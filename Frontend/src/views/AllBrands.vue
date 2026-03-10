<template>
  <div class="all-brands-page bg-grey-lighten-5 py-10 min-vh-100">
    <v-container class="bg-white rounded-xl pa-8 elevation-2">
      <div class="text-center mb-10">
        <h2 class="text-h4 font-weight-black text-black text-uppercase mb-3">
          Thương hiệu nổi bật
        </h2>
        <v-divider
          class="mx-auto"
          style="
            width: 60px;
            border-width: 3px;
            border-color: black;
            opacity: 1;
          "
        ></v-divider>
      </div>

      <div v-if="isLoading" class="d-flex justify-center align-center py-16">
        <v-progress-circular
          indeterminate
          color="black"
          size="64"
        ></v-progress-circular>
      </div>

      <v-row v-else-if="brands.length > 0">
        <v-col
          v-for="brand in brands"
          :key="brand.id"
          cols="6"
          sm="4"
          md="2"
          class="d-flex justify-center mb-4"
        >
          <router-link
            :to="`/products?brand=${brand.id}`"
            class="brand-link d-block w-100 text-center text-decoration-none"
            :title="brand.name"
          >
            <v-card
              class="elevation-0 brand-card pa-0 w-100 rounded-lg overflow-hidden bg-transparent"
            >
              <div class="img-wrapper bg-white pa-3">
                <v-img
                  :src="
                    brand.logo_url ||
                    'https://via.placeholder.com/600x300?text=' + brand.name
                  "
                  :alt="brand.name"
                  aspect-ratio="2"
                  class="brand-img mx-auto"
                ></v-img>
              </div>

              <div class="pt-3 pb-1">
                <span
                  class="text-body-2 font-weight-bold text-black text-uppercase"
                >
                  {{ brand.name }}
                </span>
              </div>
            </v-card>
          </router-link>
        </v-col>
      </v-row>

      <v-card v-else class="text-center py-16 elevation-0 bg-transparent">
        <v-icon size="64" color="grey-lighten-1" class="mb-4"
          >mdi-store-outline</v-icon
        >
        <h3 class="text-h6 font-weight-bold text-grey-darken-1">
          Đang cập nhật danh sách thương hiệu...
        </h3>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import BrandService from "@/services/brand.service.js";

const brands = ref([]);
const isLoading = ref(true);

const fetchBrands = async () => {
  isLoading.value = true;
  try {
    const data = await BrandService.getAll();

    brands.value = data.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Lỗi khi tải danh sách thương hiệu:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchBrands();
});
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}

.brand-link {
  transition: all 0.3s ease;
}

.img-wrapper {
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #eeeeee;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.brand-img {
  transition: transform 0.4s ease;
  width: 100%;
  height: 100%;
  object-fit: contain !important;
}

.brand-link:hover .brand-img {
  transform: scale(0.92);
}

.brand-link:hover span {
  color: #d32f2f !important;
}
</style>
