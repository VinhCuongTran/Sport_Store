<template>
  <div class="products-page bg-grey-lighten-5 py-10 min-vh-100">
    <v-container>
      <div class="text-center mb-10">
        <h1 class="text-h3 font-weight-black text-black text-uppercase mb-3">
          Sản phẩm
        </h1>
        <p v-if="searchQuery" class="text-grey-darken-1 text-subtitle-1 mb-4">
          Kết quả tìm kiếm cho: <strong>"{{ searchQuery }}"</strong>
        </p>
        <p v-else class="text-grey-darken-1 text-subtitle-1 mb-4">
          Khám phá bộ sưu tập đồ thể thao chính hãng mới nhất
        </p>

        <v-btn
          v-if="
            selectedCategory || selectedBrand || selectedSport || searchQuery
          "
          color="black"
          variant="outlined"
          class="text-capitalize font-weight-bold"
          @click="clearFilters"
        >
          <v-icon left class="mr-2">mdi-filter-remove-outline</v-icon> Bỏ lọc /
          Quay lại
        </v-btn>
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

          <div v-else-if="filteredProducts.length > 0">
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
              Không tìm thấy sản phẩm nào!
            </h3>
            <p class="text-grey">Hãy thử với một từ khóa hoặc danh mục khác.</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import ProductService from "@/services/product.service";
import CategoryService from "@/services/category.service";
import ProductCard from "@/components/ProductCard.vue";

const route = useRoute();
const router = useRouter();

const isLoading = ref(true);
const products = ref([]);
const categories = ref([]);

const selectedCategory = ref(route.query.category || null);
const selectedBrand = ref(route.query.brand || null);
const selectedSport = ref(route.query.sport || null);
const searchQuery = ref(route.query.search || "");

const page = ref(1);
const itemsPerPage = 16;

onBeforeRouteLeave((to, from, next) => {
  sessionStorage.setItem("productsScrollPos", window.scrollY);
  next();
});

const fetchData = async () => {
  isLoading.value = true;
  try {
    const [productsData, categoriesData] = await Promise.all([
      ProductService.getAll(),
      CategoryService.getAll(),
    ]);

    products.value = productsData.filter((p) => p.status === "active");
    categories.value = categoriesData;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu sản phẩm:", error);
  } finally {
    isLoading.value = false;

    nextTick(() => {
      const savedPosition = sessionStorage.getItem("productsScrollPos");

      if (savedPosition) {
        const targetScroll = parseInt(savedPosition);

        setTimeout(() => {
          window.scrollTo({ top: targetScroll, behavior: "instant" });
        }, 100);

        setTimeout(() => {
          window.scrollTo({ top: targetScroll, behavior: "instant" });
          sessionStorage.removeItem("productsScrollPos");
        }, 500);
      }
    });
  }
};

watch(
  () => route.query,
  (newQuery) => {
    selectedCategory.value = newQuery.category || null;
    selectedBrand.value = newQuery.brand || null;
    selectedSport.value = newQuery.sport || null;
    searchQuery.value = newQuery.search || "";
    page.value = 1;
  },
);

const getChildCategories = (parentId) => {
  return categories.value.filter((c) => c.parent_id === parentId);
};

const filteredProducts = computed(() => {
  let result = products.value;
  if (searchQuery.value) {
    const kw = searchQuery.value.toLowerCase().trim();
    result = result.filter((p) => p.name.toLowerCase().includes(kw));
  }
  if (selectedCategory.value) {
    const childCategoryIds = getChildCategories(selectedCategory.value).map(
      (c) => c.id,
    );
    const validCategoryIds = [selectedCategory.value, ...childCategoryIds];
    result = result.filter((p) => validCategoryIds.includes(p.category_id));
  }
  if (selectedSport.value) {
    const sportCategoryIds = categories.value
      .filter((c) => String(c.sport_id) === String(selectedSport.value))
      .map((c) => c.id);
    result = result.filter((p) => sportCategoryIds.includes(p.category_id));
  }
  if (selectedBrand.value) {
    result = result.filter((p) => p.brand_id === selectedBrand.value);
  }

  return result;
});

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage);
});

const paginatedProducts = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredProducts.value.slice(start, end);
});

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const clearFilters = () => {
  router.push({ path: "/products" });
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}
</style>
