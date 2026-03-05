<template>
  <div class="product-manager">
    <Loading :visible="isLoading" text="Đang xử lý dữ liệu..." />

    <div class="header-actions">
      <h2>Quản lý Sản phẩm</h2>
      <button @click="openCreateModal" class="btn btn-save">
        + Thêm Sản phẩm
      </button>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>STT</th>
          <th>Ảnh</th>
          <th>Tên Sản phẩm</th>
          <th>Phân loại</th>
          <th>Thương hiệu / Môn TT</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(product, index) in products" :key="product.id">
          <td>{{ index + 1 }}</td>
          <td>
            <img
              v-if="product.thumbnail"
              :src="product.thumbnail"
              class="product-img"
            />
            <div v-else class="img-placeholder">No IMG</div>
          </td>
          <td>
            <strong>{{ product.name }}</strong>
            <br /><small class="text-muted"
              >Giá từ: {{ formatPrice(product.min_price) }}</small
            >
            <br />
            <span
              v-if="product.active_discount > 0"
              class="badge category-badge"
              style="
                background-color: #dc3545;
                margin-top: 5px;
                display: inline-block;
              "
            >
              Đang SALE {{ product.active_discount }}%
            </span>
          </td>
          <td>
            <span class="badge category-badge">{{
              product.category_name || "N/A"
            }}</span>
          </td>
          <td>
            <small>Brand: {{ product.brand_name || "N/A" }}</small
            ><br />
            <small>Sport: {{ product.sport_name || "N/A" }}</small>
          </td>
          <td>
            <span
              :class="[
                'badge',
                product.status === 'active' ? 'status-active' : 'status-hidden',
              ]"
            >
              {{ product.status === "active" ? "Hiển thị" : "Đang ẩn" }}
            </span>
          </td>
          <td>
            <button @click="openEditModal(product.id)" class="btn btn-edit">
              Sửa
            </button>
            <button @click="handleDelete(product.id)" class="btn btn-delete">
              Xóa
            </button>
          </td>
        </tr>
        <tr v-if="products.length === 0">
          <td colspan="7" class="text-center">Chưa có sản phẩm nào.</td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content scrollable">
        <h3>{{ isEditMode ? "Cập nhật Sản phẩm" : "Thêm Sản phẩm mới" }}</h3>

        <form @submit.prevent="handleSave">
          <h4>Thông tin cơ bản</h4>
          <div class="form-row">
            <div class="form-group flex-2">
              <label>Tên Sản phẩm *</label>
              <input
                v-model="formData.name"
                type="text"
                class="input-text"
                required
              />
            </div>
            <div class="form-group flex-1">
              <label>Danh mục (Category) *</label>
              <select
                v-model="formData.category_id"
                class="input-text"
                required
              >
                <option value="" disabled>-- Chọn Danh mục --</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label>Thương hiệu (Brand)</label>
              <select v-model="formData.brand_id" class="input-text">
                <option value="">-- Bỏ qua --</option>
                <option
                  v-for="brand in brands"
                  :key="brand.id"
                  :value="brand.id"
                >
                  {{ brand.name }}
                </option>
              </select>
            </div>
            <div class="form-group flex-1">
              <label>Môn Thể thao (Sport)</label>
              <select v-model="formData.sport_id" class="input-text">
                <option value="">-- Bỏ qua --</option>
                <option
                  v-for="sport in sports"
                  :key="sport.id"
                  :value="sport.id"
                >
                  {{ sport.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Mô tả chi tiết</label>
            <textarea
              v-model="formData.description"
              class="input-text"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Trạng thái</label>
            <select v-model="formData.status" class="input-text w-50">
              <option value="active">Active (Hiển thị)</option>
              <option value="hidden">Hidden (Đang ẩn)</option>
            </select>
          </div>

          <hr />

          <div class="variant-header">
            <h4>Cài đặt Khuyến mãi (Flash Sale)</h4>
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label>Giảm giá (%)</label>
              <input
                v-model="formData.discount_percent"
                type="number"
                min="0"
                max="100"
                class="input-text"
                placeholder="Ví dụ: 20"
              />
            </div>
            <div class="form-group flex-1">
              <label>Thời gian Bắt đầu</label>
              <input
                v-model="formData.sale_start"
                type="datetime-local"
                class="input-text"
              />
            </div>
            <div class="form-group flex-1">
              <label>Thời gian Kết thúc</label>
              <input
                v-model="formData.sale_end"
                type="datetime-local"
                class="input-text"
              />
            </div>
          </div>
          <hr />

          <div class="variant-header">
            <h4>Biến thể (Kích cỡ, Màu sắc, Giá riêng...)</h4>
            <button
              type="button"
              @click="addVariant"
              class="btn btn-save btn-sm"
            >
              + Thêm biến thể
            </button>
          </div>

          <div class="variants-container">
            <div
              v-for="(variant, index) in variants"
              :key="index"
              class="variant-row"
            >
              <div class="v-col">
                <input
                  v-model="variant.size"
                  placeholder="Size (Ví dụ: XL)"
                  class="input-text"
                  required
                />
              </div>
              <div class="v-col">
                <input
                  v-model="variant.color"
                  placeholder="Màu sắc"
                  class="input-text"
                  required
                />
              </div>
              <div class="v-col">
                <input
                  v-model="variant.price"
                  type="number"
                  placeholder="Giá (VND)"
                  class="input-text"
                  required
                />
              </div>
              <div class="v-col">
                <input
                  v-model="variant.stock"
                  type="number"
                  placeholder="Số lượng kho"
                  class="input-text"
                  required
                />
              </div>
              <div class="v-col-btn">
                <button
                  type="button"
                  @click="removeVariant(index)"
                  class="btn btn-delete btn-sm"
                >
                  Xóa
                </button>
              </div>
            </div>
            <p v-if="variants.length === 0" class="text-muted text-sm">
              Chưa có phân loại nào.
            </p>
          </div>

          <hr v-if="!isEditMode" />

          <div v-if="!isEditMode" class="form-group">
            <h4>Ảnh Sản phẩm (Chọn nhiều ảnh)</h4>
            <input
              type="file"
              @change="handleFileChange"
              accept="image/*"
              multiple
              class="input-text"
            />
            <small class="text-muted"
              >Ảnh đầu tiên sẽ được làm ảnh đại diện (Thumbnail).</small
            >
          </div>
          <div v-else class="form-group text-muted">
            <small
              ><i
                >*Tính năng cập nhật ảnh hiện đang được khóa ở chế độ Sửa.</i
              ></small
            >
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn btn-save" :disabled="isLoading">
              Lưu lại
            </button>
            <button
              type="button"
              @click="closeModal"
              class="btn btn-cancel"
              :disabled="isLoading"
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ProductService from "@/services/product.service";
import CategoryService from "@/services/category.service";
import BrandService from "@/services/brand.service";
import api from "@/services/api.service";
import Loading from "@/components/Loading.vue";

const products = ref([]);
const categories = ref([]);
const brands = ref([]);
const sports = ref([]);

const showModal = ref(false);
const isLoading = ref(false);
const isEditMode = ref(false);

// Hàm format datetime cho thẻ input type="datetime-local"
const formatForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date - tzOffset).toISOString().slice(0, 16);
};

