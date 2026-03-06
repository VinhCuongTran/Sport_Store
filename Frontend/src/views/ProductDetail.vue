<template>
  <div class="product-detail-page bg-grey-lighten-5 py-10 min-vh-100">
    <v-container
      v-if="isLoading"
      class="d-flex justify-center align-center py-16"
    >
      <v-progress-circular
        indeterminate
        color="black"
        size="64"
      ></v-progress-circular>
    </v-container>

    <v-container v-else-if="product">
      <div class="mb-6">
        <v-btn
          variant="text"
          to="/products"
          class="text-none px-0 text-grey-darken-1 hover-black"
        >
          <v-icon left>mdi-arrow-left</v-icon> Quay lại danh sách
        </v-btn>
      </div>

      <v-row class="bg-white rounded-xl pa-6 border elevation-0 mb-8">
        <v-col cols="12" md="6">
          <div class="position-relative">
            <v-img
              :src="mainImage"
              aspect-ratio="1"
              cover
              class="rounded-lg border bg-grey-lighten-4"
            ></v-img>
            <v-chip
              v-if="product.active_discount > 0"
              color="red"
              class="discount-badge font-weight-bold"
              size="large"
            >
              GIẢM {{ product.active_discount }}%
            </v-chip>
          </div>

          <v-slide-group v-model="selectedImageIndex" class="mt-4" show-arrows>
            <v-slide-group-item
              v-for="(img, i) in productImages"
              :key="i"
              v-slot="{ isSelected, toggle }"
            >
              <v-card
                :class="[
                  'ma-2 rounded-lg cursor-pointer border',
                  isSelected ? 'border-black' : 'border-grey-lighten-2',
                ]"
                height="80"
                width="80"
                @click="setMainImage(img, i)"
              >
                <v-img :src="img" cover height="100%"></v-img>
              </v-card>
            </v-slide-group-item>
          </v-slide-group>
        </v-col>

        <v-col cols="12" md="6" class="d-flex flex-column">
          <v-chip
            color="black"
            size="small"
            class="align-self-start mb-2 font-weight-bold"
          >
            {{ product.brand_name || "Sport Store" }}
          </v-chip>
          <h1 class="text-h4 font-weight-black mb-2">{{ product.name }}</h1>
          <div class="text-subtitle-1 text-grey-darken-1 mb-4">
            Danh mục:
            <strong>{{ product.category_name || "Đang cập nhật" }}</strong>
            <span class="mx-2">|</span>
            Môn thể thao:
            <strong>{{ product.sport_name || "Không xác định" }}</strong>
          </div>

          <div
            class="price-section py-4 border-y mb-6 bg-grey-lighten-5 px-4 rounded-lg"
          >
            <div
              v-if="product.active_discount > 0"
              class="d-flex align-end gap-3"
            >
              <span class="text-h4 font-weight-black text-red-darken-2">
                {{ formatPrice(discountedPrice) }}
              </span>
              <span class="text-h6 text-decoration-line-through text-grey">
                {{ formatPrice(currentOriginalPrice) }}
              </span>
            </div>
            <div v-else class="text-h4 font-weight-black text-black">
              {{ formatPrice(currentOriginalPrice) }}
            </div>
          </div>

          <div class="mb-6" v-if="uniqueColors.length > 0">
            <h3 class="text-subtitle-1 font-weight-bold mb-2">Màu sắc:</h3>
            <div class="d-flex flex-wrap gap-2">
              <v-btn
                v-for="color in uniqueColors"
                :key="color"
                :variant="selectedColor === color ? 'flat' : 'outlined'"
                :color="selectedColor === color ? 'black' : 'grey-darken-1'"
                class="text-capitalize"
                @click="selectColor(color)"
              >
                {{ color }}
              </v-btn>
            </div>
          </div>

          <div class="mb-6" v-if="selectedColor && availableSizes.length > 0">
            <h3 class="text-subtitle-1 font-weight-bold mb-2">Kích cỡ:</h3>
            <div class="d-flex flex-wrap gap-2">
              <v-btn
                v-for="size in availableSizes"
                :key="size"
                :variant="selectedSize === size ? 'flat' : 'outlined'"
                :color="selectedSize === size ? 'black' : 'grey-darken-1'"
                class="text-uppercase"
                @click="selectedSize = size"
              >
                {{ size }}
              </v-btn>
            </div>
          </div>

          <div v-if="selectedVariant" class="mb-6 text-subtitle-2">
            Tình trạng:
            <span
              v-if="selectedVariant.stock > 0"
              class="text-success font-weight-bold"
              >Còn {{ selectedVariant.stock }} sản phẩm</span
            >
            <span v-else class="text-red font-weight-bold">Hết hàng</span>
          </div>
          <div v-else class="mb-6 text-subtitle-2 text-grey">
            Vui lòng chọn Màu sắc và Kích cỡ
          </div>

          <div class="d-flex gap-4 mt-auto">
            <div
              class="quantity-selector d-flex align-center border rounded-lg px-2"
            >
              <v-btn
                icon="mdi-minus"
                variant="text"
                density="compact"
                @click="decreaseQuantity"
                :disabled="quantity <= 1"
              ></v-btn>
              <span class="px-4 font-weight-bold text-h6">{{ quantity }}</span>
              <v-btn
                icon="mdi-plus"
                variant="text"
                density="compact"
                @click="increaseQuantity"
                :disabled="selectedVariant && quantity >= selectedVariant.stock"
              ></v-btn>
            </div>

            <v-btn
              color="black"
              size="x-large"
              class="flex-grow-1 font-weight-bold rounded-lg text-none"
              elevation="2"
              prepend-icon="mdi-cart-plus"
              @click="addToCart"
              :loading="isAddingToCart"
              :disabled="!selectedVariant || selectedVariant.stock === 0"
            >
              THÊM VÀO GIỎ HÀNG
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-card class="pa-6 rounded-xl border elevation-0 bg-white">
        <h2 class="text-h5 font-weight-bold mb-4 border-b pb-2">
          Mô tả sản phẩm
        </h2>
        <div
          class="product-description text-body-1 text-grey-darken-3"
          v-html="formatDescription(product.description)"
        ></div>
      </v-card>
    </v-container>

    <v-container v-else class="text-center py-16">
      <h2 class="text-h4 font-weight-bold mb-4">Sản phẩm không tồn tại</h2>
      <v-btn to="/products" color="black" variant="outlined"
        >Quay lại cửa hàng</v-btn
      >
    </v-container>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top right"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Đóng</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProductService from "@/services/product.service";
