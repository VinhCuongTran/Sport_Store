<template>
  <div class="auth-wrapper">
    <!-- Background decoration -->
    <div class="bg-orb bg-orb--1"></div>
    <div class="bg-orb bg-orb--2"></div>
    <div class="bg-orb bg-orb--3"></div>

    <div
      class="auth-card"
      :class="{ 'right-panel-active': isSignUp }"
      id="container"
    >
      <div class="form-container sign-up-container">
        <div class="form-inner">
          <div class="form-head">
            <h2 class="form-title">Tạo tài khoản</h2>
            <p class="form-subtitle">Điền thông tin để bắt đầu mua sắm</p>
          </div>

          <v-form
            ref="registerForm"
            v-model="isRegisterFormValid"
            @submit.prevent="openVerifyDialog"
          >
            <div class="field-group">
              <v-text-field
                v-model="registerData.name"
                label="Họ và tên"
                variant="outlined"
                density="compact"
                color="#001a2d"
                prepend-inner-icon="mdi-account-outline"
                :rules="[(v) => !!v || 'Vui lòng nhập họ tên']"
                required
                class="auth-field"
              />
              <v-text-field
                v-model="registerData.email"
                label="Email"
                type="email"
                variant="outlined"
                density="compact"
                color="#001a2d"
                prepend-inner-icon="mdi-email-outline"
                :rules="[
                  (v) => !!v || 'Vui lòng nhập email',
                  (v) => /.+@.+\..+/.test(v) || 'Email không hợp lệ',
                ]"
                required
                class="auth-field"
              />
              <v-text-field
                v-model="registerData.phone_number"
                label="Số điện thoại"
                variant="outlined"
                density="compact"
                color="#001a2d"
                prepend-inner-icon="mdi-phone-outline"
                :rules="[
                  (v) => !!v || 'Vui lòng nhập số điện thoại',
                  (v) =>
                    /^[0-9]{10,11}$/.test(v) || 'Số điện thoại không hợp lệ',
                ]"
                required
                class="auth-field"
              />
              <v-text-field
                v-model="registerData.password"
                label="Mật khẩu"
                :type="showRegisterPassword ? 'text' : 'password'"
                variant="outlined"
                density="compact"
                color="#001a2d"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="
                  showRegisterPassword
                    ? 'mdi-eye-off-outline'
                    : 'mdi-eye-outline'
                "
                @click:append-inner="
                  showRegisterPassword = !showRegisterPassword
                "
                :rules="[
                  (v) => !!v || 'Vui lòng nhập mật khẩu',
                  (v) => v.length >= 6 || 'Mật khẩu ít nhất 6 ký tự',
                ]"
                required
                class="auth-field"
              />
              <v-text-field
                v-model="registerData.confirmPassword"
                label="Xác nhận mật khẩu"
                :type="showRegisterConfirmPassword ? 'text' : 'password'"
                variant="outlined"
                density="compact"
                color="#001a2d"
                prepend-inner-icon="mdi-lock-check-outline"
                :append-inner-icon="
                  showRegisterConfirmPassword
                    ? 'mdi-eye-off-outline'
                    : 'mdi-eye-outline'
                "
                @click:append-inner="
                  showRegisterConfirmPassword = !showRegisterConfirmPassword
                "
                :rules="[
                  (v) => !!v || 'Vui lòng xác nhận mật khẩu',
                  (v) =>
                    v === registerData.password ||
                    'Mật khẩu xác nhận không khớp',
                ]"
                required
                class="auth-field"
              />
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
                class="auth-field"
                theme="light"
                :menu-props="{ contentClass: 'custom-white-dropdown' }"
              />
            </div>

            <transition name="fade-error">
              <div v-if="registerError" class="error-alert">
                <v-icon size="17" class="error-alert__icon"
                  >mdi-alert-circle-outline</v-icon
                >
                <span>{{ registerError }}</span>
                <button class="error-alert__close" @click="registerError = ''">
                  ✕
                </button>
              </div>
            </transition>

            <v-btn
              type="submit"
              class="auth-submit-btn"
              block
              size="large"
              rounded="pill"
              :loading="isLoadingRegister"
              :disabled="!isRegisterFormValid"
            >
              Đăng ký ngay
            </v-btn>
          </v-form>
        </div>
      </div>

      <div class="form-container sign-in-container">
        <div class="form-inner">
          <div class="form-head">
            <div class="brand-icon">
              <v-icon size="32" color="#001a2d">mdi-run-fast</v-icon>
            </div>
            <h2 class="form-title">Chào mừng trở lại</h2>
            <p class="form-subtitle">Đăng nhập để tiếp tục mua sắm</p>
          </div>

          <v-form @submit.prevent="submitLogin">
            <div class="field-group">
              <v-text-field
                v-model="loginData.identifier"
                label="Email hoặc Số điện thoại"
                variant="outlined"
                color="#001a2d"
                prepend-inner-icon="mdi-account-outline"
                required
                class="auth-field"
              />
              <v-text-field
                v-model="loginData.password"
                label="Mật khẩu"
                :type="showLoginPassword ? 'text' : 'password'"
                variant="outlined"
                color="#001a2d"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="
                  showLoginPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
                "
                @click:append-inner="showLoginPassword = !showLoginPassword"
                required
                class="auth-field"
              />
            </div>

            <div class="forgot-row">
              <!-- Đã kết nối với dialog quên mật khẩu -->
              <a href="#" class="forgot-link" @click.prevent="openForgotDialog"
                >Quên mật khẩu?</a
              >
            </div>

            <v-btn
              type="submit"
              class="auth-submit-btn"
              block
              size="x-large"
              rounded="pill"
              :loading="isLoadingLogin"
            >
              Đăng nhập
            </v-btn>
          </v-form>
        </div>
      </div>

      <div class="overlay-container">
        <div class="overlay">
          <div class="overlay-panel overlay-left">
            <div class="overlay-logo">
              <v-icon size="48" color="white">mdi-run-fast</v-icon>
            </div>
            <h2 class="overlay-title">Mừng trở lại!</h2>
            <p class="overlay-desc">
              Đăng nhập để khám phá hàng ngàn sản phẩm thể thao đang chờ bạn.
            </p>
            <button class="overlay-btn" @click="switchToLogin">
              Đăng nhập
            </button>
          </div>

          <div class="overlay-panel overlay-right">
            <div class="overlay-logo">
              <v-icon size="48" color="white">mdi-run-fast</v-icon>
            </div>
            <h2 class="overlay-title">Chào bạn mới!</h2>
            <p class="overlay-desc">
              Đăng ký thành viên để nhận ngay nhiều ưu đãi hấp dẫn từ Sport
              Store.
            </p>
            <button class="overlay-btn" @click="switchToRegister">
              Đăng ký
            </button>
          </div>
        </div>
      </div>
    </div>

    <v-dialog v-model="verifyDialog" max-width="420" persistent>
      <v-card class="otp-card" theme="light" color="white">
        <div class="otp-header">
          <div class="otp-icon">
            <v-icon size="28" color="white">mdi-shield-check-outline</v-icon>
          </div>
          <h3 class="otp-title">Xác thực tài khoản</h3>
          <p class="otp-subtitle">Chọn cách nhận mã xác thực OTP</p>
        </div>

        <div class="otp-body">
          <div v-if="step === 1" class="otp-step-1">
            <button
              class="otp-method-btn"
              @click="sendOtp('email')"
              :disabled="isLoadingEmail"
            >
              <v-icon size="22">mdi-email-outline</v-icon>
              <span>Gửi qua Email</span>
              <v-progress-circular
                v-if="isLoadingEmail"
                indeterminate
                size="18"
                width="2"
                color="#001a2d"
              />
            </button>
            <button
              class="otp-method-btn"
              @click="sendOtp('phone')"
              :disabled="isLoadingPhone"
            >
              <v-icon size="22">mdi-phone-outline</v-icon>
              <span>Gửi qua SMS</span>
              <v-progress-circular
                v-if="isLoadingPhone"
                indeterminate
                size="18"
                width="2"
                color="#001a2d"
              />
            </button>
          </div>

          <div v-else-if="step === 2" class="otp-step-2">
            <p class="otp-hint">Nhập mã 6 chữ số đã được gửi đến bạn</p>
            <v-otp-input
              v-model="otpCode"
              length="6"
              variant="outlined"
              color="#001a2d"
              class="otp-input-field"
            />
          </div>
        </div>

        <div class="otp-footer">
          <button class="otp-cancel-btn" @click="verifyDialog = false">
            Hủy
          </button>
          <button
            v-if="step === 2"
            class="otp-confirm-btn"
            :disabled="isLoadingVerify || otpCode.length < 6"
            @click="verifyAndRegister"
          >
            <v-progress-circular
              v-if="isLoadingVerify"
              indeterminate
              size="16"
              width="2"
              color="white"
              class="mr-2"
            />
            Xác nhận
          </button>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="forgotDialog" max-width="440" persistent>
      <v-card class="otp-card" theme="light" color="white">
        <div class="otp-header">
          <div class="otp-icon">
            <v-icon size="28" color="white">mdi-lock-reset</v-icon>
          </div>
          <h3 class="otp-title">Quên mật khẩu</h3>
          <p class="otp-subtitle">
            <span v-if="forgotStep === 1">Nhập email để nhận mã xác minh</span>
            <span v-else-if="forgotStep === 2"
              >Nhập mã OTP đã gửi đến email</span
            >
            <span v-else>Tạo mật khẩu mới cho tài khoản</span>
          </p>
        </div>

        <div class="otp-body">
          <div v-if="forgotStep === 1">
            <v-text-field
              v-model="forgotIdentifier"
              label="Email hoặc Số điện thoại"
              variant="outlined"
              density="compact"
              color="#001a2d"
              prepend-inner-icon="mdi-account-outline"
              :error-messages="forgotEmailError"
              @input="forgotEmailError = ''"
              class="auth-field forgot-field"
              autofocus
            />
          </div>

          <div v-else-if="forgotStep === 2" class="otp-step-2">
            <p class="otp-hint">
              Mã OTP đã được gửi đến <strong>{{ forgotMaskedEmail }}</strong>
            </p>
            <v-otp-input
              v-model="forgotOtp"
              length="6"
              variant="outlined"
              color="#001a2d"
              class="otp-input-field"
            />
            <p class="otp-resend">
              Không nhận được mã?
              <a
                href="#"
                class="otp-resend-link"
                @click.prevent="resendForgotOtp"
                >Gửi lại</a
              >
            </p>
          </div>

          <div v-else-if="forgotStep === 3">
            <v-text-field
              v-model="forgotNewPassword"
              label="Mật khẩu mới"
              :type="showNewPassword ? 'text' : 'password'"
              variant="outlined"
              density="compact"
              color="#001a2d"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="
                showNewPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
              "
              @click:append-inner="showNewPassword = !showNewPassword"
              :error-messages="forgotPasswordError"
              @input="forgotPasswordError = ''"
              class="auth-field forgot-field"
            />
            <v-text-field
              v-model="forgotConfirmPassword"
              label="Xác nhận mật khẩu"
              :type="showConfirmPassword ? 'text' : 'password'"
              variant="outlined"
              density="compact"
              color="#001a2d"
              prepend-inner-icon="mdi-lock-check-outline"
              :append-inner-icon="
                showConfirmPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
              "
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
              :error-messages="forgotConfirmError"
              @input="forgotConfirmError = ''"
              class="auth-field forgot-field mt-1"
            />
          </div>
        </div>

        <div class="otp-footer">
          <button class="otp-cancel-btn" @click="closeForgotDialog">Hủy</button>
          <button
            class="otp-confirm-btn"
            :disabled="isForgotLoading || !canSubmitForgot"
            @click="handleForgotStep"
          >
            <v-progress-circular
              v-if="isForgotLoading"
              indeterminate
              size="16"
              width="2"
              color="white"
              class="mr-2"
            />
            <span v-if="forgotStep === 1">Gửi mã OTP</span>
            <span v-else-if="forgotStep === 2">Xác nhận</span>
            <span v-else>Đặt lại mật khẩu</span>
          </button>
        </div>
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
import { reactive, ref, computed, watch, onMounted } from "vue";
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
const showLoginPassword = ref(false);

