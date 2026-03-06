<template>
  <div class="products-page bg-grey-lighten-5 py-10 min-vh-100">
    <v-container>
      <div class="text-center mb-10">
        <h1 class="text-h3 font-weight-black text-black text-uppercase mb-3">
          Tất cả sản phẩm
        </h1>
        <p class="text-grey-darken-1 text-subtitle-1">
          Khám phá bộ sưu tập đồ thể thao chính hãng mới nhất của chúng tôi
        </p>
      </div>

      <v-row>
        <v-col cols="12" md="3">
          <v-card class="pa-5 rounded-xl border elevation-0 bg-white mb-6">
            <h3 class="text-h6 font-weight-bold mb-4">Tìm kiếm</h3>
            <v-text-field
              v-model="searchQuery"
              placeholder="Nhập tên sản phẩm..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              color="black"
              hide-details
              class="mb-6"
              clearable
            ></v-text-field>

            <h3 class="text-h6 font-weight-bold mb-4">Danh mục</h3>
            <v-list density="compact" class="bg-transparent pa-0">
              <v-list-item
                @click="selectedCategory = null"
                :class="{ 'bg-black text-white rounded-lg': selectedCategory === null }"
                class="mb-2 transition-swing cursor-pointer"
              >
                <v-list-item-title class="font-weight-bold">
                  Tất cả danh mục
                </v-list-item-title>
              </v-list-item>

              <template v-for="parent in rootCategories" :key="parent.id">
                
                <v-list-item
                  @click="selectedCategory = parent.id"
                  :class="{ 'bg-grey-darken-3 text-white rounded-lg': selectedCategory === parent.id }"
                  class="mb-1 transition-swing cursor-pointer"
                >
                  <v-list-item-title class="font-weight-bold">
                    {{ parent.name }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item
                  v-for="child in getChildCategories(parent.id)"
                  :key="child.id"
                  @click="selectedCategory = child.id"
                  :class="{ 'bg-black text-white rounded-lg': selectedCategory === child.id }"
                  class="mb-1 transition-swing cursor-pointer pl-6"
                >
                  <v-list-item-title class="font-weight-medium text-body-2">
                    - {{ child.name }}
                  </v-list-item-title>
                </v-list-item>

              </template>
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="9">
          <div v-if="isLoading" class="d-flex justify-center align-center py-16">
            <v-progress-circular indeterminate color="black" size="64"></v-progress-circular>
          </div>

          <v-row v-else-if="filteredProducts.length > 0">
            <v-col
              v-for="product in filteredProducts"
              :key="product.id"
              cols="12"
              sm="6"
              md="4"
              lg="4"
            >
              <ProductCard :product="product" />
            </v-col>
          </v-row>

          <v-card
            v-else
            class="text-center py-16 rounded-xl border elevation-0 bg-white"
          >
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-package-variant-closed</v-icon>
            <h3 class="text-h5 font-weight-bold text-grey-darken-2">
              Không tìm thấy sản phẩm nào!
            </h3>
            <p class="text-grey">Vui lòng thử lại với từ khóa hoặc danh mục khác.</p>
            <v-btn
              color="black"
              class="mt-4 text-capitalize font-weight-bold"
              @click="clearFilters"
            >
              Xóa bộ lọc
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import ProductService from "@/services/product.service";
import CategoryService from "@/services/category.service";
import ProductCard from "@/components/ProductCard.vue";

const isLoading = ref(true);
const products = ref([]);
const categories = ref([]);

// State cho bộ lọc
const searchQuery = ref("");
const selectedCategory = ref(null);

// Lấy dữ liệu
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
  }
};

// 1. Computed lọc ra các danh mục GỐC (parent_id bị null hoặc trống)
const rootCategories = computed(() => {
  return categories.value.filter(c => !c.parent_id);
});

// 2. Hàm lấy danh mục CON dựa vào ID của danh mục gốc
const getChildCategories = (parentId) => {
  return categories.value.filter(c => c.parent_id === parentId);
};

// 3. Logic tự động lọc sản phẩm (ĐÃ XỬ LÝ VIỆC LẤY SẢN PHẨM CỦA DANH MỤC CON KHI CHỌN DANH MỤC GỐC)
const filteredProducts = computed(() => {
  let result = products.value;

  // Nếu người dùng có chọn 1 danh mục bất kỳ
  if (selectedCategory.value) {
    // Tìm các danh mục con của danh mục đang chọn (nếu nó là danh mục gốc thì mảng này sẽ có data)
    const childCategoryIds = getChildCategories(selectedCategory.value).map(c => c.id);
    
    // Gom ID của danh mục đang chọn VÀ toàn bộ ID danh mục con của nó thành 1 mảng hợp lệ
    const validCategoryIds = [selectedCategory.value, ...childCategoryIds];

    // Lọc: Giữ lại các sản phẩm có category_id nằm trong mảng hợp lệ
    result = result.filter((p) => validCategoryIds.includes(p.category_id));
  }

  // Lọc theo từ khóa tìm kiếm (không phân biệt hoa thường)
  if (searchQuery.value && searchQuery.value.trim() !== "") {
    const keyword = searchQuery.value.toLowerCase().trim();
    result = result.filter((p) => p.name.toLowerCase().includes(keyword));
  }

  return result;
});

// Hàm xóa bộ lọc
const clearFilters = () => {
  searchQuery.value = "";
  selectedCategory.value = null;
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}
.cursor-pointer {
  cursor: pointer;
}
/* Thụt lề cho danh mục con ở thanh Sidebar để dễ phân biệt */
.pl-6 {
  padding-left: 24px !important;
}
</style>