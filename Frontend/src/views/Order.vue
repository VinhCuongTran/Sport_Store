<template>
  <div class="orders-page bg-grey-lighten-5 py-10 min-vh-100">
    <v-container class="max-w-5xl">
      <h1 class="text-h4 font-weight-black mb-6">Đơn Hàng Của Tôi</h1>

      <v-tabs
        v-model="activeTab"
        color="black"
        bg-color="white"
        class="rounded-lg mb-6 elevation-1"
        align-tabs="center"
      >
        <v-tab value="all">Tất cả</v-tab>
        <v-tab value="pending">Chờ xác nhận</v-tab>
        <v-tab value="confirmed">Đã xác nhận</v-tab>
        <v-tab value="shipping">Đang giao</v-tab>
        <v-tab value="completed">Hoàn thành</v-tab>
        <v-tab value="cancelled">Đã hủy</v-tab>
      </v-tabs>

      <div v-if="isLoading" class="d-flex justify-center py-10">
        <v-progress-circular
          indeterminate
          color="black"
          size="50"
        ></v-progress-circular>
      </div>

      <v-card
        v-else-if="filteredOrders.length === 0"
        class="text-center py-16 rounded-lg border elevation-0 bg-white"
      >
        <v-icon size="80" color="grey-lighten-2" class="mb-4"
          >mdi-clipboard-text-outline</v-icon
        >
        <h3 class="text-h5 font-weight-bold text-grey-darken-2">
          Chưa có đơn hàng nào
        </h3>
        <p class="text-grey mt-2">
          Bạn chưa có đơn hàng nào trong trạng thái này.
        </p>
        <v-btn to="/products" color="black" class="mt-4 font-weight-bold"
          >Tiếp tục mua sắm</v-btn
        >
      </v-card>

      <div v-else>
        <!-- ITEM ĐƠN HÀNG STYLE SHOPEE -->
        <v-card
          v-for="order in filteredOrders"
          :key="order.id"
          class="mb-4 rounded-lg border elevation-0 overflow-hidden"
        >
          <!-- Header Đơn Hàng (Thông tin Shop & Trạng thái) -->
          <div
            class="d-flex justify-space-between align-center px-4 py-3 border-b bg-white"
          >
            <div class="d-flex align-center gap-2">
              <v-chip
                size="small"
                color="black"
                variant="flat"
                class="font-weight-bold px-2 rounded-sm"
              >
                SHOP
              </v-chip>
              <span class="font-weight-bold text-body-1"
                >Mã ĐH: #{{ order.id }}</span
              >
              <v-btn
                variant="outlined"
                size="small"
                density="comfortable"
                color="black"
                class="ml-2 px-2 text-none border"
                @click="gotoChat(order.id)"
              >
                <v-icon start size="small">mdi-chat-processing-outline</v-icon>
                Chat
              </v-btn>
            </div>

            <div class="d-flex align-center">
              <div
                v-if="order.status === 'completed'"
                class="d-flex align-center text-success mr-3"
              >
                <v-icon size="small" class="mr-1"
                  >mdi-truck-check-outline</v-icon
                >
                <span class="text-caption">Giao hàng thành công</span>
              </div>
              <v-divider
                vertical
                class="mr-3"
                v-if="order.status === 'completed'"
              ></v-divider>
              <span
                class="text-uppercase font-weight-bold text-caption"
                :class="getStatusTextColor(order.status)"
              >
                {{ getStatusText(order.status) }}
              </span>
            </div>
          </div>

          <!-- Danh sách sản phẩm -->
          <div class="bg-white" v-if="order.items && order.items.length > 0">
            <div
              v-for="(item, index) in order.items"
              :key="item.id"
              class="d-flex py-4 px-4"
              :class="{ 'border-b': index !== order.items.length - 1 }"
            >
              <!-- Hình ảnh -->
              <v-img
                :src="item.image_url || 'https://placehold.co/100'"
                width="80"
                height="80"
                cover
                class="border bg-grey-lighten-4 flex-grow-0 mr-4 rounded-sm"
              ></v-img>

              <!-- Thông tin SP -->
              <div
                class="flex-grow-1 d-flex flex-column justify-space-between py-1"
              >
                <div>
                  <div class="text-body-1 text-truncate-2">
                    {{ item.product_name }}
                  </div>
                  <div class="text-caption text-grey-darken-1 mt-1">
                    Phân loại hàng: {{ item.color }}, {{ item.size }}
                  </div>
                </div>
                <div class="text-body-2 text-grey-darken-2 font-weight-medium">
                  x{{ item.quantity }}
                </div>
              </div>

              <!-- Giá & Nút đánh giá (Dành riêng cho SP) -->
              <div
                class="d-flex flex-column align-end justify-center min-w-100 pl-4"
              >
                <div class="text-body-1">{{ formatPrice(item.price) }}</div>

                <div class="mt-2" v-if="order.status === 'completed'">
                  <!-- Thêm điều kiện !item.is_reviewed từ API -->
                  <v-btn
                    v-if="
                      !item.is_reviewed &&
                      !reviewedItems.includes(item.product_id)
                    "
                    size="small"
                    color="black"
                    variant="outlined"
                    class="text-none font-weight-bold px-4"
                    @click="openReviewDialog(item, order.id)"
                  >
                    Đánh giá
                  </v-btn>
                  <span
                    v-else
                    class="text-caption text-success font-weight-bold d-flex align-center mt-1"
                  >
                    <v-icon start icon="mdi-check-circle" size="small"></v-icon>
                    Đã đánh giá
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer: Tổng Tiền & Nút Hành Động -->
          <div class="bg-grey-lighten-5">
            <!-- Dòng tổng tiền -->
            <div class="px-4 py-4 d-flex justify-end align-center border-b">
              <v-icon size="small" color="red-darken-2" class="mr-2"
                >mdi-shield-check</v-icon
              >
              <span class="text-body-1 mr-2">Thành tiền:</span>
              <span class="text-h5 font-weight-bold text-red-darken-2">{{
                formatPrice(order.total_price)
              }}</span>
            </div>

            <!-- Dòng nút hành động -->
            <div class="px-4 py-3 d-flex justify-space-between align-center">
              <span class="text-caption text-grey"
                >Đặt lúc: {{ formatDate(order.created_at) }}</span
              >
              <div class="d-flex gap-2">
                <v-btn
                  v-if="order.status === 'pending'"
                  variant="outlined"
                  color="error"
                  class="text-none"
                  @click="cancelOrder(order.id)"
                  >Hủy Đơn</v-btn
                >

                <v-btn
                  variant="outlined"
                  color="black"
                  class="text-none"
                  @click="viewDetail(order.id)"
                  >Xem Chi Tiết</v-btn
                >

                <v-btn
                  v-if="order.status === 'completed'"
                  color="black"
                  variant="flat"
                  class="text-none px-6"
                  to="/products"
                  >Mua lại</v-btn
                >
              </div>
            </div>
          </div>
        </v-card>
      </div>
    </v-container>

    <!-- Dialog Chi Tiết Đơn Hàng -->
    <v-dialog v-model="dialogDetail" max-width="750px" scrollable>
      <v-card class="rounded-xl bg-grey-lighten-4" v-if="selectedOrder">
        <v-card-title
          class="bg-white pa-4 d-flex justify-space-between align-center elevation-1"
          style="z-index: 10"
        >
          <div class="d-flex align-center">
            <v-icon color="black" class="mr-2">mdi-receipt-text-outline</v-icon>
            <span class="font-weight-bold text-h6">Chi tiết đơn hàng</span>
            <v-chip
              size="small"
              class="ml-3 font-weight-bold text-white"
              :color="getStatusColor(selectedOrder.status)"
              variant="flat"
            >
              {{ getStatusText(selectedOrder.status) }}
            </v-chip>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            density="comfortable"
            @click="dialogDetail = false"
          ></v-btn>
        </v-card-title>

        <v-card-text
          class="pa-4 pa-sm-5"
          style="max-height: 80vh; overflow-y: auto"
        >
          <div class="d-flex justify-space-between align-center mb-4 px-1">
            <span class="text-grey-darken-1 text-body-2"
              >Mã đơn hàng:
              <strong class="text-black">#{{ selectedOrder.id }}</strong></span
            >
            <span class="text-grey-darken-1 text-body-2"
              >Ngày đặt:
              <strong class="text-black">{{
                formatDate(selectedOrder.created_at)
              }}</strong></span
            >
          </div>

          <div
            class="bg-white px-2 py-6 mb-5 rounded-lg border elevation-0 d-flex justify-space-between align-start"
          >
            <div
              class="d-flex flex-column align-center text-center flex-grow-1"
            >
              <div
                class="rounded-circle d-flex align-center justify-center mb-2 elevation-1"
                :class="
                  selectedOrder.created_at ? 'bg-black' : 'bg-grey-lighten-3'
                "
                style="width: 45px; height: 45px"
              >
                <v-icon
                  :color="selectedOrder.created_at ? 'white' : 'grey'"
                  size="22"
                  >mdi-clipboard-text-outline</v-icon
                >
              </div>
              <span
                class="text-caption font-weight-bold"
                :class="selectedOrder.created_at ? 'text-black' : 'text-grey'"
                >Đơn hàng<br />đã đặt</span
              >
            </div>

            <div class="d-flex align-center justify-center mt-3">
              <v-icon color="grey-lighten-1" size="24"
                >mdi-chevron-right</v-icon
              >
            </div>

            <div
              class="d-flex flex-column align-center text-center flex-grow-1"
            >
              <div
                class="rounded-circle d-flex align-center justify-center mb-2 elevation-1"
                :class="
                  ['confirmed', 'shipping', 'completed'].includes(
                    selectedOrder.status,
                  )
                    ? 'bg-black'
                    : 'bg-grey-lighten-3'
                "
                style="width: 45px; height: 45px"
              >
                <v-icon
                  :color="
                    ['confirmed', 'shipping', 'completed'].includes(
                      selectedOrder.status,
                    )
                      ? 'white'
                      : 'grey'
                  "
                  size="22"
                  >mdi-credit-card-check-outline</v-icon
                >
              </div>
              <span
                class="text-caption font-weight-bold"
                :class="
                  ['confirmed', 'shipping', 'completed'].includes(
                    selectedOrder.status,
                  )
                    ? 'text-black'
                    : 'text-grey'
                "
                >Đã xác nhận<br />thanh toán</span
              >
            </div>

            <div class="d-flex align-center justify-center mt-3">
              <v-icon color="grey-lighten-1" size="24"
                >mdi-chevron-right</v-icon
              >
            </div>

            <div
              class="d-flex flex-column align-center text-center flex-grow-1"
            >
              <div
                class="rounded-circle d-flex align-center justify-center mb-2 elevation-1"
                :class="
                  ['shipping', 'completed'].includes(selectedOrder.status)
                    ? 'bg-black'
                    : 'bg-grey-lighten-3'
                "
                style="width: 45px; height: 45px"
              >
                <v-icon
                  :color="
                    ['shipping', 'completed'].includes(selectedOrder.status)
                      ? 'white'
                      : 'grey'
                  "
                  size="22"
                  >mdi-truck-fast-outline</v-icon
                >
              </div>
              <span
                class="text-caption font-weight-bold"
                :class="
                  ['shipping', 'completed'].includes(selectedOrder.status)
                    ? 'text-black'
                    : 'text-grey'
                "
                >Đang giao<br />cho ĐVVC</span
              >
            </div>

            <div class="d-flex align-center justify-center mt-3">
              <v-icon color="grey-lighten-1" size="24"
                >mdi-chevron-right</v-icon
              >
            </div>

            <div
              class="d-flex flex-column align-center text-center flex-grow-1"
            >
              <div
                class="rounded-circle d-flex align-center justify-center mb-2 elevation-1"
                :class="
                  selectedOrder.status === 'completed'
                    ? 'bg-success'
                    : 'bg-grey-lighten-3'
                "
                style="width: 45px; height: 45px"
              >
                <v-icon
                  :color="
                    selectedOrder.status === 'completed' ? 'white' : 'grey'
                  "
                  size="22"
                  >mdi-package-variant-closed-check</v-icon
                >
              </div>
              <span
                class="text-caption font-weight-bold"
                :class="
                  selectedOrder.status === 'completed'
                    ? 'text-success'
                    : 'text-grey'
                "
                >Đã nhận<br />được hàng</span
              >
            </div>
          </div>

          <v-row class="bg-white ma-0 pa-5 mb-5 rounded-lg border elevation-0">
            <v-col
              cols="12"
              md="6"
              class="border-e-md border-b border-b-md-0 pb-5 pb-md-0 pt-0 pl-0"
            >
              <div class="d-flex align-center mb-3">
                <v-icon color="black" class="mr-2"
                  >mdi-map-marker-radius-outline</v-icon
                >
                <span class="text-subtitle-1 font-weight-bold"
                  >Địa Chỉ Nhận Hàng</span
                >
              </div>
              <div class="pl-8">
                <div class="font-weight-bold text-body-1 mb-1">
                  {{ selectedOrder.receiver_name }}
                </div>
                <div class="text-body-2 text-grey-darken-2 mb-1">
                  <v-icon size="small" class="mr-1">mdi-phone-outline</v-icon>
                  {{ selectedOrder.phone_number }}
                </div>
                <div class="text-body-2 text-grey-darken-2">
                  <v-icon size="small" class="mr-1">mdi-map-outline</v-icon>
                  {{ selectedOrder.shipping_address }}
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6" class="pt-5 pt-md-0 pl-md-6 pb-0">
              <div class="d-flex align-center mb-3">
                <v-icon color="black" class="mr-2"
                  >mdi-truck-delivery-outline</v-icon
                >
                <span class="text-subtitle-1 font-weight-bold"
                  >Thông Tin Vận Chuyển</span
                >
              </div>
              <div class="pl-8">
                <div class="text-body-2 text-grey-darken-2 mb-2">
                  Phương thức:
                  <span class="font-weight-bold text-black"
                    >Giao hàng tiêu chuẩn</span
                  >
                </div>
                <div class="text-body-2 text-grey-darken-2">
                  Trạng thái:
                  <span
                    class="font-weight-bold"
                    :class="getStatusTextColor(selectedOrder.status)"
                  >
                    {{ getStatusText(selectedOrder.status) }}
                  </span>
                </div>
                <div
                  class="mt-3 px-3 py-2 rounded bg-grey-lighten-4 border-s-lg border-s-black text-caption text-grey-darken-2 d-flex align-center"
                >
                  <v-icon size="small" class="mr-2"
                    >mdi-information-outline</v-icon
                  >
                  {{ getStatusDescription(selectedOrder.status) }}
                </div>
              </div>
            </v-col>
          </v-row>

          <div class="bg-white mb-4 pa-4 rounded-lg border elevation-0">
            <div class="d-flex align-center mb-4 pb-2 border-b">
              <v-icon class="mr-2" color="black">mdi-storefront-outline</v-icon>
              <span class="font-weight-bold text-body-1">Sản phẩm đã đặt</span>
            </div>

            <div
              v-for="(item, index) in selectedOrder.items"
              :key="item.id"
              class="d-flex py-3"
              :class="{ 'border-b': index !== selectedOrder.items.length - 1 }"
            >
              <v-img
                :src="item.image_url || 'https://placehold.co/100'"
                width="70"
                height="70"
                cover
                class="border bg-grey-lighten-4 flex-grow-0 mr-4 rounded-md"
              ></v-img>
              <div class="flex-grow-1 d-flex flex-column justify-center">
                <div class="text-body-1 text-truncate-2 font-weight-medium">
                  {{ item.product_name }}
                </div>
                <div class="text-caption text-grey-darken-1 mt-1">
                  Phân loại: {{ item.color }} - {{ item.size }}
                </div>
                <div class="text-body-2 font-weight-bold mt-1">
                  x{{ item.quantity }}
                </div>
              </div>
              <div class="d-flex align-center pl-4">
                <span class="text-body-1 font-weight-bold">{{
                  formatPrice(item.price)
                }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white pa-5 rounded-lg border elevation-0">
            <v-row no-gutters class="mb-2 text-body-2">
              <v-col cols="8" class="text-right text-grey-darken-1 pr-4"
                >Tổng tiền hàng</v-col
              >
              <v-col cols="4" class="text-right font-weight-medium">{{
                formatPrice(selectedOrder.subtotal)
              }}</v-col>
            </v-row>

            <v-row no-gutters class="mb-2 text-body-2">
              <v-col cols="8" class="text-right text-grey-darken-1 pr-4"
                >Phí vận chuyển</v-col
              >
              <v-col cols="4" class="text-right font-weight-medium">{{
                formatPrice(selectedOrder.shipping_fee || 0)
              }}</v-col>
            </v-row>

            <v-row
              no-gutters
              class="mb-2 text-body-2"
              v-if="selectedOrder.discount_amount > 0"
            >
              <v-col cols="8" class="text-right text-grey-darken-1 pr-4"
                >Voucher từ Shop</v-col
              >
              <v-col cols="4" class="text-right font-weight-medium text-success"
                >-{{ formatPrice(selectedOrder.discount_amount) }}</v-col
              >
            </v-row>

            <v-row
              no-gutters
              class="mb-2 text-body-2"
              v-if="selectedOrder.shipping_discount > 0"
            >
              <v-col cols="8" class="text-right text-grey-darken-1 pr-4"
                >Miễn phí vận chuyển</v-col
              >
              <v-col cols="4" class="text-right font-weight-medium text-success"
                >-{{ formatPrice(selectedOrder.shipping_discount) }}</v-col
              >
            </v-row>

            <v-row
              no-gutters
              class="mt-4 text-body-1 align-center border-t pt-4"
            >
              <v-col cols="8" class="text-right font-weight-bold pr-4"
                >Thành tiền</v-col
              >
              <v-col
                cols="4"
                class="text-right text-h5 font-weight-black text-red-darken-2"
                >{{ formatPrice(selectedOrder.total_price) }}</v-col
              >
            </v-row>

            <div
              class="mt-4 pa-3 bg-grey-lighten-4 rounded d-flex justify-space-between align-center"
            >
              <span class="text-body-2 text-grey-darken-2"
                ><v-icon size="small" class="mr-1">mdi-cash-check</v-icon>
                Phương thức Thanh toán:</span
              >
              <span class="text-body-2 font-weight-bold text-black">{{
                selectedOrder.payment_method === "Cash"
                  ? "Thanh toán khi nhận hàng"
                  : selectedOrder.payment_method
              }}</span>
            </div>
          </div>
        </v-card-text>

        <v-card-actions
          class="bg-white pa-4 border-t d-flex justify-end gap-2 rounded-b-lg"
        >
          <v-btn
            variant="outlined"
            color="black"
            class="text-none font-weight-bold px-4"
            @click="dialogDetail = false"
            >Đóng</v-btn
          >
          <v-btn
            variant="outlined"
            color="black"
            class="text-none font-weight-bold px-4"
            >Liên hệ Người bán</v-btn
          >
          <v-btn
            v-if="selectedOrder.status === 'completed'"
            color="black"
            class="text-none font-weight-bold px-6"
            variant="flat"
            to="/products"
            >Mua lại</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Đánh Giá -->
    <v-dialog v-model="dialogReview" max-width="500px">
      <v-card class="rounded-lg bg-white">
        <v-card-title
          class="bg-white border-b pa-4 d-flex justify-space-between align-center"
        >
          <span class="font-weight-bold">Đánh giá sản phẩm</span>
          <v-btn
            icon="mdi-close"
            density="compact"
            variant="text"
            @click="dialogReview = false"
          ></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <div class="text-center mb-6">
            <h3 class="text-subtitle-1 font-weight-bold mb-2">
              {{ reviewItem?.product_name }}
            </h3>
            <v-rating
              v-model="reviewForm.rating"
              color="amber-darken-2"
              active-color="amber-darken-2"
              hover
              size="x-large"
            ></v-rating>
            <div
              v-if="reviewForm.rating > 0"
              class="text-subtitle-2 text-amber-darken-3 font-weight-bold mt-1"
            >
              {{ reviewForm.rating }}/5 sao
            </div>
          </div>

          <v-textarea
            v-model="reviewForm.comment"
            label="Nhận xét của bạn về sản phẩm *"
            variant="outlined"
            rows="5"
            color="black"
            :error-messages="reviewError"
            @input="reviewError = ''"
            class="mb-1"
          ></v-textarea>

          <div class="d-flex justify-end text-caption mb-4">
            <span
              :class="
                wordCount > 500
                  ? 'text-grey font-weight-medium'
                  : 'text-success font-weight-bold'
              "
            >
              {{ wordCount }} / 500 từ
            </span>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-btn
            color="black"
            block
            size="large"
            variant="flat"
            class="font-weight-bold text-white"
            @click="submitReview"
            :loading="isSubmittingReview"
          >
            GỬI ĐÁNH GIÁ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmDialog ref="confirmDialog" />
    <ChatBox ref="chatBoxRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import OrderService from "@/services/order.service";
import ReviewService from "@/services/review.service";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

import { useRoute, useRouter } from "vue-router";
// IMPORT COMPONENT CHAT BẠN VỪA LÀM
import ChatBox from "@/components/Chat.vue";

const route = useRoute();
const router = useRouter();

const confirmDialog = ref(null);
// Khai báo một ref để tham chiếu đến ChatBox
const chatBoxRef = ref(null);

const orders = ref([]);
const isLoading = ref(true);
const activeTab = ref("all");

const dialogDetail = ref(false);
const selectedOrder = ref(null);

const dialogReview = ref(false);
const reviewItem = ref(null);
const currentOrderId = ref(null);
const isSubmittingReview = ref(false);
const reviewForm = ref({ rating: 5, comment: "" });
const reviewedItems = ref([]);
const reviewError = ref("");

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value || 0,
  );

