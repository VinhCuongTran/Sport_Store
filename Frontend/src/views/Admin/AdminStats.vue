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

      <v-row class="px-2 mb-6">
        <v-col cols="12" md="4">
          <v-card
            theme="dark"
            elevation="4"
            rounded="xl"
            class="pa-5"
            style="
              background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
              border: none;
            "
          >
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-subtitle-2 text-white opacity-80 mb-1">
                  Tổng doanh thu
                </p>
                <h3 class="text-h4 font-weight-bold text-white mb-1">
                  {{ formatPrice(stats.revenue) }}
                </h3>
                <p class="text-caption text-white opacity-70 mb-0">
                  Đơn hoàn thành & đã thanh toán
                </p>
              </div>
              <v-avatar
                color="white"
                variant="tonal"
                size="64"
                rounded="circle"
              >
                <v-icon size="32" color="white">mdi-currency-usd</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card
            theme="dark"
            elevation="4"
            rounded="xl"
            class="pa-5"
            style="
              background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
              border: none;
            "
          >
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-subtitle-2 text-white opacity-80 mb-1">
                  Đơn thành công
                </p>
                <h3 class="text-h4 font-weight-bold text-white mb-1">
                  {{ stats.successOrders }}
                  <span class="text-body-1 font-weight-regular">đơn</span>
                </h3>
                <p class="text-caption text-white opacity-70 mb-0">
                  Đã giao đến khách
                </p>
              </div>
              <v-avatar
                color="white"
                variant="tonal"
                size="64"
                rounded="circle"
              >
                <v-icon size="32" color="white"
                  >mdi-package-variant-closed-check</v-icon
                >
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card
            theme="dark"
            elevation="4"
            rounded="xl"
            class="pa-5"
            style="
              background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
              border: none;
            "
          >
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-subtitle-2 text-white opacity-80 mb-1">
                  Đơn đã hủy
                </p>
                <h3 class="text-h4 font-weight-bold text-white mb-1">
                  {{ stats.cancelledOrders }}
                  <span class="text-body-1 font-weight-regular">đơn</span>
                </h3>
                <p class="text-caption text-white opacity-70 mb-0">
                  Khách hủy / bom hàng
                </p>
              </div>
              <v-avatar
                color="white"
                variant="tonal"
                size="64"
                rounded="circle"
              >
                <v-icon size="32" color="white"
                  >mdi-package-variant-closed-remove</v-icon
                >
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-divider class="mx-4 mb-6" color="grey-lighten-2"></v-divider>

      <div class="px-4 text-center text-subtitle-2 text-grey font-italic py-4">
        Hệ thống phân tích báo cáo nâng cao đang sẵn sàng để tích hợp các biểu
        đồ tiêu chí...
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Loading from "@/components/Loading.vue";
import api from "@/services/api.service";

const isLoading = ref(true);
const stats = ref({
  revenue: 0,
  successOrders: 0,
  cancelledOrders: 0,
});

const formatPrice = (val) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    val || 0,
  );

const fetchStats = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/stats");
    // Chỉ map các giá trị liên quan đến chỉ số tài chính, bỏ qua mảng lowStockProducts
    stats.value = {
      revenue: response.data.revenue,
      successOrders: response.data.successOrders,
      cancelledOrders: response.data.cancelledOrders,
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
</style>
