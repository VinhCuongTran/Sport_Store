<template>
  <div
    class="pa-0 ma-0 w-100"
    style="overflow-x: hidden; border-radius: 16px; overflow: hidden"
  >
    <v-carousel
      class="smooth-slider"
      :show-arrows="false"
      hide-delimiters
      cycle
      :interval="4000"
      height="450"
      v-if="featuredProducts.length > 0"
    >
      <v-carousel-item
        v-for="(product, index) in featuredProducts"
        :key="product.id"
        :value="index"
      >
        <v-row density="compact" class="w-100 h-100 ma-0">
          <v-col cols="12" md="5" class="bg-grey-lighten-3 pa-0">
            <div
              class="h-100 d-flex align-center justify-center pa-4 image-container"
            >
              <v-img
                :src="
                  product.thumbnail ||
                  'https://placehold.co/600x600?text=No+Image'
                "
                class="rounded-lg shadow-lg slider-img"
                contain
              />
            </div>
          </v-col>

          <v-col
            cols="12"
            md="7"
            class="pa-0 d-flex flex-column justify-center custom-bg text-white"
          >
            <div class="content-inner px-8 py-6">
              <h2 class="text-h4 font-weight-bold mb-3 line-clamp-2">
                {{ product.name }}
              </h2>

              <p class="text-body-2 mb-2 text-white">
                Thương hiệu:
                <span class="font-weight-bold">{{
                  product.brand_name || "Khác"
                }}</span>
              </p>

              <p class="text-body-2 mb-6 text-white line-clamp-2">
                {{
                  product.description ||
                  "Khám phá ngay sản phẩm thể thao chất lượng cao giúp bạn bứt phá giới hạn của bản thân."
                }}
              </p>

              <div>
                <v-btn
                  :to="`/product/${product.id}`"
                  color="white"
                  variant="outlined"
                  size="large"
                  class="text-capitalize font-weight-bold px-6 rounded-pill hover-btn-white"
                >
                  Xem Chi Tiết
                  <v-icon right class="ml-2">mdi-arrow-right</v-icon>
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-carousel-item>
    </v-carousel>

    <div
      v-else
      class="d-flex justify-center align-center bg-grey-lighten-3"
      style="height: 450px; border-radius: 16px"
    >
      <v-progress-circular
        indeterminate
        color="#001a2d"
        size="64"
      ></v-progress-circular>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ProductService from "@/services/product.service";

const featuredProducts = ref([]);

const fetchRandomProducts = async () => {
  try {
    const products = await ProductService.getAll();
    if (products && products.length > 0) {
      const activeProducts = products.filter((p) => p.status === "active");
      const shuffled = [...activeProducts].sort(() => 0.5 - Math.random());
      featuredProducts.value = shuffled.slice(0, 5);
    }
  } catch (error) {
    console.error("Lỗi khi tải slider:", error);
  }
};

onMounted(() => {
  fetchRandomProducts();
});
</script>

<style scoped>
.custom-bg {
  background-color: #001a2d !important;
}

.image-container {
  height: 100%;
  width: 100%;
}

:deep(.slider-img .v-img__img) {
  object-fit: contain !important;
}

.slider-img {
  width: 100%;
  height: 100%;
  max-height: 400px;
}

.content-inner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.hover-btn-white:hover {
  background-color: white !important;
  color: #001a2d !important;
  transition: all 0.3s ease;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

:deep(.v-window__container) {
  transition: transform 1.2s cubic-bezier(0.25, 0.8, 0.5, 1) !important;
}
</style>
