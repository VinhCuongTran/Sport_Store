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

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ─── Helper: tạo User ID dạng "user_XXXXXXXX" (8 chữ số, đảm bảo unique) ──
const generateUserId = async () => {
  let id, exists;
  do {
    const digits = Math.floor(10000000 + Math.random() * 90000000).toString();
    id = `user_${digits}`;
    const [rows] = await db.query("SELECT id FROM users WHERE id = ?", [id]);
    exists = rows.length > 0;
  } while (exists);
  return id;
};

const sendRegisterEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"Sport Store" <${config.email.ACCOUNT}>`,
    to: toEmail,
    subject: "Mã Xác Thực Tài Khoản Sport Store",
    html: buildOtpEmailHtml({
      icon: "🏃",
      headerTitle: "Xác Thực Tài Khoản",
      bodyText: `Mã xác minh tài khoản <strong style="color:#001a2d;">Sport Store</strong> của bạn là:`,
      otp,
      noticeExtra:
        "Nếu không phải bạn là người yêu cầu mã, ai đó có thể đang cố gắng truy cập vào tài khoản của bạn.",
    }),
  });
};

const sendForgotPasswordEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"Sport Store" <${config.email.ACCOUNT}>`,
    to: toEmail,
    subject: "Đặt Lại Mật Khẩu Tài Khoản Sport Store",
    html: buildOtpEmailHtml({
      icon: "🔐",
      headerTitle: "Đặt Lại Mật Khẩu",
      bodyText: `Chúng tôi nhận được yêu cầu <strong style="color:#001a2d;">đặt lại mật khẩu</strong> cho tài khoản Sport Store của bạn. Mã xác minh của bạn là:`,
      otp,
      noticeExtra:
        "Nếu không phải bạn là người yêu cầu đặt lại mật khẩu, ai đó có thể đang cố gắng truy cập vào tài khoản của bạn.",
    }),
  });
};

