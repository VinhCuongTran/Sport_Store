const ProductModel = require("../models/product.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");

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
      images = req.files.map((file, index) => {
        const meta = imagesMeta[index] || {};
        return {
          image_url: file.path,
          color: meta.color || null,
          is_thumbnail:
            meta.is_thumbnail !== undefined ? meta.is_thumbnail : index === 0,
        };
      });
    }

    const productId = await ProductModel.create(productData, variants, images);
    res.status(201).json({
      message: "Tạo sản phẩm thành công",
      productId,
      images_uploaded: images,
    });
  }),

  findAll: asyncHandler(async (req, res) => {
    const data = await ProductModel.getAll();
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
    const { variants, images_meta, ...productData } = req.body;

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

    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map((file, index) => {
        const meta = parsedImagesMeta[index] || {};
        return {
          image_url: file.path,
          color: meta.color || null,
          is_thumbnail:
            meta.is_thumbnail !== undefined ? meta.is_thumbnail : index === 0,
        };
      });

      const oldProduct = await ProductModel.getById(req.params.id);
      if (oldProduct && oldProduct.images && oldProduct.images.length > 0) {
        const deletePromises = oldProduct.images.map(async (img) => {
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

    const success = await ProductModel.update(
      req.params.id,
      productData,
      parsedVariants,
      newImages.length > 0 ? newImages : null,
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
};

module.exports = Product;