const formatDate = (date) => new Date(date).toLocaleString("vi-VN");

const getStatusText = (status) => {
  const map = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    shipping: "Đang giao",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };
  return map[status] || status;
};

// Đã đổi thành class text thay vì màu background của v-chip để giống text của Shopee
const getStatusTextColor = (status) => {
  const map = {
    pending: "text-orange-darken-3",
    confirmed: "text-blue-darken-2",
    shipping: "text-primary",
    completed: "text-success",
    cancelled: "text-error",
  };
  return map[status] || "text-grey";
};

const filteredOrders = computed(() => {
  if (activeTab.value === "all") return orders.value;
  return orders.value.filter((o) => o.status === activeTab.value);
});

const fetchOrders = async () => {
  isLoading.value = true;
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    orders.value = await OrderService.getByUser(user.id);

    // -> GỌI HÀM KIỂM TRA MỞ DIALOG SAU KHI LOAD XONG DANH SÁCH ĐƠN HÀNG
    checkAndOpenOrderFromUrl();
  } catch (error) {
    console.error("Lỗi tải đơn hàng:", error);
  } finally {
    isLoading.value = false;
  }
};

// -> THÊM WATCH ĐỂ LẮNG NGHE KHI URL THAY ĐỔI QUERY ?open_order=...
watch(
  () => route.query.open_order,
  (newOrderId) => {
    if (newOrderId) {
      viewDetail(newOrderId);
    }
  }
);

