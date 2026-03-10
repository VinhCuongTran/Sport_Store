<template>
  <div class="auth-wrapper custom-page-bg">
    <v-card
      class="container rounded-xl elevation-20"
      :class="{ 'right-panel-active': isSignUp }"
      id="container"
    >
      <div class="form-container sign-up-container bg-white">
        <div class="h-100 d-flex flex-column justify-center px-10">
          <div class="text-center mb-6">
            <h2 class="text-h4 font-weight-black custom-text-primary">
              ĐĂNG KÝ
            </h2>
            <p class="text-grey-darken-1 mt-2 text-body-2">
              Sử dụng thông tin của bạn để tạo tài khoản
            </p>
          </div>

          <v-form
            ref="registerForm"
            v-model="isRegisterFormValid"
            @submit.prevent="openVerifyDialog"
          >
            <v-text-field
              v-model="registerData.name"
              label="Họ và tên"
              variant="outlined"
              density="compact"
              color="#001a2d"
              prepend-inner-icon="mdi-account"
              :rules="[(v) => !!v || 'Vui lòng nhập họ tên']"
              required
            ></v-text-field>

            <v-text-field
              v-model="registerData.email"
              label="Email"
              type="email"
              variant="outlined"
              density="compact"
              color="#001a2d"
              prepend-inner-icon="mdi-email"
              :rules="[
                (v) => !!v || 'Vui lòng nhập email',
                (v) => /.+@.+\..+/.test(v) || 'Email không hợp lệ',
              ]"
              required
            ></v-text-field>

            <v-text-field
              v-model="registerData.phone_number"
              label="Số điện thoại"
              variant="outlined"
              density="compact"
              color="#001a2d"
              prepend-inner-icon="mdi-phone"
              :rules="[
                (v) => !!v || 'Vui lòng nhập số điện thoại',
                (v) => /^[0-9]{10,11}$/.test(v) || 'Số điện thoại không hợp lệ',
              ]"
              required
            ></v-text-field>

            <v-text-field
              v-model="registerData.password"
              label="Mật khẩu"
              :type="showRegisterPassword ? 'text' : 'password'"
              variant="outlined"
              density="compact"
              color="#001a2d"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="
                showRegisterPassword ? 'mdi-eye-off' : 'mdi-eye'
              "
              @click:append-inner="showRegisterPassword = !showRegisterPassword"
              :rules="[
                (v) => !!v || 'Vui lòng nhập mật khẩu',
                (v) => v.length >= 6 || 'Mật khẩu ít nhất 6 ký tự',
              ]"
              required
            ></v-text-field>

            <v-select
              v-model="registerData.gender"
              :items="[
                { title: 'Nam', value: 'male' },
                { title: 'Nữ', value: 'female' },
                { title: 'Khác', value: 'other' },
              ]"
              label="Giới tính"
              variant="outlined"
              density="compact"
              color="#001a2d"
              prepend-inner-icon="mdi-gender-male-female"
              required
            ></v-select>

            <v-btn
              type="submit"
              class="font-weight-bold custom-btn-primary ripple-grey"
              block
              size="large"
              rounded="pill"
              :loading="isLoadingRegister"
              :disabled="!isRegisterFormValid"
            >
              ĐĂNG KÝ
            </v-btn>
          </v-form>
        </div>
      </div>

      <div class="form-container sign-in-container bg-white">
        <div class="h-100 d-flex flex-column justify-center px-12">
          <div class="text-center mb-8">
            <v-icon size="64" color="#001a2d" class="mb-4"
              >mdi-account-circle</v-icon
            >
            <h2 class="text-h4 font-weight-black custom-text-primary">
              ĐĂNG NHẬP
            </h2>
            <p class="text-grey-darken-1 mt-2 text-body-2">
              Chào mừng bạn quay trở lại
            </p>
          </div>

          <v-form @submit.prevent="submitLogin">
            <v-text-field
              v-model="loginData.identifier"
              label="Email hoặc Số điện thoại"
              variant="outlined"
              color="#001a2d"
              prepend-inner-icon="mdi-account"
              class="mb-2"
              required
            ></v-text-field>

            <v-text-field
              v-model="loginData.password"
              label="Mật khẩu"
              :type="showLoginPassword ? 'text' : 'password'"
              variant="outlined"
              color="#001a2d"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showLoginPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showLoginPassword = !showLoginPassword"
              required
            ></v-text-field>

            <div class="text-right mb-4">
              <a
                href="#"
                class="custom-text-primary font-weight-medium text-decoration-none text-body-2 hover-underline"
              >
                Quên mật khẩu?
              </a>
            </div>

            <v-btn
              type="submit"
              class="font-weight-bold custom-btn-primary ripple-grey"
              block
              size="x-large"
              rounded="pill"
              :loading="isLoadingLogin"
            >
              ĐĂNG NHẬP
            </v-btn>
          </v-form>
        </div>
      </div>

      <div class="overlay-container">
        <div class="overlay custom-header-bg">
          <div class="overlay-panel overlay-left">
            <h2
              class="text-h3 font-weight-black text-white mb-6 text-uppercase"
            >
              Mừng trở lại!
            </h2>
            <p
              class="text-h6 font-weight-regular text-grey-lighten-2 mb-10 px-6"
            >
              Để giữ kết nối với chúng tôi, vui lòng đăng nhập bằng thông tin cá
              nhân.
            </p>
            <v-btn
              variant="outlined"
              color="white"
              size="x-large"
              class="px-10 font-weight-bold ripple-grey-light"
              rounded="pill"
              @click="switchToLogin"
            >
              ĐĂNG NHẬP
            </v-btn>
          </div>

          <div class="overlay-panel overlay-right">
            <h2
              class="text-h3 font-weight-black text-white mb-6 text-uppercase"
            >
              Chào bạn mới!
            </h2>
            <p
              class="text-h6 font-weight-regular text-grey-lighten-2 mb-10 px-6"
            >
              Đăng ký thành viên để nhận ngay nhiều ưu đãi hấp dẫn từ Sport
              Store.
            </p>
            <v-btn
              variant="outlined"
              color="white"
              size="x-large"
              class="px-10 font-weight-bold ripple-grey-light"
              rounded="pill"
              @click="switchToRegister"
            >
              ĐĂNG KÝ
            </v-btn>
          </div>
        </div>
      </div>
    </v-card>

    <v-dialog v-model="verifyDialog" max-width="400" persistent>
      <v-card class="pa-6 rounded-xl custom-header-bg text-white">
        <v-card-title
          class="text-h5 font-weight-bold text-center px-0 pb-4 text-white"
        >
          Xác thực tài khoản
        </v-card-title>
        <v-card-text class="px-0">
          <div v-if="step === 1">
            <p class="text-center text-body-1 mb-6 text-grey-lighten-2">
              Chọn phương thức nhận mã OTP:
            </p>
            <v-btn
              block
              variant="outlined"
              color="white"
              class="mb-3 ripple-grey-light"
              height="50"
              @click="sendOtp('email')"
              :loading="isLoadingEmail"
            >
              <v-icon left class="mr-2">mdi-email</v-icon> Gửi qua Email
            </v-btn>
            <v-btn
              block
              variant="outlined"
              color="white"
              height="50"
              @click="sendOtp('phone')"
              :loading="isLoadingPhone"
              class="ripple-grey-light"
            >
              <v-icon left class="mr-2">mdi-phone</v-icon> Gửi qua SMS
            </v-btn>
          </div>
          <div v-else-if="step === 2">
            <v-otp-input
              v-model="otpCode"
              length="6"
              variant="underlined"
              color="white"
              class="mb-6"
            ></v-otp-input>
          </div>
        </v-card-text>
        <v-card-actions class="px-0 d-flex justify-space-between">
          <v-btn
            variant="text"
            color="grey-lighten-1"
            @click="verifyDialog = false"
            >Hủy</v-btn
          >
          <v-btn
            v-if="step === 2"
            color="white"
            variant="flat"
            class="px-6 text-black font-weight-bold"
            :loading="isLoadingVerify"
            @click="verifyAndRegister"
          >
            Xác nhận
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
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import AuthService from "@/services/auth.service";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

