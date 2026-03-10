<template>
  <div class="cart-page bg-grey-lighten-5 py-10 min-vh-100">
    <v-container>
      <div class="text-center mb-8">
        <h1 class="text-h3 font-weight-black text-uppercase custom-main-color">
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
        <v-btn to="/login" size="large" class="font-weight-bold px-8 custom-btn"
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
          Giỏ hàng của bạn đang trống
        </h3>
        <p class="text-grey mb-6">
          Hãy đi mua sắm và tìm những sản phẩm yêu thích nhé!
        </p>
        <v-btn
          to="/products"
          size="large"
          class="font-weight-bold px-8 custom-btn"
        >
          MUA NGAY
        </v-btn>
      </v-card>

      <v-row v-else>
        <v-col cols="12" md="8">
          <v-card class="rounded-xl border elevation-0 bg-white pa-4 mb-4">
            <div
              class="d-flex justify-space-between align-center mb-4 border-b pb-4"
            >
              <div class="d-flex align-center">
                <v-checkbox
                  :model-value="
                    selectedItems.length === cartItems.length &&
                    cartItems.length > 0
                  "
                  @update:model-value="toggleSelectAll"
                  color="black"
                  hide-details
                  density="compact"
                  class="mr-2"
                ></v-checkbox>
                <h2 class="text-subtitle-1 font-weight-bold mb-0">
                  Tất cả ({{ cartItems.length }} sản phẩm)
                </h2>
              </div>
              <v-btn
                variant="text"
                color="red"
                size="small"
                @click="clearCart"
                prepend-icon="mdi-trash-can-outline"
              >
                Làm trống
              </v-btn>
            </div>

            <div
              v-for="item in cartItems"
              :key="item.cart_item_id"
              class="cart-item py-4 border-b"
            >
              <v-row align="start" class="ma-0 flex-nowrap">
                <v-col
                  cols="auto"
                  class="pa-0 d-flex flex-column align-center"
                  style="width: 50px"
                >
                  <v-checkbox
                    v-model="selectedItems"
                    :value="item"
                    color="black"
                    hide-details
                    density="compact"
                  ></v-checkbox>
                  <button
                    @click="removeItem(item.cart_item_id)"
                    class="btn-delete-small mt-2"
                  >
                    Xóa
                  </button>
                </v-col>

                <v-col cols="3" sm="2" class="pa-1">
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

                <v-col cols="4" sm="5">
                  <h3
                    class="text-body-2 font-weight-bold line-clamp-2 mb-1 cursor-pointer"
                    @click="$router.push(`/product/${item.product_id}`)"
                  >
                    {{ item.product_name }}
                  </h3>
                  <div class="text-caption text-grey">
                    Màu: {{ item.color }} | Size: {{ item.size }}
                  </div>
                </v-col>

                <v-col cols="auto" class="text-right flex-grow-1 pa-0 pr-2">
                  <div class="price-container mb-2">
                    <span class="price-text">{{
                      formatPrice(item.variant_price)
                    }}</span>
                  </div>

                  <div class="d-flex justify-end">
                    <div
                      class="quantity-control d-flex align-center border rounded-lg"
                    >
                      <v-btn
                        icon="mdi-minus"
                        variant="text"
                        density="compact"
                        @click="updateQuantity(item, item.quantity - 1)"
                        :disabled="item.quantity <= 1"
                      ></v-btn>
                      <span class="px-2 text-caption font-weight-bold">{{
                        item.quantity
                      }}</span>
                      <v-btn
                        icon="mdi-plus"
                        variant="text"
                        density="compact"
                        @click="updateQuantity(item, item.quantity + 1)"
                        :disabled="item.quantity >= item.stock"
                      ></v-btn>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card
            class="rounded-xl border elevation-0 bg-white pa-6 sticky-top"
          >
            <h3 class="text-h6 font-weight-bold mb-6">Tóm tắt đơn hàng</h3>
            <div class="d-flex justify-space-between mb-4">
              <span class="text-grey">Tổng tiền:</span>
              <span
                class="text-h5 font-weight-black text-red-darken-2 price-text"
              >
                {{ formatPrice(totalPrice) }}
              </span>
            </div>
            <v-btn
              block
              size="x-large"
              class="custom-btn mb-3"
              @click="goToCheckout"
              :disabled="selectedItems.length === 0"
            >
              TIẾN HÀNH THANH TOÁN
            </v-btn>
            <v-btn
              to="/products"
              variant="outlined"
              block
              class="custom-btn-outline"
            >
              Tiếp tục mua sắm
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <ConfirmDialog ref="confirmDialog" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import CartService from "@/services/cart.service";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

