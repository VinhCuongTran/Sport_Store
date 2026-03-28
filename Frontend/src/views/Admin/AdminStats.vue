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

      <div class="d-flex align-center px-4 py-2 mb-3 gap-3">
        <h2
          class="text-h6 font-weight-bold text-indigo-darken-4"
          style="line-height: 1.2"
        >
          Sản phẩm sắp hết hàng
        </h2>
      </div>

      <div class="px-2 pb-2" ref="tableContainer">
        <v-table hover class="rounded-xl overflow-hidden bg-white border">
          <thead>
            <tr
              style="
                background: linear-gradient(90deg, #f8f9fa 0%, #f1f3f5 100%);
              "
            >
              <th
                class="text-center font-weight-bold text-indigo-darken-3"
                style="width: 70px"
              >
                STT
              </th>
              <th class="text-left font-weight-bold text-indigo-darken-3">
                Tên sản phẩm
              </th>
              <th class="text-left font-weight-bold text-indigo-darken-3">
                Phân loại (Màu sắc - Kích cỡ)
              </th>
              <th
                class="text-center font-weight-bold text-indigo-darken-3"
                style="width: 120px"
              >
                Tồn kho
              </th>
              <th
                class="text-center font-weight-bold text-indigo-darken-3"
                style="width: 200px"
              >
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in visibleProducts"
              :key="index"
              class="table-row"
            >
              <td class="text-center">
                <v-chip
                  size="x-small"
                  color="indigo-lighten-4"
                  text-color="indigo-darken-4"
                  variant="flat"
                >
                  {{ index + 1 }}
                </v-chip>
              </td>
              <td>
                <span class="text-body-2 font-weight-bold text-black">{{
                  item.product_name
                }}</span>
              </td>
              <td>
                <span class="text-body-2 text-grey-darken-3"
                  >{{ item.color }} - {{ item.size }}</span
                >
              </td>
              <td class="text-center">
                <span class="text-h6 font-weight-bold text-red-darken-1">{{
                  item.stock
                }}</span>
              </td>
              <td class="text-center">
                <v-chip
                  size="small"
                  :color="item.stock === 0 ? 'error' : 'warning'"
                  variant="flat"
                  class="font-weight-medium"
                >
                  <v-icon start size="14">{{
                    item.stock === 0 ? "mdi-close-circle" : "mdi-alert"
                  }}</v-icon>
                  {{ item.stock === 0 ? "Hết hàng" : "Sắp hết hàng" }}
                </v-chip>
              </td>
            </tr>
            <tr v-if="stats.lowStockProducts?.length === 0">
              <td colspan="5" class="text-center py-10">
                <div class="d-flex flex-column align-center gap-2">
                  <v-icon size="48" color="green-darken-2"
                    >mdi-check-circle-outline</v-icon
                  >
                  <span class="text-body-1 font-weight-bold text-green-darken-2"
                    >Tuyệt vời!</span
                  >
                  <span class="text-body-2 text-medium-emphasis"
                    >Tất cả sản phẩm đều đang đủ hàng trong kho.</span
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>

        <div
          class="mt-4 mb-2 text-center"
          v-if="stats.lowStockProducts?.length > pageSize"
        >
          <v-btn
            v-if="displayCount < stats.lowStockProducts.length"
            variant="text"
            size="small"
            color="indigo-darken-4"
            class="text-none font-weight-bold"
            @click="showMore"
          >
            + Xem thêm ({{ stats.lowStockProducts.length - displayCount }} sản
            phẩm)
          </v-btn>
          <v-btn
            v-if="displayCount > pageSize"
            variant="text"
            size="small"
            color="grey-darken-2"
            class="text-none font-weight-bold ml-2"
            @click="showLess"
          >
            - Thu gọn
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, nextTick } from "vue";
import Loading from "@/components/Loading.vue";
import api from "@/services/api.service";

const isLoading = ref(true);
const stats = ref({
  revenue: 0,
  successOrders: 0,
  cancelledOrders: 0,
  lowStockProducts: [],
});

const tableContainer = ref(null);
const pageSize = ref(5);
const displayCount = ref(5);

const visibleProducts = computed(() => {
  return stats.value.lowStockProducts?.slice(0, displayCount.value) || [];
});

const calculatePageSize = () => {
  if (tableContainer.value) {
    const rect = tableContainer.value.getBoundingClientRect();
    const availableSpace = window.innerHeight - rect.top - 150;
    let calculatedRows = Math.floor(availableSpace / 55);
    pageSize.value = Math.max(3, calculatedRows);
    if (
      displayCount.value < pageSize.value ||
      displayCount.value === pageSize.value
    ) {
      displayCount.value = pageSize.value;
    }
  }
};

const showMore = () => {
  displayCount.value += pageSize.value;
};

const showLess = () => {
  displayCount.value = pageSize.value;
  if (tableContainer.value) {
    tableContainer.value.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
};

const formatPrice = (val) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    val || 0,
  );

const fetchStats = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/stats");
    stats.value = response.data;
    nextTick(() => {
      setTimeout(calculatePageSize, 100);
    });
  } catch (error) {
    console.error("Lỗi khi tải thống kê:", error);
    alert("Không thể tải dữ liệu thống kê!");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchStats();
  window.addEventListener("resize", calculatePageSize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", calculatePageSize);
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.opacity-70 {
  opacity: 0.7;
}
.opacity-80 {
  opacity: 0.8;
}
.border {
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.table-row {
  transition: background 0.15s;
}
.table-row:hover {
  background: rgba(99, 102, 241, 0.04) !important;
}
</style>