watch(dialogDetail, (isOpen) => {
  // Nếu dialog vừa đóng (isOpen === false) và trên URL đang có tham số open_order
  if (!isOpen && route.query.open_order) {
    // Tách bỏ open_order ra khỏi danh sách query trên URL
    const { open_order, ...restQuery } = route.query;

    // Dùng router.replace để làm sạch URL về /orders (không tạo thêm lịch sử trang web)
    router.replace({
      path: route.path,
      query: restQuery,
    });
  }
});

const viewDetail = async (orderId) => {
  try {
    selectedOrder.value = await OrderService.get(orderId);
    dialogDetail.value = true;
  } catch (error) {
    confirmDialog.value.open(
      "Có lỗi xảy ra",
      "Không thể tải chi tiết đơn hàng lúc này.",
      { isAlert: true, iconColor: "red" },
    );
  }
};

// --- THÊM HÀM NÀY VÀO ĐÂY ---
const checkAndOpenOrderFromUrl = () => {
  const targetOrderId = route.query.open_order;
  if (targetOrderId) {
    viewDetail(targetOrderId);
  }
};

const cancelOrder = async (orderId) => {
  // Sử dụng await để đợi người dùng bấm "Đồng ý" hoặc "Hủy bỏ" từ ConfirmDialog
  const isConfirmed = await confirmDialog.value.open(
    "Xác nhận hủy đơn",
    `Bạn có chắc chắn muốn hủy đơn hàng #${orderId} không?`,
    {
      confirmText: "Đồng ý",
      cancelText: "Quay lại",
      confirmColor: "red-lighten-1",
      icon: "mdi-alert-circle-outline",
      iconColor: "amber-lighten-1",
    },
  );

  if (isConfirmed) {
    isLoading.value = true;
    try {
      await OrderService.cancel(orderId);

      // Hiển thị thông báo thành công dạng Alert (chỉ có 1 nút đóng)
      await confirmDialog.value.open(
        "Thành công",
        "Đã hủy đơn hàng thành công.",
        {
          isAlert: true,
          icon: "mdi-check-circle-outline",
          iconColor: "green-lighten-1",
        },
      );

      await fetchOrders();
    } catch (error) {
      console.error(error);

      // Hiển thị thông báo lỗi dạng Alert
      await confirmDialog.value.open(
        "Lỗi hệ thống",
        error.response?.data?.message || "Không thể hủy đơn hàng lúc này.",
        {
          isAlert: true,
          icon: "mdi-close-circle-outline",
          iconColor: "red-lighten-1",
        },
      );
    } finally {
      isLoading.value = false;
    }
  }
};
// Hàm tạo màu nền cho Chip Status
const getStatusColor = (status) => {
  const map = {
    pending: "orange-darken-3",
    confirmed: "blue-darken-2",
    shipping: "primary",
    completed: "success",
    cancelled: "error",
  };
  return map[status] || "grey";
};

