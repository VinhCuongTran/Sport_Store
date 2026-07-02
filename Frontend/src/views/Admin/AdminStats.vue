<template>
  <v-container
    fluid
    theme="light"
    class="fill-height d-flex flex-column align-center pa-4"
    style="background-color: #f4f6f8; min-height: 100vh"
  >
    <Loading :visible="isLoading" text="Đang tải dữ liệu thống kê..." />

    <v-card
      color="white"
      width="100%"
      max-width="1200"
      elevation="0"
      rounded="xl"
      class="pa-4"
      style="
        border: 1px solid rgba(99, 102, 241, 0.15);
        box-shadow: 0 4px 24px rgba(99, 102, 241, 0.1);
      "
    >
      <div class="d-flex justify-space-between align-center px-4 py-2 mb-4">
        <div class="d-flex align-center gap-3">
          <div>
            <h2
              class="text-h5 font-weight-bold text-indigo-darken-4"
              style="line-height: 1.2"
            >
              Thống kê Tổng quan
            </h2>
            <span class="text-caption text-indigo-darken-4"
              >Báo cáo doanh thu và tình trạng đơn hàng</span
            >
          </div>
        </div>
        <v-btn
          color="indigo-darken-4"
          prepend-icon="mdi-refresh"
          rounded="lg"
          elevation="0"
          variant="tonal"
          class="text-capitalize font-weight-semibold"
          @click="fetchStats"
        >
          Làm Mới
        </v-btn>
      </div>

      <!-- BỘ LỌC THỜI GIAN -->
      <v-row class="px-4 mb-4" align="center">
        <v-col cols="12" md="3">
          <v-select
            v-model="filterForm.period"
            :items="[
              { title: 'Theo Tháng', value: 'month' },
              { title: 'Theo Quý', value: 'quarter' },
              { title: 'Theo Năm', value: 'year' },
            ]"
            label="Bộ lọc"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="fetchStats"
          ></v-select>
        </v-col>

        <v-col v-if="filterForm.period === 'month'" cols="12" md="2">
          <v-select
            v-model="filterForm.month"
            :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"
            label="Tháng"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="fetchStats"
          ></v-select>
        </v-col>

        <v-col v-if="filterForm.period === 'quarter'" cols="12" md="2">
          <v-select
            v-model="filterForm.quarter"
            :items="[1, 2, 3, 4]"
            label="Quý"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="fetchStats"
          ></v-select>
        </v-col>

        <v-col cols="12" md="2">
          <v-select
            v-model="filterForm.year"
            :items="[2024, 2025, 2026, 2027]"
            label="Năm"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="fetchStats"
          ></v-select>
        </v-col>
      </v-row>

      <v-row class="px-2 mb-6" align="stretch">
        <!-- DOANH THU -->
        <v-col cols="12" md="3">
          <v-card
            theme="dark"
            elevation="4"
            rounded="xl"
            class="pa-5 h-100"
            style="
              background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
              border: none;
            "
          >
            <div class="d-flex align-center justify-space-between h-100">
              <div>
                <p class="text-subtitle-2 text-white opacity-80 mb-1">
                  Doanh thu
                </p>
                <h3 class="text-h4 font-weight-bold text-white mb-1">
                  {{ formatPrice(stats.revenue) }}
                </h3>
              </div>
              <v-avatar color="white" variant="tonal" size="64" rounded="circle">
                <v-icon size="32" color="white">mdi-currency-usd</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <!-- LỢI NHUẬN -->
        <v-col cols="12" md="3">
          <v-card
            theme="dark"
            elevation="4"
            rounded="xl"
            class="pa-5 h-100"
            style="
              background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
              border: none;
            "
          >
            <div class="d-flex align-center justify-space-between h-100">
              <div>
                <p class="text-subtitle-2 text-white opacity-80 mb-1">
                  Lợi nhuận
                </p>
                <h3 class="text-h4 font-weight-bold text-white mb-1">
                  {{ formatPrice(stats.profit) }}
                </h3>
              </div>
              <v-avatar color="white" variant="tonal" size="64" rounded="circle">
                <v-icon size="32" color="white">mdi-cash-register</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <!-- ĐƠN THÀNH CÔNG -->
        <v-col cols="12" md="3">
          <v-card
            theme="dark"
            elevation="4"
            rounded="xl"
            class="pa-5 cursor-pointer hover-card h-100"
            style="
              background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
              border: none;
            "
            @click="openOrderDialog('Thành Công', stats.successOrderList)"
          >
            <div class="d-flex align-center justify-space-between h-100">
              <div>
                <p class="text-subtitle-2 text-white opacity-80 mb-1">
                  Đơn thành công <span class="text-caption font-italic">(Xem chi tiết)</span>
                </p>
                <h3 class="text-h4 font-weight-bold text-white mb-1">
                  {{ stats.successOrders }}
                  <span class="text-body-1 font-weight-regular">đơn</span>
                </h3>
              </div>
              <v-avatar color="white" variant="tonal" size="64" rounded="circle">
                <v-icon size="32" color="white">mdi-package-variant-closed-check</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <!-- ĐƠN HỦY -->
        <v-col cols="12" md="3">
          <v-card
            theme="dark"
            elevation="4"
            rounded="xl"
            class="pa-5 cursor-pointer hover-card h-100"
            style="
              background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
              border: none;
            "
            @click="openOrderDialog('Đã Hủy', stats.cancelledOrderList)"
          >
            <div class="d-flex align-center justify-space-between h-100">
              <div>
                <p class="text-subtitle-2 text-white opacity-80 mb-1">
                  Đơn đã hủy <span class="text-caption font-italic">(Xem chi tiết)</span>
                </p>
                <h3 class="text-h4 font-weight-bold text-white mb-1">
                  {{ stats.cancelledOrders }}
                  <span class="text-body-1 font-weight-regular">đơn</span>
                </h3>
              </div>
              <v-avatar color="white" variant="tonal" size="64" rounded="circle">
                <v-icon size="32" color="white">mdi-package-variant-closed-remove</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- DIALOG HIỂN THỊ DANH SÁCH ĐƠN HÀNG (STYLE SHOPEE) -->
    <v-dialog v-model="dialogOrders" max-width="800px" scrollable>
      <v-card class="bg-grey-lighten-4 rounded-xl">
        <v-card-title
          class="bg-white pa-4 d-flex justify-space-between align-center elevation-1"
          style="z-index: 10"
        >
          <span class="font-weight-bold text-h6"
            >Danh sách đơn hàng {{ dialogTitle }}</span
          >
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="dialogOrders = false"
          ></v-btn>
        </v-card-title>

        <v-card-text class="pa-4" style="max-height: 75vh; overflow-y: auto">
          <div
            v-if="!selectedList || selectedList.length === 0"
            class="text-center py-10"
          >
            <v-icon size="60" color="grey">mdi-clipboard-text-outline</v-icon>
            <div class="mt-4 text-grey-darken-1">
              Không có đơn hàng nào trong khoảng thời gian này.
            </div>
          </div>

          <v-card
            v-for="order in selectedList"
            :key="order.id"
            class="mb-4 rounded-lg border elevation-0 overflow-hidden"
          >
            <!-- Header: Thông tin Người Mua -->
            <div
              class="d-flex justify-space-between align-center px-4 py-3 border-b bg-white"
            >
              <div class="d-flex align-center gap-2">
                <v-icon color="black" class="mr-1"
                  >mdi-account-circle-outline</v-icon
                >
                <span class="font-weight-bold text-body-1">{{
                  order.receiver_name
                }}</span>
                <span class="text-caption text-grey-darken-1"
                  >| {{ order.phone_number }}</span
                >
              </div>
              <span class="text-caption text-grey-darken-1"
                >Mã ĐH: #{{ order.id }}</span
              >
            </div>

            <!-- Danh sách sản phẩm trong đơn -->
            <div class="bg-white" v-if="order.items && order.items.length > 0">
              <div
                v-for="(item, index) in order.items"
                :key="index"
                class="d-flex py-4 px-4"
                :class="{ 'border-b': index !== order.items.length - 1 }"
              >
                <v-img
                  :src="item.image_url || 'https://placehold.co/100'"
                  width="80"
                  height="80"
                  cover
                  class="border bg-grey-lighten-4 flex-grow-0 mr-4 rounded-sm"
                ></v-img>

                <div class="flex-grow-1 d-flex flex-column py-1">
                  <div class="text-body-1 font-weight-medium">
                    {{ item.product_name }}
                  </div>
                  <div class="text-caption text-grey-darken-1 mt-1">
                    Phân loại: {{ item.color }}, {{ item.size }}
                  </div>
                  <div class="text-body-2 text-grey-darken-2 mt-auto">
                    x{{ item.quantity }}
                  </div>
                </div>

                <div class="d-flex align-center justify-end pl-4">
                  <div class="text-body-1">{{ formatPrice(item.price) }}</div>
                </div>
              </div>
            </div>

            <!-- Footer: Tổng Tiền & Địa chỉ -->
            <div class="bg-grey-lighten-5 px-4 py-3">
              <div
                class="text-caption text-grey-darken-2 mb-2 d-flex align-start"
              >
                <v-icon size="small" class="mr-1 mt-1"
                  >mdi-map-marker-outline</v-icon
                >
                <span>{{ order.shipping_address }}</span>
              </div>
              <div
                class="d-flex justify-space-between align-center border-t pt-2"
              >
                <span class="text-caption text-grey"
                  >Đặt lúc: {{ formatDate(order.created_at) }}</span
                >
                <div>
                  <span class="text-body-2 mr-2">Tổng thu:</span>
                  <span class="text-h6 font-weight-bold text-red-darken-2">{{
                    formatPrice(order.total_price)
                  }}</span>
                </div>
              </div>
            </div>
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Loading from "@/components/Loading.vue";
import api from "@/services/api.service";

