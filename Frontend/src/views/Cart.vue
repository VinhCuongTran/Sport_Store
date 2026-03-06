<template>
  <div class="cart-page bg-grey-lighten-5 py-10 min-vh-100">
    <v-container>
      <div class="text-center mb-8">
        <h1 class="text-h3 font-weight-black text-black text-uppercase">
          Giỏ hàng của bạn
        </h1>
      </div>

      <v-card
        v-if="!isLoggedIn"
        class="text-center py-16 rounded-xl border elevation-0 bg-white"
      >
        <v-icon size="64" color="grey-lighten-1" class="mb-4"
          >mdi-account-lock</v-icon
        >
        <h3 class="text-h5 font-weight-bold text-grey-darken-2 mb-2">
          Bạn chưa đăng nhập
        </h3>
        <p class="text-grey mb-6">
          Vui lòng đăng nhập để xem và quản lý giỏ hàng của bạn.
        </p>
        <v-btn
          to="/login"
          color="black"
          size="large"
          class="font-weight-bold px-8"
          >Đăng nhập ngay</v-btn
        >
      </v-card>

      <div v-else-if="isLoading" class="d-flex justify-center py-16">
        <v-progress-circular
          indeterminate
          color="black"
          size="64"
        ></v-progress-circular>
      </div>

      <v-card
        v-else-if="cartItems.length === 0"
        class="text-center py-16 rounded-xl border elevation-0 bg-white"
      >
        <v-icon size="80" color="grey-lighten-2" class="mb-4"
          >mdi-cart-remove</v-icon
        >
        <h3 class="text-h5 font-weight-bold text-grey-darken-2 mb-2">
          Giỏ hàng trống
        </h3>
        <p class="text-grey mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
        <v-btn
          to="/products"
          color="black"
          size="large"
          class="font-weight-bold px-8"
          >Tiếp tục mua sắm</v-btn
        >
      </v-card>

      <v-row v-else>
        <v-col cols="12" md="8">
          <v-card class="rounded-xl border elevation-0 bg-white pa-4 mb-4">
            <div
              class="d-flex justify-space-between align-center mb-4 border-b pb-4"
            >
              <h2 class="text-h6 font-weight-bold">
                Sản phẩm ({{ cartItems.length }})
              </h2>
              <v-btn
                variant="text"
                color="red"
                @click="clearCart"
                prepend-icon="mdi-trash-can-outline"
              >
                Xóa tất cả
              </v-btn>
            </div>

            <div
              v-for="item in cartItems"
              :key="item.cart_item_id"
              class="cart-item py-4 border-b"
            >
              <v-row align="center">
                <v-col cols="4" sm="2">
                  <v-img
                    :src="
                      item.thumbnail ||
                      'https://placehold.co/150x150?text=No+Img'
                    "
                    class="rounded-lg border bg-grey-lighten-4"
                    aspect-ratio="1"
                    cover
                  ></v-img>
                </v-col>

                <v-col cols="8" sm="4">
                  <h3
                    class="text-subtitle-1 font-weight-bold line-clamp-2 mb-1"
                  >
                    {{ item.product_name }}
                  </h3>
                  <div class="text-caption text-grey-darken-1 mb-2">
                    Phân loại:
                    <strong>{{ item.color }} - {{ item.size }}</strong>
                  </div>
                  <div
                    class="text-error text-caption"
                    v-if="item.stock < item.quantity"
                  >
                    Chỉ còn {{ item.stock }} sản phẩm trong kho
                  </div>
                </v-col>

                <v-col cols="6" sm="3" class="d-flex justify-center">
                  <div
                    class="quantity-control d-flex align-center border rounded-lg px-1"
                  >
                    <v-btn
                      icon="mdi-minus"
                      variant="text"
                      density="compact"
                      @click="updateQuantity(item, item.quantity - 1)"
                      :disabled="
                        item.quantity <= 1 || isUpdating === item.cart_item_id
                      "
                    ></v-btn>
                    <span class="px-3 font-weight-bold">{{
                      item.quantity
                    }}</span>
                    <v-btn
                      icon="mdi-plus"
                      variant="text"
                      density="compact"
                      @click="updateQuantity(item, item.quantity + 1)"
                      :disabled="
                        item.quantity >= item.stock ||
                        isUpdating === item.cart_item_id
                      "
                    ></v-btn>
                  </div>
                </v-col>

                <v-col cols="6" sm="3" class="text-right">
                  <div
                    class="text-subtitle-1 font-weight-black text-red-darken-2 mb-2"
                  >
                    {{ formatPrice(item.variant_price * item.quantity) }}
                  </div>
                  <v-btn
                    icon="mdi-delete-outline"
                    variant="text"
                    color="grey-darken-1"
                    @click="removeItem(item.cart_item_id)"
                  ></v-btn>
                </v-col>
              </v-row>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card
            class="rounded-xl border elevation-0 bg-white pa-6 position-sticky"
            style="top: 80px"
          >
            <h3 class="text-h6 font-weight-bold mb-6">Tóm tắt đơn hàng</h3>

            <div class="d-flex justify-space-between mb-4">
              <span class="text-grey-darken-1">Tạm tính:</span>
              <span class="font-weight-bold">{{
                formatPrice(totalPrice)
              }}</span>
            </div>

            <v-divider class="mb-4"></v-divider>

            <div class="d-flex justify-space-between align-center mb-6">
              <span class="text-subtitle-1 font-weight-bold">Tổng tiền:</span>
              <span class="text-h5 font-weight-black text-red-darken-2">{{
                formatPrice(totalPrice)
              }}</span>
            </div>

            <v-btn
              color="black"
              block
              size="x-large"
              class="font-weight-bold rounded-lg mb-3"
              @click="goToCheckout"
              :disabled="cartItems.length === 0"
            >
              TIẾN HÀNH THANH TOÁN
            </v-btn>
            <v-btn
              to="/products"
              variant="outlined"
              color="black"
              block
              size="large"
              class="rounded-lg"
            >
              Tiếp tục mua sắm
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import CartService from "@/services/cart.service";