// Hàm hiển thị dòng nhắc nhở trạng thái đơn hàng
const getStatusDescription = (status) => {
  const map = {
    pending:
      "Vui lòng chờ. Người bán đang kiểm tra và xác nhận đơn hàng của bạn.",
    confirmed: "Đơn hàng đã được xác nhận và đang trong quá trình đóng gói.",
    shipping:
      "Đơn hàng đã được giao cho đơn vị vận chuyển. Vui lòng chú ý điện thoại.",
    completed: "Đơn hàng đã được giao thành công. Cảm ơn bạn đã mua sắm!",
    cancelled:
      "Đơn hàng này đã bị hủy. Vui lòng liên hệ người bán nếu có thắc mắc.",
  };
  return map[status] || "Đang tải trạng thái...";
};

// Thêm computed đếm số từ
const wordCount = computed(() => {
  if (!reviewForm.value.comment) return 0;
  return reviewForm.value.comment
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
});

// Thêm hàm validation
const validateReviewContent = (text) => {
  if (!text || text.trim() === "") return "Vui lòng nhập nội dung đánh giá.";

  // 1. Kiểm tra độ dài từ (Tối đa 500)
  const count = wordCount.value;
  if (count > 500) {
    return `Đánh giá vượt quá giới hạn (Tối đa 500 từ).`;
  }

  // 2. Kiểm tra Số điện thoại cơ bản
  const phoneRegex = /(0[3|5|7|8|9])[0-9]{8}/g;
  if (phoneRegex.test(text)) {
    return "Hệ thống đã chặn: Không cung cấp Số điện thoại trong nội dung.";
  }

  // 3. Kiểm tra Link cơ bản
  const urlRegex =
    /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|vn|me|net)(\/[^\s]*)?)/gi;
  if (urlRegex.test(text)) {
    return "Hệ thống đã chặn: Không chèn các đường dẫn (Link) vào đánh giá.";
  }

  return null;
};

