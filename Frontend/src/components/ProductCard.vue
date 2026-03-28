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

      <div class="text-caption text-grey-darken-1 mt-1 text-center">
        Danh mục: {{ product.category_name || "Đang cập nhật" }}
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
import { defineProps, computed } from "vue";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

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
