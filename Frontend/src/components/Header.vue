<template>
  <v-app-bar app color="black" dark flat elevation="2">
    <v-container fluid class="d-flex align-center py-0 px-6">
      <v-toolbar-title
        class="font-weight-bold text-h6 d-flex align-center cursor-pointer"
        @click="$router.push('/')"
      >
        <v-icon class="mr-2">mdi-basketball</v-icon>
        Sport Store
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <div class="hidden-sm-and-down mr-4">
        <v-btn text to="/" class="text-capitalize font-weight-medium"
          >Trang chủ</v-btn
        >
        <v-btn text to="/products" class="text-capitalize font-weight-medium"
          >Sản phẩm</v-btn
        >
        <v-btn text to="/cart" class="text-capitalize font-weight-medium">
          <v-icon left class="mr-1">mdi-cart-outline</v-icon> Giỏ hàng
        </v-btn>
      </div>

      <template v-if="user">
        <v-menu offset-y transition="scale-transition">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" text class="pl-2 pr-4 text-capitalize">
              <v-avatar size="32" class="mr-2 border border-white">
                <v-img
                  :src="user.avatar || defaultAvatar"
                  alt="Avatar"
                  cover
                ></v-img>
              </v-avatar>
              <span class="font-weight-bold">{{
                user.name || user.email
              }}</span>
              <v-icon right>mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list density="compact" class="py-2">
            <v-list-item to="/profile" prepend-icon="mdi-account-circle">
              <v-list-item-title>Hồ sơ cá nhân</v-list-item-title>
            </v-list-item>

            <v-list-item to="/orders" prepend-icon="mdi-clipboard-text-outline">
              <v-list-item-title>Đơn hàng của tôi</v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="isAdminOrStaff"
              to="/admin"
              prepend-icon="mdi-view-dashboard"
            >
              <v-list-item-title>Quản trị hệ thống</v-list-item-title>
            </v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item
              @click="logout"
              prepend-icon="mdi-logout"
              class="text-red"
            >
              <v-list-item-title>Đăng xuất</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <template v-else>
        <div class="d-flex gap-2">
          <v-btn text to="/login" class="text-capitalize">Đăng nhập</v-btn>
          <v-btn
            color="white"
            class="text-capitalize text-black font-weight-bold"
            to="/register"
          >
            Đăng ký
          </v-btn>
        </div>
      </template>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import AuthService from "@/services/auth.service";

const router = useRouter();
const route = useRoute();
const user = ref(null);
const isAdminOrStaff = ref(false);
const defaultAvatar =
  "https://res.cloudinary.com/dosb4fmpo/image/upload/v1772181216/Male_gqcp4c.jpg";

const checkUserStatus = () => {
  const userData = localStorage.getItem("user");
  if (userData) {
    try {
      user.value = JSON.parse(userData);
      isAdminOrStaff.value = AuthService.isAdmin();
    } catch (e) {
      user.value = null;
      isAdminOrStaff.value = false;
    }
  } else {
    user.value = null;
    isAdminOrStaff.value = false;
  }
};

const logout = () => {
  AuthService.logout();
  checkUserStatus();
  router.push("/login");
};

onMounted(() => {
  checkUserStatus();
  // Lắng nghe sự thay đổi của localStorage (nếu mở nhiều tab)
  window.addEventListener("storage", checkUserStatus);
});

// Cập nhật lại trạng thái user khi chuyển trang (tránh lỗi cache)
watch(
  () => route.path,
  () => {
    checkUserStatus();
  },
);
</script>

<style scoped>
.v-btn {
  letter-spacing: 0.5px;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
