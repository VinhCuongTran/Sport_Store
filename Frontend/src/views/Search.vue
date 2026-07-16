<template>
  <div class="products-page bg-grey-lighten-5 py-8 min-vh-100">
    <v-container>
      <div class="mb-6 border-b pb-4 d-flex align-center gap-4">
        <v-icon color="red" size="32">
          {{
            searchState.searchType === "image"
              ? "mdi-image-search"
              : "mdi-magnify"
          }}
        </v-icon>
        <h2 class="text-h5 font-weight-bold text-black mb-0">
          <span v-if="searchState.searchType === 'image'"
            >Kết quả tìm kiếm bằng hình ảnh</span
          >
          <span v-else>Kết quả tìm kiếm cho: "{{ route.query.q }}"</span>
        </h2>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <v-progress-circular
          indeterminate
          size="64"
          width="5"
          color="black"
          class="mb-6"
        ></v-progress-circular>
        <h3
          class="text-h6 font-weight-regular text-grey-darken-3"
          style="min-height: 32px"
        >
          {{ searchStepText }}
        </h3>
      </div>

      <v-row v-else>
        <v-col cols="12" md="3" class="d-none d-md-block">
          <div
            v-if="
              searchState.searchType === 'image' && searchState.imagePreview
            "
            class="mb-6"
          >
            <h3 class="text-subtitle-2 font-weight-bold mb-2">Ảnh của bạn:</h3>
            <v-img
              :src="searchState.imagePreview"
              class="rounded-lg border elevation-1 bg-white"
              height="150"
              cover
            ></v-img>
          </div>

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

          <div v-if="filteredProducts.length > 0">
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
              Không tìm thấy sản phẩm nào khớp với bộ lọc!
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
import { useRoute } from "vue-router";
import axios from "axios";
import { useToast } from "vue-toastification";

// Components & Services
import { searchState } from "@/services/search.service";
import CategoryService from "@/services/category.service";
import BrandService from "@/services/brand.service";
import ProductCard from "@/components/ProductCard.vue";
import FilterSidebar from "@/components/Filter.vue";

const route = useRoute();
const toast = useToast();
const isLoading = ref(false);

// State cho Filters
const categories = ref([]);
const brands = ref([]);
const activePanels = ref([]);
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

const sortOrder = ref("popular");
const sortOptions = [
  { title: "Phổ biến nhất/Độ chính xác", value: "popular" },
  { title: "Mới nhất", value: "newest" },
  { title: "Giá: Thấp đến Cao", value: "price_asc" },
  { title: "Giá: Cao đến Thấp", value: "price_desc" },
];

// Tiến trình AI
const searchSteps = [
  "Đang tải ảnh lên...",
  "Đang phân tích hình ảnh...",
  "Đang so khớp với sản phẩm...",
];
const searchStepText = ref(searchSteps[0]);
let searchStepInterval = null;

const startSearchSteps = () => {
  let i = 0;
  searchStepText.value = searchSteps[0];
  searchStepInterval = setInterval(() => {
    i = (i + 1) % searchSteps.length;
    searchStepText.value = searchSteps[i];
  }, 1200);
};

const stopSearchSteps = () => {
  if (searchStepInterval) {
    clearInterval(searchStepInterval);
    searchStepInterval = null;
  }
};

// Chuẩn hóa dữ liệu API trả về để ProductCard hiển thị đúng
const normalizeProductData = (p) => {
  // Gắn đúng key ID
  p.id = p.id || p.product_id;

  if (p.matched_image) {
    // 1. Lưu lại các trường gốc (nếu lỡ cần dùng)
    p.original_image = p.image; 
    p.original_images = p.images;
    
    // 2. Ép kiểu ảnh AI vào MỌI tên biến chuỗi thông dụng
    p.image = p.matched_image; 
    p.image_url = p.matched_image;
    p.thumbnail = p.matched_image;
    
    // 3. Ép kiểu ảnh AI vào dạng MẢNG OBJECT (cấu trúc mà dự án bạn đang dùng)
    p.images = [
      {
        image_url: p.matched_image,
        is_thumbnail: 1,
        is_thumbnail_true: true
      }
    ];
    
    // 4. Đề phòng trường hợp ProductCard tự parse JSON chuỗi
    try {
      p.images_json = JSON.stringify([{ image_url: p.matched_image }]);
    } catch (e) {}
  }
  
  return p;
};

