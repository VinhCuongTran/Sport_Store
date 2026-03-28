<template>
  <v-container
    fluid
    theme="light"
    class="fill-height d-flex flex-column align-center pa-6"
    style="background-color: #f4f6f8; min-height: 100vh"
  >
    <Loading :visible="isLoading" text="Đang xử lý dữ liệu..." />

    <div class="d-flex justify-space-between align-center w-100 mb-6">
      <div>
        <h2
          class="text-h5 font-weight-bold text-indigo-darken-4"
          style="line-height: 1.2"
        >
          Quản lý Người dùng
        </h2>
        <span class="text-caption text-indigo-darken-4"
          >Danh sách tài khoản khách hàng và nhân viên</span
        >
      </div>
      <v-btn
        color="indigo-darken-4"
        prepend-icon="mdi-refresh"
        rounded="lg"
        elevation="0"
        variant="elevated"
        class="text-capitalize font-weight-semibold"
        @click="fetchUsers"
        :loading="isLoading"
      >
        Làm Mới
      </v-btn>
    </div>

    <v-card
      color="white"
      width="100%"
      elevation="0"
      rounded="xl"
      class="pa-4"
      style="
        border: 1px solid rgba(99, 102, 241, 0.15);
        box-shadow: 0 4px 24px rgba(99, 102, 241, 0.1);
      "
    >
      <div class="d-flex align-center gap-3 mb-4 px-2">
        <v-text-field
          v-model="search"
          density="compact"
          variant="outlined"
          placeholder="Tìm tên, email, SĐT..."
          prepend-inner-icon="mdi-magnify"
          hide-details
          clearable
          rounded="lg"
          color="indigo-darken-3"
          style="max-width: 320px"
        />
        <v-spacer />
        <v-chip
          color="indigo-lighten-4"
          text-color="indigo-darken-4"
          size="small"
          variant="flat"
          prepend-icon="mdi-account-group"
        >
          {{ users.length }} người dùng
        </v-chip>
      </div>

      <v-divider class="mb-2" />

      <v-data-table
        :headers="headers"
        :items="users"
        :search="search"
        :loading="isLoading"
        hover
        class="bg-white rounded-lg"
        no-data-text="Chưa có người dùng nào"
      >
        <template v-slot:item.index="{ item, index }">
          <span class="font-weight-bold text-indigo-darken-4">{{
            index + 1
          }}</span>
        </template>

        <template v-slot:item.avatar="{ item }">
          <div class="d-flex justify-center my-2">
            <v-avatar size="48" class="border bg-grey-lighten-4">
              <v-img v-if="item.avatar" :src="item.avatar" cover></v-img>
              <v-icon v-else color="grey-lighten-1">mdi-account</v-icon>
            </v-avatar>
          </div>
        </template>

        <template v-slot:item.info="{ item }">
          <div class="text-body-2 font-weight-bold text-black mb-1">
            {{ item.name }}
          </div>
          <div class="text-caption text-grey-darken-2 d-flex align-center">
            <v-icon size="14" class="mr-1">mdi-email-outline</v-icon>
            {{ item.email }}
          </div>
          <div class="text-caption text-grey-darken-2 d-flex align-center">
            <v-icon size="14" class="mr-1">mdi-phone-outline</v-icon>
            {{ item.phone_number || "Chưa có SĐT" }}
          </div>
        </template>

        <template v-slot:item.role="{ item }">
          <v-chip
            size="small"
            :color="getRoleColor(item.role)"
            variant="tonal"
            class="font-weight-bold text-uppercase"
          >
            {{ item.role }}
          </v-chip>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            size="small"
            :color="item.status === 'active' ? 'success' : 'error'"
            variant="flat"
            class="font-weight-medium"
          >
            <v-icon start size="14">{{
              item.status === "active" ? "mdi-check-circle" : "mdi-lock"
            }}</v-icon>
            {{ item.status === "active" ? "Hoạt động" : "Bị khóa" }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-center align-center gap-2">
            <v-btn
              :color="item.status === 'active' ? 'warning' : 'success'"
              size="small"
              rounded="lg"
              :prepend-icon="
                item.status === 'active' ? 'mdi-lock' : 'mdi-lock-open'
              "
              variant="tonal"
              class="text-capitalize"
              @click="toggleStatus(item)"
            >
              {{ item.status === "active" ? "Khóa" : "Mở khóa" }}
            </v-btn>
            <v-btn
              color="amber-darken-2"
              size="small"
              rounded="lg"
              prepend-icon="mdi-pencil"
              variant="tonal"
              class="text-capitalize"
              @click="openEditModal(item)"
              >Sửa</v-btn
            >
            <v-btn
              color="red-darken-1"
              size="small"
              rounded="lg"
              prepend-icon="mdi-delete"
              variant="tonal"
              class="text-capitalize"
              @click="handleDelete(item)"
              >Xóa</v-btn
            >
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="showModal" max-width="700px" persistent scrollable>
      <v-card rounded="xl" elevation="8" theme="light" color="white">
        <div
          class="d-flex align-center justify-space-between px-6 py-4"
          style="background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%)"
        >
          <div class="d-flex align-center gap-3">
            <v-icon color="white" size="22">mdi-account-edit</v-icon>
            <span class="text-body-1 font-weight-bold text-white"
              >Cập nhật Người dùng</span
            >
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            size="small"
            @click="closeModal"
            :disabled="isLoading"
          ></v-btn>
        </div>

        <v-card-text
          class="px-6 py-5 bg-white"
          style="max-height: 75vh; overflow-y: auto"
        >
          <form @submit.prevent="handleSave">
            <v-row>
              <v-col cols="12" md="6" class="py-1">
                <label
                  class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                  >Họ và Tên <span class="text-red">*</span></label
                >
                <input
                  v-model="formData.name"
                  type="text"
                  class="custom-input text-black"
                  required
                  placeholder="Nhập họ tên..."
                />
              </v-col>
              <v-col cols="12" md="6" class="py-1">
                <label
                  class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                  >Email <span class="text-red">*</span></label
                >
                <input
                  v-model="formData.email"
                  type="email"
                  class="custom-input text-black"
                  required
                  placeholder="user@example.com"
                />
              </v-col>

              <v-col cols="12" md="6" class="py-1 mt-2">
                <label
                  class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                  >Số điện thoại</label
                >
                <input
                  v-model="formData.phone_number"
                  type="text"
                  class="custom-input text-black"
                  placeholder="Nhập SĐT..."
                />
              </v-col>
              <v-col cols="12" md="6" class="py-1 mt-2">
                <label
                  class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                  >Giới tính</label
                >
                <select
                  v-model="formData.gender"
                  class="custom-input text-black"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </v-col>

              <v-col cols="12" md="6" class="py-1 mt-2">
                <label
                  class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                  >Vai trò (Role)</label
                >
                <select v-model="formData.role" class="custom-input text-black">
                  <option value="customer">Customer (Khách hàng)</option>
                  <option value="staff">Staff (Nhân viên)</option>
                  <option value="admin">Admin (Quản trị)</option>
                </select>
              </v-col>
              <v-col cols="12" md="6" class="py-1 mt-2">
                <label
                  class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                  >Trạng thái</label
                >
                <select
                  v-model="formData.status"
                  class="custom-input text-black"
                  :disabled="formData.id === currentUser.id"
                >
                  <option value="active">Active (Hoạt động)</option>
                  <option value="blocked">Blocked (Bị khóa)</option>
                </select>
              </v-col>

              <v-col cols="12" class="py-1 mt-2">
                <label
                  class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                >
                  <v-icon size="16" class="mr-1">mdi-lock-reset</v-icon> Mật
                  khẩu mới
                </label>
                <input
                  v-model="formData.password"
                  type="password"
                  class="custom-input text-black"
                  placeholder="Để trống nếu không muốn đổi mật khẩu..."
                />
              </v-col>

              <v-col cols="12" class="py-1 mt-2">
                <label
                  class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                >
                  <v-icon size="16" class="mr-1">mdi-image</v-icon> Ảnh đại diện
                  (Avatar)
                </label>
                <input
                  type="file"
                  @change="handleFileChange"
                  accept="image/*"
                  class="custom-input text-black file-input"
                />

                <div v-if="previewImage" class="text-center mt-4">
                  <v-avatar size="100" class="border">
                    <img
                      :src="previewImage"
                      alt="Preview"
                      class="preview-img"
                    />
                  </v-avatar>
                </div>
                <div v-else-if="formData.avatar" class="text-center mt-4">
                  <v-avatar size="100" class="border">
                    <img
                      :src="formData.avatar"
                      alt="Current Avatar"
                      class="preview-img"
                    />
                  </v-avatar>
                </div>
              </v-col>
            </v-row>
          </form>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="px-6 py-4 gap-3 bg-white">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="tonal"
            rounded="lg"
            min-width="110"
            class="text-capitalize"
            @click="closeModal"
            :disabled="isLoading"
          >
            <v-icon start>mdi-close</v-icon>Hủy bỏ
          </v-btn>
          <v-btn
            color="indigo-darken-4"
            variant="elevated"
            rounded="lg"
            min-width="140"
            class="text-capitalize"
            @click="handleSave"
            :loading="isLoading"
          >
            <v-icon start>mdi-content-save</v-icon>Lưu lại
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmDialog ref="confirmDialogRef" />

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top right"
    >
      <div class="d-flex align-center gap-2">
        <v-icon size="18">{{
          snackbar.color === "success" ? "mdi-check-circle" : "mdi-alert-circle"
        }}</v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import UserService from "@/services/user.service";
import Loading from "@/components/Loading.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

const users = ref([]);
const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
const showModal = ref(false);
const isLoading = ref(false);
const search = ref("");
const confirmDialogRef = ref(null);
const snackbar = ref({ show: false, text: "", color: "success" });

const headers = [
  {
    title: "STT",
    key: "index",
    width: "70px",
    align: "center",
    sortable: false,
  },
  {
    title: "Avatar",
    key: "avatar",
    width: "90px",
    align: "center",
    sortable: false,
  },
  { title: "Thông tin", key: "info", align: "start" },
  { title: "Vai trò", key: "role", align: "center", width: "140px" },
  { title: "Trạng thái", key: "status", align: "center", width: "160px" },
  {
    title: "Thao tác",
    key: "actions",
    sortable: false,
    align: "center",
    width: "290px",
  },
];

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

const showMessage = (text, color = "success") => {
  snackbar.value = { show: true, text, color };
};

const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const data = await UserService.getAll();
    users.value = data.map((u) => ({
      ...u,
      info: `${u.name} ${u.email} ${u.phone_number || ""}`,
    }));
  } catch (error) {
    showMessage("Lỗi khi tải người dùng", "error");
  } finally {
    isLoading.value = false;
  }
};

