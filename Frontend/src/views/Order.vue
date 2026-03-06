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

          <v-list lines="two" class="pa-0">
            <v-list-item class="pa-4">
              <v-list-item-title class="font-weight-bold"
                >Đơn hàng gửi đến: {{ order.receiver_name }}</v-list-item-title
              >
              <v-list-item-subtitle class="mt-1"
                >Địa chỉ: {{ order.shipping_address }}</v-list-item-subtitle
              >
              <v-list-item-subtitle
                >SĐT: {{ order.phone_number }} | PT:
                {{ order.payment_method }}</v-list-item-subtitle
              >
            </v-list-item>
          </v-list>

          <v-divider></v-divider>

          <div class="pa-4 d-flex justify-space-between align-center">
            <div>
              <span class="text-grey-darken-1 mr-2">Tổng tiền:</span>
              <span class="text-h6 font-weight-black text-red-darken-2">{{
                formatPrice(order.total_price)
              }}</span>
            </div>
            <div class="d-flex gap-2">
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
          class="bg-black text-white pa-4 d-flex justify-space-between"
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
            <v-list-item
              v-for="item in selectedOrder.items"
              :key="item.id"
              class="border-b mb-2 pb-2"
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import OrderService from "@/services/order.service";

const router = useRouter();
const orders = ref([]);
const isLoading = ref(true);
const activeTab = ref("all");

const dialogDetail = ref(false);
const selectedOrder = ref(null);

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

// Computed Lọc Đơn hàng theo Tab
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
    alert("Không thể tải chi tiết");
  }
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}
.gap-2 {
  gap: 8px;
}
</style>