const submitLogin = async () => {
  if (!loginData.identifier || !loginData.password) {
    showError("Vui lòng nhập đầy đủ thông tin");
    return;
  }

  try {
    isLoadingLogin.value = true;

    const response = await AuthService.login({
      identifier: loginData.identifier.trim(),
      password: loginData.password,
    });

    localStorage.setItem("token", response.accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);
    localStorage.setItem("user", JSON.stringify(response.user));

    const role = response.user.role;
    router.push(role === "admin" || role === "staff" ? "/admin" : "/");
  } catch (error) {
    // Gọi dialog thông báo lỗi thay vì in ra html hay alert
    showError(
      error.response?.data?.message ||
        "Tài khoản hoặc mật khẩu không chính xác!",
    );
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
  confirmPassword: "",
  gender: "",
});
const isLoadingRegister = ref(false);
const registerError = ref("");
const showRegisterPassword = ref(false);
const showRegisterConfirmPassword = ref(false);
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
  confirmDialogRef.value?.open("Thông báo", message, {
    isAlert: true,
    icon: "mdi-alert-circle",
    iconColor: "red-darken-1",
    confirmText: "Đóng",
    confirmColor: "black",
  });
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
  else isLoadingPhone.value = true;

  try {
    await AuthService.sendOtp({
      method,
      email: registerData.email.trim(),
      phone_number: registerData.phone_number.trim(),
    });
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
    const response = await AuthService.registerWithOtp({
      ...registerData,
      name: registerData.name.trim(),
      email: registerData.email.trim(),
      phone_number: registerData.phone_number.trim(),
      otp: otpCode.value.trim(),
      method: verifyMethod.value,
    });

    localStorage.setItem("token", response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem("refreshToken", response.refreshToken);
    }
    localStorage.setItem("user", JSON.stringify(response.user));

    showMessage("Đăng ký thành công! Đang tự động đăng nhập...");
    verifyDialog.value = false;
    setTimeout(() => router.push("/"), 1500);
  } catch (error) {
    showError(error.response?.data?.message || "Mã OTP không chính xác");
  } finally {
    isLoadingVerify.value = false;
  }
};

