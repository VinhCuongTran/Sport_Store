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

          <div v-else-if="newProducts.length > 0">
            <v-row>
              <v-col
                v-for="product in paginatedProducts"
                :key="product.id"
                cols="12"
                sm="6"
                md="3"
                lg="3"
              >
                <ProductCard :product="product" />
              </v-col>
            </v-row>

            <div class="d-flex justify-center mt-12 mb-4" v-if="totalPages > 1">
              <v-pagination
                v-model="page"
                :length="totalPages"
                color="black"
                rounded="circle"
                :total-visible="7"
                @update:modelValue="scrollToTop"
              ></v-pagination>
            </div>
          </div>

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
import { ref, onMounted, computed } from "vue";
import ProductService from "@/services/product.service";
import ProductCard from "@/components/ProductCard.vue";

const isLoading = ref(true);
const newProducts = ref([]);

const page = ref(1);
const itemsPerPage = 16;

const totalPages = computed(() => {
  return Math.ceil(newProducts.value.length / itemsPerPage);
});

const paginatedProducts = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return newProducts.value.slice(start, end);
});

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const fetchNewArrivals = async () => {
  isLoading.value = true;
  try {
    const productsData = await ProductService.getAll();
    newProducts.value = productsData
      .filter((p) => p.status === "active")
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
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
