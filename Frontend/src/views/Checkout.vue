<template>
  <div class="checkout-page bg-grey-lighten-5 py-10 min-vh-100">
    <Loading :visible="isLoading" text="Đang xử lý đơn hàng..." />

    <AddressManager v-model="dialogAddresses" />

    <v-container class="max-w-5xl">
      <h1 class="text-h4 font-weight-black mb-6">Thanh Toán</h1>

      <v-row>
        <v-col cols="12" md="8">
          <v-card class="rounded-xl border elevation-0 pa-6 mb-6">
            <div
              class="d-flex justify-space-between align-center border-b pb-3 mb-4"
            >
              <h3 class="text-h6 font-weight-bold text-red-darken-2">
                <v-icon left>mdi-map-marker-outline</v-icon> Địa chỉ nhận hàng
              </h3>
              <v-btn
                v-if="addresses.length > 0"
                variant="text"
                color="blue-darken-2"
                class="font-weight-bold text-none"
                @click="openAddressSelector"
              >
                Thay đổi
              </v-btn>
            </div>

            <div v-if="isLoadingAddresses" class="d-flex justify-center py-4">
              <v-progress-circular
                indeterminate
                color="black"
              ></v-progress-circular>
            </div>

            <div v-else-if="selectedAddress" class="d-flex align-start">
              <div class="flex-grow-1">
                <div class="d-flex align-center gap-2 mb-2">
                  <span class="font-weight-bold text-subtitle-1">{{
                    selectedAddress.receiver_name
                  }}</span>
                  <span class="text-grey-darken-1">|</span>
                  <span class="font-weight-bold text-subtitle-2">{{
                    selectedAddress.phone_number
                  }}</span>
                </div>
                <div class="text-body-1 text-grey-darken-3">
                  {{ selectedAddress.shipping_address }}
                </div>
                <v-chip
                  v-if="selectedAddress.is_default"
                  color="red-darken-2"
                  size="small"
                  variant="outlined"
                  class="mt-2 font-weight-bold"
                >
                  Mặc định
                </v-chip>
              </div>
            </div>

            <div v-else class="text-center py-6">
              <v-icon size="48" color="grey-lighten-1" class="mb-3"
                >mdi-map-marker-off-outline</v-icon
              >
              <p class="text-grey-darken-1 mb-4">
                Bạn chưa có địa chỉ nhận hàng nào.
              </p>
              <v-btn
                color="black"
                prepend-icon="mdi-plus"
                @click="dialogAddresses = true"
                class="font-weight-bold"
              >
                Thêm địa chỉ ngay
              </v-btn>
            </div>
          </v-card>

          <v-card class="rounded-xl border elevation-0 pa-6">
            <h3 class="text-h6 font-weight-bold mb-4 border-b pb-2">
              <v-icon left color="black">mdi-package-variant-closed</v-icon> Sản
              phẩm đơn hàng
            </h3>
            <v-list lines="two" class="pa-0">
              <v-list-item
                v-for="item in checkoutItems"
                :key="item.variant_id"
                class="px-0 border-b"
              >
                <template v-slot:prepend>
                  <v-img
                    :src="item.thumbnail"
                    width="60"
                    height="60"
                    cover
                    class="rounded border mr-4 bg-grey-lighten-4"
                  ></v-img>
                </template>
                <v-list-item-title class="font-weight-bold line-clamp-2">{{
                  item.product_name
                }}</v-list-item-title>
                <v-list-item-subtitle class="mt-1"
                  >Phân loại:
                  <strong
                    >{{ item.color }} - {{ item.size }}</strong
                  ></v-list-item-subtitle
                >

                <template v-slot:append>
                  <div class="text-right ml-4">
                    <div class="font-weight-bold">
                      {{ formatPrice(item.variant_price) }}
                    </div>
                    <div class="text-caption text-grey-darken-1 mt-1">
                      x {{ item.quantity }}
                    </div>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card
            class="rounded-xl border elevation-0 pa-6 position-sticky"
            style="top: 80px"
          >
            <h3 class="text-h6 font-weight-bold mb-4">
              Phương thức thanh toán
            </h3>
            <v-radio-group v-model="paymentMethod" hide-details class="mb-6">
              <v-radio
                label="Thanh toán khi nhận hàng (COD)"
                value="COD"
                color="black"
              ></v-radio>
              <v-radio
                label="Chuyển khoản ngân hàng"
                value="BankTransfer"
                color="black"
              ></v-radio>
            </v-radio-group>

            <h3 class="text-h6 font-weight-bold mb-2">Mã giảm giá</h3>
            <div class="d-flex gap-2 mb-6">
              <v-text-field
                v-model="voucherCode"
                placeholder="Nhập mã giảm giá..."
                variant="outlined"
                density="compact"
                hide-details
                @keyup.enter="applyVoucher"
              ></v-text-field>
              <v-btn
                color="black"
                height="40"
                @click="applyVoucher"
                :loading="isApplyingVoucher"
                >Áp dụng</v-btn
              >
            </div>
            <div
              v-if="appliedVoucher"
              class="text-success text-caption mb-4 font-weight-bold"
            >
              <v-icon size="small">mdi-check-circle</v-icon> Đã áp dụng:
              {{ appliedVoucher.code }}
              <v-btn
                variant="text"
                size="x-small"
                color="red"
                @click="removeVoucher"
                >Bỏ mã</v-btn
              >
            </div>

            <v-divider class="mb-4"></v-divider>

            <div class="d-flex justify-space-between mb-2">
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
              <span class="text-subtitle-1 font-weight-bold"
                >Tổng thanh toán:</span
              >
              <span class="text-h4 font-weight-black text-red-darken-2">{{
                formatPrice(totalPrice)
              }}</span>
            </div>

            <v-btn
              color="black"
              block
              size="x-large"
              class="font-weight-bold rounded-lg"
              @click="submitOrder"
            >
              ĐẶT HÀNG
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="showAddressSelector" max-width="500px">
      <v-card class="rounded-xl">
        <v-card-title
          class="font-weight-bold pa-4 border-b d-flex justify-space-between align-center"
        >
          <span>Chọn địa chỉ giao hàng</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="showAddressSelector = false"
          ></v-btn>
        </v-card-title>
        <v-card-text class="pa-4 bg-grey-lighten-5">
          <v-radio-group v-model="tempSelectedAddressId" hide-details>
            <v-card
              v-for="addr in addresses"
              :key="addr.id"
              class="mb-3 border elevation-0 pa-3 cursor-pointer rounded-lg bg-white"
              @click="tempSelectedAddressId = addr.id"
            >
              <div class="d-flex align-start gap-2">
                <v-radio
                  :value="addr.id"
                  color="red-darken-2"
                  hide-details
                  class="mt-n1"
                ></v-radio>
                <div>
                  <div class="d-flex align-center gap-2 mb-1">
                    <span class="font-weight-bold">{{
                      addr.receiver_name
                    }}</span>
                    <span class="text-grey-lighten-1">|</span>
                    <span class="text-grey-darken-2">{{
                      addr.phone_number
                    }}</span>
                  </div>
                  <div class="text-body-2 text-grey-darken-2">
                    {{ addr.shipping_address }}
                  </div>
                  <v-chip
                    v-if="addr.is_default"
                    color="red-darken-2"
                    size="x-small"
                    variant="outlined"
                    class="mt-2 font-weight-bold"
                    >Mặc định</v-chip
                  >
                </div>
              </div>
            </v-card>
          </v-radio-group>

          <v-btn
            block
            variant="outlined"
            color="black"
            class="mt-2 font-weight-bold bg-white"
            prepend-icon="mdi-cog"
            @click="openAddressManagerFromSelector"
          >
            Thêm / Quản lý địa chỉ
          </v-btn>
        </v-card-text>
        <v-card-actions class="pa-4 border-t bg-white">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            color="grey-darken-1"
            class="font-weight-bold"
            @click="showAddressSelector = false"
            >Hủy</v-btn
          >
          <v-btn
            color="red-darken-2"
            variant="flat"
            class="font-weight-bold px-6"
            @click="confirmAddressSelection"
            >Xác nhận</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top right"
    >
      {{ snackbar.text }}
    </v-snackbar>
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