const forgotDialog = ref(false);
const forgotStep = ref(1);
const forgotIdentifier = ref("");
const forgotRealEmail = ref("");
const forgotMaskedEmail = ref("");
const forgotOtp = ref("");
const forgotNewPassword = ref("");
const forgotConfirmPassword = ref("");
const isForgotLoading = ref(false);
const forgotEmailError = ref("");
const forgotPasswordError = ref("");
const forgotConfirmError = ref("");
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const canSubmitForgot = computed(() => {
  if (forgotStep.value === 1) return forgotIdentifier.value.trim().length >= 5;
  if (forgotStep.value === 2) return forgotOtp.value.length === 6;
  if (forgotStep.value === 3)
    return (
      forgotNewPassword.value.length >= 6 &&
      forgotConfirmPassword.value.length >= 6
    );
  return false;
});

const openForgotDialog = () => {
  forgotStep.value = 1;
  forgotIdentifier.value = "";
  forgotRealEmail.value = "";
  forgotMaskedEmail.value = "";
  forgotOtp.value = "";
  forgotNewPassword.value = "";
  forgotConfirmPassword.value = "";
  forgotEmailError.value = "";
  forgotPasswordError.value = "";
  forgotConfirmError.value = "";
  forgotDialog.value = true;
};

const closeForgotDialog = () => {
  forgotDialog.value = false;
};