const openReviewDialog = (item, orderId) => {
  reviewItem.value = item;
  currentOrderId.value = orderId;
  reviewForm.value = { rating: 0, comment: "" }; // Thiết lập ban đầu không chọn sao nào (0 sao)
  reviewError.value = ""; // Ẩn hoàn toàn các thông báo lỗi ban đầu
  dialogReview.value = true;
};

const submitReview = async () => {
  // Chỉ thực hiện kiểm tra và báo lỗi sau khi nhấn nút Submit
  if (!reviewForm.value.rating || reviewForm.value.rating === 0) {
    reviewError.value = "Vui lòng click chọn số sao đánh giá cho sản phẩm.";
    return;
  }

  // Yêu cầu 1: Kiểm tra trạng thái đơn hàng (Phải hoàn tất mới được gọi)
  const targetOrder = orders.value.find((o) => o.id === currentOrderId.value);
  if (targetOrder?.status !== "completed") {
    confirmDialog.value.open(
      "Từ chối hành động",
      "Hệ thống chỉ chấp nhận đánh giá cho đơn hàng đã giao thành công.",
      { isAlert: true, iconColor: "red" },
    );
    return;
  }

  // Yêu cầu 2 & 3: Thực hiện scan kiểm duyệt nội dung văn bản dữ liệu thô
  const errorMsg = validateReviewContent(reviewForm.value.comment);
  if (errorMsg) {
    reviewError.value = errorMsg;
    return;
  }

  isSubmittingReview.value = true;
  try {
    const userStr = localStorage.getItem("user");
    const user = JSON.parse(userStr);

    // 1. Hứng kết quả trả về từ Backend vào biến 'response'
    const response = await ReviewService.create({
      product_id: reviewItem.value.product_id,
      order_id: currentOrderId.value,
      rating: reviewForm.value.rating,
      comment: reviewForm.value.comment,
    });

    // 2. Lấy thông báo động từ Backend (response.message) để hiển thị
    confirmDialog.value.open(
      "Thông báo",
      response.message || "Cảm ơn bạn đã gửi đánh giá chất lượng sản phẩm!",
      {
        isAlert: true,
      },
    );

    dialogReview.value = false;
    reviewedItems.value.push(reviewItem.value.product_id);
  } catch (error) {
    confirmDialog.value.open(
      "Thất bại",
      error.response?.data?.message ||
        "Không thể gửi phản hồi. Hệ thống ghi nhận bạn đã thực hiện đánh giá mục này rồi.",
      { isAlert: true, iconColor: "red" },
    );
  } finally {
    isSubmittingReview.value = false;
  }
};

const gotoChat = (orderId) => {
  if (chatBoxRef.value) {
    chatBoxRef.value.openChatWithOrder(orderId);
  }
};

onMounted(() => fetchOrders());
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}
.gap-2 {
  gap: 8px;
}
.min-w-100 {
  min-width: 100px;
}
/* Style để cắt text nếu tên sản phẩm quá dài giống Shopee */
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