// Gọi API
const executeSearch = async () => {
  const { q, type } = route.query;
  page.value = 1; // Reset trang

  if (type === "image") {
    searchState.searchType = "image";
    if (!searchState.isNewImageUpload && searchState.results.length > 0) return;
    if (!searchState.imageFile) return;

    try {
      isLoading.value = true;
      startSearchSteps();
      const formData = new FormData();
      formData.append("image", searchState.imageFile);

      const response = await axios.post(
        "http://localhost:3000/api/search/image",
        formData,
      );
      if (response.data.success) {
        searchState.results = response.data.products.map(normalizeProductData);
      }
    } catch (error) {
      toast.error("Lỗi server hoặc không tìm thấy sản phẩm.");
    } finally {
      stopSearchSteps();
      isLoading.value = false;
      searchState.isNewImageUpload = false;
    }
  } else if (q) {
    searchState.searchType = "text";
    if (searchState.keyword === q && searchState.results.length > 0) return;
    searchState.keyword = q;

    try {
      isLoading.value = true;
      const response = await axios.get("http://localhost:3000/api/products", {
        params: { search: q },
      });
      const rawProducts = response.data.products || response.data;
      searchState.results = rawProducts
        .filter((p) => p.status === "active")
        .map(normalizeProductData);
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi tìm kiếm.");
    } finally {
      isLoading.value = false;
    }
  }

  // Tự động set max price theo kết quả trả về
  nextTick(() => {
    priceRange.value = [0, maxPriceLimit.value];
  });
};

// --- LOGIC LỌC (Tương tự Products.vue) ---
const getMinPrice = (product) =>
  Number(product.min_price) || Number(product.price) || 0;

const getProductsForFilter = (excludeFilter = null) => {
  let result = [...searchState.results];

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

// Tính toán dải giá
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

watch(maxPriceLimit, (newMax, oldMax) => {
  let newRange = [...priceRange.value];
  if (oldMax && newRange[1] === oldMax && newMax > oldMax) newRange[1] = newMax;
  else if (newRange[1] > newMax) newRange[1] = newMax;
  if (newRange[0] > newMax) newRange[0] = 0;
  priceRange.value = newRange;
});

// Computed cho Sidebar Options
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

// Chips
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
  filterCategories.value = [];
  filterBrands.value = [];
  filterColors.value = [];
  sortOrder.value = "popular";
  limits.value = {
    brand: defaultLimit,
    category: defaultLimit,
    color: defaultLimit,
  };
  nextTick(() => (priceRange.value = [0, maxPriceLimit.value]));
};

// Lọc kết quả cuối cùng + Sort
const filteredProducts = computed(() => {
  let result = getProductsForFilter(null);
  if (sortOrder.value === "price_asc") {
    result.sort((a, b) => getMinPrice(a) - getMinPrice(b));
  } else if (sortOrder.value === "price_desc") {
    result.sort((a, b) => getMinPrice(b) - getMinPrice(a));
  } else if (sortOrder.value === "newest") {
    result.sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
    );
  } else {
    // "popular" sẽ ưu tiên giữ nguyên thứ tự ban đầu từ AI / Backend (theo độ chính xác điểm số)
    // Hoặc kết hợp thêm điểm bán chạy/đánh giá
    // Ở đây ta dùng hàm chuẩn của bạn
  }
  return result;
});

// Phân trang
const totalPages = computed(() =>
  Math.ceil(filteredProducts.value.length / itemsPerPage),
);
const paginatedProducts = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  return filteredProducts.value.slice(start, start + itemsPerPage);
});

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

// Khởi tạo
onMounted(async () => {
  // Lấy danh sách Categories và Brands để bộ lọc có thể hiển thị Tên
  try {
    const [catRes, brandRes] = await Promise.all([
      CategoryService.getAll(),
      BrandService.getAll(),
    ]);
    categories.value = catRes;
    brands.value = brandRes;
  } catch (error) {
    console.error("Lỗi lấy dữ liệu danh mục/thương hiệu", error);
  }
  await executeSearch();
});

watch(() => route.query, executeSearch);
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