const resendForgotOtp = async () => {
  isForgotLoading.value = true;
  try {
    const res = await AuthService.forgotPasswordSendOtp({
      identifier: forgotIdentifier.value.trim(),
    });
    forgotOtp.value = "";
    forgotMaskedEmail.value = res.maskedEmail;
    showMessage("Đã gửi lại mã OTP vào email của bạn");
  } catch (error) {
    showError(error.response?.data?.message || "Lỗi khi gửi lại mã OTP");
  } finally {
    isForgotLoading.value = false;
  }
};

const handleForgotStep = async () => {
  isForgotLoading.value = true;

  try {
    if (forgotStep.value === 1) {
      const res = await AuthService.forgotPasswordSendOtp({
        identifier: forgotIdentifier.value.trim(),
      });
      forgotRealEmail.value = res.email;
      forgotMaskedEmail.value = res.maskedEmail;
      showMessage("Mã OTP đã được gửi, hãy kiểm tra hộp thư của bạn");
      forgotStep.value = 2;
    } else if (forgotStep.value === 2) {
      await AuthService.forgotPasswordVerifyOtp({
        email: forgotRealEmail.value,
        otp: forgotOtp.value.trim(),
      });
      forgotStep.value = 3;
    } else if (forgotStep.value === 3) {
      if (forgotNewPassword.value.length < 6) {
        forgotPasswordError.value = "Mật khẩu phải có ít nhất 6 ký tự";
        return;
      }
      if (forgotNewPassword.value !== forgotConfirmPassword.value) {
        forgotConfirmError.value = "Mật khẩu xác nhận không khớp";
        return;
      }

      await AuthService.forgotPasswordReset({
        email: forgotRealEmail.value,
        otp: forgotOtp.value.trim(),
        newPassword: forgotNewPassword.value,
      });

      forgotDialog.value = false;
      showMessage("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
    }
  } catch (error) {
    // Gọi dialog
    showError(
      error.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.",
    );
  } finally {
    isForgotLoading.value = false;
  }
};
onMounted(() => {
  if (route.query.locked) {
    // Dùng setTimeout xíu để đảm bảo ConfirmDialog đã render xong
    setTimeout(() => {
      showError(
        "Tài khoản của bạn đã bị quản trị viên khóa. Vui lòng liên hệ hỗ trợ!",
      );

      // Xóa query ?locked=true trên thanh địa chỉ để F5 không bị hiện lại
      router.replace({ query: {} });
    }, 300);
  }
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.auth-wrapper {
  position: relative;
  min-height: 100vh;
  background: #f0f3f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: "Be Vietnam Pro", "Segoe UI", sans-serif;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.45;
  pointer-events: none;
}
.bg-orb--1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #b8cef8, #dbe8ff);
  top: -120px;
  left: -100px;
  animation: floatOrb 12s ease-in-out infinite;
}
.bg-orb--2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #c5d8f8, #e8f0ff);
  bottom: -80px;
  right: -80px;
  animation: floatOrb 16s ease-in-out infinite reverse;
}
.bg-orb--3 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, #d0dff5, #ecf3ff);
  top: 40%;
  left: 40%;
  animation: floatOrb 10s ease-in-out infinite 3s;
}

