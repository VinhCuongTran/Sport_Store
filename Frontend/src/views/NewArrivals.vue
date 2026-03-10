<template>
  <div class="new-arrivals-page bg-grey-lighten-5 py-10 min-vh-100">
    <v-container>
      <div class="text-center mb-10">
        <h1 class="text-h3 font-weight-black text-black text-uppercase mb-3">
          Hàng mới về
        </h1>
        <p class="text-grey-darken-1 text-subtitle-1 mb-4">
          Khám phá những bộ sưu tập và sản phẩm thể thao vừa được cập nhật mới
          nhất
        </p>
        <v-divider
          class="mx-auto"
          style="
            width: 80px;
            border-width: 3px;
            border-color: black;
            opacity: 1;
          "
        ></v-divider>
      </div>

      <v-row>
        <v-col cols="12">
          <div
            v-if="isLoading"
            class="d-flex justify-center align-center py-16"
          >
            <v-progress-circular
              indeterminate
              color="black"
              size="64"
            ></v-progress-circular>
          </div>

          <v-row v-else-if="newProducts.length > 0">
            <v-col
              v-for="product in newProducts"
              :key="product.id"
              cols="12"
              sm="6"
              md="3"
              lg="3"
            >
              <ProductCard :product="product" />
            </v-col>
          </v-row>

          <v-card
            v-else
            class="text-center py-16 rounded-xl border elevation-0 bg-white"
          >
            <v-icon size="64" color="grey-lighten-1" class="mb-4"
              >mdi-package-variant-closed</v-icon
            >
            <h3 class="text-h5 font-weight-bold text-grey-darken-2">
              Chưa có sản phẩm mới nào!
            </h3>
            <p class="text-grey">
              Vui lòng quay lại sau để cập nhật những mẫu mã mới nhất.
            </p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ProductService from "@/services/product.service";
import ProductCard from "@/components/ProductCard.vue";

const isLoading = ref(true);
const newProducts = ref([]);

const fetchNewArrivals = async () => {
  isLoading.value = true;
  try {
    const productsData = await ProductService.getAll();
    newProducts.value = productsData
      .filter((p) => p.status === "active")
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 24);
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu hàng mới về:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchNewArrivals();
});
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}
</style>
