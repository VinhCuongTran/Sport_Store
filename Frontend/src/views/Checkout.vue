<template>
  <div class="checkout-page bg-grey-lighten-4 py-10 min-vh-100">
    <Loading :visible="isLoading" text="Đang xử lý đơn hàng..." />

    <AddressManager v-model="dialogAddresses" />

    <v-container class="max-w-5xl">
      <h1 class="text-h4 font-weight-black mb-6 custom-main-color">
        THANH TOÁN
      </h1>

      <v-row>
        <v-col cols="12" md="8">
          <v-card class="rounded-xl elevation-2 pa-6 mb-6 bg-white border-none">
            <div
              class="d-flex justify-space-between align-center border-b pb-3 mb-4"
            >
              <h3 class="text-h6 font-weight-bold custom-main-color">
                <v-icon left class="mr-2">mdi-map-marker-radius</v-icon> Địa chỉ
                nhận hàng
              </h3>
              <v-btn
                v-if="addresses.length > 0"
                variant="text"
                class="font-weight-bold text-none hover-green-text"
                @click="openAddressSelector"
              >
                Thay đổi
              </v-btn>
            </div>

            <div v-if="isLoadingAddresses" class="d-flex justify-center py-4">
              <v-progress-circular
                indeterminate
                color="#001a2d"
              ></v-progress-circular>
            </div>

            <div
              v-else-if="selectedAddress"
              class="d-flex align-start text-black"
            >
              <div class="flex-grow-1">
                <div class="d-flex align-center gap-2 mb-2">
                  <span class="font-weight-bold text-subtitle-1">{{
                    selectedAddress.receiver_name
                  }}</span>
                  <span class="text-grey-lighten-1">|</span>
                  <span class="font-weight-bold text-subtitle-2">{{
                    selectedAddress.phone_number
                  }}</span>
                </div>
                <div class="text-body-1 text-grey-darken-3">
                  {{ selectedAddress.shipping_address }}
                </div>
                <v-chip
                  color="#001a2d"
                  size="small"
                  variant="flat"
                  class="mt-2 font-weight-bold text-white"
                  v-if="selectedAddress.is_default"
                  >Mặc định</v-chip
                >
              </div>
            </div>

            <div v-else class="text-center py-6">
              <v-btn
                class="font-weight-bold custom-btn"
                prepend-icon="mdi-plus"
                @click="dialogAddresses = true"
                >Thêm địa chỉ ngay</v-btn
              >
            </div>
          </v-card>

          <v-card class="rounded-xl elevation-2 pa-6 bg-white border-none">
            <h3
              class="text-h6 font-weight-bold mb-4 border-b pb-2 custom-main-color"
            >
              <v-icon left class="mr-2">mdi-package-variant-closed</v-icon> Sản
              phẩm đơn hàng
            </h3>
            <v-list lines="two" class="pa-0 bg-white">
              <v-list-item
                v-for="item in checkoutItems"
                :key="item.variant_id"
                class="px-0 border-b last-no-border"
              >
                <template v-slot:prepend>
                  <v-img
                    :src="item.thumbnail"
                    width="70"
                    height="70"
                    cover
                    class="rounded-lg border mr-4 bg-grey-lighten-5"
                  ></v-img>
                </template>
                <v-list-item-title
                  class="font-weight-bold line-clamp-2 text-body-1 text-black"
                  >{{ item.product_name }}</v-list-item-title
                >
                <v-list-item-subtitle class="mt-1 text-grey-darken-1">
                  Phân loại:
                  <strong class="text-black"
                    >{{ item.color }} - {{ item.size }}</strong
                  >
                </v-list-item-subtitle>
                <template v-slot:append>
                  <div class="text-right ml-4">
                    <div
                      class="font-weight-black text-red-darken-2 text-no-wrap price-padding"
                    >
                      {{ formatPrice(item.variant_price) }}
                    </div>
                    <div
                      class="text-caption text-grey-darken-2 mt-1 font-weight-bold"
                    >
                      x{{ item.quantity }}
                    </div>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card
            class="rounded-xl elevation-4 pa-6 sticky-top bg-white border-none"
          >
            <h3 class="text-h6 font-weight-bold mb-4 custom-main-color">
              Phương thức thanh toán
            </h3>
            <v-radio-group v-model="paymentMethod" hide-details class="mb-6">
              <v-radio
                label="Thanh toán khi nhận hàng (COD)"
                value="COD"
                color="#001a2d"
                class="text-black"
              ></v-radio>
              <v-radio
                label="Chuyển khoản ngân hàng"
                value="BankTransfer"
                color="#001a2d"
                class="text-black"
              ></v-radio>
            </v-radio-group>

            <h3 class="text-h6 font-weight-bold mb-2 custom-main-color">
              Mã giảm giá
            </h3>
            <div class="d-flex gap-2 mb-6">
              <v-text-field
                v-model="voucherCode"
                placeholder="Nhập mã..."
                variant="outlined"
                density="compact"
                hide-details
                bg-color="grey-lighten-5"
                class="rounded-lg"
              ></v-text-field>
              <v-btn
                class="custom-btn"
                height="40"
                @click="applyVoucher"
                :loading="isApplyingVoucher"
                >Áp dụng</v-btn
              >
            </div>

            <v-divider class="mb-4"></v-divider>
            <div class="d-flex justify-space-between mb-2 text-black">
              <span class="text-grey-darken-1">Tạm tính:</span>
              <span class="font-weight-bold">{{ formatPrice(subtotal) }}</span>
            </div>
            <div class="d-flex justify-space-between mb-4 text-green-darken-2">
              <span>Khuyến mãi:</span>
              <span class="font-weight-bold"
                >-{{ formatPrice(discountAmount) }}</span
              >
            </div>
            <v-divider class="mb-4"></v-divider>
            <div class="d-flex justify-space-between align-center mb-6">
              <span class="text-subtitle-1 font-weight-bold text-black"
                >Tổng cộng:</span
              >
              <span
                class="text-h4 font-weight-black text-red-darken-2 text-no-wrap price-padding"
                >{{ formatPrice(totalPrice) }}</span
              >
            </div>

            <v-btn
              block
              size="x-large"
              class="custom-btn rounded-lg py-6"
              @click="submitOrder"
              >ĐẶT HÀNG NGAY</v-btn
            >
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="showAddressSelector" max-width="500px">
      <v-card class="rounded-xl bg-white text-black">
        <v-card-title class="pa-4 border-b font-weight-bold custom-main-color"
          >Chọn địa chỉ giao hàng</v-card-title
        >
        <v-card-text class="pa-4">
          <v-radio-group v-model="tempSelectedAddressId">
            <v-card
              v-for="addr in addresses"
              :key="addr.id"
              class="mb-3 border elevation-0 pa-3 rounded-lg"
              @click="tempSelectedAddressId = addr.id"
            >
              <div class="d-flex align-start gap-2">
                <v-radio :value="addr.id" color="#001a2d"></v-radio>
                <div>
                  <div class="font-weight-bold">
                    {{ addr.receiver_name }} | {{ addr.phone_number }}
                  </div>
                  <div class="text-body-2 text-grey-darken-2">
                    {{ addr.shipping_address }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-radio-group>
        </v-card-text>
        <v-card-actions class="pa-4 border-t">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showAddressSelector = false">Hủy</v-btn>
          <v-btn class="custom-btn px-6" @click="confirmAddressSelection"
            >Xác nhận</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showQRDialog" max-width="450px" persistent>
      <v-card class="rounded-xl pa-6 text-center bg-white text-black">
        <h3 class="text-h6 font-weight-bold mb-4 custom-main-color">
          Quét mã thanh toán
        </h3>
        <v-img
          :src="qrUrl"
          width="250"
          height="250"
          class="mx-auto border mb-4 rounded-lg"
        ></v-img>
        <div class="text-left bg-grey-lighten-5 pa-4 rounded-lg border mb-6">
          <div class="mb-1">
            Ngân hàng: <strong>{{ BANK_ID }}</strong>
          </div>
          <div class="mb-1">
            Số tiền:
            <strong class="text-red">{{ formatPrice(totalPrice) }}</strong>
          </div>
          <div>
            Nội dung: <strong>{{ qrDescription }}</strong>
          </div>
        </div>
        <v-btn block size="large" class="custom-btn" @click="finishPayment"
          >TÔI ĐÃ CHUYỂN KHOẢN</v-btn
        >
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top right"
      >{{ snackbar.text }}</v-snackbar
    >
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import OrderService from "@/services/order.service";
import VoucherService from "@/services/voucher.service";
import AddressService from "@/services/address.service";
import Loading from "@/components/Loading.vue";
import AddressManager from "@/components/AddressManager.vue";

const router = useRouter();
const isLoading = ref(false);
const snackbar = ref({ show: false, text: "", color: "success" });
const checkoutItems = ref([]);
const user = ref(null);
const isFromCart = ref(true);

const paymentMethod = ref("COD");
const showQRDialog = ref(false);
const qrUrl = ref("");
const qrDescription = ref("");
const BANK_ID = "MB";
const ACCOUNT_NO = "0123456789";
const ACCOUNT_NAME = "SPORT STORE THU NGHIEM";

const addresses = ref([]);
const isLoadingAddresses = ref(true);
const selectedAddressId = ref(null);
const showAddressSelector = ref(false);
const tempSelectedAddressId = ref(null);
const dialogAddresses = ref(false);
const isApplyingVoucher = ref(false);
const voucherCode = ref("");
const appliedVoucher = ref(null);
const vouchersList = ref([]);

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value || 0,
  );
