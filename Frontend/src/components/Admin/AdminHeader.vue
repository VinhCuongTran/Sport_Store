<template>
  <v-app-bar
    color="indigo-darken-4"
    elevation="4"
    height="64"
    style="border-bottom: 2px solid rgba(255, 255, 255, 0.08)"
  >
    <v-app-bar-nav-icon
      @click="$emit('toggle-drawer')"
      color="white"
      variant="text"
    ></v-app-bar-nav-icon>

    <div
      class="d-flex align-center rounded-lg mx-2 px-2 py-1"
      style="background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(4px)"
    >
      <img
        src="../../assets/logo.jpg"
        alt="Admin Logo"
        height="32"
        style="border-radius: 6px"
      />
    </div>

    <v-app-bar-title
      class="font-weight-bold text-uppercase text-body-1 text-white ml-1"
      style="letter-spacing: 1.5px"
    >
      Trang Quản Trị
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <v-btn
      prepend-icon="mdi-home"
      variant="tonal"
      color="white"
      class="mr-3 text-capitalize"
      rounded="lg"
      @click="goToHome"
    >
      Trang Khách
    </v-btn>

    <div v-if="user" class="d-none d-sm-flex align-center mr-4">
      <v-avatar
        size="36"
        class="mr-2"
        style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.5);
        "
      >
        <v-icon color="white" size="20">mdi-account</v-icon>
      </v-avatar>
      <div class="d-flex flex-column" style="line-height: 1.2">
        <span class="text-caption text-blue-grey-lighten-3">Xin chào,</span>
        <strong class="text-body-2 text-white">{{
          user.name || user.email
        }}</strong>
      </div>
    </div>

    <v-btn
      prepend-icon="mdi-logout"
      color="red-lighten-1"
      variant="flat"
      class="mr-2 text-capitalize"
      rounded="lg"
      @click="handleLogout"
    >
      Đăng xuất
    </v-btn>
  </v-app-bar>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import AuthService from "../../services/auth.service";

const router = useRouter();
const user = ref(null);

onMounted(() => {
  const userData = localStorage.getItem("user");
  if (userData) {
    user.value = JSON.parse(userData);
  }
});

const handleLogout = () => {
  AuthService.logout();
  router.push({ name: "login" });
};

const goToHome = () => {
  router.push({ name: "home" });
};
</script>

<style scoped>
.v-app-bar {
  background: linear-gradient(
    90deg,
    #1a237e 0%,
    #283593 60%,
    #303f9f 100%
  ) !important;
}
</style>
