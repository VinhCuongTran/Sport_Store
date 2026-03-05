<template>
  <div class="brand-manager">
    <Loading :visible="isLoading" text="Đang xử lý dữ liệu..." />

    <div class="header-actions">
      <h2>Quản lý Thương hiệu</h2>
      <button @click="openModal()" class="btn btn-add">
        Thêm Thương Hiệu Mới
      </button>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>STT</th>
          <th>Logo</th>
          <th>Tên Thương Hiệu</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(brand, index) in brands" :key="brand.id">
          <td>{{ index + 1 }}</td>
          <td>
            <img
              v-if="brand.logo_url"
              :src="getImageUrl(brand.logo_url)"
              alt="Logo"
              class="brand-logo"
            />
            <span v-else>Không có ảnh</span>
          </td>
          <td>{{ brand.name }}</td>
          <td>
            <button @click="openModal(brand)" class="btn btn-edit">Sửa</button>
            <button @click="handleDelete(brand.id)" class="btn btn-delete">
              Xóa
            </button>
          </td>
        </tr>
        <tr v-if="brands.length === 0">
          <td colspan="4" class="text-center">Chưa có thương hiệu nào.</td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>
          {{ isEditMode ? "Cập nhật Thương Hiệu" : "Thêm Thương Hiệu Mới" }}
        </h3>

        <form @submit.prevent="handleSave">
          <div class="form-group">
            <label>Tên thương hiệu</label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="Nhập tên thương hiệu..."
              class="input-text"
              required
            />
          </div>

          <div class="form-group">
            <label>Logo thương hiệu</label>
            <input
              type="file"
              @change="handleFileChange"
              accept="image/*"
              class="input-text"
            />
            <div v-if="previewImage" class="preview-container">
              <img :src="previewImage" alt="Preview" class="preview-img" />
            </div>
            <div
              v-else-if="formData.logo_url && isEditMode"
              class="preview-container"
            >
              <img
                :src="getImageUrl(formData.logo_url)"
                alt="Current Logo"
                class="preview-img"
              />
            </div>
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
import BrandService from "@/services/brand.service";
import Loading from "@/components/Loading.vue"; // 1. Import component Loading

const brands = ref([]);
const showModal = ref(false);
const isEditMode = ref(false);
const isLoading = ref(false); // 2. Thêm biến trạng thái Loading

const formData = ref({ id: null, name: "", logo_url: "" });
const selectedFile = ref(null);
const previewImage = ref(null);

const getImageUrl = (path) => {
  return path;
};

const fetchBrands = async () => {
  isLoading.value = true; // Bật loading
  try {
    brands.value = await BrandService.getAll();
  } catch (error) {
    console.error("Lỗi khi tải thương hiệu", error);
  } finally {
    isLoading.value = false; // Tắt loading
  }
};

const handleDelete = async (id) => {
  if (!confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) return;
  isLoading.value = true;
  try {
    await BrandService.delete(id);
    await fetchBrands(); // Chờ fetchBrands chạy xong
  } catch (error) {
    alert("Không thể xóa thương hiệu này.");
  } finally {
    isLoading.value = false;
  }
};

const openModal = (brand = null) => {
  if (brand) {
    isEditMode.value = true;
    formData.value = { ...brand };
  } else {
    isEditMode.value = false;
    formData.value = { id: null, name: "", logo_url: "" };
  }
  selectedFile.value = null;
  previewImage.value = null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedFile.value = null;
  previewImage.value = null;
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewImage.value = URL.createObjectURL(file);
  } else {
    selectedFile.value = null;
    previewImage.value = null;
  }
};

const handleSave = async () => {
  isLoading.value = true;
  try {
    const data = new FormData();
    data.append("name", formData.value.name);

    if (selectedFile.value) {
      data.append("logo", selectedFile.value);
    }

    if (isEditMode.value) {
      await BrandService.update(formData.value.id, data);
    } else {
      await BrandService.create(data);
    }

    closeModal();
    await fetchBrands();
  } catch (error) {
    alert(error.response?.data?.message || "Lỗi khi lưu dữ liệu");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchBrands();
});
</script>

<style scoped>
/* Tái sử dụng CSS từ file gốc của bạn... */
.brand-manager {
  max-width: 900px;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.input-text {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin-top: 5px;
}

.btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  margin-right: 5px;
}
.btn-add {
  background-color: #28a745;
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
} /* Thêm CSS cho trạng thái disabled */

.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th,
.data-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
  vertical-align: middle;
}
.data-table th {
  background-color: #f4f6f9;
}
.text-center {
  text-align: center;
}

.brand-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 2px;
  background: #fff;
}
.preview-container {
  margin-top: 10px;
  text-align: center;
}
.preview-img {
  max-width: 100%;
  max-height: 120px;
  border: 1px dashed #ccc;
  padding: 5px;
}

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
  width: 450px;
  max-width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.modal-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
}
.form-group {
  margin-bottom: 15px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
