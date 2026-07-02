const ProductModel = require("../models/product.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");
const { getImageEmbeddingFromUrl } = require("../utils/embedding.util");

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
    res.status(201).json({
      message: "Tạo sản phẩm thành công",
      productId,
      images_uploaded: images,
    });
  }),

  findAll: asyncHandler(async (req, res) => {
    // 1. Bắt lấy từ khóa tìm kiếm mà frontend gửi lên
    const searchKeyword = req.query.search || "";

    // 2. Truyền từ khóa đó vào model
    const data = await ProductModel.getAll(searchKeyword);
    res.json(data);
  }),

  findOne: asyncHandler(async (req, res) => {
    const data = await ProductModel.getById(req.params.id);
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
    res.status(201).json({ message: "Lưu phiếu kiểm kho thành công", ticketId });
  })
};

module.exports = Product;
