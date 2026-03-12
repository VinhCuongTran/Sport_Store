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
        class="text-center py-16 rounded-xl border elevation-0 bg-white"
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
        <v-card
          v-for="order in filteredOrders"
          :key="order.id"
          class="mb-4 rounded-xl border elevation-0"
        >
          <div
            class="d-flex justify-space-between align-center pa-4 border-b bg-grey-lighten-4"
          >
            <div class="font-weight-bold">
              Mã ĐH: #{{ order.id }}
              <span class="text-caption text-grey ml-2">{{
                formatDate(order.created_at)
              }}</span>
            </div>
            <v-chip
              :color="getStatusColor(order.status)"
              size="small"
              class="font-weight-bold text-uppercase"
            >
              {{ getStatusText(order.status) }}
            </v-chip>
          </div>

          <div
            class="pa-4 bg-white"
            v-if="order.items && order.items.length > 0"
          >
            <div
              v-for="item in order.items"
              :key="item.id"
              class="d-flex align-center py-3 border-b border-dashed"
            >
              <v-avatar
                rounded="0"
                size="70"
                class="bg-grey-lighten-4 mr-4 border"
              >
                <v-img
                  :src="item.image_url || 'https://placehold.co/100'"
                  cover
                ></v-img>
              </v-avatar>

              <div class="flex-grow-1 pr-4">
                <div class="font-weight-bold text-body-1">
                  {{ item.product_name }}
                </div>
                <div class="text-caption text-grey-darken-1 mt-1">
                  Phân loại: {{ item.color }}, {{ item.size }}
                  <span class="mx-2">|</span> Số lượng: x{{ item.quantity }}
                </div>
              </div>

              <div
                class="text-right d-flex flex-column align-end justify-center min-w-100"
              >
                <div class="font-weight-bold mb-2">
                  {{ formatPrice(item.price) }}
                </div>

                <v-btn
                  v-if="
                    order.status === 'completed' &&
                    !reviewedItems.includes(item.product_id)
                  "
                  size="small"
                  color="warning"
                  variant="outlined"
                  class="text-none font-weight-bold"
                  prepend-icon="mdi-star"
                  @click="openReviewDialog(item, order.id)"
                >
                  Đánh giá
                </v-btn>
                <v-chip
                  v-else-if="
                    order.status === 'completed' &&
                    reviewedItems.includes(item.product_id)
                  "
                  size="small"
                  color="success"
                  class="font-weight-bold"
                  variant="flat"
                >
                  <v-icon start icon="mdi-check-circle"></v-icon> Đã đánh giá
                </v-chip>
              </div>
            </div>
          </div>

          <v-divider></v-divider>

          <div
            class="pa-4 d-flex justify-space-between align-center bg-grey-lighten-5"
          >
            <div>
              <span class="text-grey-darken-1 mr-2">Tổng tiền:</span>
              <span class="text-h6 font-weight-black text-red-darken-2">{{
                formatPrice(order.total_price)
              }}</span>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                v-if="order.status === 'pending'"
                variant="outlined"
                color="error"
                @click="cancelOrder(order.id)"
              >Hủy Đơn</v-btn>

              <v-btn
                variant="outlined"
                color="black"
                @click="viewDetail(order.id)"
                >Xem Chi Tiết</v-btn
              >
              <v-btn
                v-if="order.status === 'completed'"
                color="black"
                to="/products"
                >Mua lại</v-btn
              >
            </div>
          </div>
        </v-card>
      </div>
    </v-container>

    <v-dialog v-model="dialogDetail" max-width="600px">
      <v-card class="rounded-xl" v-if="selectedOrder">
        <v-card-title
          class="bg-black text-white pa-4 d-flex justify-space-between align-center"
        >
          <span>Chi tiết đơn #{{ selectedOrder.id }}</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="dialogDetail = false"
          ></v-btn>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-list>
            <v-list-item class="pa-0 mb-4 bg-grey-lighten-4 pa-4 rounded-lg">
              <v-list-item-title class="font-weight-bold"
                >Gửi đến: {{ selectedOrder.receiver_name }}</v-list-item-title
              >
              <v-list-item-subtitle class="mt-1"
                >Địa chỉ:
                {{ selectedOrder.shipping_address }}</v-list-item-subtitle
              >
              <v-list-item-subtitle
                >SĐT: {{ selectedOrder.phone_number }} | PT:
                {{ selectedOrder.payment_method }}</v-list-item-subtitle
              >
            </v-list-item>

            <v-list-item
              v-for="item in selectedOrder.items"
              :key="item.id"
              class="border-b mb-2 pb-2 pa-0"
            >
              <v-list-item-title class="font-weight-bold">{{
                item.product_name
              }}</v-list-item-title>
              <v-list-item-subtitle
                >Phân loại: {{ item.color }} -
                {{ item.size }}</v-list-item-subtitle
              >
              <template v-slot:append>
                <div class="text-right">
                  <div>{{ formatPrice(item.price) }}</div>
                  <div class="text-caption">x{{ item.quantity }}</div>
                </div>
              </template>
            </v-list-item>
          </v-list>
          <div class="text-right mt-4">
            <p>Tạm tính: {{ formatPrice(selectedOrder.subtotal) }}</p>
            <p>Khuyến mãi: -{{ formatPrice(selectedOrder.discount_amount) }}</p>
            <h3 class="text-red">
              Tổng: {{ formatPrice(selectedOrder.total_price) }}
            </h3>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogReview" max-width="500px">
      <v-card class="rounded-xl">
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
              color="warning"
              active-color="warning"
              hover
              size="x-large"
            ></v-rating>
            <div class="text-caption text-grey mt-1">
              Chọn số sao để đánh giá
            </div>
          </div>

          <v-textarea
            v-model="reviewForm.comment"
            label="Nhận xét của bạn về sản phẩm (Tuỳ chọn)"
            variant="outlined"
            rows="4"
            hide-details
            color="black"
          ></v-textarea>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-btn
            color="black"
            block
            size="large"
            variant="flat"
            class="font-weight-bold"
            @click="submitReview"
            :loading="isSubmittingReview"
          >
            GỬI ĐÁNH GIÁ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmDialog ref="confirmDialog" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import OrderService from "@/services/order.service";