const router = useRouter();

const isLoggedIn = ref(false);
const isLoading = ref(true);
const cartItems = ref([]);
const isUpdating = ref(null); // Lưu id item đang update để disable nút
const user = ref(null);

const formatPrice = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
};

// Tính tổng tiền
const totalPrice = computed(() => {
  return cartItems.value.reduce(
    (total, item) => total + item.variant_price * item.quantity,
    0,
  );
});

// Lấy giỏ hàng
const fetchCart = async () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    isLoggedIn.value = false;
    isLoading.value = false;
    return;
  }

  isLoggedIn.value = true;
  user.value = JSON.parse(userStr);
  isLoading.value = true;

  try {
    const response = await CartService.getCart(user.value.id);
    cartItems.value = response.items || [];
  } catch (error) {
    console.error("Lỗi khi tải giỏ hàng:", error);
  } finally {
    isLoading.value = false;
  }
};

// Cập nhật số lượng
const updateQuantity = async (item, newQuantity) => {
  if (newQuantity < 1 || newQuantity > item.stock) return;

  isUpdating.value = item.cart_item_id;
  try {
    await CartService.updateQuantity(item.cart_item_id, newQuantity);
    // Cập nhật local để UI mượt hơn không cần load lại API
    const targetItem = cartItems.value.find(
      (i) => i.cart_item_id === item.cart_item_id,
    );
    if (targetItem) targetItem.quantity = newQuantity;
  } catch (error) {
    alert(error.response?.data?.message || "Lỗi cập nhật số lượng");
  } finally {
    isUpdating.value = null;
  }
};

// Xóa 1 SP
const removeItem = async (cartItemId) => {
  if (!confirm("Bạn muốn xóa sản phẩm này khỏi giỏ hàng?")) return;
  try {
    await CartService.removeItem(cartItemId);
    cartItems.value = cartItems.value.filter(
      (i) => i.cart_item_id !== cartItemId,
    );
  } catch (error) {
    alert("Lỗi khi xóa sản phẩm");
  }
};

// Xóa tất cả
const clearCart = async () => {
  if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?")) return;
  try {
    await CartService.clearCart(user.value.id);
    cartItems.value = [];
  } catch (error) {
    alert("Lỗi khi làm sạch giỏ hàng");
  }
};

const goToCheckout = () => {
  if (cartItems.value.length === 0) return;
  // Lưu giỏ hàng tạm thời vào SessionStorage để Checkout.vue lấy dùng
  sessionStorage.setItem("checkout_items", JSON.stringify(cartItems.value));
  router.push("/checkout");
};

onMounted(() => {
  fetchCart();
});
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.cart-item:last-child {
  border-bottom: none !important;
}
.position-sticky {
  position: sticky;
}
.quantity-control {
  height: 40px;
}
</style>