// Cập nhật formData gốc để chứa 3 trường khuyến mãi
const formData = ref({
  id: null,
  name: "",
  description: "",
  category_id: "",
  brand_id: "",
  sport_id: "",
  status: "active",
  discount_percent: 0,
  sale_start: "",
  sale_end: "",
});

const variants = ref([]);
const selectedFiles = ref([]);

const formatPrice = (value) => {
  if (!value) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const fetchData = async () => {
  isLoading.value = true;
  try {
    const [prodRes, catRes, brandRes, sportRes] = await Promise.all([
      ProductService.getAll(),
      CategoryService.getAll(),
      BrandService.getAll(),
      api
        .get("/sports")
        .then((res) => res.data)
        .catch(() => []),
    ]);
    products.value = prodRes;
    categories.value = catRes;
    brands.value = brandRes;
    sports.value = sportRes;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu", error);
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = async (id) => {
  if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
  isLoading.value = true;
  try {
    await ProductService.delete(id);
    await fetchData();
  } catch (error) {
    alert("Lỗi khi xóa sản phẩm.");
  } finally {
    isLoading.value = false;
  }
};

const openCreateModal = () => {
  isEditMode.value = false;
  // Reset lại toàn bộ bao gồm cả trường khuyến mãi
  formData.value = {
    id: null,
    name: "",
    description: "",
    category_id: "",
    brand_id: "",
    sport_id: "",
    status: "active",
    discount_percent: 0,
    sale_start: "",
    sale_end: "",
  };
  variants.value = [];
  selectedFiles.value = [];
  showModal.value = true;
};

const openEditModal = async (id) => {
  isLoading.value = true;
  try {
    const productDetail = await ProductService.get(id);
    isEditMode.value = true;

    // Đổ dữ liệu vào form, kèm theo thông tin Khuyến mãi
    formData.value = {
      id: productDetail.id,
      name: productDetail.name,
      description: productDetail.description,
      category_id: productDetail.category_id,
      brand_id: productDetail.brand_id,
      sport_id: productDetail.sport_id,
      status: productDetail.status,
      discount_percent: productDetail.discount_percent || 0,
      sale_start: formatForInput(productDetail.sale_start),
      sale_end: formatForInput(productDetail.sale_end),
    };
    variants.value = productDetail.variants || [];
    selectedFiles.value = [];
    showModal.value = true;
  } catch (error) {
    alert("Không thể tải chi tiết sản phẩm");
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
};

const addVariant = () => {
  variants.value.push({ size: "", color: "", price: 0, stock: 0 });
};
const removeVariant = (index) => {
  variants.value.splice(index, 1);
};

const handleFileChange = (event) => {
  selectedFiles.value = Array.from(event.target.files);
};

const handleSave = async () => {
  isLoading.value = true;
  try {
    if (!isEditMode.value) {
      const data = new FormData();
      data.append("name", formData.value.name);
      data.append("description", formData.value.description || "");
      data.append("category_id", formData.value.category_id);
      if (formData.value.brand_id)
        data.append("brand_id", formData.value.brand_id);
      if (formData.value.sport_id)
        data.append("sport_id", formData.value.sport_id);
      data.append("status", formData.value.status);

      // Gửi thêm dữ liệu Khuyến mãi
      data.append("discount_percent", formData.value.discount_percent || 0);
      if (formData.value.sale_start)
        data.append("sale_start", formData.value.sale_start);
      if (formData.value.sale_end)
        data.append("sale_end", formData.value.sale_end);

      data.append("variants", JSON.stringify(variants.value));

      selectedFiles.value.forEach((file) => {
        data.append("images", file);
      });

      await ProductService.create(data);
    } else {
      const payload = {
        ...formData.value,
        variants: variants.value,
      };
      await ProductService.update(formData.value.id, payload);
    }

    closeModal();
    await fetchData();
  } catch (error) {
    alert(error.response?.data?.message || "Lỗi khi lưu dữ liệu");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.product-manager {
  max-width: 1100px;
  margin: auto;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}
.data-table th,
.data-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
  vertical-align: middle;
}
.data-table th {
  background-color: #f4f6f9;
}

.product-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}
.img-placeholder {
  width: 60px;
  height: 60px;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7em;
  color: #999;
  border-radius: 4px;
}

/* Nút bấm */
.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  margin-right: 5px;
}
.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}
.btn-edit {
  background-color: #ffc107;
  color: #000;
}
.btn-delete {
  background-color: #dc3545;
}
.btn-save {
  background-color: #007bff;
}
.btn-cancel {
  background-color: #6c757d;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Badges */
.badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
  color: white;
}
.category-badge {
  background-color: #17a2b8;
}
.status-active {
  background-color: #198754;
}
.status-hidden {
  background-color: #dc3545;
}

/* Form Elements */
.input-text {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin-top: 5px;
}
.w-50 {
  width: 50%;
}
.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}
.form-group {
  margin-bottom: 15px;
}
.flex-1 {
  flex: 1;
}
.flex-2 {
  flex: 2;
}
.text-muted {
  color: #6c757d;
}
.text-sm {
  font-size: 0.85em;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  width: 850px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* Variants Area */
.variant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.variants-container {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border: 1px dashed #ccc;
}
.variant-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}
.v-col {
  flex: 1;
}
.v-col-btn {
  width: 60px;
  text-align: right;
}
</style>