// State cho Đơn hàng & User
const checkoutItems = ref([]);
const user = ref(null);
const isFromCart = ref(true);
const paymentMethod = ref("COD");

// State cho Địa chỉ
const addresses = ref([]);
const isLoadingAddresses = ref(true);
const selectedAddressId = ref(null);
const showAddressSelector = ref(false); // Modal Chọn nhanh
const tempSelectedAddressId = ref(null);
const dialogAddresses = ref(false); // Modal AddressManager đầy đủ

// State cho Voucher
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

// ======================= XỬ LÝ ĐỊA CHỈ =======================
const selectedAddress = computed(() => {
  return addresses.value.find((a) => a.id === selectedAddressId.value);
});

const fetchAddresses = async () => {
  isLoadingAddresses.value = true;
  try {
    addresses.value = await AddressService.getAll();
    if (addresses.value.length > 0) {
      // Nếu chưa chọn địa chỉ nào HOẶC địa chỉ cũ bị xóa -> Tự động chọn địa chỉ Mặc định (hoặc cái đầu tiên)
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
      selectedAddressId.value = null; // Trống
    }
  } catch (error) {
    console.error("Lỗi lấy địa chỉ", error);
  } finally {
    isLoadingAddresses.value = false;
  }
};

// Lắng nghe sự kiện đóng AddressManager -> Tải lại danh sách địa chỉ mới nhất
watch(dialogAddresses, (newVal) => {
  if (!newVal) {
    fetchAddresses();
  }
});

// Các hàm cho Modal Chọn nhanh (Thay đổi)
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
  dialogAddresses.value = true; // Mở cái Pop-up lớn
};

// ======================= TÍNH TOÁN TIỀN & VOUCHER =======================
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

// ======================= ĐẶT HÀNG =======================
const submitOrder = async () => {
  if (!selectedAddress.value) {
    showMessage("Vui lòng chọn địa chỉ giao hàng để tiếp tục", "error");
    return;
  }

  isLoading.value = true;
  try {
    const payload = {
      user_id: user.value.id,
      // Lấy thông tin từ địa chỉ được chọn
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
        price: i.variant_price, // Giá khóa cứng lúc đặt
      })),
    };

    await OrderService.create(payload);

    sessionStorage.removeItem("checkout_items");
    showMessage("Đặt hàng thành công!");

    setTimeout(() => {
      router.push("/orders");
    }, 1500);
  } catch (error) {
    showMessage(error.response?.data?.message || "Lỗi khi đặt hàng", "error");
  } finally {
    isLoading.value = false;
  }
};

// ======================= KHỞI TẠO =======================
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
.min-vh-100 {
  min-height: 100vh;
}
.position-sticky {
  position: sticky;
}
.gap-2 {
  gap: 8px;
}
.cursor-pointer {
  cursor: pointer;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
</style>
