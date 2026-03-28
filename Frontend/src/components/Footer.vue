<template>
  <v-footer class="custom-footer text-white py-10 mt-10" elevation="0">
    <v-container>
      <v-row>
        <v-col
          cols="12"
          md="4"
          class="d-flex flex-column align-center align-md-start mb-6 mb-md-0"
        >
          <div class="footer-title-wrap mb-4">
            <img
              src="../assets/logo.jpg"
              alt="Logo Footer"
              class="footer-logo-img"
            />
            <h3 class="footer-brand-text">Sport Store</h3>
          </div>
          <p
            class="text-grey-lighten-1 text-body-2 pr-md-4 text-center text-md-left"
          >
            Đánh thức đam mê, bứt phá giới hạn. Hệ thống cung cấp đồ thể thao
            chính hãng hàng đầu Việt Nam.
          </p>
        </v-col>

        <v-col
          cols="12"
          md="4"
          class="d-flex flex-column align-center align-md-start mb-6 mb-md-0"
        >
          <div class="footer-title-wrap mb-4">
            <h4 class="footer-static-title">Thông tin liên hệ</h4>
          </div>
          <div class="contact-info text-center text-md-left">
            <p class="text-grey-lighten-1 text-body-2 mb-2">
              <v-icon size="small" class="mr-2">mdi-map-marker</v-icon> 123
              Đường 3/2, Phường Ninh Kiều, Thành phố Cần Thơ
            </p>
            <p class="text-grey-lighten-1 text-body-2 mb-2">
              <v-icon size="small" class="mr-2">mdi-phone</v-icon> 0987654321
            </p>
            <p class="text-grey-lighten-1 text-body-2 mb-2">
              <v-icon size="small" class="mr-2">mdi-email</v-icon>
              sportstore@gmail.com
            </p>
          </div>
        </v-col>

        <v-col
          cols="12"
          md="4"
          class="d-flex flex-column align-center justify-center"
        >
          <div class="footer-title-wrap mb-4">
            <h4 class="footer-static-title">Theo dõi chúng tôi</h4>
          </div>

          <div class="d-flex gap-3 mb-6 justify-center">
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

          <p class="text-caption text-grey-darken-1">
            &copy; {{ new Date().getFullYear() }} - Sport Store. Bảo lưu mọi
            quyền.
          </p>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup></script>

<style scoped>
.custom-footer {
  background-color: #001a2d !important;
}

.footer-title-wrap {
  display: flex;
  align-items: center;
  height: 55px;
}

.footer-logo-img {
  height: 50px;
  width: auto;
  margin-right: 12px;
  border-radius: 4px;
}

.footer-brand-text {
  font-size: 1.5rem;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1;
  margin: 0;
}

.footer-static-title {
  font-size: 1.25rem;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1;
  margin: 0;
}

.gap-3 {
  gap: 12px;
}

.hover-scale {
  transition: transform 0.2s;
}

.hover-scale:hover {
  transform: translateY(-3px);
  background-color: rgba(255, 255, 255, 0.1) !important;
}

@media (max-width: 960px) {
  .footer-title-wrap {
    height: auto;
    margin-bottom: 15px !important;
  }
}
</style>
