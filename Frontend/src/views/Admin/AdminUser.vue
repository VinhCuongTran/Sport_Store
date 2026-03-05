<template>
  <div class="user-manager">
    <Loading :visible="isLoading" text="Đang xử lý dữ liệu..." />

    <div class="header-actions">
      <h2>Quản lý Người dùng</h2>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>STT</th>
          <th>Avatar</th>
          <th>Thông tin</th>
          <th>Vai trò</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in users" :key="user.id">
          <td>{{ index + 1 }}</td>
          <td>
            <img
              v-if="user.avatar"
              :src="user.avatar"
              alt="Avatar"
              class="user-avatar"
            />
            <div v-else class="avatar-placeholder">No IMG</div>
          </td>
          <td>
            <strong>{{ user.name }}</strong
            ><br />
            <small>{{ user.email }}</small
            ><br />
            <small>{{ user.phone_number || "Chưa có SĐT" }}</small>
          </td>
          <td>
            <span :class="['badge', `role-${user.role}`]">{{ user.role }}</span>
          </td>
          <td>
            <span :class="['badge', `status-${user.status}`]">{{
              user.status === "active" ? "Hoạt động" : "Bị khóa"
            }}</span>
          </td>
          <td>
            <button
              @click="toggleStatus(user)"
              :class="[
                'btn',
                user.status === 'active' ? 'btn-warning' : 'btn-success',
              ]"
            >
              {{ user.status === "active" ? "Khóa" : "Mở khóa" }}
            </button>
            <button @click="openEditModal(user)" class="btn btn-edit">
              Sửa
            </button>
            <button @click="handleDelete(user.id)" class="btn btn-delete">
              Xóa
            </button>
          </td>
        </tr>
        <tr v-if="users.length === 0">
          <td colspan="6" class="text-center">Chưa có người dùng nào.</td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content scrollable">
        <h3>Cập nhật Người dùng</h3>

        <form @submit.prevent="handleSave">
          <div class="form-row">
            <div class="form-group half">
              <label>Họ và Tên</label>
              <input
                v-model="formData.name"
                type="text"
                class="input-text"
                required
              />
            </div>
            <div class="form-group half">
              <label>Email</label>
              <input
                v-model="formData.email"
                type="email"
                class="input-text"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label>Số điện thoại</label>
              <input
                v-model="formData.phone_number"
                type="text"
                class="input-text"
              />
            </div>
            <div class="form-group half">
              <label>Giới tính</label>
              <select v-model="formData.gender" class="input-text">
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label>Vai trò (Role)</label>
              <select v-model="formData.role" class="input-text">
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="form-group half">
              <label>Trạng thái</label>
              <select v-model="formData.status" class="input-text">
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Mật khẩu mới (Để trống nếu không đổi)</label>
            <input
              v-model="formData.password"
              type="password"
              placeholder="Nhập mật khẩu mới..."
              class="input-text"
            />
          </div>

          <div class="form-group">
            <label>Ảnh đại diện (Avatar)</label>
            <input
              type="file"
              @change="handleFileChange"
              accept="image/*"
              class="input-text"
            />
            <div v-if="previewImage" class="preview-container">
              <img :src="previewImage" alt="Preview" class="preview-img" />
            </div>
            <div v-else-if="formData.avatar" class="preview-container">
              <img
                :src="formData.avatar"
                alt="Current Avatar"
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
import UserService from "@/services/user.service";
import Loading from "@/components/Loading.vue";

const users = ref([]);
const showModal = ref(false);
const isLoading = ref(false);

const formData = ref({
  id: null,
  name: "",
  email: "",
  phone_number: "",
  gender: "",
  role: "",
  status: "",
  password: "",
  avatar: "",
});
const selectedFile = ref(null);
const previewImage = ref(null);

const fetchUsers = async () => {
  isLoading.value = true;
  try {
    users.value = await UserService.getAll();
  } catch (error) {
    console.error("Lỗi khi tải người dùng", error);
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = async (id) => {
  if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
  isLoading.value = true;
  try {
    await UserService.delete(id);
    await fetchUsers();
  } catch (error) {
    alert("Lỗi khi xóa người dùng.");
  } finally {
    isLoading.value = false;
  }
};

// --- HÀM MỚI: Toggle nhanh trạng thái Khóa/Mở ---
const toggleStatus = async (user) => {
  const newStatus = user.status === "active" ? "blocked" : "active";
  const actionText = newStatus === "blocked" ? "khóa" : "mở khóa";

  if (
    !confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản của ${user.name}?`)
  )
    return;

  isLoading.value = true;
  try {
    const data = new FormData();
    data.append("status", newStatus);

    await UserService.update(user.id, data);
    await fetchUsers();
  } catch (error) {
    alert(error.response?.data?.message || "Lỗi khi cập nhật trạng thái");
  } finally {
    isLoading.value = false;
  }
};

const openEditModal = (user) => {
  formData.value = { ...user, password: "" };
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
    data.append("email", formData.value.email);

    // Nếu rỗng thì gửi rỗng lên, BE sẽ chuyển thành null để tránh lỗi trùng số ĐT
    if (formData.value.phone_number) {
      data.append("phone_number", formData.value.phone_number);
    } else {
      data.append("phone_number", "");
    }

    data.append("gender", formData.value.gender);
    data.append("role", formData.value.role);
    data.append("status", formData.value.status);

    if (formData.value.password) {
      data.append("password", formData.value.password);
    }

    if (selectedFile.value) {
      data.append("avatar", selectedFile.value);
    }

    await UserService.update(formData.value.id, data);

    closeModal();
    await fetchUsers();
  } catch (error) {
    alert(error.response?.data?.message || "Lỗi khi cập nhật");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.user-manager {
  max-width: 1000px;
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

/* Nút bấm */
.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  margin-right: 5px;
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
.btn-warning {
  background-color: #ffc107; /* Màu vàng cam để cảnh báo khóa */
  color: #000;
}
.btn-success {
  background-color: #198754; /* Màu xanh khi muốn mở khóa */
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Form inputs */
.input-text {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin-top: 5px;
}
.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}
.half {
  flex: 1;
}
.form-group {
  margin-bottom: 15px;
}

/* Badges */
.badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
  color: white;
}
.role-admin {
  background-color: #dc3545;
}
.role-staff {
  background-color: #0d6efd;
}
.role-customer {
  background-color: #6c757d;
}
.status-active {
  background-color: #198754;
}
.status-blocked {
  background-color: #dc3545;
}

/* Ảnh Avatar */
.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7em;
  color: #999;
}
.preview-container {
  margin-top: 10px;
  text-align: center;
}
.preview-img {
  max-width: 100px;
  max-height: 100px;
  border-radius: 50%;
  object-fit: cover;
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
  width: 550px;
  max-width: 90%;
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
</style>