import ReviewService from "@/services/review.service";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

const router = useRouter();
const confirmDialog = ref(null);

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

const getStatusColor = (status) => {
  const map = {
    pending: "orange",
    confirmed: "info",
    shipping: "primary",
    completed: "success",
    cancelled: "error",
  };
  return map[status] || "grey";
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
  } catch (error) {
    console.error("Lỗi tải đơn hàng:", error);
  } finally {
    isLoading.value = false;
  }
};

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

const openReviewDialog = (item, orderId) => {
  reviewItem.value = item;
  currentOrderId.value = orderId;
  reviewForm.value = { rating: 5, comment: "" };
  dialogReview.value = true;
};

const submitReview = async () => {
  if (!reviewForm.value.rating) return;
  isSubmittingReview.value = true;
  try {
    const userStr = localStorage.getItem("user");
    const user = JSON.parse(userStr);

    await ReviewService.create({
      user_id: user.id,
      product_id: reviewItem.value.product_id,
      order_id: currentOrderId.value,
      rating: reviewForm.value.rating,
      comment: reviewForm.value.comment,
    });

    confirmDialog.value.open("Thành công", "Cảm ơn bạn đã đánh giá sản phẩm!", {
      isAlert: true,
    });
    dialogReview.value = false;
    reviewedItems.value.push(reviewItem.value.product_id);
  } catch (error) {
    confirmDialog.value.open(
      "Lỗi",
      "Không thể gửi đánh giá. Có thể bạn đã đánh giá rồi.",
      { isAlert: true, iconColor: "red" },
    );
  } finally {
    isSubmittingReview.value = false;
  }
};

const cancelOrder = async (orderId) => {
  const isConfirmed = confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId} không?`);
  
  if (isConfirmed) {
    isLoading.value = true;
    try {
      await OrderService.cancel(orderId);
      confirmDialog.value.open("Thành công", "Đã hủy đơn hàng.", {
        isAlert: true,
      });
      await fetchOrders();
    } catch (error) {
      console.error(error);
      confirmDialog.value.open(
        "Lỗi", 
        error.response?.data?.message || "Không thể hủy đơn hàng lúc này.", 
        { isAlert: true, iconColor: "red" }
      );
    } finally {
      isLoading.value = false;
    }
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
.border-dashed {
  border-bottom-style: dashed !important;
}
</style>
