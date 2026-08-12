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

            <!-- KHỐI HIỂN THỊ TRÊN TRANG CHECKOUT -->
            <div
              class="d-flex justify-space-between align-center mb-4 custom-main-color border-b pb-2"
            >
              <h3
                class="text-h6 font-weight-bold ma-0 d-flex align-center"
                style="height: 32px"
              >
                Mã giảm giá
              </h3>

              <v-btn
                variant="text"
                color="blue-darken-2"
                class="font-weight-bold text-none px-2 m-0"
                height="32"
                @click="openVoucherDialog"
              >
                Chọn Voucher
              </v-btn>
            </div>

            <!-- Hiển thị mã đã chọn -->
            <div
              class="d-flex flex-column gap-2 mb-4"
              v-if="appliedShippingVoucher || appliedProductVoucher"
            >
              <v-chip
                v-if="appliedShippingVoucher"
                color="teal-darken-2"
                variant="tonal"
                closable
                @click:close="removeVoucher('shipping')"
              >
                <v-icon start>mdi-truck-fast</v-icon> Đã áp dụng:
                {{ appliedShippingVoucher.code }}
              </v-chip>
              <v-chip
                v-if="appliedProductVoucher"
                color="red-darken-2"
                variant="tonal"
                closable
                @click:close="removeVoucher('product')"
              >
                <v-icon start>mdi-ticket-percent</v-icon> Đã áp dụng:
                {{ appliedProductVoucher.code }}
              </v-chip>
            </div>

            <!-- DIALOG CHỌN VOUCHER -->
            <v-dialog v-model="showVoucherDialog" max-width="500px" scrollable>
              <v-card class="rounded-xl bg-white text-black">
                <v-card-title
                  class="pa-4 border-b font-weight-bold custom-main-color d-flex justify-space-between align-center"
                >
                  <span>Chọn Voucher</span>
                  <v-btn
                    icon="mdi-close"
                    variant="text"
                    @click="showVoucherDialog = false"
                  ></v-btn>
                </v-card-title>

                <v-card-text class="pa-4 bg-grey-lighten-4">
                  <div v-if="isLoadingVouchers" class="text-center py-4">
                    <v-progress-circular
                      indeterminate
                      color="#001a2d"
                    ></v-progress-circular>
                  </div>

                  <div v-else>
                    <!-- KHỐI 1: MIỄN PHÍ VẬN CHUYỂN -->
                    <div class="font-weight-bold text-teal-darken-3 mb-2">
                      Mã Miễn Phí Vận Chuyển
                    </div>
                    <v-radio-group
                      v-model="tempShippingVoucherId"
                      hide-details
                      class="mb-4"
                    >
                      <div
                        v-for="v in validShippingVouchers"
                        :key="v.id"
                        class="voucher-card mb-3"
                        :class="{
                          'voucher-card--selected':
                            tempShippingVoucherId === v.id,
                        }"
                        @click="
                          tempShippingVoucherId =
                            tempShippingVoucherId === v.id ? null : v.id
                        "
                      >
                        <div class="voucher-card-icon bg-teal-darken-2">
                          <v-icon size="26" color="white"
                            >mdi-truck-fast</v-icon
                          >
                          <span class="voucher-card-icon-text">Freeship</span>
                        </div>
                        <span
                          class="voucher-card-notch voucher-card-notch--top"
                        ></span>
                        <span
                          class="voucher-card-notch voucher-card-notch--bottom"
                        ></span>

                        <div class="voucher-card-body">
                          <div class="voucher-card-main text-teal-darken-3">
                            Giảm {{ voucherDiscountText(v) }}
                          </div>
                          <div class="voucher-card-sub">
                            Đơn Tối Thiểu {{ formatPrice(v.min_order_value) }}
                          </div>
                          <div class="voucher-card-footer">
                            <span class="voucher-card-code">{{ v.code }}</span>
                            <span class="voucher-card-expiry"
                              >HSD: {{ formatDate(v.end_date) }}</span
                            >
                          </div>
                        </div>

                        <div
                          class="voucher-card-radio"
                          @click.stop.prevent="
                            tempShippingVoucherId =
                              tempShippingVoucherId === v.id ? null : v.id
                          "
                        >
                          <v-radio
                            :value="v.id"
                            color="teal-darken-2"
                            density="compact"
                            hide-details
                            readonly
                          ></v-radio>
                        </div>
                      </div>
                      <div
                        v-if="validShippingVouchers.length === 0"
                        class="text-caption text-grey text-center my-2"
                      >
                        Không có mã khả dụng
                      </div>
                    </v-radio-group>

                    <!-- KHỐI 2: GIẢM GIÁ SẢN PHẨM -->
                    <div class="font-weight-bold text-red-darken-3 mb-2 mt-4">
                      Giảm Giá Sản Phẩm
                    </div>
                    <v-radio-group v-model="tempProductVoucherId" hide-details>
                      <div
                        v-for="v in validProductVouchers"
                        :key="v.id"
                        class="voucher-card mb-3"
                        :class="{
                          'voucher-card--selected':
                            tempProductVoucherId === v.id,
                        }"
                        @click="
                          tempProductVoucherId =
                            tempProductVoucherId === v.id ? null : v.id
                        "
                      >
                        <div class="voucher-card-icon bg-red-darken-2">
                          <v-icon size="26" color="white"
                            >mdi-ticket-percent</v-icon
                          >
                          <span class="voucher-card-icon-text">Giảm giá</span>
                        </div>
                        <span
                          class="voucher-card-notch voucher-card-notch--top"
                        ></span>
                        <span
                          class="voucher-card-notch voucher-card-notch--bottom"
                        ></span>

                        <div class="voucher-card-body">
                          <div class="voucher-card-main text-red-darken-3">
                            Giảm {{ voucherDiscountText(v) }}
                          </div>
                          <div class="voucher-card-sub">
                            Đơn Tối Thiểu {{ formatPrice(v.min_order_value) }}
                          </div>
                          <div class="voucher-card-footer">
                            <span class="voucher-card-code">{{ v.code }}</span>
                            <span class="voucher-card-expiry"
                              >HSD: {{ formatDate(v.end_date) }}</span
                            >
                          </div>
                        </div>

                        <div
                          class="voucher-card-radio"
                          @click.stop.prevent="
                            tempProductVoucherId =
                              tempProductVoucherId === v.id ? null : v.id
                          "
                        >
                          <v-radio
                            :value="v.id"
                            color="red-darken-2"
                            density="compact"
                            hide-details
                            readonly
                          ></v-radio>
                        </div>
                      </div>
                      <div
                        v-if="validProductVouchers.length === 0"
                        class="text-caption text-grey text-center my-2"
                      >
                        Không có mã khả dụng
                      </div>
                    </v-radio-group>
                  </div>
                </v-card-text>

                <v-card-actions class="pa-4 border-t bg-white">
                  <v-spacer></v-spacer>
                  <v-btn
                    class="custom-btn px-8"
                    @click="confirmVoucherSelection"
                    >Đồng ý</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-divider class="mb-4"></v-divider>
            <div class="d-flex justify-space-between mb-2 text-black">
              <span class="text-grey-darken-1">Tạm tính:</span>
              <span class="font-weight-bold">{{ formatPrice(subtotal) }}</span>
            </div>

            <div class="d-flex justify-space-between mb-2 text-black">
              <span class="text-grey-darken-1">Phí vận chuyển:</span>
              <span class="font-weight-bold">{{
                formatPrice(shippingFee)
              }}</span>
            </div>

            <div class="d-flex justify-space-between mb-2 text-black">
              <span class="text-grey-darken-1">Dự kiến nhận hàng:</span>
              <span class="font-weight-bold text-green-darken-3">{{
                estimatedDeliveryText
              }}</span>
            </div>

            <div
              class="d-flex justify-space-between mb-2 text-green-darken-2"
              v-if="shippingDiscountAmount > 0"
            >
              <span>Giảm giá vận chuyển:</span>
              <span class="font-weight-bold"
                >-{{ formatPrice(shippingDiscountAmount) }}</span
              >
            </div>

            <div
              class="d-flex justify-space-between mb-4 text-green-darken-2"
              v-if="discountAmount > 0"
            >
              <span>Mã giảm giá:</span>
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

