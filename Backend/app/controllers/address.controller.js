const Address = require("../models/address.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");

exports.getAllByUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const addresses = await Address.getByUser(userId);
  res.status(200).json(addresses);
});

exports.create = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const count = await Address.countByUser(userId);

  if (count >= 5) {
    throw new ApiError(400, "Bạn chỉ được lưu tối đa 5 địa chỉ nhận hàng.");
  }

  let { receiver_name, phone_number, shipping_address, is_default } = req.body;

  if (count === 0) is_default = true;
  if (is_default) await Address.unsetDefault(userId);

  const id = await Address.create({
    user_id: userId,
    receiver_name,
    phone_number,
    shipping_address,
    is_default: is_default || false,
  });

  res.status(201).json({ message: "Thêm địa chỉ thành công", id });
});

exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { receiver_name, phone_number, shipping_address, is_default } = req.body;

  const address = await Address.getById(id);
  if (!address || address.user_id !== userId) throw new ApiError(404, "Không tìm thấy địa chỉ");

  if (is_default) await Address.unsetDefault(userId);

  await Address.update(id, {
    receiver_name,
    phone_number,
    shipping_address,
    is_default,
  });
  res.status(200).json({ message: "Cập nhật thành công" });
});

exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const address = await Address.getById(id);
  if (!address || address.user_id !== userId) throw new ApiError(404, "Không tìm thấy địa chỉ");

  if (address.is_default)
    throw new ApiError(
      400,
      "Không thể xóa địa chỉ mặc định. Vui lòng chọn địa chỉ khác làm mặc định trước.",
    );

  await Address.delete(id);
  res.status(200).json({ message: "Xóa thành công" });
});

exports.setDefault = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const address = await Address.getById(id);
  if (!address || address.user_id !== userId) throw new ApiError(404, "Không tìm thấy địa chỉ");

  await Address.unsetDefault(userId);
  await Address.update(id, { is_default: true });

  res.status(200).json({ message: "Thiết lập mặc định thành công" });
});