const router = useRouter();
const route = useRoute();

const isSignUp = ref(route.name === "register");

watch(
  () => route.name,
  (name) => {
    isSignUp.value = name === "register";
  },
);

const switchToLogin = () => {
  isSignUp.value = false;
  router.replace({ name: "login" });
};

const switchToRegister = () => {
  isSignUp.value = true;
  router.replace({ name: "register" });
};

const loginData = reactive({ identifier: "", password: "" });
const isLoadingLogin = ref(false);
const loginError = ref("");
const showLoginPassword = ref(false);

const submitLogin = async () => {
  if (!loginData.identifier || !loginData.password) {
    loginError.value = "Vui lòng nhập đầy đủ thông tin";
    return;
  }

  try {
    isLoadingLogin.value = true;
    loginError.value = "";

    const payload = {
      identifier: loginData.identifier.trim(),
      password: loginData.password,
    };

    const response = await AuthService.login(payload);
    localStorage.setItem("token", response.accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);
    localStorage.setItem("user", JSON.stringify(response.user));

    const role = response.user.role;
    if (role === "admin" || role === "staff") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  } catch (error) {
    loginError.value =
      error.response?.data?.message ||
      "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
  } finally {
    isLoadingLogin.value = false;
  }
};

const registerForm = ref(null);
const isRegisterFormValid = ref(false);
const registerData = reactive({
  name: "",
  email: "",
  phone_number: "",
  password: "",
  gender: "male",
});
const isLoadingRegister = ref(false);
const registerError = ref("");
const showRegisterPassword = ref(false);
const isLoadingEmail = ref(false);
const isLoadingPhone = ref(false);
const isLoadingVerify = ref(false);
const verifyDialog = ref(false);
const step = ref(1);
const verifyMethod = ref("");
const otpCode = ref("");
const snackbar = ref({ show: false, text: "", color: "success" });
const confirmDialogRef = ref(null);