const showMessage = (text, color = "success") => {
  snackbar.value = { show: true, text, color };
};

const selectedAddress = computed(() => {
  return addresses.value.find((a) => a.id === selectedAddressId.value);
});

const fetchAddresses = async () => {
  isLoadingAddresses.value = true;
  try {
    addresses.value = await AddressService.getAll();
    if (addresses.value.length > 0) {
      if (
        !selectedAddressId.value ||
        !addresses.value.some((a) => a.id === selectedAddressId.value)
      ) {
        const defaultAddr = addresses.value.find((a) => a.is_default);
        selectedAddressId.value = defaultAddr
          ? defaultAddr.id
          : addresses.value[0].id;
      }
    } else {
      selectedAddressId.value = null;
    }
  } catch (error) {
    console.error("Lỗi lấy địa chỉ", error);
  } finally {
    isLoadingAddresses.value = false;
  }
};

watch(dialogAddresses, (newVal) => {
  if (!newVal) {
    fetchAddresses();
  }
});

const openAddressSelector = () => {
  tempSelectedAddressId.value = selectedAddressId.value;
  showAddressSelector.value = true;
};

const confirmAddressSelection = () => {
  selectedAddressId.value = tempSelectedAddressId.value;
  showAddressSelector.value = false;
};

const openAddressManagerFromSelector = () => {
  showAddressSelector.value = false;
  dialogAddresses.value = true;
};

