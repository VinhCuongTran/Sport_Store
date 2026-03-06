<template>
  <header class="admin-header">
    <div class="logo d-flex align-center">
      <div style="background: white; padding: 2px 5px; border-radius: 4px; display: inline-flex; margin-right: 10px;">
        <img src="../../assets/logo.jpg" alt="Admin Logo" height="30" />
      </div>
      <h3 class="m-0">Admin Panel</h3>
    </div>
    <div class="user-info">
      <span v-if="user" class="greeting"
        >Xin chào, {{ user.name || user.email }}</span
      >
      <button @click="handleLogout" class="btn-logout">Đăng xuất</button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import AuthService from "../../services/auth.service";

const router = useRouter();
const user = ref(null);

onMounted(() => {
  // Lấy thông tin user từ localStorage để hiển thị
  const userData = localStorage.getItem("user");
  if (userData) {
    user.value = JSON.parse(userData);
  }
});

const handleLogout = () => {
  AuthService.logout(); // Xóa token và user khỏi localStorage
  router.push({ name: "login" }); // Đẩy về trang đăng nhập
};
</script>

<style scoped>
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 60px;
  background-color: #343a40;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo h3 {
  margin: 0;
  font-size: 1.2rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.greeting {
  font-size: 0.9rem;
}

.btn-logout {
  padding: 6px 12px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-logout:hover {
  background-color: #c82333;
}
</style>
