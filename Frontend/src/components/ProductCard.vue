<template>
  <v-card
    class="product-card rounded-xl overflow-hidden bg-white text-black"
    elevation="0"
  >
    <div class="pa-4 position-relative">
      <v-img
        :src="
          product.thumbnail ||
          'https://placehold.co/300x300/cccccc/333333?text=No+Image'
        "
        height="280"
        cover
        class="rounded-lg shadow-md product-img"
      ></v-img>

      <v-chip
        v-if="product.active_discount > 0"
        color="red"
        class="discount-badge font-weight-bold"
        size="small"
      >
        -{{ product.active_discount }}%
      </v-chip>

      <!-- THÊM HUY HIỆU HOT (nếu view >= 50, bạn có thể chỉnh số này) -->
      <v-chip
        v-if="product.views >= 50"
        color="orange-darken-3"
        class="hot-badge font-weight-bold text-white shadow-sm"
        size="small"
      >
        🔥 HOT
      </v-chip>

      <!-- Nút Yêu thích trên Card -->
      <v-btn
        icon
        size="small"
        class="favorite-badge"
        :color="isFavorite ? 'red-lighten-5' : 'white'"
        elevation="2"
        @click.prevent="toggleFavorite"
      >
        <v-icon :color="isFavorite ? 'red' : 'grey-darken-1'">
          {{ isFavorite ? "mdi-heart" : "mdi-heart-outline" }}
        </v-icon>
      </v-btn>
    </div>

    <v-card-title
      class="text-h6 font-weight-bold pt-2 pb-0 text-truncate text-center"
    >
      {{ product.name }}
    </v-card-title>

    <v-card-subtitle class="pb-2 mt-1 text-center">
      Thương hiệu: {{ product.brand_name || "Khác" }}
    </v-card-subtitle>

    <v-card-text class="py-1">
      <div class="price-block">
        <template v-if="product.active_discount > 0">
          <div
            class="text-caption text-decoration-line-through text-grey-darken-1 font-weight-medium"
          >
            {{ formatPrice(originalPrice) }}
          </div>
          <div class="custom-price-red">
            {{ formatPrice(discountedPrice) }}
          </div>
        </template>
        <template v-else>
          <div class="custom-price-red">
            {{ formatPrice(originalPrice) }}
          </div>
        </template>
      </div>

      <!-- Thống kê Đã bán & Lượt thích & Lượt Xem -->
      <div
        class="text-caption text-grey-darken-2 mt-2 d-flex justify-space-between align-center px-1"
      >
        <span class="d-flex align-center">
          <v-icon size="x-small" class="mr-1" color="red">mdi-heart</v-icon>
          {{ favoriteCount }}
        </span>

        <!-- THÊM LƯỢT XEM VÀO GIỮA -->
        <span class="d-flex align-center">
          <v-icon size="x-small" class="mr-1" color="blue"
            >mdi-eye-outline</v-icon
          >
          {{ product.views || 0 }}
        </span>

        <span class="d-flex align-center">
          <v-icon size="x-small" class="mr-1">mdi-shopping-outline</v-icon>
          Đã bán: {{ product.sold_count || 0 }}
        </span>
      </div>
    </v-card-text>

    <v-card-actions class="px-4 py-3 bg-grey-lighten-4">
      <router-link
        :to="`/product/${product.id}`"
        class="text-decoration-none w-100"
      >
        <v-btn
          block
          variant="flat"
          color="#001a2d"
          class="text-white font-weight-bold rounded-lg text-capitalize"
          elevation="2"
          height="40"
        >
          Xem Chi Tiết
        </v-btn>
      </router-link>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { defineProps, computed, ref, watch } from "vue";
import ProductService from "@/services/product.service";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const isFavorite = ref(
  props.product.is_favorite > 0 || props.product.is_favorite === true || false,
);
const favoriteCount = ref(props.product.favorite_count || 0);

watch(
  () => props.product,
  (newVal) => {
    isFavorite.value =
      newVal.is_favorite > 0 || newVal.is_favorite === true || false;
    favoriteCount.value = newVal.favorite_count || 0;
  },
  { deep: true },
);

const toggleFavorite = async () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    alert("Vui lòng đăng nhập để thêm vào yêu thích!");
    return;
  }

  // Tạm đổi state phía UI để mượt mà
  isFavorite.value = !isFavorite.value;
  favoriteCount.value += isFavorite.value ? 1 : -1;

  // Gọi API Backend
  try {
    await ProductService.toggleFavorite({
      product_id: props.product.id,
    });
  } catch (error) {
    // Revert nếu lỗi
    isFavorite.value = !isFavorite.value;
    favoriteCount.value += isFavorite.value ? 1 : -1;
    console.error("Lỗi khi cập nhật yêu thích:", error);
  }
};

const originalPrice = computed(() => props.product.min_price || 0);

const discountedPrice = computed(() => {
  const discount = props.product.active_discount || 0;
  return originalPrice.value * (1 - discount / 100);
});

const formatPrice = (value) => {
  if (!value) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};
</script>

<style scoped>

.hot-badge {
  position: absolute;
  top: 10px;
  left: 50px; /* Cách nút tim ra một khoảng */
  z-index: 2;
}

.product-card {
  transition: all 0.4s ease-in-out;
  border: 1px solid rgba(0, 26, 45, 0.1);
}

.product-card:hover {
  transform: scale(1.03) translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(0, 26, 45, 0.2);
}

.product-img {
  transition: transform 0.5s ease;
}
.product-card:hover .product-img {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 0;
  right: 0;
  border-radius: 0 8px 0 8px !important;
  z-index: 2;
  font-size: 14px;
  padding: 4px 12px;
}

.favorite-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
}

.price-block {
  min-height: 54px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.custom-price-red {
  font-size: 24px !important;
  font-weight: 900 !important;
  color: #e53935 !important;
  line-height: 1.2 !important;
  text-align: center !important;
}
</style>