const isLoading = ref(true);

// State filter
const filterForm = ref({
  period: "month",
  month: new Date().getMonth() + 1, // Lấy tháng hiện tại
  quarter: 1,
  year: new Date().getFullYear(), // Lấy năm hiện tại
});

const stats = ref({
  revenue: 0,
  profit: 0,
  successOrders: 0,
  cancelledOrders: 0,
  successOrderList: [],
  cancelledOrderList: [],
});

// Trạng thái Dialog
const dialogOrders = ref(false);
const dialogTitle = ref("");
const selectedList = ref([]);

const formatPrice = (val) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    val || 0,
  );

const formatDate = (date) => new Date(date).toLocaleString("vi-VN");

const openOrderDialog = (type, list) => {
  dialogTitle.value = type;
  selectedList.value = list;
  dialogOrders.value = true;
};

const fetchStats = async () => {
  isLoading.value = true;
  try {
    // Gọi API filtered truyền các query params
    const response = await api.get("/stats/filtered", {
      params: filterForm.value,
    });

    // Gán dữ liệu trả về từ API
    const data = response.data;
    stats.value = {
      revenue: data.stats.revenue,
      profit: data.stats.profit,
      successOrders: data.stats.successOrders,
      cancelledOrders: data.stats.cancelledOrders,
      successOrderList: data.successOrderList,
      cancelledOrderList: data.cancelledOrderList,
    };
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu thống kê:", error);
    alert("Không thể tải dữ liệu thống kê!");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
.opacity-70 {
  opacity: 0.7;
}
.opacity-80 {
  opacity: 0.8;
}
.hover-card:hover {
  transform: translateY(-2px);
  transition: 0.2s ease-in-out;
  cursor: pointer;
}
</style>