const router = useRouter();
const confirmDialog = ref(null);

const isLoggedIn = ref(false);
const isLoading = ref(true);
const cartItems = ref([]);
const selectedItems = ref([]);
const isUpdating = ref(null);
const user = ref(null);

const formatPrice = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
};

const toggleSelectAll = (isChecked) => {
  if (isChecked) {
    selectedItems.value = [...cartItems.value];
  } else {
    selectedItems.value = [];
  }
};

const totalPrice = computed(() => {
  return selectedItems.value.reduce(
    (total, item) => total + item.variant_price * item.quantity,
    0,
  );
});

const hasInvalidItems = computed(() => {
  return selectedItems.value.some(
    (item) => item.quantity > item.stock || item.stock === 0,
  );
});

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

const updateQuantity = async (item, newQuantity) => {
  if (newQuantity < 1 || newQuantity > item.stock) return;

  isUpdating.value = item.cart_item_id;
  try {
    await CartService.updateQuantity(item.cart_item_id, newQuantity);
    const targetItem = cartItems.value.find(
      (i) => i.cart_item_id === item.cart_item_id,
    );
    if (targetItem) targetItem.quantity = newQuantity;

    const selectedTarget = selectedItems.value.find(
      (i) => i.cart_item_id === item.cart_item_id,
    );
    if (selectedTarget) selectedTarget.quantity = newQuantity;
  } catch (error) {
    confirmDialog.value.open(
      "Lỗi cập nhật",
      error.response?.data?.message || "Lỗi cập nhật số lượng",
      { isAlert: true, confirmText: "Đóng", iconColor: "red" },
    );
  } finally {
    isUpdating.value = null;
  }
};

const removeItem = async (cartItemId) => {
  const isConfirmed = await confirmDialog.value.open(
    "Xác nhận xóa",
    "Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?",
    { confirmColor: "red-darken-1", icon: "mdi-cart-remove" },
  );

  if (!isConfirmed) return;

  try {
    await CartService.removeItem(cartItemId);
    cartItems.value = cartItems.value.filter(
      (i) => i.cart_item_id !== cartItemId,
    );
    selectedItems.value = selectedItems.value.filter(
      (i) => i.cart_item_id !== cartItemId,
    );
  } catch (error) {
    confirmDialog.value.open("Lỗi", "Không thể xóa sản phẩm lúc này", {
      isAlert: true,
    });
  }
};

const clearCart = async () => {
  const isConfirmed = await confirmDialog.value.open(
    "Làm trống giỏ hàng",
    "Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng?",
    { confirmColor: "red-darken-1", icon: "mdi-trash-can-alert" },
  );

  if (!isConfirmed) return;

  try {
    await CartService.clearCart(user.value.id);
    cartItems.value = [];
    selectedItems.value = [];
  } catch (error) {
    confirmDialog.value.open("Lỗi", "Lỗi khi làm sạch giỏ hàng", {
      isAlert: true,
    });
  }
};

const goToCheckout = () => {
  if (selectedItems.value.length === 0) return;
  sessionStorage.setItem("checkout_items", JSON.stringify(selectedItems.value));
  router.push("/checkout");
};

onMounted(() => {
  fetchCart();
});
</script>

<style scoped>
.custom-main-color {
  color: #001a2d !important;
}

.custom-btn {
  background-color: #001a2d !important;
  color: white !important;
  font-weight: bold;
  border-radius: 8px;
}
.custom-btn:hover {
  color: #77e51f !important;
}

.custom-btn-outline {
  border-color: #001a2d !important;
  color: #001a2d !important;
  border-radius: 8px;
}
.custom-btn-outline:hover {
  background-color: #001a2d !important;
  color: #77e51f !important;
}

.btn-delete-small {
  background: none;
  border: none;
  font-size: 11px;
  color: #757575;
  text-decoration: underline;
  cursor: pointer;
  padding: 2px 5px;
  transition: color 0.2s;
}
.btn-delete-small:hover {
  color: #ff5252;
}

.price-container {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  overflow: hidden;
}

.price-text {
  white-space: nowrap;
  font-weight: 800;
  color: #d32f2f;
  display: inline-block;
  padding-right: 6px;
}

.quantity-control {
  max-width: fit-content;
  background: white;
}

.sticky-top {
  position: sticky;
  top: 100px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 600px) {
  .price-text {
    font-size: 14px !important;
  }
}
</style>
