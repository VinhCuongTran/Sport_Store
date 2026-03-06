<template>
  <div class="profile-page bg-grey-lighten-5 py-10 min-vh-100">
    <Loading :visible="isUploading" text="Đang cập nhật ảnh đại diện..." />

    <v-container class="max-w-4xl mx-auto">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card class="rounded-xl border elevation-0 bg-white pa-8">
            <div v-if="isLoadingData" class="d-flex justify-center py-10">
              <v-progress-circular
                indeterminate
                color="black"
                size="50"
              ></v-progress-circular>
            </div>

            <div v-else-if="userData">
              <div class="d-flex flex-column align-center mb-8">
                <div class="position-relative">
                  <v-avatar color="grey-lighten-3" size="130" class="border">
                    <v-img
                      :src="userData.avatar || defaultAvatar"
                      alt="Avatar"
                      cover
                    ></v-img>
                  </v-avatar>

                  <v-btn
                    icon="mdi-camera"
                    size="small"
                    color="black"
                    class="avatar-edit-btn"
                    @click="triggerFileInput"
                    :loading="isUploading"
                  ></v-btn>

                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    class="d-none"
                    @change="handleAvatarUpload"
                  />
                </div>

                <h2 class="text-h4 font-weight-black text-black mt-4 mb-1">
                  {{ userData.name }}
                </h2>
                <v-chip
                  color="black"
                  variant="outlined"
                  size="small"
                  class="font-weight-bold text-uppercase"
                >
                  {{ userData.role }}
                </v-chip>
              </div>

              <v-divider class="mb-6"></v-divider>

              <v-list class="bg-transparent px-md-10">
                <v-list-item class="mb-2">
                  <template v-slot:prepend>
                    <v-avatar color="grey-lighten-4" class="mr-4">
                      <v-icon color="black">mdi-email-outline</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold"
                    >Email</v-list-item-title
                  >
                  <v-list-item-subtitle class="text-subtitle-1 mt-1">{{
                    userData.email
                  }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="mb-2">
                  <template v-slot:prepend>
                    <v-avatar color="grey-lighten-4" class="mr-4">
                      <v-icon color="black">mdi-phone-outline</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold"
                    >Số điện thoại</v-list-item-title
                  >
                  <v-list-item-subtitle class="text-subtitle-1 mt-1">
                    {{ userData.phone_number || "Chưa cập nhật" }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="mb-2">
                  <template v-slot:prepend>
                    <v-avatar color="grey-lighten-4" class="mr-4">
                      <v-icon color="black">mdi-gender-male-female</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold"
                    >Giới tính</v-list-item-title
                  >
                  <v-list-item-subtitle
                    class="text-subtitle-1 mt-1 text-capitalize"
                  >
                    {{ getGenderText(userData.gender) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <div class="d-flex justify-center flex-wrap gap-4 mt-8">
                <v-btn
                  prepend-icon="mdi-pencil"
                  color="black"
                  size="large"
                  class="font-weight-bold text-none px-6 rounded-lg"
                  @click="openEditDialog"
                >
                  Cập nhật thông tin
                </v-btn>

                <v-btn
                  prepend-icon="mdi-map-marker-outline"
                  color="blue-darken-2"
                  variant="outlined"
                  size="large"
                  class="font-weight-bold text-none px-6 rounded-lg bg-white"
                  @click="dialogAddresses = true"
                >
                  Sổ địa chỉ
                </v-btn>

                <v-btn
                  prepend-icon="mdi-lock-reset"
                  color="red-darken-2"
                  variant="outlined"
                  size="large"
                  class="font-weight-bold text-none px-6 rounded-lg bg-white"
                  @click="dialogPassword = true"
                >
                  Đổi mật khẩu
                </v-btn>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="dialogEdit" max-width="500px" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="text-h5 font-weight-bold pa-5 bg-black text-white">
          <v-icon class="mr-2">mdi-account-edit</v-icon> Chỉnh sửa hồ sơ
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="formEdit" @submit.prevent="submitUpdateInfo">
            <v-text-field
              v-model="editForm.name"
              label="Họ và tên"
              variant="outlined"
              color="black"
              :rules="[(v) => !!v || 'Tên không được để trống']"
              class="mb-2"
            ></v-text-field>

            <v-text-field
              v-model="editForm.phone_number"
              label="Số điện thoại"
              variant="outlined"
              color="black"
              class="mb-2"
            ></v-text-field>

            <v-select
              v-model="editForm.gender"
              label="Giới tính"
              :items="[
                { title: 'Nam', value: 'male' },
                { title: 'Nữ', value: 'female' },
                { title: 'Khác', value: 'other' },
              ]"
              variant="outlined"
              color="black"
            ></v-select>

            <div class="d-flex justify-end mt-4 gap-3">
              <v-btn
                variant="text"
                color="grey-darken-1"
                class="font-weight-bold"
                @click="dialogEdit = false"
                >Hủy</v-btn
              >
              <v-btn
                type="submit"
                color="black"
                class="font-weight-bold"
                :loading="isSaving"
                >Lưu thay đổi</v-btn
              >
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogPassword" max-width="500px">
      <v-card class="rounded-xl">
        <v-card-title
          class="text-h5 font-weight-bold pa-5 bg-red-darken-2 text-white"
        >
          <v-icon class="mr-2">mdi-lock-reset</v-icon> Đổi mật khẩu mới
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="formPassword" @submit.prevent="submitChangePassword">
            <v-text-field
              v-model="passwordForm.newPassword"
              label="Mật khẩu mới"
              :type="showPass ? 'text' : 'password'"
              variant="outlined"
              color="black"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPass = !showPass"
              :rules="[
                (v) => !!v || 'Vui lòng nhập mật khẩu mới',
                (v) => (v && v.length >= 6) || 'Mật khẩu phải từ 6 ký tự',
              ]"
              class="mb-2"
            ></v-text-field>

            <v-text-field
              v-model="passwordForm.confirmPassword"
              label="Nhập lại mật khẩu mới"
              :type="showPass ? 'text' : 'password'"
              variant="outlined"
              color="black"
              prepend-inner-icon="mdi-lock-check-outline"
              :rules="[
                (v) => !!v || 'Vui lòng xác nhận mật khẩu',
                (v) => v === passwordForm.newPassword || 'Mật khẩu không khớp',
              ]"
            ></v-text-field>

            <div class="d-flex justify-end mt-4 gap-3">
              <v-btn
                variant="text"
                color="grey-darken-1"
                class="font-weight-bold"
                @click="dialogPassword = false"
                >Hủy</v-btn
              >
              <v-btn
                type="submit"
                color="red-darken-2"
                class="font-weight-bold"
                :loading="isSaving"
                >Cập nhật mật khẩu</v-btn
              >
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top right"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Đóng</v-btn>
      </template>
    </v-snackbar>
    <AddressManager v-model="dialogAddresses" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import UserService from "@/services/user.service";
import AddressManager from "@/components/AddressManager.vue";
import Loading from "@/components/Loading.vue";

const router = useRouter();

// State quản lý UI
const isLoadingData = ref(true);
const isUploading = ref(false); // Biến này sẽ kích hoạt Loading.vue
const isSaving = ref(false);
const dialogEdit = ref(false);
const dialogPassword = ref(false);
const showPass = ref(false);
const fileInput = ref(null);
const dialogAddresses = ref(false);

// Form Refs cho Validation Vuetify
const formEdit = ref(null);
const formPassword = ref(null);

const snackbar = ref({ show: false, text: "", color: "success" });

const userData = ref(null);
const defaultAvatar =
  "https://res.cloudinary.com/dosb4fmpo/image/upload/v1772181216/Male_gqcp4c.jpg";

// Data forms
const editForm = ref({ name: "", phone_number: "", gender: "other" });
const passwordForm = ref({ newPassword: "", confirmPassword: "" });

// Helpers
const getGenderText = (val) => {
  if (val === "male") return "Nam";
  if (val === "female") return "Nữ";
  return "Khác";
};

const showMessage = (text, color = "success") => {
  snackbar.value = { show: true, text, color };
};

// ================= FETCH DATA =================
const fetchUserProfile = async () => {
  isLoadingData.value = true;
  try {
    const localUserStr = localStorage.getItem("user");
    if (!localUserStr) {
      router.push("/login");
      return;
    }

    const localUser = JSON.parse(localUserStr);

    // Gọi API lấy dữ liệu mới nhất từ DB
    const data = await UserService.get(localUser.id);
    userData.value = data;

    // Cập nhật lại localStorage để đồng bộ Header
    localStorage.setItem("user", JSON.stringify(data));
    window.dispatchEvent(new Event("storage")); // Báo cho Header.vue biết để cập nhật tên/avatar
  } catch (error) {
    console.error("Lỗi lấy thông tin:", error);
    showMessage("Không thể tải thông tin cá nhân", "error");
  } finally {
    isLoadingData.value = false;
  }
};

// ================= CẬP NHẬT ẢNH ĐẠI DIỆN =================
const triggerFileInput = () => {
  fileInput.value.click();
};

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isUploading.value = true; // Bật Loading Overlay
  try {
    // Backend API /users/:id cấu hình nhận multipart/form-data thông qua Multer
    const formData = new FormData();
    formData.append("avatar", file);

    await UserService.update(userData.value.id, formData);

    showMessage("Cập nhật ảnh đại diện thành công!");
    await fetchUserProfile(); // Load lại data để lấy link ảnh mới
  } catch (error) {
    showMessage("Lỗi khi tải ảnh lên", "error");
  } finally {
    isUploading.value = false; // Tắt Loading Overlay
    event.target.value = null; // Reset input
  }
};