@keyframes floatOrb {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(20px, -30px) scale(1.05);
  }
  66% {
    transform: translate(-15px, 15px) scale(0.97);
  }
}

.auth-card {
  position: relative;
  overflow: hidden;
  width: 960px;
  max-width: calc(100vw - 32px);
  min-height: 640px;
  border-radius: 28px;
  background: #ffffff;
  box-shadow:
    0 32px 80px rgba(0, 26, 45, 0.14),
    0 8px 24px rgba(0, 26, 45, 0.08),
    0 0 0 1px rgba(0, 26, 45, 0.05);
}

.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.65s cubic-bezier(0.77, 0, 0.175, 1);
  background: #ffffff;
}

.sign-in-container {
  left: 0;
  width: 50%;
  z-index: 2;
}
.auth-card.right-panel-active .sign-in-container {
  transform: translateX(100%);
}

.sign-up-container {
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
}
.auth-card.right-panel-active .sign-up-container {
  transform: translateX(100%);
  opacity: 1;
  z-index: 5;
  animation: showForm 0.65s;
}

@keyframes showForm {
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

.form-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px 48px;
  overflow-y: auto;
}

.form-head {
  margin-bottom: 28px;
}

.brand-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #e8eef8, #d0dcf0);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.form-title {
  font-size: 26px;
  font-weight: 800;
  color: #001a2d;
  letter-spacing: -0.4px;
  margin: 0 0 6px;
}

.form-subtitle {
  font-size: 13.5px;
  color: #7a8a9a;
  margin: 0;
  font-weight: 400;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 10px;
}

:deep(.auth-field .v-field) {
  border-radius: 12px !important;
  background: #f7f9fc !important;
  font-size: 14px;
  color: #001a2d !important;
}

.forgot-row {
  text-align: right;
  margin-bottom: 16px;
}