const getRoleColor = (role) => {
  if (role === "admin") return "red-darken-1";
  if (role === "staff") return "blue-darken-1";
  return "grey-darken-1";
};

const handleDelete = async (user) => {
  const isConfirmed = await confirmDialogRef.value.open(
    "Xóa Người Dùng",
    `Bạn có chắc chắn muốn xóa tài khoản "${user.name}"? Dữ liệu không thể khôi phục.`,
  );

  if (!isConfirmed) return;

  isLoading.value = true;
  try {
    await UserService.delete(user.id);
    showMessage("Xóa người dùng thành công!");
    await fetchUsers();
  } catch (error) {
    showMessage(
      error.response?.data?.message || "Lỗi khi xóa người dùng.",
      "error",
    );
  } finally {
    isLoading.value = false;
  }
};

const toggleStatus = async (user) => {
  if (user.id === currentUser.id) {
    showMessage("Bạn không thể tự khóa tài khoản của chính mình!", "error");
    return;
  }
  const newStatus = user.status === "active" ? "blocked" : "active";
  const actionText = newStatus === "blocked" ? "khóa" : "mở khóa";

  const isConfirmed = await confirmDialogRef.value.open(
    "Cập nhật Trạng thái",
    `Bạn có chắc chắn muốn ${actionText} tài khoản của "${user.name}"?`,
  );

  if (!isConfirmed) return;

  isLoading.value = true;
  try {
    const data = new FormData();
    data.append("status", newStatus);

    await UserService.update(user.id, data);
    showMessage(`Đã ${actionText} tài khoản thành công!`);
    await fetchUsers();
  } catch (error) {
    showMessage(
      error.response?.data?.message || "Lỗi khi cập nhật trạng thái",
      "error",
    );
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
  if (!formData.value.name || !formData.value.email) {
    showMessage("Vui lòng điền đầy đủ Tên và Email!", "error");
    return;
  }
  if (
    formData.value.id === currentUser.id &&
    formData.value.status === "blocked"
  ) {
    showMessage("Bạn không thể tự khóa tài khoản của chính mình!", "error");
    return;
  }

  isLoading.value = true;
  try {
    const data = new FormData();
    data.append("name", formData.value.name);
    data.append("email", formData.value.email);
    data.append("phone_number", formData.value.phone_number || "");
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
    showMessage("Cập nhật thông tin thành công!");
    closeModal();
    await fetchUsers();
  } catch (error) {
    showMessage(error.response?.data?.message || "Lỗi khi cập nhật", "error");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.custom-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #c5cae9;
  border-radius: 10px;
  font-size: 0.9rem;
  outline: none;
  background: #fafbff;
  color: #000;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.custom-input:focus {
  border-color: #3949ab;
  box-shadow: 0 0 0 3px rgba(57, 73, 171, 0.12);
  background: #fff;
}
select.custom-input {
  cursor: pointer;
}
.file-input {
  padding: 7px 12px;
  cursor: pointer;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.border {
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.v-data-table th.v-data-table__th) {
  background: linear-gradient(90deg, #e8eaf6 0%, #f3f4f6 100%) !important;
  color: #283593 !important;
  font-weight: 700 !important;
  font-size: 0.9rem !important;
}

:deep(.v-data-table th.v-data-table__th:hover),
:deep(.v-data-table th.v-data-table__th:hover .v-data-table-header__sort-icon) {
  color: #1a237e !important;
}

:deep(.v-data-table td) {
  vertical-align: middle;
}
</style>
