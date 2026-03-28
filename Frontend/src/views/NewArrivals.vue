<template>
  <div class="products-page bg-grey-lighten-5 py-10 min-vh-100">
    <v-container>
      <div class="text-center mb-8">
        <h1 class="text-h3 font-weight-black text-black text-uppercase mb-3">
          Hàng mới về
        </h1>
        
        <p v-if="searchQuery" class="text-grey-darken-1 text-subtitle-1 mb-4">
          Kết quả tìm kiếm cho: <strong>"{{ searchQuery }}"</strong>
        </p>
      </div>

      <v-row>
        <v-col cols="12" md="3" class="d-none d-md-block">
          <FilterSidebar
            :availableCategories="availableCategories"
            :availableBrands="availableBrands"
            :availableColors="availableColors"
            :maxPriceLimit="maxPriceLimit"
            :hasActiveSidebarFilters="hasActiveSidebarFilters"
            v-model:activePanels="activePanels"
            v-model:priceRange="priceRange"
            v-model:filterCategories="filterCategories"
            v-model:filterBrands="filterBrands"
            v-model:filterColors="filterColors"
            v-model:limits="limits"
            @clearFilters="clearFilters"
          />
        </v-col>

        <v-col cols="12" md="9">
          <div
            class="d-flex flex-column flex-md-row justify-space-between align-md-start mb-4 gap-4"
          >
            <div class="d-flex flex-wrap gap-2 flex-grow-1">
              <v-chip
                v-for="(filter, index) in activeFilterChips"
                :key="index"
                closable
                color="black"
                variant="outlined"
                @click:close="removeFilterChip(filter)"
              >
                {{ filter.label }}
              </v-chip>
            </div>

            <div style="min-width: 200px">
              <v-select
                v-model="sortOrder"
                :items="sortOptions"
                item-title="title"
                item-value="value"
                density="compact"
                variant="outlined"
                hide-details
                prepend-inner-icon="mdi-sort-variant"
                bg-color="white"
                class="text-black"
              ></v-select>
            </div>
          </div>

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
                md="4"
                lg="4"
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
            <v-btn color="black" class="mt-4" @click="clearFilters"
              >Xóa bộ lọc</v-btn
            >
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
import BrandService from "@/services/brand.service";
import ProductCard from "@/components/ProductCard.vue";
import FilterSidebar from "@/components/Filter.vue";

const route = useRoute();
const router = useRouter();

const isLoading = ref(true);
const products = ref([]);
const categories = ref([]);
const brands = ref([]);

// Thay đổi mảng rỗng để đóng tất cả các panel khi mới load
const activePanels = ref([]);

const sortOrder = ref("newest");
const sortOptions = [
  { title: "Mới nhất", value: "newest" },
  { title: "Giá: Thấp đến Cao", value: "price_asc" },
  { title: "Giá: Cao đến Thấp", value: "price_desc" },
];

const selectedCategory = ref(route.query.category || null);
const selectedBrand = ref(route.query.brand || null);
const selectedSport = ref(route.query.sport || null);
const searchQuery = ref(route.query.search || "");

const filterBrands = ref([]);
const filterCategories = ref([]);
const filterColors = ref([]);
const priceRange = ref([0, 10000000]);

const page = ref(1);
const itemsPerPage = 9;

const defaultLimit = 5;
const limits = ref({
  brand: defaultLimit,
  category: defaultLimit,
  color: defaultLimit,
});

onBeforeRouteLeave((to, from, next) => {
  sessionStorage.setItem("productsScrollPos", window.scrollY);
  const filterState = {
    filterBrands: filterBrands.value,
    filterCategories: filterCategories.value,
    filterColors: filterColors.value,
    priceRange: priceRange.value,
    limits: limits.value,
    activePanels: activePanels.value,
    sortOrder: sortOrder.value,
  };
  sessionStorage.setItem("productsFilterState", JSON.stringify(filterState));
  next();
});

const getMinPrice = (product) => {
  return Number(product.min_price) || Number(product.price) || 0;
};