// ================= CẬP NHẬT THÔNG TIN CƠ BẢN =================
const openEditDialog = () => {
  editForm.value = {
    name: userData.value.name,
    phone_number: userData.value.phone_number || "",
    gender: userData.value.gender || "other",
  };
  dialogEdit.value = true;
};

const submitUpdateInfo = async () => {
  const { valid } = await formEdit.value.validate();
  if (!valid) return;

  isSaving.value = true;
  try {
    const formData = new FormData();
    formData.append("name", editForm.value.name);
    formData.append("gender", editForm.value.gender);

    // Xử lý gửi chuỗi rỗng nếu người dùng xóa SĐT
    if (editForm.value.phone_number) {
      formData.append("phone_number", editForm.value.phone_number);
    } else {
      formData.append("phone_number", "");
    }

    await UserService.update(userData.value.id, formData);

    showMessage("Cập nhật thông tin thành công!");
    dialogEdit.value = false;
    await fetchUserProfile();
  } catch (error) {
    showMessage(error.response?.data?.message || "Lỗi cập nhật", "error");
  } finally {
    isSaving.value = false;
  }
};

// ================= ĐỔI MẬT KHẨU =================
const submitChangePassword = async () => {
  const { valid } = await formPassword.value.validate();
  if (!valid) return;

  isSaving.value = true;
  try {
    const formData = new FormData();
    // API backend sẽ tự động hash password mới nếu có trường password gửi lên
    formData.append("password", passwordForm.value.newPassword);

    await UserService.update(userData.value.id, formData);

    showMessage("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
    dialogPassword.value = false;

    // Tự động đăng xuất sau 2s
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("storage"));
      router.push("/login");
    }, 2000);
  } catch (error) {
    showMessage("Lỗi khi đổi mật khẩu", "error");
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}
.max-w-4xl {
  max-width: 900px;
}
.avatar-edit-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  border: 3px solid white !important;
  z-index: 10;
  background-color: white !important;
}
.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}
</style>
