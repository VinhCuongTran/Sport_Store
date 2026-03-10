<template>
  <header class="custom-header border-b">
    <v-container class="py-3">
      <v-row align="center" no-gutters>
        <v-col
          cols="12"
          md="3"
          class="d-flex align-center justify-center justify-md-start mb-3 mb-md-0"
        >
          <router-link to="/" class="text-decoration-none custom-logo-wrap">
            <img src="../assets/logo.jpg" alt="Logo" class="custom-logo-img" />
            <span
              class="custom-logo-text d-none d-sm-inline font-weight-black text-white"
              >Sport Store</span
            >
          </router-link>
        </v-col>

        <v-col cols="12" md="5" class="px-md-4 mb-3 mb-md-0">
          <v-text-field
            v-model="searchKeyword"
            placeholder="Bạn đang tìm gì?"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            bg-color="white"
            color="black"
            rounded="pill"
            @keyup.enter="handleSearch"
          >
            <template v-slot:append-inner>
              <v-icon @click="handleSearch" class="cursor-pointer text-black"
                >mdi-arrow-right-circle</v-icon
              >
            </template>
          </v-text-field>
        </v-col>

        <v-col
          cols="12"
          md="4"
          class="d-flex justify-center justify-md-end align-center gap-4"
        >
          <v-btn
            icon
            to="/cart"
            variant="text"
            class="hover-green-target text-white"
          >
            <v-badge v-if="cartCount > 0" :content="cartCount" color="red">
              <v-icon size="28">mdi-cart-outline</v-icon>
            </v-badge>
            <v-icon v-else size="28">mdi-cart-outline</v-icon>
          </v-btn>

          <template v-if="user">
            <v-menu offset-y transition="scale-transition">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  variant="outlined"
                  class="text-none px-2 rounded-pill border hover-green-target text-white"
                >
                  <v-avatar size="28" class="mr-2">
                    <v-img
                      :src="user.avatar || defaultAvatar"
                      alt="Avatar"
                      cover
                    ></v-img>
                  </v-avatar>
                  <span class="font-weight-bold d-none d-sm-inline">{{
                    user.name || user.email
                  }}</span>
                  <v-icon right>mdi-chevron-down</v-icon>
                </v-btn>
              </template>

              <v-list density="compact" class="py-2">
                <v-list-item to="/profile" prepend-icon="mdi-account-circle"
                  ><v-list-item-title
                    >Hồ sơ cá nhân</v-list-item-title
                  ></v-list-item
                >
                <v-list-item
                  v-if="isAdminOrStaff"
                  to="/admin"
                  prepend-icon="mdi-view-dashboard"
                  ><v-list-item-title
                    >Quản trị hệ thống</v-list-item-title
                  ></v-list-item
                >
                <v-divider class="my-2"></v-divider>
                <v-list-item
                  @click="logout"
                  prepend-icon="mdi-logout"
                  class="text-red"
                  ><v-list-item-title>Đăng xuất</v-list-item-title></v-list-item
                >
              </v-list>
            </v-menu>
          </template>

          <template v-else>
            <v-btn
              variant="outlined"
              class="text-none font-weight-bold rounded-pill px-6 hover-green-target text-white"
              to="/login"
            >
              Tham gia với chúng tôi
            </v-btn>
          </template>
        </v-col>
      </v-row>
    </v-container>

    <div class="custom-header-nav">
      <v-container
        class="py-0 d-flex align-center overflow-x-auto hide-scrollbar"
      >
        <v-menu
          v-model="menuOpen"
          open-on-hover
          :close-on-content-click="false"
          transition="slide-y-transition"
          location="bottom left"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              class="text-none font-weight-bold px-5 py-3 h-100 rounded-0 hover-green-target text-white"
            >
              <v-icon left class="mr-2">mdi-menu</v-icon>
              Danh mục
            </v-btn>
          </template>

          <SportCategoryMenu @close-menu="closeMenu" />
        </v-menu>

        <div class="d-flex flex-nowrap pl-4 gap-2">
          <v-btn
            variant="text"
            to="/"
            exact
            class="text-none font-weight-medium hover-green-target text-white"
            >Trang chủ</v-btn
          >
          <v-btn
            variant="text"
            to="/products"
            class="text-none font-weight-medium hover-green-target text-white"
            >Tất cả sản phẩm</v-btn
          >
          <v-btn
            variant="text"
            to="/All-Brands"
            class="text-none font-weight-medium hover-green-target text-white"
            >Thương hiệu nổi bật</v-btn
          >
          <v-btn
            variant="text"
            to="/New-Arrivals"
            class="text-none font-weight-medium hover-green-target text-white"
            >Hàng mới về</v-btn
          >
          <v-btn
            variant="text"
            to="/About-Us"
            class="text-none font-weight-medium hover-green-target text-white"
            >Về chúng tôi</v-btn
          >
        </div>
      </v-container>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import AuthService from "@/services/auth.service.js";
import SportCategoryMenu from "@/components/SportCategoryMenu.vue";

const router = useRouter();
const route = useRoute();
const user = ref(null);
const isAdminOrStaff = ref(false);
const cartCount = ref(0);
const searchKeyword = ref("");
const menuOpen = ref(false);
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

const closeMenu = () => {
  menuOpen.value = false;
};

const handleSearch = () => {
  if (searchKeyword.value.trim() !== "") {
    router.push({
      path: "/products",
      query: { search: searchKeyword.value.trim() },
    });
  } else {
    router.push({ path: "/products" });
  }
};

onMounted(() => {
  checkUserStatus();
  window.addEventListener("storage", checkUserStatus);
  if (route.query.search) {
    searchKeyword.value = route.query.search;
  }
});

watch(
  () => route.path,
  () => {
    checkUserStatus();
  },
);
watch(
  () => route.query.search,
  (newVal) => {
    searchKeyword.value = newVal || "";
  },
);
</script>

<style scoped>
.custom-header {
  background-color: #001a2d;
  color: #ffffff;
}
.custom-header-nav {
  background-color: rgba(0, 0, 0, 0.2);
}

.hover-green-target {
  transition: color 0.3s ease;
}

.hover-green-target:hover {
  color: #77e51f !important;
}

:deep(.v-btn.hover-green-target .v-btn__overlay) {
  background-color: rgba(255, 255, 255, 0.03) !important;
}

:deep(.v-btn.hover-green-target .v-ripple__animation) {
  background-color: rgba(150, 150, 150, 0.3) !important;
}

.custom-logo-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.custom-logo-img {
  height: 40px;
  border-radius: 6px;
}
.custom-logo-text {
  font-size: 24px;
}

.gap-2 {
  gap: 8px;
}
.gap-4 {
  gap: 16px;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
