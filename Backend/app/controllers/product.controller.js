const ProductModel = require("../models/product.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");
const { getImageEmbeddingFromUrl } = require("../utils/embedding.util");
const jwt = require("jsonwebtoken");
const config = require("../config");
const ActivityLog = require("../models/activity_log.model");

const cloudinary = require("cloudinary").v2;

const extractPublicId = (url) => {
  try {
    const splitUrl = url.split("/upload/");
    if (splitUrl.length < 2) return null;

    let pathStr = splitUrl[1];

    if (pathStr.match(/^v\d+\//)) {
      pathStr = pathStr.replace(/^v\d+\//, "");
    }

    const lastDotIndex = pathStr.lastIndexOf(".");
    const encodedPublicId =
      lastDotIndex !== -1 ? pathStr.substring(0, lastDotIndex) : pathStr;

    return decodeURIComponent(encodedPublicId);
  } catch (error) {
    console.error("Lỗi khi tách public_id:", error);
    return null;
  }
};

// Tính embedding (vector) cho danh sách ảnh vừa upload lên Cloudinary.
// Ảnh nào lỗi (mạng, model...) sẽ có embedding = null, không làm hỏng cả request.
const attachEmbeddings = async (images) => {
  return Promise.all(
    images.map(async (img) => {
      try {
        const embedding = await getImageEmbeddingFromUrl(img.image_url);
        return { ...img, embedding: JSON.stringify(embedding) };
      } catch (error) {
        console.error(
          "Lỗi tính embedding cho ảnh:",
          img.image_url,
          error.message,
        );
        return { ...img, embedding: null };
      }
    }),
  );
};

const Product = {
  create: asyncHandler(async (req, res) => {
    const productData = req.body;

    let variants = [];
    if (req.body.variants) {
      try {
        variants = JSON.parse(req.body.variants);
      } catch (error) {
        throw new ApiError(400, "Định dạng variants không hợp lệ");
      }
    }

    let imagesMeta = [];
    if (req.body.images_meta) {
      try {
        imagesMeta = JSON.parse(req.body.images_meta);
      } catch (error) {
        console.warn("Lỗi parse images_meta:", error);
      }
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      const rawImages = req.files.map((file, index) => {
        const meta = imagesMeta[index] || {};
        return {
          image_url: file.path,
          color: meta.color || null,
          is_thumbnail:
            meta.is_thumbnail !== undefined ? meta.is_thumbnail : index === 0,
        };
      });

      // Tính vector cho từng ảnh song song (không làm chậm quá nhiều vì chạy đồng thời)
      images = await attachEmbeddings(rawImages);
    }

    const productId = await ProductModel.create(productData, variants, images);
    await ActivityLog.logAction(req.user.id, 'CREATE_PRODUCT', `Đã thêm sản phẩm mới`, productId);
    res.status(201).json({
      message: "Tạo sản phẩm thành công",
      productId,
      images_uploaded: images,
    });
  }),

  findAll: asyncHandler(async (req, res) => {
    const searchKeyword = req.query.search || "";

    // KỸ THUẬT LẤY USER ID NGẦM (Không chặn lỗi nếu khách vãng lai)
    let userId = null;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, config.jwt.secret);
        userId = decoded.id; // Nếu token hợp lệ, lấy id của khách hàng
      } catch (error) {
        // Token lỗi hoặc hết hạn thì bỏ qua, coi như khách vãng lai
      }
    }

    const data = await ProductModel.getAll(searchKeyword, userId);
    res.json(data);
  }),

  findOne: asyncHandler(async (req, res) => {
    // KỸ THUẬT LẤY USER ID NGẦM
    let userId = null;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, config.jwt.secret);
        userId = decoded.id;
      } catch (error) {}
    }

    const data = await ProductModel.getById(req.params.id, userId);
    if (!data) {
      throw new ApiError(404, "Không tìm thấy sản phẩm");
    }
    res.json(data);
  }),

  update: asyncHandler(async (req, res) => {
    const {
      variants,
      images_meta,
      deleted_images,
      thumbnail_id,
      ...productData
    } = req.body;

    let parsedVariants = [];
    if (variants) {
      parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;
    }

    let parsedImagesMeta = [];
    if (images_meta) {
      parsedImagesMeta =
        typeof images_meta === "string" ? JSON.parse(images_meta) : images_meta;
    }

    let parsedDeletedImages = [];
    if (deleted_images) {
      parsedDeletedImages =
        typeof deleted_images === "string"
          ? JSON.parse(deleted_images)
          : deleted_images;
    }

    // Xóa file ảnh cũ trên Cloudinary
    if (parsedDeletedImages.length > 0) {
      const oldProduct = await ProductModel.getById(req.params.id);
      if (oldProduct && oldProduct.images && oldProduct.images.length > 0) {
        const imagesToDelete = oldProduct.images.filter((img) =>
          parsedDeletedImages.includes(img.id),
        );
        const deletePromises = imagesToDelete.map(async (img) => {
          if (img.image_url && img.image_url.includes("cloudinary.com")) {
            const publicId = extractPublicId(img.image_url);
            if (publicId) {
              await cloudinary.uploader.destroy(publicId, { invalidate: true });
            }
          }
        });
        await Promise.all(deletePromises);
      }
    }

    let newImages = [];
    if (req.files && req.files.length > 0) {
      const rawNewImages = req.files.map((file, index) => {
        const meta = parsedImagesMeta[index] || {};
        return {
          image_url: file.path,
          color: meta.color || null,
          is_thumbnail:
            meta.is_thumbnail !== undefined ? meta.is_thumbnail : false, // Nếu k có sẽ tự tính toán logic DB
        };
      });

      newImages = await attachEmbeddings(rawNewImages);
    }

    const success = await ProductModel.update(
      req.params.id,
      productData,
      parsedVariants,
      newImages.length > 0 ? newImages : null,
      parsedDeletedImages,
      thumbnail_id || null,
    );

    if (!success) {
      throw new ApiError(404, "Cập nhật thất bại hoặc không tìm thấy sản phẩm");
    }
    await ActivityLog.logAction(req.user.id, 'UPDATE_PRODUCT', `Đã cập nhật thông tin sản phẩm`, req.params.id);
    res.json({ message: "Cập nhật thành công" });
  }),

  delete: asyncHandler(async (req, res) => {
    const productId = req.params.id;

    const product = await ProductModel.getById(productId);
    if (!product) {
      throw new ApiError(404, "Không tìm thấy sản phẩm để xóa");
    }

    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(async (img) => {
        if (img.image_url && img.image_url.includes("cloudinary.com")) {
          const publicId = extractPublicId(img.image_url);
          if (publicId) {
            await cloudinary.uploader.destroy(publicId, { invalidate: true });
          }
        }
      });
      await Promise.all(deletePromises);
    }

    const success = await ProductModel.delete(productId);
    if (!success) {
      throw new ApiError(500, "Lỗi khi xóa sản phẩm khỏi cơ sở dữ liệu");
    }
    await ActivityLog.logAction(req.user.id, 'DELETE_PRODUCT', `Đã xóa sản phẩm`, productId);
    res.json({
      message: "Đã xóa sản phẩm và dọn sạch hình ảnh thành công",
    });
  }),

  // Thêm API xử lý Nhập kho
  importStock: asyncHandler(async (req, res) => {
    const variantId = req.params.id; // Lấy ID biến thể từ URL
    const { quantity_added, import_price, note } = req.body;

    if (!quantity_added || quantity_added <= 0) {
      throw new ApiError(400, "Số lượng nhập phải lớn hơn 0");
    }

    if (import_price < 0) {
      throw new ApiError(400, "Giá nhập không được là số âm");
    }

    await ProductModel.importStock(
      variantId,
      quantity_added,
      import_price || 0,
      note || "Nhập hàng từ Admin",
    );

    res.json({ message: "Lưu phiếu nhập kho thành công" });
  }),

  getAllVariants: asyncHandler(async (req, res) => {
    const data = await ProductModel.getAllVariants();
    res.json(data);
  }),

  getAllStockTickets: asyncHandler(async (req, res) => {
    const data = await ProductModel.getAllStockTickets();
    res.json(data);
  }),

  getStockTicketById: asyncHandler(async (req, res) => {
    const ticket = await ProductModel.getStockTicketById(req.params.id);
    if (!ticket) {
      throw new ApiError(404, "Không tìm thấy phiếu kiểm kho");
    }
    res.json(ticket);
  }),

  createStockTicket: asyncHandler(async (req, res) => {
    const staffId = req.user.id;
    const ticketData = req.body;

    if (!ticketData.items || ticketData.items.length === 0) {
      throw new ApiError(400, "Phiếu nhập không có sản phẩm nào");
    }

    const ticketId = await ProductModel.createStockTicket(staffId, ticketData);
    await ActivityLog.logAction(staffId, 'CREATE_STOCK_TICKET', `Đã tạo phiếu nhập kho mới`, ticketId);
    res
      .status(201)
      .json({ message: "Lưu phiếu kiểm kho thành công", ticketId });
  }),

  toggleFavorite: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { product_id } = req.body; // Bỏ variant_id ở đây

    if (!product_id) {
      throw new ApiError(400, "Không tìm thấy thông tin sản phẩm (product_id)");
    }

    // Truyền duy nhất 2 tham số
    const result = await ProductModel.toggleFavorite(userId, product_id);
    res.json(result);
  }),

  getFavoriteProducts: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const data = await ProductModel.getFavoritesByUser(userId);
    res.json(data);
  }),
};

module.exports = Product;
