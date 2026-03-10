<template>
  <div class="profile-page bg-grey-lighten-4 py-10 min-vh-100">
    <Loading :visible="isUploading" text="Đang cập nhật ảnh đại diện..." />

    <v-container class="max-w-4xl mx-auto">
      <v-row justify="center">
        <v-col cols="12" md="11">
          <v-card
            class="rounded-xl elevation-2 bg-white border-none overflow-hidden"
          >
            <v-tabs
              v-model="activeTab"
              bg-color="#001a2d"
              color="#77e51f"
              align-tabs="center"
              slider-color="#77e51f"
              class="text-white"
            >
              <v-tab value="info" class="text-none font-weight-bold">
                <v-icon start>mdi-account-circle</v-icon>Hồ sơ cá nhân
              </v-tab>
              <v-tab
                value="orders"
                class="text-none font-weight-bold"
                to="/orders"
              >
                <v-icon start>mdi-clipboard-text-outline</v-icon>Đơn hàng của
                tôi
              </v-tab>
            </v-tabs>

            <v-card-text class="pa-8">
              <v-window v-model="activeTab">
                <v-window-item value="info">
                  <div v-if="isLoadingData" class="d-flex justify-center py-10">
                    <v-progress-circular
                      indeterminate
                      color="#001a2d"
                      size="50"
                    ></v-progress-circular>
                  </div>

                  <div v-else-if="userData">
                    <div class="d-flex flex-column align-center mb-10">
                      <div class="position-relative">
                        <v-avatar
                          color="grey-lighten-4"
                          size="130"
                          class="border-avatar elevation-1"
                        >
                          <v-img
                            :src="userData.avatar || defaultAvatar"
                            alt="Avatar"
                            cover
                          ></v-img>
                        </v-avatar>

                        <v-btn
                          icon="mdi-camera"
                          size="small"
                          class="avatar-edit-btn custom-btn"
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

                      <h2
                        class="text-h4 font-weight-black mt-4 custom-main-color text-uppercase"
                      >
                        {{ userData.name }}
                      </h2>
                      <v-chip
                        color="#001a2d"
                        variant="flat"
                        class="mt-2 text-white font-weight-bold text-uppercase"
                      >
                        {{ userData.role }}
                      </v-chip>
                    </div>

                    <v-divider class="mb-8"></v-divider>

                    <v-row justify="center">
                      <v-col cols="12" sm="10">
                        <v-list class="bg-transparent pa-0">
                          <v-list-item
                            class="mb-4 rounded-lg border bg-grey-lighten-5"
                          >
                            <template v-slot:prepend>
                              <v-icon color="#001a2d" class="mr-4"
                                >mdi-email-outline</v-icon
                              >
                            </template>
                            <v-list-item-title class="text-caption text-grey"
                              >Email tài khoản</v-list-item-title
                            >
                            <v-list-item-subtitle
                              class="text-body-1 font-weight-bold text-black mt-1"
                            >
                              {{ userData.email }}
                            </v-list-item-subtitle>
                          </v-list-item>

                          <v-list-item
                            class="mb-4 rounded-lg border bg-grey-lighten-5"
                          >
                            <template v-slot:prepend>
                              <v-icon color="#001a2d" class="mr-4"
                                >mdi-phone-outline</v-icon
                              >
                            </template>
                            <v-list-item-title class="text-caption text-grey"
                              >Số điện thoại</v-list-item-title
                            >
                            <v-list-item-subtitle
                              class="text-body-1 font-weight-bold text-black mt-1"
                            >
                              {{ userData.phone_number || "Chưa cập nhật" }}
                            </v-list-item-subtitle>
                          </v-list-item>

                          <v-list-item
                            class="rounded-lg border bg-grey-lighten-5"
                          >
                            <template v-slot:prepend>
                              <v-icon color="#001a2d" class="mr-4"
                                >mdi-gender-male-female</v-icon
                              >
                            </template>
                            <v-list-item-title class="text-caption text-grey"
                              >Giới tính</v-list-item-title
                            >
                            <v-list-item-subtitle
                              class="text-body-1 font-weight-bold text-black mt-1"
                            >
                              {{ getGenderText(userData.gender) }}
                            </v-list-item-subtitle>
                          </v-list-item>
                        </v-list>
                      </v-col>
                    </v-row>

                    <div class="d-flex flex-wrap justify-center gap-4 mt-10">
                      <v-btn
                        prepend-icon="mdi-pencil"
                        class="custom-btn px-8 py-6 rounded-lg font-weight-bold"
                        @click="openEditDialog"
                      >
                        CẬP NHẬT THÔNG TIN
                      </v-btn>

                      <v-btn
                        prepend-icon="mdi-map-marker-outline"
                        variant="outlined"
                        class="custom-btn-outline px-8 py-6 rounded-lg font-weight-bold"
                        @click="dialogAddresses = true"
                      >
                        SỔ ĐỊA CHỈ
                      </v-btn>

                      <v-btn
                        prepend-icon="mdi-lock-reset"
                        variant="outlined"
                        class="custom-btn-outline-red px-8 py-6 rounded-lg font-weight-bold"
                        @click="dialogPassword = true"
                      >
                        ĐỔI MẬT KHẨU
                      </v-btn>
                    </div>
                  </div>
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="dialogEdit" max-width="500px" persistent>
      <v-card class="rounded-xl bg-white text-black">
        <v-card-title
          class="text-h5 font-weight-bold pa-6 bg-custom-dark text-white"
        >
          <v-icon class="mr-2">mdi-account-edit</v-icon> Chỉnh sửa hồ sơ
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="formEdit" @submit.prevent="submitUpdateInfo">
            <v-text-field
              v-model="editForm.name"
              label="Họ và tên"
              variant="outlined"
              color="#001a2d"
              class="mb-2"
            ></v-text-field>
            <v-text-field
              v-model="editForm.phone_number"
              label="Số điện thoại"
              variant="outlined"
              color="#001a2d"
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
              color="#001a2d"
            ></v-select>
            <div class="d-flex justify-end mt-4 gap-2">
              <v-btn
                variant="text"
                color="grey-darken-1"
                @click="dialogEdit = false"
                >Hủy</v-btn
              >
              <v-btn
                type="submit"
                class="custom-btn px-6 rounded-lg"
                :loading="isSaving"
                >Lưu thay đổi</v-btn
              >
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogPassword" max-width="500px">
      <v-card class="rounded-xl bg-white text-black">
        <v-card-title
          class="text-h5 font-weight-bold pa-6 bg-red-darken-2 text-white"
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
              color="#001a2d"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPass = !showPass"
              class="mb-2"
            ></v-text-field>
            <v-text-field
              v-model="passwordForm.confirmPassword"
              label="Nhập lại mật khẩu mới"
              :type="showPass ? 'text' : 'password'"
              variant="outlined"
              color="#001a2d"
              prepend-inner-icon="mdi-lock-check-outline"
            ></v-text-field>
            <div class="d-flex justify-end mt-4 gap-2">
              <v-btn
                variant="text"
                color="grey-darken-1"
                @click="dialogPassword = false"
                >Hủy</v-btn
              >
              <v-btn
                type="submit"
                color="red-darken-2"
                class="font-weight-bold px-6 rounded-lg text-white"
                :loading="isSaving"
                >Cập nhật</v-btn
              >
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top right"
      timeout="3000"
      >{{ snackbar.text }}</v-snackbar
    >
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
const activeTab = ref("info");
const isLoadingData = ref(true);
const isUploading = ref(false);
const isSaving = ref(false);
const dialogEdit = ref(false);
const dialogPassword = ref(false);
const showPass = ref(false);
const fileInput = ref(null);
const dialogAddresses = ref(false);

