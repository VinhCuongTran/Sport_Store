<template>
  <v-app>
    <AdminHeader @toggle-drawer="drawer = !drawer" />

    <v-navigation-drawer
      v-model="drawer"
      color="indigo-darken-4"
      elevation="6"
      expand-on-hover
      rail-variant
      style="border-right: none"
    >
      <div
        class="d-flex align-center justify-center py-4 px-3"
        style="border-bottom: 1px solid rgba(255, 255, 255, 0.1)"
      >
        <v-icon color="indigo-lighten-4" size="28">mdi-shield-crown</v-icon>
      </div>

      <v-list density="compact" nav class="pa-2 mt-1">
        <v-list-subheader
          class="text-uppercase font-weight-bold text-indigo-lighten-3 text-caption"
          style="letter-spacing: 1px"
        >
          Menu Quản Trị
        </v-list-subheader>

        <v-list-item
          v-if="isSuperAdmin"
          prepend-icon="mdi-chart-line"
          title="Thống kê"
          :to="{ name: 'admin-stats' }"
          exact
          color="white"
          rounded="lg"
          class="mb-1 nav-item"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-shape"
          title="Quản lý Danh mục"
          :to="{ name: 'admin-category' }"
          exact
          color="white"
          rounded="lg"
          class="mb-1 nav-item"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-run-fast"
          title="Quản lý Môn thể thao"
          :to="{ name: 'admin-sport' }"
          exact
          color="white"
          rounded="lg"
          class="mb-1 nav-item"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-tag-multiple"
          title="Quản lý Thương hiệu"
          :to="{ name: 'admin-brand' }"
          exact
          color="white"
          rounded="lg"
          class="mb-1 nav-item"
        ></v-list-item>

        <v-list-item
          v-if="isSuperAdmin"
          prepend-icon="mdi-account-group"
          title="Quản lý Người dùng"
          :to="{ name: 'admin-user' }"
          exact
          color="white"
          rounded="lg"
          class="mb-1 nav-item"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-shoe-sneaker"
          title="Quản lý Sản phẩm"
          :to="{ name: 'admin-product' }"
          exact
          color="white"
          rounded="lg"
          class="mb-1 nav-item"
        ></v-list-item>

        <v-list-item
          v-if="isSuperAdmin"
          prepend-icon="mdi-ticket-percent"
          title="Quản lý Voucher"
          :to="{ name: 'admin-voucher' }"
          exact
          color="white"
          rounded="lg"
          class="mb-1 nav-item"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-star-circle"
          title="Quản lý Đánh giá"
          :to="{ name: 'admin-review' }"
          exact
          color="white"
          rounded="lg"
          class="mb-1 nav-item"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-cart"
          title="Quản lý Đơn hàng"
          :to="{ name: 'admin-order' }"
          exact
          color="white"
          rounded="lg"
          class="mb-1 nav-item"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main
      style="
        background: linear-gradient(135deg, #f0f4ff 0%, #e8eaf6 100%);
        min-height: 100vh;
      "
    >
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from "vue";
import AdminHeader from "./AdminHeader.vue";
import AuthService from "@/services/auth.service"; // Nhúng auth service

const drawer = ref(true);

// Kiểm tra có phải Super Admin không
const isSuperAdmin = computed(() => AuthService.isSuperAdmin());
</script>

<style scoped>
.nav-item {
  transition:
    background 0.2s,
    transform 0.15s;
}
.nav-item:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  transform: translateX(2px);
}
.nav-item.v-list-item--active {
  background: rgba(255, 255, 255, 0.15) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
:deep(.v-list-item__prepend .v-icon) {
  color: rgba(255, 255, 255, 0.75) !important;
}
:deep(.v-list-item--active .v-list-item__prepend .v-icon) {
  color: #fff !important;
}
:deep(.v-list-item-title) {
  color: rgba(255, 255, 255, 0.85) !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
}
:deep(.v-list-item--active .v-list-item-title) {
  color: #fff !important;
  font-weight: 600 !important;
}
</style>