import CartService from "@/services/cart.service";

const route = useRoute();
const router = useRouter();

const isLoading = ref(true);
const isAddingToCart = ref(false);
const product = ref(null);
const quantity = ref(1);

// Quản lý hình ảnh
const mainImage = ref("");
const selectedImageIndex = ref(0);

// Quản lý phân loại (Variants)
const selectedColor = ref(null);
const selectedSize = ref(null);

// Thông báo
const snackbar = ref({ show: false, text: "", color: "success" });

// Khởi tạo dữ liệu
// Khởi tạo dữ liệu
const fetchProductDetail = async () => {
  isLoading.value = true;
  try {
    const id = route.params.id;
    const data = await ProductService.get(id);

    if (data.status !== "active") throw new Error("Sản phẩm không khả dụng");

    product.value = data;

    // --- LOGIC TÌM ẢNH ĐÃ ĐƯỢC SỬA ---
    // Tìm trong mảng images xem ảnh nào được đánh dấu là ảnh đại diện (is_thumbnail = 1)
    const thumbnailObj = data.images?.find(
      (img) => img.is_thumbnail === 1 || img.is_thumbnail === true,
    );
    // Hoặc lấy bừa ảnh đầu tiên nếu không có cái nào set thumbnail
    const firstImage = data.images?.[0]?.image_url;

    // Gán vào ảnh chính (mainImage)
    mainImage.value =
      thumbnailObj?.image_url ||
      firstImage ||
      "https://placehold.co/600x600?text=No+Image";

    if (uniqueColors.value.length > 0) {
      selectColor(uniqueColors.value[0]);
    }
  } catch (error) {
    console.error("Lỗi khi tải chi tiết sản phẩm:", error);
    product.value = null;
  } finally {
    isLoading.value = false;
  }
};

// ================= COMPUTED PROPERTIES CHO VARIANTS =================
// 1. Mảng hình ảnh (Lấy toàn bộ image_url từ mảng images do DB trả về)
const productImages = computed(() => {
  if (
    !product.value ||
    !product.value.images ||
    product.value.images.length === 0
  ) {
    return ["https://placehold.co/600x600?text=No+Image"];
  }

  // Trích xuất đúng trường "image_url" từ Database
  return product.value.images.map((img) => img.image_url);
});