// --- GLOBAL STATES ---
const router = useRouter();
const isLoading = ref(false);
const snackbar = ref({ show: false, text: "", color: "success" });
const checkoutItems = ref([]);
const user = ref(null);
const isFromCart = ref(true);

// --- PAYMENT & QR STATES ---
const paymentMethod = ref("COD");
const showQRDialog = ref(false);
const qrUrl = ref("");
const qrDescription = ref("");
const BANK_ID = "MB";
const ACCOUNT_NO = "0123456789";
const ACCOUNT_NAME = "SPORT STORE THU NGHIEM";

// --- ADDRESS STATES ---
const addresses = ref([]);
const isLoadingAddresses = ref(true);
const selectedAddressId = ref(null);
const showAddressSelector = ref(false);
const tempSelectedAddressId = ref(null);
const dialogAddresses = ref(false);

// --- VOUCHER STATES (MỚI) ---
const showVoucherDialog = ref(false);
const isLoadingVouchers = ref(false);
const vouchersList = ref([]);

const appliedShippingVoucher = ref(null);
const appliedProductVoucher = ref(null);
const tempShippingVoucherId = ref(null);
const tempProductVoucherId = ref(null);

// --- UTILS ---
const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value || 0,
  );
const showMessage = (text, color = "success") => {
  snackbar.value = { show: true, text, color };
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
};

