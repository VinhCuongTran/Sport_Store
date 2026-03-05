<template>
  <div class="category-manager">
    <Loading :visible="isLoading" text="Đang xử lý dữ liệu..." />

    <div class="header-actions">
      <h2>Quản lý Danh mục sản phẩm</h2>
      <button @click="openModal()" class="btn btn-add">
        Thêm Danh Mục Mới
      </button>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>STT</th>
          <th>Tên Danh Mục</th>
          <th>Danh Mục Cha</th>
          <th>Ngày Tạo</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(category, index) in categories" :key="category.id">
          <td>{{ index + 1 }}</td>
          <td>{{ category.name }}</td>
          <td>
            <span v-if="category.parent_id" class="badge-parent">
              {{ getParentName(category.parent_id) }}
            </span>
            <span v-else class="text-muted">Danh mục gốc</span>
          </td>
          <td>
            {{ new Date(category.created_at).toLocaleDateString("vi-VN") }}
          </td>
          <td>
            <button @click="openModal(category)" class="btn btn-edit">
              Sửa
            </button>
            <button @click="handleDelete(category.id)" class="btn btn-delete">
              Xóa
            </button>
          </td>
        </tr>
        <tr v-if="categories.length === 0">
          <td colspan="5" class="text-center">Chưa có danh mục nào.</td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ isEditMode ? "Cập nhật Danh Mục" : "Thêm Danh Mục Mới" }}</h3>

        <div class="form-group">
          <label>Tên danh mục</label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="Nhập tên danh mục..."
            class="input-text"
            @keyup.enter="handleSave"
          />
        </div>

        <div class="form-group">
          <label>Danh mục cha</label>
          <select v-model="formData.parent_id" class="input-text">
            <option :value="null">-- Không có (Danh mục gốc) --</option>
            <option
              v-for="cat in availableParentCategories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="modal-actions">
          <button
            @click="handleSave"
            class="btn btn-save"
            :disabled="isLoading"
          >
            {{ isLoading ? "Đang lưu..." : "Lưu lại" }}
          </button>
          <button
            @click="closeModal"
            class="btn btn-cancel"
            :disabled="isLoading"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"; // Nhớ import thêm computed
import CategoryService from "@/services/category.service";
import Loading from "@/components/Loading.vue";

const categories = ref([]);

// State cho Modal và Loading
const showModal = ref(false);
const isEditMode = ref(false);
const isLoading = ref(false);
// Cập nhật formData để có thêm parent_id
const formData = ref({ id: null, name: "", parent_id: null });

// Computed property để lọc danh sách danh mục cha
// Tránh việc một danh mục chọn chính nó làm cha khi cập nhật
const availableParentCategories = computed(() => {
  if (!isEditMode.value) return categories.value;
  return categories.value.filter((cat) => cat.id !== formData.value.id);
});

// Hàm lấy tên danh mục cha dựa vào id để hiển thị trên bảng
const getParentName = (parentId) => {
  const parent = categories.value.find((c) => c.id === parentId);
  return parent ? parent.name : "Không xác định";
};

// Gọi API lấy danh sách
const fetchCategories = async () => {
  isLoading.value = true;
  try {
    categories.value = await CategoryService.getAll();
  } catch (error) {
    console.error("Lỗi khi tải danh mục", error);
  } finally {
    isLoading.value = false;
  }
};

// Xóa danh mục
const handleDelete = async (id) => {
  if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
  isLoading.value = true;
  try {
    await CategoryService.delete(id);
    await fetchCategories();
  } catch (error) {
    alert(
      "Không thể xóa danh mục này (Có thể do đang có sản phẩm thuộc danh mục hoặc đang làm cha của danh mục khác)",
    );
  } finally {
    isLoading.value = false;
  }
};

// Mở Modal
const openModal = (category = null) => {
  if (category) {
    isEditMode.value = true;
    formData.value = { ...category };
  } else {
    isEditMode.value = false;
    formData.value = { id: null, name: "", parent_id: null };
  }
  showModal.value = true;
};

// Đóng Modal
const closeModal = () => {
  showModal.value = false;
  formData.value = { id: null, name: "", parent_id: null };
};

// Lưu dữ liệu
const handleSave = async () => {
  if (!formData.value.name.trim()) {
    return alert("Tên danh mục không được để trống");
  }

  isLoading.value = true;
  try {
    const payload = {
      name: formData.value.name,
      parent_id: formData.value.parent_id, // Gửi thêm parent_id lên server
    };

    if (isEditMode.value) {
      await CategoryService.update(formData.value.id, payload);
    } else {
      await CategoryService.create(payload);
    }

    closeModal();
    await fetchCategories();
  } catch (error) {
    alert(error.response?.data?.message || "Lỗi khi lưu dữ liệu");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
/* Giữ nguyên CSS cũ của bạn và thêm một chút CSS cho nhãn cha */
.category-manager {
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

.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th,
.data-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}
.data-table th {
  background-color: #f4f6f9;
}
.text-center {
  text-align: center;
}

/* Thêm css cho text Danh mục */
.text-muted {
  color: #6c757d;
  font-style: italic;
  font-size: 0.9em;
}
.badge-parent {
  background-color: #e9ecef;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  color: #495057;
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
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
}
.form-group {
  margin-bottom: 20px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