const subtotal = computed(() =>
  checkoutItems.value.reduce(
    (total, item) => total + item.variant_price * item.quantity,
    0,
  ),
);

const discountAmount = computed(() => {
  if (!appliedVoucher.value) return 0;
  let discount = 0;
  if (appliedVoucher.value.discount_type === "percent") {
    discount = subtotal.value * (appliedVoucher.value.discount_value / 100);
    if (
      appliedVoucher.value.max_discount &&
      discount > appliedVoucher.value.max_discount
    ) {
      discount = appliedVoucher.value.max_discount;
    }
  } else {
    discount = appliedVoucher.value.discount_value;
  }
  return discount > subtotal.value ? subtotal.value : discount;
});

const totalPrice = computed(() => subtotal.value - discountAmount.value);

const applyVoucher = async () => {
  if (!voucherCode.value) return;
  isApplyingVoucher.value = true;

  try {
    if (vouchersList.value.length === 0) {
      vouchersList.value = await VoucherService.getAll();
    }
    const voucher = vouchersList.value.find(
      (v) => v.code.toUpperCase() === voucherCode.value.toUpperCase(),
    );

    if (!voucher) throw new Error("Mã giảm giá không tồn tại");
    if (new Date(voucher.end_date) < new Date())
      throw new Error("Mã giảm giá đã hết hạn");
    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit)
      throw new Error("Mã giảm giá đã hết lượt sử dụng");
    if (subtotal.value < voucher.min_order_value)
      throw new Error(
        `Đơn hàng tối thiểu ${formatPrice(voucher.min_order_value)} để áp mã này`,
      );

    const userOrders = await OrderService.getByUser(user.value.id);
    const hasUsedVoucher = userOrders.some(
      (order) =>
        order.voucher_id === voucher.id && order.status !== "cancelled",
    );

    if (hasUsedVoucher) {
      throw new Error("Tài khoản của bạn đã sử dụng mã giảm giá này!");
    }

    appliedVoucher.value = voucher;
    showMessage("Áp dụng mã giảm giá thành công");
  } catch (error) {
    showMessage(error.message, "error");
    appliedVoucher.value = null;
  } finally {
    isApplyingVoucher.value = false;
  }
};

