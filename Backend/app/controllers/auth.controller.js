const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../utils/mysql.db");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");
const nodemailer = require("nodemailer");
const UserModel = require("../models/user.model");
const config = require("../config");

const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email.ACCOUNT,
    pass: config.email.pass,
  },
});

const DEFAULT_AVATAR_MALE =
  "https://res.cloudinary.com/dosb4fmpo/image/upload/v1772181216/Male_gqcp4c.jpg";
const DEFAULT_AVATAR_FEMALE =
  "https://res.cloudinary.com/dosb4fmpo/image/upload/v1772182096/Female_exbvnm.jpg";

const AuthController = {
  sendOtp: asyncHandler(async (req, res) => {
    const { method, email, phone_number } = req.body;

    const checkQuery =
      method === "email"
        ? "SELECT id FROM users WHERE email = ?"
        : "SELECT id FROM users WHERE phone_number = ?";
    const checkValue = method === "email" ? email : phone_number;

    const [existing] = await db.query(checkQuery, [checkValue]);
    if (existing.length > 0) {
      throw new ApiError(
        400,
        `${method === "email" ? "Email" : "Số điện thoại"} này đã được sử dụng. Vui lòng chọn số/email khác.`,
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = method === "email" ? email : phone_number;

    otpStore.set(key, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    if (method === "email") {
      const mailOptions = {
        from: '"Sport Store" <your_email@gmail.com>',
        to: email,
        subject: "Mã xác nhận đăng ký tài khoản",
        html: `<h3>Mã xác nhận (OTP) của bạn là: <b style="color: blue;">${otp}</b></h3><p>Mã này có hiệu lực trong 5 phút.</p>`,
      };
      await transporter.sendMail(mailOptions);
    } else if (method === "phone") {
      console.log(`[SMS MOCK] Sending OTP ${otp} to phone ${phone_number}`);
    }

    res.json({ message: "Mã OTP đã được gửi thành công" });
  }),

  registerWithOtp: asyncHandler(async (req, res) => {
    const { name, email, phone_number, password, gender, otp, method } =
      req.body;

    const key = method === "email" ? email : phone_number;

    const storedOtpData = otpStore.get(key);
    if (!storedOtpData) {
      throw new ApiError(400, "Mã OTP không tồn tại hoặc đã hết hạn");
    }

    if (Date.now() > storedOtpData.expiresAt) {
      otpStore.delete(key);
      throw new ApiError(400, "Mã OTP đã hết hạn. Vui lòng gửi lại");
    }

    if (storedOtpData.otp !== otp) {
      throw new ApiError(400, "Mã OTP không chính xác");
    }

    otpStore.delete(key);

    const hashedPassword = await bcrypt.hash(password, 10);

    let avatar = null;
    if (gender === "male") {
      avatar = DEFAULT_AVATAR_MALE;
    } else if (gender === "female") {
      avatar = DEFAULT_AVATAR_FEMALE;
    }

    try {
      const [result] = await db.query(
        "INSERT INTO users (name, email, phone_number, password, gender, avatar, role, status) VALUES (?, ?, ?, ?, ?, ?, 'customer', 'active')",
        [name, email, phone_number, hashedPassword, gender, avatar],
      );

      const newUserId = result.insertId;

      const payload = { id: newUserId, role: "customer" };

      const accessToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      });

      const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn,
      });

      const user = {
        id: newUserId,
        name: name,
        email: email,
        phone_number: phone_number,
        gender: gender,
        avatar: avatar,
        role: "customer",
        status: "active",
      };

      res.status(201).json({
        message: "Đăng ký thành công",
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: user,
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        if (error.sqlMessage.includes("phone_number")) {
          throw new ApiError(
            400,
            "Số điện thoại này đã được sử dụng. Vui lòng đăng nhập hoặc dùng số khác.",
          );
        }
        if (error.sqlMessage.includes("email")) {
          throw new ApiError(
            400,
            "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.",
          );
        }
      }
      throw error;
    }
  }),

  register: asyncHandler(async (req, res) => {
    const data = req.body;

    if (data.gender === "male") {
      data.avatar = DEFAULT_AVATAR_MALE;
    } else if (data.gender === "female") {
      data.avatar = DEFAULT_AVATAR_FEMALE;
    }

    if (!data.name || !data.email || !data.password) {
      throw new ApiError(400, "Vui lòng cung cấp đủ name, email và password");
    }

    const saltRounds = 10;
    data.password = await bcrypt.hash(data.password, saltRounds);

    try {
      const id = await UserModel.create(data);
      res.status(201).json({
        message: "Đăng ký tài khoản thành công",
        id,
        gender: data.gender,
        avatar: data.avatar,
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new ApiError(400, "Email hoặc Số điện thoại này đã được sử dụng");
      }
      throw error;
    }
  }),

  login: asyncHandler(async (req, res) => {
    const identifier =
      req.body.identifier || req.body.email || req.body.phone_number;
    const password = req.body.password;

    if (!identifier || !password) {
      throw new ApiError(400, "Vui lòng nhập Email/Số điện thoại và Mật khẩu");
    }

    const user = await UserModel.findByIdentifier(identifier);
    if (!user) {
      throw new ApiError(401, "Tài khoản hoặc mật khẩu không chính xác");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, "Tài khoản hoặc mật khẩu không chính xác");
    }

    if (user.status === "blocked") {
      throw new ApiError(
        403,
        "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ CSKH.",
      );
    }

    const payload = { id: user.id, role: user.role };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    delete user.password;

    res.json({
      message: "Đăng nhập thành công",
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: user,
    });
  }),

  refreshToken: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(403, "Không tìm thấy Refresh Token");
    }

    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      const payload = { id: decoded.id, role: decoded.role };

      const newAccessToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      });

      res.json({
        accessToken: newAccessToken,
      });
    } catch (error) {
      throw new ApiError(
        403,
        "Refresh Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
      );
    }
  }),

  logout: asyncHandler(async (req, res) => {
    res.json({
      message: "Đăng xuất thành công. Vui lòng xóa Token ở phía Client.",
    });
  }),

  checkExists: asyncHandler(async (req, res) => {
    const { email, phone_number } = req.body;

    // 1. Kiểm tra Email
    const [emailExists] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (emailExists.length > 0) {
      throw new ApiError(
        400,
        "Email này đã được sử dụng. Vui lòng sử dụng email khác.",
      );
    }

    // 2. Kiểm tra Số điện thoại
    const [phoneExists] = await db.query(
      "SELECT id FROM users WHERE phone_number = ?",
      [phone_number],
    );
    if (phoneExists.length > 0) {
      throw new ApiError(
        400,
        "Số điện thoại này đã được sử dụng. Vui lòng sử dụng số khác.",
      );
    }

    res.json({ message: "Dữ liệu hợp lệ" });
  }),
};

module.exports = AuthController;
