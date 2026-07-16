<template>
  <div class="favorites-page bg-grey-lighten-4 py-8 min-vh-100">
    <v-container class="max-w-7xl">
      <div class="d-flex align-center justify-space-between mb-8 pb-4 border-b">
        <h1
          class="text-h4 font-weight-black text-uppercase custom-main-color d-flex align-center mb-0"
        >
          <v-icon color="red" class="mr-3" size="36">mdi-heart</v-icon>
          Sản phẩm Yêu Thích
        </h1>
        <v-chip class="font-weight-bold" color="#001a2d" variant="flat">
          {{ favoriteProducts.length }} Sản phẩm
        </v-chip>
      </div>

      <div v-if="isLoading" class="d-flex justify-center align-center py-16">
        <v-progress-circular
          indeterminate
          color="#001a2d"
          size="64"
          width="6"
        ></v-progress-circular>
      </div>

      <div
        v-else-if="favoriteProducts.length === 0"
        class="text-center py-16 bg-white rounded-xl shadow-sm elevation-1"
      >
        <v-icon size="80" color="grey-lighten-2" class="mb-4"
          >mdi-heart-broken-outline</v-icon
        >
        <h2 class="text-h5 font-weight-bold text-grey-darken-3 mb-2">
          Bạn chưa có sản phẩm yêu thích nào
        </h2>
        <p class="text-grey-darken-1 mb-8">
          Hãy dạo một vòng và thả tim cho các sản phẩm bạn ưng ý nhé!
        </p>
        <v-btn
          to="/products"
          color="#001a2d"
          size="large"
          rounded="pill"
          class="px-8 font-weight-bold text-white elevation-2 custom-hover"
        >
          TIẾP TỤC MUA SẮM
        </v-btn>
      </div>

      <v-row v-else>
        <v-col
          cols="12"
          sm="6"
          md="4"
          lg="3"
          v-for="item in favoriteProducts"
          :key="item.id"
        >
          <ProductCard :product="item" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import ProductService from "@/services/product.service"; // Chắc chắn đã thêm logic getFavoriteProducts vào service này
import ProductCard from "@/components/ProductCard.vue";
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();

const isLoading = ref(true);
const favoriteProducts = ref([]);

const fetchFavorites = async () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    toast.error("Vui lòng đăng nhập để xem mục Yêu thích");
    router.push("/login");
    return;
  }

  try {
    isLoading.value = true;
    const res = await ProductService.getFavoriteProducts();
    // Phụ thuộc vào cấu trúc trả về, điều chỉnh res.data hoặc res
    favoriteProducts.value = res.data || res || [];
  } catch (error) {
    console.error("Lỗi khi tải danh sách yêu thích:", error);
    toast.error("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại!");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchFavorites();
});
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}
.max-w-7xl {
  max-width: 1280px;
  margin: 0 auto;
}
.custom-main-color {
  color: #001a2d;
}
.custom-hover {
  transition: all 0.3s ease;
}
.custom-hover:hover {
  background-color: #003459 !important;
  transform: translateY(-2px);
}
</style>