const showMessage = (text, color = "success") => {
  snackbar.value = { show: true, text, color };
};

const showError = (message) => {
  if (confirmDialogRef.value) {
    confirmDialogRef.value.open("Lỗi đăng ký", message, {
      isAlert: true,
      icon: "mdi-alert-circle",
      iconColor: "red-darken-1",
      confirmText: "Đóng",
      confirmColor: "black",
    });
  }
};

const openVerifyDialog = async () => {
  const { valid } = await registerForm.value.validate();
  if (!valid) return;

  try {
    isLoadingRegister.value = true;
    await AuthService.checkExists({
      email: registerData.email.trim(),
      phone_number: registerData.phone_number.trim(),
    });

    registerError.value = "";
    step.value = 1;
    otpCode.value = "";
    verifyDialog.value = true;
  } catch (error) {
    showError(
      error.response?.data?.message ||
        "Số điện thoại hoặc email đã được sử dụng.",
    );
  } finally {
    isLoadingRegister.value = false;
  }
};

const sendOtp = async (method) => {
  verifyMethod.value = method;
  if (method === "email") isLoadingEmail.value = true;
  if (method === "phone") isLoadingPhone.value = true;

  try {
    const payload = {
      method,
      email: registerData.email.trim(),
      phone_number: registerData.phone_number.trim(),
    };
    await AuthService.sendOtp(payload);
    showMessage(`Đã gửi mã OTP qua ${method === "email" ? "Email" : "SMS"}`);
    step.value = 2;
  } catch (error) {
    verifyDialog.value = false;
    showError(error.response?.data?.message || "Lỗi khi gửi mã xác thực");
  } finally {
    isLoadingEmail.value = false;
    isLoadingPhone.value = false;
  }
};

const verifyAndRegister = async () => {
  isLoadingVerify.value = true;
  try {
    const payload = {
      ...registerData,
      name: registerData.name.trim(),
      email: registerData.email.trim(),
      phone_number: registerData.phone_number.trim(),
      otp: otpCode.value.trim(),
      method: verifyMethod.value,
    };

    const response = await AuthService.registerWithOtp(payload);

    localStorage.setItem("token", response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem("refreshToken", response.refreshToken);
    }
    localStorage.setItem("user", JSON.stringify(response.user));

    showMessage("Đăng ký thành công! Đang tự động đăng nhập...");
    verifyDialog.value = false;

    setTimeout(() => {
      router.push("/");
    }, 1500);
  } catch (error) {
    showError(error.response?.data?.message || "Mã OTP không chính xác");
  } finally {
    isLoadingVerify.value = false;
  }
};
</script>

<style scoped>
.custom-page-bg {
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.custom-header-bg {
  background-color: #001a2d !important;
}

.custom-text-primary {
  color: #001a2d !important;
}

.custom-btn-primary {
  background-color: #001a2d !important;
  color: white !important;
}

:deep(.ripple-grey .v-ripple__animation) {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

:deep(.ripple-grey-light .v-ripple__animation) {
  background-color: rgba(150, 150, 150, 0.3) !important;
}

.container {
  position: relative;
  overflow: hidden;
  width: 1000px;
  max-width: 100%;
  min-height: 650px;
  background-color: #fff;
}

.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
}

.sign-in-container {
  left: 0;
  width: 50%;
  z-index: 2;
}

.container.right-panel-active .sign-in-container {
  transform: translateX(100%);
}

.sign-up-container {
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
}

.container.right-panel-active .sign-up-container {
  transform: translateX(100%);
  opacity: 1;
  z-index: 5;
  animation: show 0.6s;
}

@keyframes show {
  0%,
  49.99% {
    opacity: 0;
    z-index: 1;
  }
  50%,
  100% {
    opacity: 1;
    z-index: 5;
  }
}

.overlay-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
}

.container.right-panel-active .overlay-container {
  transform: translateX(-100%);
}

.overlay {
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

.container.right-panel-active .overlay {
  transform: translateX(50%);
}

.overlay-panel {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

.overlay-left {
  transform: translateX(-20%);
}
.container.right-panel-active .overlay-left {
  transform: translateX(0);
}
.overlay-right {
  right: 0;
  transform: translateX(0);
}
.container.right-panel-active .overlay-right {
  transform: translateX(20%);
}

.hover-underline:hover {
  text-decoration: underline !important;
}
</style>
