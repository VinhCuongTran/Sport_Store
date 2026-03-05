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
          <v-col cols="12" md="5" class="bg-grey-lighten-3">
            <div class="h-100 d-flex align-center justify-center pa-6">
              <v-img
                :src="
                  product.thumbnail ||
                  'https://placehold.co/600x600?text=No+Image'
                "
                class="rounded-lg shadow-lg"
                cover
                height="100%"
                width="100%"
              />
            </div>
          </v-col>

          <v-col
            cols="12"
            md="7"
            class="py-10 px-10 d-flex flex-column justify-center"
            style="background-color: #111; color: white"
          >
            <v-chip
              v-if="product.active_discount > 0"
              color="red"
              class="mb-4 align-self-start font-weight-bold"
            >
              Đang Sale -{{ product.active_discount }}%
            </v-chip>

            <h2 class="text-h3 font-weight-bold mb-4 line-clamp-2">
              {{ product.name }}
            </h2>
            <p class="text-h6 mb-2 text-grey-lighten-1">
              Thương hiệu:
              <span class="text-white">{{ product.brand_name || "Khác" }}</span>
            </p>
            <p class="text-body-1 mb-8 text-grey-lighten-1 line-clamp-3">
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
                size="x-large"
                class="text-capitalize font-weight-bold px-8 rounded-pill"
              >
                Xem chi tiết
                <v-icon right class="ml-2">mdi-arrow-right</v-icon>
              </v-btn>
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
        color="black"
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
      // Lọc ra sản phẩm đang hiển thị (active)
      const activeProducts = products.filter((p) => p.status === "active");
      // Đảo ngẫu nhiên và lấy 3 sản phẩm
      const shuffled = [...activeProducts].sort(() => 0.5 - Math.random());
      featuredProducts.value = shuffled.slice(0, 3);
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
