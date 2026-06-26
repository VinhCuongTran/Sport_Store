// app/utils/send.email.js
const nodemailer = require("nodemailer");
const config = require("../config");

// Cấu hình transporter (Sử dụng Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email.ACCOUNT,
    pass: config.email.pass,
  },
});

// Hàm format tiền tệ (VNĐ)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Hàm dùng chung để build layout HTML giống auth.controller.js
const buildOrderEmailHtml = ({ icon, headerTitle, buyerName, bodyContent }) => `
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
              <p style="color:#334155;font-size:16px;margin:0 0 20px;line-height:1.6;font-weight:600;">Xin chào ${buyerName},</p>
              ${bodyContent}
              <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:30px 0 0;border-top:1px solid #e2e8f0;padding-top:20px;">Email này được gửi tự động từ hệ thống Sport Store. Vui lòng không trả lời email này.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e8edf8;padding:20px 40px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} Sport Store · Tất cả quyền được bảo lưu</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// 1. Hàm gửi email khi đặt hàng thành công
const sendOrderConfirmation = async (
  userEmail,
  orderId,
  orderData,
  buyerName,
) => {
  try {
    // --- BẮT ĐẦU: LOGIC TÍNH NGÀY DỰ KIẾN NHẬN HÀNG ---
    const addBusinessDays = (date, days) => {
      let result = new Date(date);
      let added = 0;
      while (added < days) {
        result.setDate(result.getDate() + 1);
        if (result.getDay() !== 0) {
          // Bỏ qua Chủ Nhật
          added++;
        }
      }
      return result;
    };

    const orderDate = new Date();
    const minDate = addBusinessDays(orderDate, 3);
    const maxDate = addBusinessDays(orderDate, 5);

    const formatDateStr = (d) => {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      return `${day}/${month}/${d.getFullYear()}`;
    };

    const estimatedDelivery = `${formatDateStr(minDate)} - ${formatDateStr(maxDate)}`;
    // --- KẾT THÚC: LOGIC TÍNH NGÀY ---

    const bodyContent = `
      <p style="color:#334155;font-size:15px;margin:0 0 20px;line-height:1.6;">Cảm ơn bạn đã tin tưởng và đặt mua sản phẩm tại cửa hàng của chúng tôi!</p>
      
      <div style="background:#f0f4ff;border:2px dashed #93c5fd;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px;">
        <p style="margin:0 0 8px;color:#1e3a8a;font-size:14px;font-weight:600;">Mã đơn hàng của bạn</p>
        <span style="font-size:28px;font-weight:800;color:#001a2d;letter-spacing:2px;">#${orderId}</span>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;border-radius:12px;border:1px solid #fed7aa;overflow:hidden;margin-bottom:24px;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 12px;color:#92400e;font-size:14.5px;font-weight:700;">📦 Thông tin nhận hàng</p>
            <ul style="margin:0;padding-left:18px;color:#78350f;font-size:14px;line-height:1.8;">
              <li><strong>Người nhận:</strong> ${orderData.receiver_name}</li>
              <li><strong>Số điện thoại:</strong> ${orderData.phone_number}</li>
              <li><strong>Địa chỉ:</strong> ${orderData.shipping_address}</li>
              <li><strong>Dự kiến giao hàng:</strong> <span style="color:#059669;font-weight:bold;">${estimatedDelivery}</span></li>
            </ul>
          </td>
        </tr>
      </table>

      <p style="color:#334155;font-size:16px;margin:0 0 16px;line-height:1.6;font-weight:600;">
        Tổng thanh toán: <span style="color:#e11d48;font-size:20px;">${formatCurrency(orderData.total_price)}</span>
      </p>
      
      <p style="color:#334155;font-size:14px;margin:0;line-height:1.6;">Chúng tôi sẽ xử lý và giao đơn hàng đến địa chỉ trên trong thời gian sớm nhất.</p>
    `;

    const mailOptions = {
      from: `"Sport Store" <${config.email.ACCOUNT}>`,
      to: userEmail,
      subject: `[Xác nhận đơn hàng] Đơn hàng #${orderId} đặt thành công`,
      html: buildOrderEmailHtml({
        icon: "🛍️",
        headerTitle: "XÁC NHẬN ĐƠN HÀNG",
        buyerName,
        bodyContent,
      }),
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `[Email] Đã gửi xác nhận đơn hàng #${orderId} tới ${userEmail}`,
    );
  } catch (error) {
    console.error("[Email Error] Lỗi khi gửi xác nhận đặt hàng:", error);
  }
};

// 2. Hàm gửi email khi trạng thái đơn hàng thay đổi
const sendOrderStatusUpdate = async (userEmail, orderId, status, buyerName) => {
  try {
    const statusMap = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      delivering: "Đang giao hàng",
      completed: "Đã hoàn thành",
      cancelled: "Đã hủy",
    };

    const statusVN = statusMap[status] || status;

    // Gắn thêm lời nhắc động tùy theo trạng thái
    let extraNotice = "";
    if (status === "delivering") {
      extraNotice = `<div style="background:#d1fae5;border-left:4px solid #059669;padding:12px 16px;border-radius:6px;margin-top:20px;"><p style="margin:0;color:#065f46;font-size:14px;">🛵 <strong>Lưu ý:</strong> Vui lòng chú ý điện thoại, nhân viên giao hàng sẽ sớm liên hệ với bạn.</p></div>`;
    } else if (status === "completed") {
      extraNotice = `<div style="background:#d1fae5;border-left:4px solid #059669;padding:12px 16px;border-radius:6px;margin-top:20px;"><p style="margin:0;color:#065f46;font-size:14px;">🎉 <strong>Thành công:</strong> Cảm ơn bạn đã mua sắm tại cửa hàng. Hy vọng bạn hài lòng với sản phẩm!</p></div>`;
    } else if (status === "cancelled") {
      extraNotice = `<div style="background:#ffe4e6;border-left:4px solid #e11d48;padding:12px 16px;border-radius:6px;margin-top:20px;"><p style="margin:0;color:#9f1239;font-size:14px;">❌ <strong>Thông báo:</strong> Đơn hàng của bạn đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ CSKH.</p></div>`;
    }

    const bodyContent = `
      <p style="color:#334155;font-size:15px;margin:0 0 20px;line-height:1.6;">Trạng thái đơn hàng <strong style="color:#001a2d;">#${orderId}</strong> của bạn vừa được hệ thống cập nhật thành:</p>
      
      <div style="background:#f0f4ff;border:2px solid #93c5fd;border-radius:12px;padding:16px;text-align:center;margin:0 0 20px;">
        <span style=\"font-size:22px;font-weight:800;color:#1d4ed8;text-transform:uppercase;\">${statusVN}</span>
      </div>

      ${extraNotice}
    `;

    const mailOptions = {
      from: `"Sport Store" <${config.email.ACCOUNT}>`,
      to: userEmail,
      subject: `[Cập nhật trạng thái] Đơn hàng #${orderId}: ${statusVN}`,
      html: buildOrderEmailHtml({
        icon: "🚚",
        headerTitle: "CẬP NHẬT ĐƠN HÀNG",
        buyerName,
        bodyContent,
      }),
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `[Email] Đã gửi thông báo cập nhật (${status}) cho đơn hàng #${orderId}`,
    );
  } catch (error) {
    console.error(
      "[Email Error] Lỗi khi gửi email cập nhật trạng thái:",
      error,
    );
  }
};

module.exports = {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
};