.forgot-link {
  font-size: 13px;
  color: #003459;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}
.forgot-link:hover {
  color: #001a2d;
  text-decoration: underline;
}

:deep(.auth-submit-btn) {
  background: linear-gradient(135deg, #001a2d, #003459) !important;
  color: white !important;
  font-weight: 700 !important;
  letter-spacing: 0.02em !important;
  font-size: 15px !important;
  height: 50px !important;
  box-shadow: 0 4px 20px rgba(0, 26, 45, 0.3) !important;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}
:deep(.auth-submit-btn:hover:not(:disabled)) {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 28px rgba(0, 26, 45, 0.38) !important;
}

.overlay-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.65s cubic-bezier(0.77, 0, 0.175, 1);
  z-index: 100;
}
.auth-card.right-panel-active .overlay-container {
  transform: translateX(-100%);
}

.overlay {
  position: relative;
  background: linear-gradient(135deg, #001a2d 0%, #003459 50%, #0a4a7a 100%);
  color: white;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.65s cubic-bezier(0.77, 0, 0.175, 1);
}
.auth-card.right-panel-active .overlay {
  transform: translateX(50%);
}

.overlay-panel {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  padding: 0 48px;
  transition: transform 0.65s cubic-bezier(0.77, 0, 0.175, 1);
}

.overlay-left {
  transform: translateX(-20%);
}
.auth-card.right-panel-active .overlay-left {
  transform: translateX(0);
}

.overlay-right {
  right: 0;
  transform: translateX(0);
}
.auth-card.right-panel-active .overlay-right {
  transform: translateX(20%);
}

.overlay-logo {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  backdrop-filter: blur(8px);
}

.overlay-title {
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
  margin: 0 0 14px;
}

.overlay-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.65;
  margin: 0 0 32px;
  font-weight: 400;
}

.overlay-btn {
  padding: 13px 36px;
  border-radius: 50px;
  border: 1.8px solid rgba(255, 255, 255, 0.6);
  background: transparent;
  color: white;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(4px);
}
.overlay-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

:deep(.otp-card.v-card) {
  border-radius: 24px !important;
  overflow: hidden;
  padding: 0 !important;
  box-shadow: 0 24px 60px rgba(0, 26, 45, 0.2) !important;
}

.otp-header {
  background: linear-gradient(135deg, #001a2d, #003459);
  padding: 28px 28px 24px;
  text-align: center;
}

.otp-icon {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.otp-title {
  font-size: 20px;
  font-weight: 800;
  color: white;
  margin: 0 0 6px;
}

.otp-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.otp-body {
  padding: 24px 28px;
}

.otp-step-1 {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.otp-method-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 15px 20px;
  border: 1.5px solid #e0e8f0;
  border-radius: 14px;
  background: #f7f9fc;
  color: #001a2d;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s ease;
}
.otp-method-btn:hover:not(:disabled) {
  border-color: #001a2d;
  background: #eef2f8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 26, 45, 0.1);
}
.otp-method-btn span {
  flex: 1;
  text-align: left;
}
.otp-method-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.otp-step-2 {
  text-align: center;
}

.otp-hint {
  font-size: 13.5px;
  color: #7a8a9a;
  margin: 0 0 20px;
}

.otp-resend {
  font-size: 13px;
  color: #7a8a9a;
  margin-top: 16px;
}

.otp-resend-link {
  color: #003459;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}
.otp-resend-link:hover {
  text-decoration: underline;
}

:deep(.otp-input-field .v-otp-input__field) {
  border-radius: 12px !important;
  font-size: 20px !important;
  font-weight: 700 !important;
}

.otp-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px 24px;
  gap: 12px;
}

.otp-cancel-btn {
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: #9aaab8;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border-radius: 50px;
  transition: all 0.2s;
}
.otp-cancel-btn:hover {
  background: #f0f3f9;
  color: #001a2d;
}

.otp-confirm-btn {
  display: flex;
  align-items: center;
  padding: 11px 28px;
  background: linear-gradient(135deg, #001a2d, #003459);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 14px rgba(0, 26, 45, 0.28);
}
.otp-confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 26, 45, 0.36);
}
.otp-confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff2f2;
  border: 1.5px solid #fca5a5;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 14px;
  font-size: 13px;
  color: #c62828;
  font-weight: 500;
  animation: shakeAlert 0.35s ease;
}

.error-alert__icon {
  color: #e53935 !important;
  flex-shrink: 0;
}

.error-alert__close {
  margin-left: auto;
  background: none;
  border: none;
  color: #e57373;
  cursor: pointer;
  font-size: 12px;
  padding: 0 2px;
  line-height: 1;
  transition: color 0.2s;
}
.error-alert__close:hover {
  color: #c62828;
}

@keyframes shakeAlert {
  0% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-6px);
  }
  40% {
    transform: translateX(6px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
  100% {
    transform: translateX(0);
  }
}

.fade-error-enter-active {
  animation: fadeSlideIn 0.28s ease;
}
.fade-error-leave-active {
  animation: fadeSlideIn 0.2s ease reverse;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mt-1 {
  margin-top: 4px;
}
.mt-2 {
  margin-top: 8px;
}

:deep(.forgot-field .v-field) {
  background: #f7f9fc !important;
  color: #001a2d !important;
}
:deep(.forgot-field .v-field__input) {
  color: #001a2d !important;
}
:deep(.forgot-field .v-label) {
  color: #7a8a9a !important;
}
:deep(.forgot-field input) {
  color: #001a2d !important;
  caret-color: #001a2d !important;
}
</style>
