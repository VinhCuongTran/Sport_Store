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
        <!-- NHÓM 1: TỔNG QUAN & HỆ THỐNG (Chỉ Admin) -->
        <template v-if="isSuperAdmin">
          <v-list-subheader
            class="text-uppercase font-weight-bold text-indigo-lighten-3 text-caption"
            style="letter-spacing: 1px"
          >
            Tổng quan & Hệ thống
          </v-list-subheader>

          <v-list-item
            prepend-icon="mdi-chart-line"
            title="Thống kê"
            :to="{ name: 'admin-stats' }"
            exact
            color="white"
            rounded="lg"
            class="mb-1 nav-item"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-cash-multiple"
            title="Quản lý dòng tiền"
            :to="{ name: 'admin-transaction' }"
            exact
            color="white"
            rounded="lg"
            class="mb-1 nav-item"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-account-group-outline"
            title="Người dùng"
            :to="{ name: 'admin-user' }"
            exact
            color="white"
            rounded="lg"
            class="mb-1 nav-item"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-history"
            title="Lịch sử Thao tác"
            :to="{ name: 'admin-activity-log' }"
            exact
            color="white"
            rounded="lg"
            class="mb-1 nav-item"
          ></v-list-item>

          <v-divider
            class="my-2"
            style="border-color: rgba(255, 255, 255, 0.1)"
          ></v-divider>
        </template>

        <!-- NHÓM 2: QUẢN LÝ BÁN HÀNG -->
        <v-list-subheader
          class="text-uppercase font-weight-bold text-indigo-lighten-3 text-caption"
          style="letter-spacing: 1px"
        >
          Quản lý Bán hàng
        </v-list-subheader>

        <v-list-item
          prepend-icon="mdi-clipboard-text-outline"
          title="Đơn hàng"
          :to="{ name: 'admin-order' }"
          exact
          color="white"
          rounded="lg"
          class="mb-1 nav-item"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-ticket-percent-outline"
          title="Voucher"
          :to="{ name: 'admin-voucher' }"
          exact
          color="white"
          rounded="lg"
          class="mb-1 nav-item"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-star-outline"
          title="Đánh giá"
          :to="{ name: 'admin-review' }"
          exact
          color="white"
          rounded="lg"
          class="mb-1 nav-item"
        ></v-list-item>

        <v-divider
          class="my-2"
          style="border-color: rgba(255, 255, 255, 0.1)"
        ></v-divider>

        <!-- NHÓM 3: DANH MỤC SẢN PHẨM -->
        <v-list-subheader
          class="text-uppercase font-weight-bold text-indigo-lighten-3 text-caption"
          style="letter-spacing: 1px"
        >
          Sản phẩm & Danh mục
        </v-list-subheader>

        <v-list-item
          prepend-icon="mdi-package-variant-closed"
          title="Sản phẩm"
          :to="{ name: 'admin-product' }"
          exact
          color="white"
          rounded="lg"
          class="mb-1 nav-item"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-shape-outline"
          title="Loại hàng"
          :to="{ name: 'admin-category' }"
          exact
          color="white"
          rounded="lg"
          class="mb-1 nav-item"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-basketball"
          title="Môn thể thao"
          :to="{ name: 'admin-sport' }"
          exact
          color="white"
          rounded="lg"
          class="mb-1 nav-item"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-tag-multiple-outline"
          title="Thương hiệu"
          :to="{ name: 'admin-brand' }"
          exact
          color="white"
          rounded="lg"
          class="mb-1 nav-item"
        ></v-list-item>

        <v-divider
          class="my-2"
          style="border-color: rgba(255, 255, 255, 0.1)"
        ></v-divider>

        <!-- NHÓM 4: KHO HÀNG -->
        <v-list-subheader
          class="text-uppercase font-weight-bold text-indigo-lighten-3 text-caption"
          style="letter-spacing: 1px"
        >
          Kho Hàng
        </v-list-subheader>

        <v-list-item
          prepend-icon="mdi-alert-decagram"
          title="Cảnh báo Kho"
          :to="{ name: 'admin-low-stock' }"
          exact
          color="red-lighten-1"
          rounded="lg"
          class="mb-1 nav-item"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-clipboard-check-outline"
          title="Quản lý phiếu nhập kho"
          :to="{ name: 'admin-stock-take' }"
          exact
          color="blue-lighten-1"
          rounded="lg"
          class="mb-1 nav-item"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-history"
          title="Lịch sử Kho"
          :to="{ name: 'admin-inventory-log' }"
          exact
          color="green-lighten-1"
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

    <ChatBox />
  </v-app>
</template>

<script setup>
import { ref, computed } from "vue";
import AdminHeader from "./AdminHeader.vue";
import AuthService from "@/services/auth.service";
import ChatBox from "@/components/Chat.vue";

const drawer = ref(true);
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
}
</style>
