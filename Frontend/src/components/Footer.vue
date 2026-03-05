<template>
  <v-footer class="bg-black text-white py-8 mt-10" elevation="0">
    <v-container>
      <v-row>
        <v-col cols="12" md="4" class="text-center text-md-left mb-4 mb-md-0">
          <div class="d-flex align-center justify-center justify-md-start mb-4">
            <v-icon class="mr-2" color="white" size="x-large"
              >mdi-basketball</v-icon
            >
            <h3 class="font-weight-bold text-h5">Sport Store</h3>
          </div>
          <p class="text-grey-lighten-1 text-body-2 mb-2 pr-md-4">
            Đánh thức đam mê, bứt phá giới hạn. Hệ thống cung cấp đồ thể thao
            chính hãng hàng đầu Việt Nam.
          </p>
        </v-col>

        <v-col cols="12" md="4" class="text-center text-md-left mb-4 mb-md-0">
          <h4 class="font-weight-bold text-h6 mb-4">Thông tin liên hệ</h4>
          <p class="text-grey-lighten-1 text-body-2 mb-2">
            <v-icon size="small" class="mr-2">mdi-map-marker</v-icon> 123 Đường
            Thể Thao, Hà Nội
          </p>
          <p class="text-grey-lighten-1 text-body-2 mb-2">
            <v-icon size="small" class="mr-2">mdi-phone</v-icon> 0123 456 789
          </p>
          <p class="text-grey-lighten-1 text-body-2 mb-2">
            <v-icon size="small" class="mr-2">mdi-email</v-icon>
            contact@sportstore.com
          </p>
        </v-col>

        <v-col
          cols="12"
          md="4"
          class="text-center text-md-right d-flex flex-column justify-center"
        >
          <div class="mb-4">
            <span
              class="text-body-2 font-weight-bold mr-3 d-none d-md-inline-block"
              >Theo dõi chúng tôi:</span
            >
            <div class="d-inline-flex gap-3">
              <v-btn
                icon
                variant="tonal"
                density="comfortable"
                color="white"
                class="hover-scale"
              >
                <v-icon size="small">mdi-facebook</v-icon>
              </v-btn>
              <v-btn
                icon
                variant="tonal"
                density="comfortable"
                color="white"
                class="hover-scale"
              >
                <v-icon size="small">mdi-instagram</v-icon>
              </v-btn>
              <v-btn
                icon
                variant="tonal"
                density="comfortable"
                color="white"
                class="hover-scale"
              >
                <v-icon size="small">mdi-youtube</v-icon>
              </v-btn>
            </div>
          </div>
          <p class="text-caption text-grey-darken-1 mt-auto">
            &copy; {{ new Date().getFullYear() }} - Sport Store. Bảo lưu mọi
            quyền.
          </p>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup>
// Vuetify components không cần khai báo export default phức tạp nếu dùng script setup
</script>

<style scoped>
.hover-scale {
  transition: transform 0.2s;
}
.hover-scale:hover {
  transform: translateY(-3px);
  background-color: rgba(255, 255, 255, 0.1) !important;
}
</style>