const formEdit = ref(null);
const formPassword = ref(null);
const snackbar = ref({ show: false, text: "", color: "success" });
const userData = ref(null);
const defaultAvatar =
  "https://res.cloudinary.com/dosb4fmpo/image/upload/v1772181216/Male_gqcp4c.jpg";

const editForm = ref({ name: "", phone_number: "", gender: "other" });
const passwordForm = ref({ newPassword: "", confirmPassword: "" });

const getGenderText = (val) => {
  if (val === "male") return "Nam";
  if (val === "female") return "Nữ";
  return "Khác";
};

const showMessage = (text, color = "success") => {
  snackbar.value = { show: true, text, color };
};

const fetchUserProfile = async () => {
  isLoadingData.value = true;
  try {
    const localUserStr = localStorage.getItem("user");
    if (!localUserStr) {
      router.push("/login");
      return;
    }
    const localUser = JSON.parse(localUserStr);
    const data = await UserService.get(localUser.id);
    userData.value = data;
    localStorage.setItem("user", JSON.stringify(data));
    window.dispatchEvent(new Event("storage"));
  } catch (error) {
    showMessage("Không thể tải thông tin cá nhân", "error");
  } finally {
    isLoadingData.value = false;
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  isUploading.value = true;
  try {
    const formData = new FormData();
    formData.append("avatar", file);
    await UserService.update(userData.value.id, formData);
    showMessage("Cập nhật ảnh đại diện thành công!");
    await fetchUserProfile();
  } catch (error) {
    showMessage("Lỗi khi tải ảnh lên", "error");
  } finally {
    isUploading.value = false;
    event.target.value = null;
  }
};

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
    formData.append("phone_number", editForm.value.phone_number || "");
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

const submitChangePassword = async () => {
  const { valid } = await formPassword.value.validate();
  if (!valid) return;
  isSaving.value = true;
  try {
    const formData = new FormData();
    formData.append("password", passwordForm.value.newPassword);
    await UserService.update(userData.value.id, formData);
    showMessage("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
    dialogPassword.value = false;
    setTimeout(() => {
      localStorage.removeItem("token");
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
.custom-main-color {
  color: #001a2d !important;
}
.bg-custom-dark {
  background-color: #001a2d !important;
}

.custom-btn {
  background-color: #001a2d !important;
  color: white !important;
  transition: all 0.3s ease;
}
.custom-btn:hover {
  color: #77e51f !important;
  transform: translateY(-2px);
}

.custom-btn-outline {
  border: 2px solid #001a2d !important;
  color: #001a2d !important;
}
.custom-btn-outline:hover {
  background-color: #001a2d !important;
  color: #77e51f !important;
}

.custom-btn-outline-red {
  border: 2px solid #d32f2f !important;
  color: #d32f2f !important;
}
.custom-btn-outline-red:hover {
  background-color: #d32f2f !important;
  color: white !important;
}

.border-avatar {
  border: 4px solid #f5f5f5;
}
.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  border: 2px solid white !important;
  z-index: 10;
}

.gap-4 {
  gap: 1rem;
}
.min-vh-100 {
  min-height: 100vh;
}
.border-none {
  border: none !important;
}
</style>
