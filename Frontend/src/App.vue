<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script setup>
</script>

<style>
/* Import font Inter từ Google Fonts - Font chữ cực kỳ hiện đại và tối ưu cho UI/UX */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");

/* Khai báo biến CSS toàn cục để dễ dàng tái sử dụng ở mọi component */
:root {
  --bg-primary: #001a2d;
  --text-primary: #ffffff;
  --accent-green: #77e51f;
}

body {
  margin: 0;
  padding: 0;
  /* Dùng Inter làm font chính, dự phòng bằng các font hệ thống chuẩn của Apple/Windows */
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif;

  /* Giúp font chữ sắc nét và mịn màng hơn */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  /* Cập nhật màu nền và màu chữ giống Header */
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* Ép tất cả các component của Vuetify sử dụng font mới và màu nền mới */
.v-application {
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif !important;
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

/* Class tiện ích dùng chung cho toàn app (nếu cần) */
.text-accent-green {
  color: var(--accent-green) !important;
}
</style>