const buildOtpEmailHtml = ({
  icon,
  headerTitle,
  bodyText,
  otp,
  noticeExtra,
}) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background-color:#f0f3f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f3f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,26,45,0.12);">
          <tr>
            <td style="background:linear-gradient(135deg,#001a2d 0%,#003459 60%,#0a4a7a 100%);padding:36px 40px;text-align:center;">
              <div style="display:inline-block;width:60px;height:60px;background:rgba(255,255,255,0.15);border-radius:50%;border:1.5px solid rgba(255,255,255,0.3);line-height:60px;font-size:28px;margin-bottom:16px;">${icon}</div>
              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.3px;">Sport Store</h1>
              <p style="color:rgba(255,255,255,0.6);margin:6px 0 0;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">${headerTitle}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <p style="color:#334155;font-size:15px;margin:0 0 20px;line-height:1.6;">Xin chào,</p>
              <p style="color:#334155;font-size:15px;margin:0 0 28px;line-height:1.6;">${bodyText}</p>
              <div style="background:#f0f4ff;border:2px dashed #93c5fd;border-radius:16px;padding:28px;text-align:center;margin:0 0 28px;">
                <span style="font-size:42px;font-weight:900;color:#001a2d;letter-spacing:10px;font-family:'Courier New',monospace;">${otp}</span>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;border-radius:12px;border:1px solid #fed7aa;overflow:hidden;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 8px;color:#92400e;font-size:13.5px;font-weight:700;">⏱ Lưu ý quan trọng</p>
                    <ul style="margin:0;padding-left:18px;color:#78350f;font-size:13.5px;line-height:1.9;">
                      <li>Mã này sẽ <strong>hết hạn sau 10 phút</strong>.</li>
                      <li><strong>Không chia sẻ mã</strong> với bất kỳ ai.</li>
                      <li>${noticeExtra}</li>
                    </ul>
                  </td>
                </tr>
              </table>
              <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0;">Email này được gửi tự động từ hệ thống Sport Store. Vui lòng không trả lời email này.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e8edf8;padding:20px 40px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">© 2025 Sport Store · Tất cả quyền được bảo lưu</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const AuthController = {
  sendOtp: asyncHandler(async (req, res) => {
    const { method, email, phone_number } = req.body;

    if (!method || (method !== "email" && method !== "phone")) {
      throw new ApiError(400, "Phương thức không hợp lệ (email hoặc phone)");
    }

    const checkQuery =
      method === "email"
        ? "SELECT id FROM users WHERE email = ?"
        : "SELECT id FROM users WHERE phone_number = ?";
    const checkValue = method === "email" ? email : phone_number;

    if (!checkValue) {
      throw new ApiError(
        400,
        `Vui lòng cung cấp ${method === "email" ? "email" : "số điện thoại"}`,
      );
    }

    const [existing] = await db.query(checkQuery, [checkValue]);
    if (existing.length > 0) {
      throw new ApiError(
        400,
        `${method === "email" ? "Email" : "Số điện thoại"} này đã được sử dụng. Vui lòng chọn số/email khác.`,
      );
    }

    const otp = generateOtp();
    const key = `register:${checkValue.trim()}`;

    otpStore.set(key, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      purpose: "register",
    });

    if (method === "email") {
      await sendRegisterEmail(email.trim(), otp);
    } else {
      // Tích hợp SMS provider tại đây (ESMS, Twilio, ...)
      console.log(`[SMS MOCK] OTP ${otp} → ${phone_number}`);
    }

    res.json({ message: "Mã OTP đã được gửi thành công" });
  }),

  registerWithOtp: asyncHandler(async (req, res) => {
    const { name, email, phone_number, password, gender, otp, method } =
      req.body;

    if (!name || !email || !phone_number || !password || !otp || !method) {
      throw new ApiError(400, "Vui lòng cung cấp đầy đủ thông tin đăng ký");
    }

    const keyValue = method === "email" ? email.trim() : phone_number.trim();
    const key = `register:${keyValue}`;
    const storedOtpData = otpStore.get(key);

    if (!storedOtpData) {
      throw new ApiError(400, "Mã OTP không tồn tại hoặc đã hết hạn");
    }
    if (storedOtpData.purpose !== "register") {
      throw new ApiError(400, "Mã OTP không hợp lệ cho thao tác này");
    }
    if (Date.now() > storedOtpData.expiresAt) {
      otpStore.delete(key);
      throw new ApiError(400, "Mã OTP đã hết hạn. Vui lòng gửi lại");
    }
    if (storedOtpData.otp !== otp.trim()) {
      throw new ApiError(400, "Mã OTP không chính xác");
    }

    otpStore.delete(key);

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar =
      gender === "male"
        ? DEFAULT_AVATAR_MALE
        : gender === "female"
          ? DEFAULT_AVATAR_FEMALE
          : null;

    const newUserId = await generateUserId();

    try {
      await db.query(
        "INSERT INTO users (id, name, email, phone_number, password, gender, avatar, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'customer', 'active')",
        [
          newUserId,
          name.trim(),
          email.trim(),
          phone_number.trim(),
          hashedPassword,
          gender,
          avatar,
        ],
      );

      const payload = { id: newUserId, role: "customer" };

      const accessToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      });
      const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn,
      });

      res.status(201).json({
        message: "Đăng ký thành công",
        accessToken,
        refreshToken,
        user: {
          id: newUserId,
          name: name.trim(),
          email: email.trim(),
          phone_number: phone_number.trim(),
          gender,
          avatar,
          role: "customer",
          status: "active",
        },
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        if (error.sqlMessage.includes("phone_number")) {
          throw new ApiError(
            400,
            "Số điện thoại này đã được sử dụng. Vui lòng dùng số khác.",
          );
        }
        if (error.sqlMessage.includes("email")) {
          throw new ApiError(
            400,
            "Email này đã được sử dụng. Vui lòng dùng email khác.",
          );
        }
      }
      throw error;
    }
  }),

  login: asyncHandler(async (req, res) => {
    const identifier =
      req.body.identifier || req.body.email || req.body.phone_number;
    const { password } = req.body;

    if (!identifier || !password) {
      throw new ApiError(400, "Vui lòng nhập Email/Số điện thoại và Mật khẩu");
    }

    const user = await UserModel.findByIdentifier(identifier.trim());
    if (!user) {
      // Sửa 401 thành 400 ở đây
      throw new ApiError(400, "Tài khoản hoặc mật khẩu không chính xác");
    }

    if (user.status === "blocked") {
      throw new ApiError(
        403,
        "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ CSKH.",
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(400, "Tài khoản hoặc mật khẩu không chính xác");
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
      accessToken,
      refreshToken,
      user,
    });
  }),

  checkExists: asyncHandler(async (req, res) => {
    const { email, phone_number } = req.body;

    if (!email || !phone_number) {
      throw new ApiError(400, "Vui lòng cung cấp email và số điện thoại");
    }

    const [emailExists] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email.trim()],
    );
    if (emailExists.length > 0) {
      throw new ApiError(
        400,
        "Email này đã được sử dụng. Vui lòng sử dụng email khác.",
      );
    }

    const [phoneExists] = await db.query(
      "SELECT id FROM users WHERE phone_number = ?",
      [phone_number.trim()],
    );
    if (phoneExists.length > 0) {
      throw new ApiError(
        400,
        "Số điện thoại này đã được sử dụng. Vui lòng sử dụng số khác.",
      );
    }

    res.json({ message: "Dữ liệu hợp lệ" });
  }),

  refreshToken: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(403, "Không tìm thấy Refresh Token");
    }

    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      const newAccessToken = jwt.sign(
        { id: decoded.id, role: decoded.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn },
      );
      res.json({ accessToken: newAccessToken });
    } catch {
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

  forgotPasswordSendOtp: asyncHandler(async (req, res) => {
    const { identifier } = req.body;

    if (!identifier || !identifier.trim()) {
      throw new ApiError(400, "Vui lòng nhập email hoặc số điện thoại");
    }

    const value = identifier.trim();
    const isEmail = /.+@.+\..+/.test(value);
    const query = isEmail
      ? "SELECT id, email FROM users WHERE email = ? AND status != 'blocked'"
      : "SELECT id, email FROM users WHERE phone_number = ? AND status != 'blocked'";

    const [users] = await db.query(query, [value]);

    if (users.length === 0) {
      throw new ApiError(
        404,
        "Không tìm thấy tài khoản với thông tin này. Vui lòng kiểm tra lại.",
      );
    }

    const realEmail = users[0].email;
    const otp = generateOtp();
    const key = `forgot:${realEmail}`;

    otpStore.set(key, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      purpose: "forgot_password",
      userId: users[0].id,
      verified: false,
    });

    await sendForgotPasswordEmail(realEmail, otp);

    const maskedEmail = realEmail.replace(
      /^(.{1,3})(.*)(@.+)$/,
      (_, a, b, c) => a + "*".repeat(Math.max(1, b.length)) + c,
    );

    res.json({
      message: "Mã OTP đã được gửi đến email của tài khoản",
      maskedEmail,
      email: realEmail,
    });
  }),

  forgotPasswordVerifyOtp: asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new ApiError(400, "Thiếu email hoặc mã OTP");
    }

    const key = `forgot:${email.trim()}`;
    const storedOtpData = otpStore.get(key);

    if (!storedOtpData || storedOtpData.purpose !== "forgot_password") {
      throw new ApiError(400, "Mã OTP không tồn tại hoặc đã hết hạn");
    }
    if (Date.now() > storedOtpData.expiresAt) {
      otpStore.delete(key);
      throw new ApiError(400, "Mã OTP đã hết hạn. Vui lòng gửi lại");
    }
    if (storedOtpData.otp !== otp.trim()) {
      throw new ApiError(400, "Mã OTP không chính xác");
    }
    otpStore.set(key, { ...storedOtpData, verified: true });

    res.json({ message: "Xác minh OTP thành công" });
  }),

  forgotPasswordReset: asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      throw new ApiError(400, "Thiếu thông tin cần thiết");
    }
    if (newPassword.length < 6) {
      throw new ApiError(400, "Mật khẩu phải có ít nhất 6 ký tự");
    }

    const key = `forgot:${email.trim()}`;
    const storedOtpData = otpStore.get(key);

    if (!storedOtpData || storedOtpData.purpose !== "forgot_password") {
      throw new ApiError(
        400,
        "Phiên đặt lại mật khẩu không hợp lệ. Vui lòng thực hiện lại từ đầu.",
      );
    }
    if (!storedOtpData.verified) {
      throw new ApiError(
        400,
        "Vui lòng xác minh OTP trước khi đặt lại mật khẩu",
      );
    }
    if (storedOtpData.otp !== otp.trim()) {
      throw new ApiError(400, "Mã OTP không hợp lệ");
    }
    if (Date.now() > storedOtpData.expiresAt) {
      otpStore.delete(key);
      throw new ApiError(
        400,
        "Phiên đã hết hạn. Vui lòng thực hiện lại từ đầu.",
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      email.trim(),
    ]);

    otpStore.delete(key);

    res.json({
      message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.",
    });
  }),
};

module.exports = AuthController;