// 2. Lấy danh sách màu sắc độc nhất từ variants
const uniqueColors = computed(() => {
  if (!product.value || !product.value.variants) return [];
  const colors = product.value.variants.map((v) => v.color);
  return [...new Set(colors)];
});

// 3. Lấy danh sách size dựa trên màu đang chọn
const availableSizes = computed(() => {
  if (!product.value || !product.value.variants || !selectedColor.value)
    return [];
  return product.value.variants
    .filter((v) => v.color === selectedColor.value)
    .map((v) => v.size);
});

// 4. Tìm Variant chính xác dựa trên Color và Size đang chọn
const selectedVariant = computed(() => {
  if (
    !product.value ||
    !product.value.variants ||
    !selectedColor.value ||
    !selectedSize.value
  )
    return null;
  return product.value.variants.find(
    (v) => v.color === selectedColor.value && v.size === selectedSize.value,
  );
});

// 5. Tính toán giá gốc (Lấy giá của variant nếu có, không thì lấy giá min của sản phẩm)
const currentOriginalPrice = computed(() => {
  if (!product.value) return 0;
  if (selectedVariant.value) return selectedVariant.value.price;
  return product.value.min_price || 0;
});

// 6. Tính toán giá sau khuyến mãi
const discountedPrice = computed(() => {
  if (!product.value || !product.value.active_discount)
    return currentOriginalPrice.value;
  return currentOriginalPrice.value * (1 - product.value.active_discount / 100);
});

// ================= CÁC HÀM XỬ LÝ =================
const setMainImage = (img, index) => {
  mainImage.value = img;
  selectedImageIndex.value = index;
};

const selectColor = (color) => {
  selectedColor.value = color;
  // Khi đổi màu, reset lại size
  selectedSize.value = null;
  // Tự động chọn size đầu tiên của màu mới để UX mượt hơn
  const sizesForColor = product.value.variants
    .filter((v) => v.color === color)
    .map((v) => v.size);
  if (sizesForColor.length > 0) {
    selectedSize.value = sizesForColor[0];
  }
  quantity.value = 1; // reset số lượng
};

const increaseQuantity = () => {
  if (selectedVariant.value && quantity.value < selectedVariant.value.stock) {
    quantity.value++;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const formatPrice = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
};

// Xuống dòng cho mô tả
const formatDescription = (desc) => {
  if (!desc) return "Chưa có mô tả cho sản phẩm này.";
  return desc.replace(/\n/g, "<br />");
};

const showMessage = (text, color = "success") => {
  snackbar.value = { show: true, text, color };
};

// ================= THÊM VÀO GIỎ HÀNG =================
const addToCart = async () => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) {
    showMessage("Vui lòng đăng nhập để mua hàng", "error");
    setTimeout(() => router.push("/login"), 1500);
    return;
  }

  if (uniqueColors.value.length > 0 && !selectedVariant.value) {
    showMessage("Vui lòng chọn đầy đủ màu sắc và kích cỡ", "warning");
    return;
  }

  isAddingToCart.value = true;
  try {
    const user = JSON.parse(userStr);
    
    // Tạo payload chuẩn theo yêu cầu của backend
    const payload = {
      user_id: user.id,
      product_id: product.value.id,
      variant_id: selectedVariant.value ? selectedVariant.value.id : null,
      quantity: quantity.value,
    };

    await CartService.addToCart(payload);
    showMessage("Đã thêm vào giỏ hàng thành công!");

  } catch (error) {
    console.error("Lỗi khi thêm giỏ hàng:", error);
    showMessage(
      error.response?.data?.message || "Không thể thêm vào giỏ hàng",
      "error",
    );
  } finally {
    isAddingToCart.value = false;
  }
};

onMounted(() => {
  fetchProductDetail();
});

// Cập nhật lại data nếu người dùng bấm từ Sản phẩm liên quan (chuyển params.id)
watch(
  () => route.params.id,
  (newId) => {
    if (newId) fetchProductDetail();
  },
);
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}
.discount-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
}
.hover-black:hover {
  color: #000 !important;
}
.quantity-selector {
  height: 52px; /* Đồng bộ chiều cao với nút x-large của Vuetify */
}
.product-description {
  line-height: 1.8;
}
</style>
