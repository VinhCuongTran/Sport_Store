<template>
  <v-app>
    <v-main
      class="bg-white d-flex flex-column align-center justify-center min-vh-100"
    >
      <div class="image-wrapper">
        <v-img
          :src="notFoundImg"
          max-width="1000px"
          class="mx-auto"
          contain
        ></v-img>

        <v-btn
          to="/"
          class="btn-go-home font-weight-bold"
          height="56"
          rounded="pill"
          elevation="4"
        >
          <v-icon left size="24" class="mr-2">mdi-cart-arrow-right</v-icon>
          TIẾP TỤC MUA SẮM
        </v-btn>
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import notFoundImg from "@/assets/notfound.png";
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}

.image-wrapper {
  position: relative;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.btn-go-home {
  position: absolute;
  z-index: 10;

  top: 350px;
  right: 80px;

  background-color: #ef4444 !important;
  color: #ffffff !important;
  font-size: 16px;
  letter-spacing: 1px;
  padding: 0 40px !important;
  transition: all 0.3s ease;
}
.btn-go-home:hover {
  background-color: #dc2626 !important;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4) !important;
}

@media (max-width: 768px) {
  .btn-go-home {
    top: 50%;
    right: auto;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .btn-go-home:hover {
    transform: translate(-50%, -55%);
  }
}
</style>