const removeVoucher = () => {
  appliedVoucher.value = null;
  voucherCode.value = "";
};

const submitOrder = async () => {
  if (!selectedAddress.value) {
    showMessage("Vui lòng chọn địa chỉ giao hàng để tiếp tục", "error");
    return;
  }

  isLoading.value = true;
  try {
    const payload = {
      user_id: user.value.id,
      receiver_name: selectedAddress.value.receiver_name,
      phone_number: selectedAddress.value.phone_number,
      shipping_address: selectedAddress.value.shipping_address,
      payment_method: paymentMethod.value,
      voucher_id: appliedVoucher.value?.id || null,
      subtotal: subtotal.value,
      discount_amount: discountAmount.value,
      total_price: totalPrice.value,
      is_from_cart: isFromCart.value,
      items: checkoutItems.value.map((i) => ({
        product_id: i.product_id,
        variant_id: i.variant_id,
        quantity: i.quantity,
        price: i.variant_price,
      })),
    };

    const res = await OrderService.create(payload);

    sessionStorage.removeItem("checkout_items");

    const createdOrderId = res.order_id;

    if (paymentMethod.value === "BankTransfer") {
      qrDescription.value = `Thanh toan don hang ${createdOrderId}`;
      qrUrl.value = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${totalPrice.value}&addInfo=${encodeURIComponent(qrDescription.value)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

      isLoading.value = false;
      showQRDialog.value = true;
    } else {
      showMessage("Đặt hàng thành công!");
      setTimeout(() => {
        router.push("/orders");
      }, 1500);
    }
  } catch (error) {
    showMessage(error.response?.data?.message || "Lỗi khi đặt hàng", "error");
    isLoading.value = false;
  }
};

const finishPayment = () => {
  showQRDialog.value = false;
  showMessage("Đã ghi nhận đơn hàng. Hệ thống sẽ kiểm tra thanh toán của bạn.");
  setTimeout(() => {
    router.push("/orders");
  }, 1000);
};

onMounted(() => {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    router.push("/login");
    return;
  }
  user.value = JSON.parse(userStr);

  const itemsStr = sessionStorage.getItem("checkout_items");
  if (itemsStr) {
    checkoutItems.value = JSON.parse(itemsStr);
  } else {
    router.push("/cart");
  }

  fetchAddresses();
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
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  border: none !important;
}
.custom-btn:hover {
  color: #77e51f !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(119, 229, 31, 0.2);
}

.hover-green-text:hover {
  color: #77e51f !important;
}

.text-no-wrap {
  white-space: nowrap;
}
.price-padding {
  padding-right: 8px;
}

.bg-white {
  background-color: #ffffff !important;
}

.border-none {
  border: none !important;
}

.sticky-top {
  position: sticky;
  top: 100px;
}

.last-no-border:last-child {
  border-bottom: none !important;
}

.gap-2 {
  gap: 8px;
}

.min-vh-100 {
  min-height: 100vh;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.text-black {
  color: #1a1a1a !important;
}
</style>
