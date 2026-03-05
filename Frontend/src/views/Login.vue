<template>
  <div class="login-page">
    <div class="login-box">
      <h2 class="text-center">Đăng Nhập</h2>
      <form @submit.prevent="submitLogin">
        <div class="form-group">
          <label>Email / Số điện thoại</label>
          <input
            type="text"
            v-model="formData.identifier"
            required
            class="form-control"
            placeholder="Nhập email hoặc SĐT"
          />
        </div>
        <div class="form-group">
          <label>Mật khẩu</label>
          <input
            type="password"
            v-model="formData.password"
            required
            class="form-control"
            placeholder="Nhập mật khẩu"
          />
        </div>
        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
        <button type="submit" class="btn-submit">Đăng nhập</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AuthService from "../services/auth.service";

const router = useRouter();
const formData = reactive({ identifier: "", password: "" });
const errorMessage = ref("");

const submitLogin = async () => {
  try {
    errorMessage.value = "";
    const response = await AuthService.login(formData);

    // Lưu token và user vào localStorage
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));

    // PHÂN LUỒNG ĐIỀU HƯỚNG DỰA VÀO ROLE
    const role = response.user.role;
    if (role === "admin" || role === "staff") {
      router.push("/admin"); // Là Admin/Staff -> Đẩy vào trang Quản trị
    } else {
      router.push("/"); // Là Customer -> Đẩy ra Trang chủ cửa hàng
    }
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message ||
      "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f4f6f9;
}
.login-box {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.text-center {
  text-align: center;
  margin-bottom: 20px;
}
.form-group {
  margin-bottom: 15px;
}
.form-control {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.btn-submit {
  width: 100%;
  padding: 10px;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
}
.btn-submit:hover {
  background-color: #1a252f;
}
.error-msg {
  color: #dc3545;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}
</style>