// Hàm lấy dữ liệu sản phẩm để tính toán bộ lọc
const getProductsForFilter = (excludeFilter = null) => {
  let result = [...products.value];

  if (searchQuery.value) {
    const kw = searchQuery.value.toLowerCase().trim();
    result = result.filter((p) => p.name.toLowerCase().includes(kw));
  }
  if (selectedCategory.value) {
    const childIds = categories.value
      .filter((c) => c.parent_id === selectedCategory.value)
      .map((c) => c.id);
    result = result.filter((p) =>
      [selectedCategory.value, ...childIds].includes(p.category_id),
    );
  }
  if (selectedBrand.value) {
    result = result.filter((p) => p.brand_id === selectedBrand.value);
  }

  if (excludeFilter !== "category" && filterCategories.value.length > 0) {
    result = result.filter((p) =>
      filterCategories.value.includes(p.category_id),
    );
  }
  if (excludeFilter !== "brand" && filterBrands.value.length > 0) {
    result = result.filter((p) => filterBrands.value.includes(p.brand_id));
  }
  if (excludeFilter !== "color" && filterColors.value.length > 0) {
    result = result.filter(
      (p) => p.colors && filterColors.value.some((c) => p.colors.includes(c)),
    );
  }
  if (excludeFilter !== "price") {
    result = result.filter((p) => {
      const pPrice = getMinPrice(p);
      return pPrice >= priceRange.value[0] && pPrice <= priceRange.value[1];
    });
  }

  return result;
};

// Cập nhật: Làm cho maxPriceLimit thay đổi linh hoạt theo các bộ lọc khác
const maxPriceLimit = computed(() => {
  const validProducts = getProductsForFilter("price");
  if (validProducts.length === 0) return 10000000;

  let max = 0;
  validProducts.forEach((p) => {
    const pPrice = getMinPrice(p);
    if (pPrice > max) max = pPrice;
  });
  return max > 0 ? Math.ceil(max / 50000) * 50000 : 10000000;
});

// Watcher thông minh: Tự kéo thanh giá thụt vào nếu limit giảm, 
// và tự nới ra nếu limit tăng (trường hợp user chưa chủ động kéo thanh giá)
watch(maxPriceLimit, (newMax, oldMax) => {
  let newRange = [...priceRange.value];
  let changed = false;

  // Nếu limit mới lớn hơn, và đầu thanh trượt đang chạm kịch trần limit cũ -> Nới thanh trượt ra theo limit mới
  if (oldMax && newRange[1] === oldMax && newMax > oldMax) {
    newRange[1] = newMax;
    changed = true;
  }
  // Nếu limit mới thụt vào, bắt buộc phải ép đầu thanh trượt thụt vào để không vượt quá max
  else if (newRange[1] > newMax) {
    newRange[1] = newMax;
    changed = true;
  }

  // Đầu min không được lớn hơn limit mới
  if (newRange[0] > newMax) {
    newRange[0] = 0;
    changed = true;
  }

  if (changed) {
    priceRange.value = newRange;
  }
});