const voucherDiscountText = (v) => {
  if (v.discount_type.includes("percent")) {
    let text = `${v.discount_value}%`;
    if (v.max_discount) text += ` tối đa ${formatPrice(v.max_discount)}`;
    return text;
  }
  return `tối đa ${formatPrice(v.discount_value)}`;
};

// --- ADDRESS COMPUTED & METHODS ---
const selectedAddress = computed(() =>
  addresses.value.find((a) => a.id === selectedAddressId.value),
);

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
  if (!newVal) fetchAddresses();
});

const openAddressSelector = () => {
  tempSelectedAddressId.value = selectedAddressId.value;
  showAddressSelector.value = true;
};

const confirmAddressSelection = () => {
  selectedAddressId.value = tempSelectedAddressId.value;
  showAddressSelector.value = false;
};

// --- CALCULATIONS COMPUTED ---
const subtotal = computed(() =>
  checkoutItems.value.reduce(
    (total, item) => total + item.variant_price * item.quantity,
    0,
  ),
);

const shippingFee = computed(() => {
  if (!selectedAddress.value) return 0;
  const address = selectedAddress.value.shipping_address.toLowerCase();
  if (address.includes("cần thơ")) return 15000;
  if (
    address.includes("hà nội") ||
    address.includes("hồ chí minh") ||
    address.includes("hcm")
  )
    return 30000;
  return 35000;
});

const estimatedDeliveryText = computed(() => {
  const addBusinessDays = (date, days) => {
    let result = new Date(date);
    let added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 0) added++;
    }
    return result;
  };
  const now = new Date();
  const minDate = addBusinessDays(now, 3);
  const maxDate = addBusinessDays(now, 5);
  const format = (d) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  return `${format(minDate)} - ${format(maxDate)}`;
});

// --- VOUCHER LOGIC (MỚI) ---
const validShippingVouchers = computed(() => {
  return vouchersList.value.filter(
    (v) =>
      v.discount_type.includes("shipping") &&
      v.min_order_value <= subtotal.value &&
      new Date(v.end_date) > new Date() &&
      (!v.usage_limit || v.used_count < v.usage_limit),
  );
});

const validProductVouchers = computed(() => {
  return vouchersList.value.filter(
    (v) =>
      !v.discount_type.includes("shipping") &&
      v.min_order_value <= subtotal.value &&
      new Date(v.end_date) > new Date() &&
      (!v.usage_limit || v.used_count < v.usage_limit),
  );
});

const openVoucherDialog = async () => {
  showVoucherDialog.value = true;
  if (vouchersList.value.length === 0) {
    isLoadingVouchers.value = true;
    try {
      vouchersList.value = await VoucherService.getAll();
    } catch (error) {
      console.error("Lỗi tải voucher:", error);
    } finally {
      isLoadingVouchers.value = false;
    }
  }
  tempShippingVoucherId.value = appliedShippingVoucher.value?.id || null;
  tempProductVoucherId.value = appliedProductVoucher.value?.id || null;
};

const confirmVoucherSelection = () => {
  appliedShippingVoucher.value =
    vouchersList.value.find((v) => v.id === tempShippingVoucherId.value) ||
    null;
  appliedProductVoucher.value =
    vouchersList.value.find((v) => v.id === tempProductVoucherId.value) || null;
  showVoucherDialog.value = false;
  showMessage("Cập nhật mã giảm giá thành công");
};

const removeVoucher = (type) => {
  if (type === "shipping") appliedShippingVoucher.value = null;
  if (type === "product") appliedProductVoucher.value = null;
};

// TÍNH TIỀN GIẢM GIÁ
const shippingDiscountAmount = computed(() => {
  if (!appliedShippingVoucher.value) return 0;
  const v = appliedShippingVoucher.value;
  let discount =
    v.discount_type === "shipping_percent"
      ? shippingFee.value * (v.discount_value / 100)
      : v.discount_value;
  if (
    v.discount_type === "shipping_percent" &&
    v.max_discount &&
    discount > v.max_discount
  )
    discount = v.max_discount;
  return discount > shippingFee.value ? shippingFee.value : discount;
});

const discountAmount = computed(() => {
  if (!appliedProductVoucher.value) return 0;
  const v = appliedProductVoucher.value;
  let discount =
    v.discount_type === "percent"
      ? subtotal.value * (v.discount_value / 100)
      : v.discount_value;
  if (
    v.discount_type === "percent" &&
    v.max_discount &&
    discount > v.max_discount
  )
    discount = v.max_discount;
  return discount > subtotal.value ? subtotal.value : discount;
});

const totalPrice = computed(
  () =>
    subtotal.value +
    shippingFee.value -
    discountAmount.value -
    shippingDiscountAmount.value,
);

// --- SUBMIT ORDER ---
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
      voucher_id: appliedProductVoucher.value?.id || null, // ID Voucher SP
      shipping_voucher_id: appliedShippingVoucher.value?.id || null, // ID Voucher Vận chuyển
      subtotal: subtotal.value,
      discount_amount: discountAmount.value,
      shipping_discount: shippingDiscountAmount.value, // Số tiền Ship được giảm
      shipping_fee: shippingFee.value,
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
    sessionStorage.removeItem("is_from_cart");

    if (paymentMethod.value === "BankTransfer") {
      qrDescription.value = `Thanh toan don hang ${res.order_id}`;
      qrUrl.value = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${totalPrice.value}&addInfo=${encodeURIComponent(qrDescription.value)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;
      isLoading.value = false;
      showQRDialog.value = true;
    } else {
      showMessage("Đặt hàng thành công!");
      setTimeout(() => router.push("/orders"), 1500);
    }
  } catch (error) {
    showMessage(error.response?.data?.message || "Lỗi khi đặt hàng", "error");
    isLoading.value = false;
  }
};

const finishPayment = () => {
  showQRDialog.value = false;
  showMessage("Đã ghi nhận đơn hàng. Hệ thống sẽ kiểm tra thanh toán của bạn.");
  setTimeout(() => router.push("/orders"), 1000);
};

// --- LIFECYCLE ---
onMounted(() => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return router.push("/login");
  user.value = JSON.parse(userStr);

  const itemsStr = sessionStorage.getItem("checkout_items");
  if (itemsStr) {
    checkoutItems.value = JSON.parse(itemsStr);
  } else {
    return router.push("/cart");
  }

  isFromCart.value = sessionStorage.getItem("is_from_cart") !== "false";
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

.lh-1 {
  line-height: 1.2 !important;
}

.voucher-header .v-btn {
  height: auto !important;
  min-height: 32px;
}

/* --- Voucher ticket card (Shopee-style) --- */
.voucher-card {
  position: relative;
  display: flex;
  align-items: stretch;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.voucher-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.voucher-card--selected {
  border-color: #001a2d;
  box-shadow: 0 0 0 1px #001a2d inset;
}

.voucher-card-icon {
  flex: 0 0 84px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 6px;
  text-align: center;
}

.voucher-card-icon-text {
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
}

.voucher-card-notch {
  position: absolute;
  left: 84px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #f5f5f5;
  transform: translateX(-50%);
  z-index: 2;
}

.voucher-card-notch--top {
  top: -7px;
}

.voucher-card-notch--bottom {
  bottom: -7px;
}

.voucher-card-body {
  flex: 1 1 auto;
  padding: 10px 12px;
  border-left: 1px dashed #d0d0d0;
  min-width: 0;
}

.voucher-card-main {
  font-weight: 800;
  font-size: 15px;
  line-height: 1.3;
}

.voucher-card-sub {
  font-size: 12px;
  color: #757575;
  margin-top: 2px;
}

.voucher-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  gap: 8px;
}

.voucher-card-code {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #9e9e9e;
  text-transform: uppercase;
}

.voucher-card-expiry {
  font-size: 11px;
  color: #9e9e9e;
  white-space: nowrap;
}

.voucher-card-radio {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 6px;
}
</style>