const fetchData = async () => {
  isLoading.value = true;
  try {
    const [productsData, categoriesData, brandsData] = await Promise.all([
      ProductService.getAll(),
      CategoryService.getAll(),
      BrandService.getAll(),
    ]);

    products.value = productsData.filter((p) => p.status === "active");
    // (Lưu ý: Bến trang NewArrivals thì vẫn giữ phần .sort(...).slice(0, 40) của bạn nhé)
    
    categories.value = categoriesData;
    brands.value = brandsData;

    // --- BỔ SUNG: Tính ngay giá cao nhất của toàn bộ sản phẩm thực tế ---
    let absoluteMax = 0;
    products.value.forEach((p) => {
      const pPrice = getMinPrice(p);
      if (pPrice > absoluteMax) absoluteMax = pPrice;
    });
    // Làm tròn lên bội số của 50.000đ
    const roundedMax = absoluteMax > 0 ? Math.ceil(absoluteMax / 50000) * 50000 : 10000000;
    // ---------------------------------------------------------------------

    const savedFilters = sessionStorage.getItem("productsFilterState");
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      filterBrands.value = parsed.filterBrands || [];
      filterCategories.value = parsed.filterCategories || [];
      filterColors.value = parsed.filterColors || [];
      
      // Nếu có giá trị lưu từ trước thì khôi phục, nếu KHÔNG thì set kịch trần bằng giá trị thực tế
      if (parsed.priceRange && parsed.priceRange.length === 2) {
        priceRange.value = parsed.priceRange;
      } else {
        priceRange.value = [0, roundedMax]; 
      }
      
      if (parsed.activePanels) activePanels.value = parsed.activePanels;
      if (parsed.sortOrder) sortOrder.value = parsed.sortOrder;
    } else {
      // Set kịch trần ngay khi vào trang lần đầu
      priceRange.value = [0, roundedMax];
    }
    
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu sản phẩm:", error);
  } finally {
    isLoading.value = false;
    nextTick(() => {
      // (Giữ nguyên logic scroll cũ của bạn ở đây...)
      const savedPosition = sessionStorage.getItem("productsScrollPos"); // Đổi key tương ứng với file
      if (savedPosition) {
        setTimeout(
          () =>
            window.scrollTo({
              top: parseInt(savedPosition),
              behavior: "instant",
            }),
          100,
        );
        sessionStorage.removeItem("productsScrollPos");
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

const availableCategories = computed(() => {
  const validProducts = getProductsForFilter("category");
  const activeIds = [
    ...new Set(validProducts.map((p) => p.category_id).filter(Boolean)),
  ];
  return categories.value.filter((c) => activeIds.includes(c.id));
});
const availableBrands = computed(() => {
  const validProducts = getProductsForFilter("brand");
  const activeIds = [
    ...new Set(validProducts.map((p) => p.brand_id).filter(Boolean)),
  ];
  return brands.value.filter((b) => activeIds.includes(b.id));
});
const availableColors = computed(() => {
  const validProducts = getProductsForFilter("color");
  const colorSet = new Set();
  validProducts.forEach((p) => {
    if (p.colors) p.colors.split(",").forEach((c) => colorSet.add(c.trim()));
  });
  return [...colorSet].filter(Boolean);
});

const hasActiveSidebarFilters = computed(() => {
  return (
    filterBrands.value.length > 0 ||
    filterCategories.value.length > 0 ||
    filterColors.value.length > 0 ||
    priceRange.value[0] > 0 ||
    priceRange.value[1] < maxPriceLimit.value
  );
});

const activeFilterChips = computed(() => {
  const chips = [];
  filterCategories.value.forEach((id) => {
    const cat = categories.value.find((c) => c.id === id);
    if (cat) chips.push({ type: "category", value: id, label: cat.name });
  });
  filterBrands.value.forEach((id) => {
    const brand = brands.value.find((b) => b.id === id);
    if (brand) chips.push({ type: "brand", value: id, label: brand.name });
  });
  filterColors.value.forEach((color) =>
    chips.push({ type: "color", value: color, label: color }),
  );
  return chips;
});

const removeFilterChip = (filter) => {
  if (filter.type === "category")
    filterCategories.value = filterCategories.value.filter(
      (id) => id !== filter.value,
    );
  if (filter.type === "brand")
    filterBrands.value = filterBrands.value.filter((id) => id !== filter.value);
  if (filter.type === "color")
    filterColors.value = filterColors.value.filter((c) => c !== filter.value);
};

const clearFilters = () => {
  router.push({ path: "/products" });
  filterCategories.value = [];
  filterBrands.value = [];
  filterColors.value = [];
  searchQuery.value = "";
  sortOrder.value = "newest";

  limits.value = {
    brand: defaultLimit,
    category: defaultLimit,
    color: defaultLimit,
  };
  sessionStorage.removeItem("productsFilterState");

  // Đợi computed properties cập nhật rồi gán lại priceRange
  nextTick(() => {
    priceRange.value = [0, maxPriceLimit.value];
  });
};

const filteredProducts = computed(() => {
  let result = getProductsForFilter(null);

  if (sortOrder.value === "price_asc")
    result.sort((a, b) => getMinPrice(a) - getMinPrice(b));
  else if (sortOrder.value === "price_desc")
    result.sort((a, b) => getMinPrice(b) - getMinPrice(a));
  else
    result.sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
    );

  return result;
});

const totalPages = computed(() =>
  Math.ceil(filteredProducts.value.length / itemsPerPage),
);
const paginatedProducts = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  return filteredProducts.value.slice(start, start + itemsPerPage);
});

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}
.gap-2 {
  gap: 8px;
}
.gap-4 {
  gap: 16px;
}
</style>