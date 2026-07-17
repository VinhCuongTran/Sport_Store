<template>
  <v-container
    fluid
    theme="light"
    class="fill-height d-flex flex-column align-center pa-4 pa-md-6 admin-stats-page"
  >
    <!-- ==========================================
         PHẦN 1: BIỂU ĐỒ SO SÁNH DOANH THU (ĐẦU TRANG)
         ========================================== -->
    <v-card
      color="white"
      class="pa-5 pa-md-6 mb-6 border shadow-sm rounded-xl w-100 max-w-1400 section-card"
      elevation="0"
    >
      <div
        class="d-flex justify-space-between align-center mb-4 flex-wrap gap-3 border-b pb-4"
      >
        <div class="d-flex align-center">
          <div class="header-accent mr-3"></div>
          <div>
            <h3
              class="text-h6 font-weight-bold text-indigo-darken-4 d-flex align-center"
            >
              Biểu Đồ So Sánh Doanh Thu
            </h3>
            <span class="text-caption text-grey-darken-1"
              >Lọc độc lập để so sánh doanh thu các mốc thời gian</span
            >
          </div>
        </div>

        <!-- BỘ LỌC RIÊNG CỦA BIỂU ĐỒ -->
        <div
          class="d-flex gap-2 align-center bg-grey-lighten-4 pa-2 rounded-lg flex-wrap filter-panel"
        >
          <v-select
            v-model="chartFilter.type"
            :items="[
              { title: 'Theo Tháng', value: 'month' },
              { title: 'Theo Quý', value: 'quarter' },
            ]"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            bg-color="white"
            style="width: 140px"
            @update:model-value="fetchChartData"
          ></v-select>
          <v-select
            v-model="chartFilter.year1"
            :items="[2024, 2025, 2026, 2027]"
            label="Năm chính"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            bg-color="white"
            style="width: 120px"
            @update:model-value="fetchChartData"
          ></v-select>
          <span class="text-body-2 font-weight-bold text-grey-darken-1 px-1"
            >VS</span
          >
          <v-select
            v-model="chartFilter.year2"
            :items="[
              { title: 'Không so sánh', value: null },
              2024,
              2025,
              2026,
              2027,
            ]"
            label="Năm so sánh"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            bg-color="white"
            style="width: 160px"
            @update:model-value="fetchChartData"
          ></v-select>
        </div>
      </div>

      <div class="position-relative">
        <Loading :visible="isChartLoading" text="Đang vẽ biểu đồ..." />
        <apexchart
          type="area"
          height="350"
          :options="chartOptions"
          :series="chartSeries"
        ></apexchart>
      </div>
    </v-card>

    <!-- ==========================================
         PHẦN 2: BÁO CÁO DOANH THU & ĐƠN HÀNG (GIỮA)
         ========================================== -->
    <v-card
      color="white"
      class="pa-5 pa-md-6 mb-6 border shadow-sm rounded-xl w-100 max-w-1400 section-card"
      elevation="0"
    >
      <div
        class="d-flex justify-space-between align-center mb-4 flex-wrap gap-3 border-b pb-4"
      >
        <div class="d-flex align-center">
          <div class="header-accent mr-3"></div>
          <div>
            <h3
              class="text-h6 font-weight-bold text-indigo-darken-4 d-flex align-center"
            >
              Báo Cáo Kinh Doanh
            </h3>
            <span class="text-caption text-grey-darken-1"
              >Thống kê chi tiết lợi nhuận và đơn hàng</span
            >
          </div>
        </div>

        <!-- BỘ LỌC RIÊNG CỦA BÁO CÁO -->
        <div
          class="d-flex gap-2 align-center bg-grey-lighten-4 pa-2 rounded-lg flex-wrap filter-panel"
        >
          <v-select
            v-model="overviewFilter.period"
            :items="[
              { title: 'Theo Tháng', value: 'month' },
              { title: 'Theo Quý', value: 'quarter' },
              { title: 'Theo Năm', value: 'year' },
            ]"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            bg-color="white"
            style="width: 140px"
            @update:model-value="fetchOverviewData"
          ></v-select>

          <v-select
            v-if="overviewFilter.period === 'month'"
            v-model="overviewFilter.month"
            :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"
            label="Tháng"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            bg-color="white"
            style="width: 100px"
            @update:model-value="fetchOverviewData"
          ></v-select>

          <v-select
            v-if="overviewFilter.period === 'quarter'"
            v-model="overviewFilter.quarter"
            :items="[1, 2, 3, 4]"
            label="Quý"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            bg-color="white"
            style="width: 100px"
            @update:model-value="fetchOverviewData"
          ></v-select>

          <v-select
            v-model="overviewFilter.year"
            :items="[2024, 2025, 2026, 2027]"
            label="Năm"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            bg-color="white"
            style="width: 110px"
            @update:model-value="fetchOverviewData"
          ></v-select>
        </div>
      </div>

      <div class="position-relative">
        <Loading :visible="isOverviewLoading" text="Đang tính toán..." />
        <v-row align="stretch">
          <v-col cols="12" sm="6" md="4" lg="2" class="d-flex flex-column">
            <v-card
              elevation="0"
              rounded="xl"
              class="pa-4 flex-grow-1 stat-card card-gradient-1"
              style="background: linear-gradient(135deg, #3f51b5, #283593)"
            >
              <p class="text-caption text-white opacity-80 mb-1">Doanh thu</p>
              <h3 class="text-h6 font-weight-black text-white">
                {{ formatPrice(stats.revenue) }}
              </h3>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="4" lg="2" class="d-flex flex-column">
            <v-card
              elevation="0"
              rounded="xl"
              class="pa-4 flex-grow-1 stat-card card-gradient-2"
              style="background: linear-gradient(135deg, #00897b, #00695c)"
            >
              <p class="text-caption text-white opacity-80 mb-1">Lợi nhuận</p>
              <h3 class="text-h6 font-weight-black text-white">
                {{ formatPrice(stats.profit) }}
              </h3>
            </v-card>
          </v-col>

          <!-- Thẻ Đơn thành công -->
          <v-col cols="12" sm="6" md="4" lg="2" class="d-flex flex-column">
            <v-card
              elevation="0"
              rounded="xl"
              class="pa-4 flex-grow-1 cursor-pointer hover-card stat-card card-gradient-3"
              style="background: linear-gradient(135deg, #43a047, #2e7d32)"
              @click="openOrderDialog('Thành Công', stats.successOrderList)"
            >
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-subtitle-2 text-white opacity-90">Đơn thành công</span>
                <span class="text-caption text-white detail-text font-weight-bold">CHI TIẾT</span>
              </div>
              <h3 class="text-h4 font-weight-black text-white mt-1">
                {{ stats.successOrders }}
              </h3>
            </v-card>
          </v-col>

          <!-- Thẻ Hóa đơn chưa thanh toán -->
          <v-col cols="12" sm="6" md="4" lg="3" class="d-flex flex-column">
            <v-card
              elevation="0"
              rounded="xl"
              class="pa-4 flex-grow-1 cursor-pointer hover-card stat-card card-gradient-4"
              style="background: linear-gradient(135deg, #fb8c00, #ef6c00)"
              @click="openOrderDialog('Chưa Thanh Toán', stats.unpaidOrderList)"
            >
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-subtitle-2 text-white opacity-90">Chưa thanh toán</span>
                <span class="text-caption text-white detail-text font-weight-bold">CHI TIẾT</span>
              </div>
              <h3 class="text-h4 font-weight-black text-white mt-1">
                {{ stats.unpaidOrders }}
              </h3>
            </v-card>
          </v-col>

          <!-- Thẻ Đơn đã hủy -->
          <v-col cols="12" sm="6" md="4" lg="3" class="d-flex flex-column">
            <v-card
              elevation="0"
              rounded="xl"
              class="pa-4 flex-grow-1 cursor-pointer hover-card stat-card card-gradient-5"
              style="background: linear-gradient(135deg, #e53935, #c62828)"
              @click="openOrderDialog('Đã Hủy', stats.cancelledOrderList)"
            >
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-subtitle-2 text-white opacity-90">Đơn đã hủy</span>
                <span class="text-caption text-white detail-text font-weight-bold">CHI TIẾT</span>
              </div>
              <h3 class="text-h4 font-weight-black text-white mt-1">
                {{ stats.cancelledOrders }}
              </h3>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-card>

    <!-- ==========================================
         PHẦN 3: XẾP HẠNG SẢN PHẨM (CUỐI TRANG)
         ========================================== -->
    <v-card
      color="white"
      class="pa-5 pa-md-6 border shadow-sm rounded-xl w-100 max-w-1400 section-card"
      elevation="0"
    >
      <div
        class="d-flex justify-space-between align-center mb-4 flex-wrap gap-3 border-b pb-4"
      >
        <div class="d-flex align-center">
          <div class="header-accent mr-3"></div>
          <div>
            <h3
              class="text-h6 font-weight-bold text-indigo-darken-4 d-flex align-center"
            >
              Bảng Xếp Hạng Sản Phẩm
            </h3>
            <span class="text-caption text-grey-darken-1"
              >Lọc xem sản phẩm bán chạy theo thời điểm cụ thể</span
            >
          </div>
        </div>

        <!-- BỘ LỌC RIÊNG CỦA SẢN PHẨM -->
        <div
          class="d-flex gap-2 align-center bg-grey-lighten-4 pa-2 rounded-lg flex-wrap filter-panel"
        >
          <v-select
            v-model="productFilter.period"
            :items="[
              { title: 'Theo Tháng', value: 'month' },
              { title: 'Theo Quý', value: 'quarter' },
              { title: 'Theo Năm', value: 'year' },
            ]"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            bg-color="white"
            style="width: 140px"
            @update:model-value="fetchTopProducts"
          ></v-select>

          <v-select
            v-if="productFilter.period === 'month'"
            v-model="productFilter.month"
            :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"
            label="Tháng"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            bg-color="white"
            style="width: 100px"
            @update:model-value="fetchTopProducts"
          ></v-select>

          <v-select
            v-if="productFilter.period === 'quarter'"
            v-model="productFilter.quarter"
            :items="[1, 2, 3, 4]"
            label="Quý"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            bg-color="white"
            style="width: 100px"
            @update:model-value="fetchTopProducts"
          ></v-select>

          <v-select
            v-model="productFilter.year"
            :items="[2024, 2025, 2026, 2027]"
            label="Năm"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            bg-color="white"
            style="width: 110px"
            @update:model-value="fetchTopProducts"
          ></v-select>
        </div>
      </div>

      <div class="position-relative">
        <Loading :visible="isProductLoading" text="Đang tải danh sách..." />
        <v-row>
          <!-- Cột Sản phẩm bán chạy -->
          <v-col cols="12" md="6">
            <v-card
              color="white"
              variant="outlined"
              class="rounded-lg overflow-hidden"
              elevation="0"
            >
              <v-card-title
                class="bg-indigo-lighten-5 text-indigo-darken-4 font-weight-bold d-flex align-center"
              >
                Bán Chạy Nhất
              </v-card-title>
              <v-list
                lines="two"
                class="pa-2 bg-white"
                style="max-height: 400px; overflow-y: auto"
              >
                <v-list-item
                  v-for="(item, i) in topProducts.bestSellers"
                  :key="item.id"
                  class="px-2 rounded-lg product-row"
                >
                  <template v-slot:prepend>
                    <div class="rank-badge mr-3" :class="'rank-' + (i + 1)">
                      {{ i + 1 }}
                    </div>
                    <v-avatar
                      rounded="lg"
                      size="48"
                      color="grey-lighten-3"
                      class="border"
                    >
                      <v-img
                        :src="item.thumbnail || 'https://placehold.co/100'"
                        cover
                      ></v-img>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-body-2">{{
                    item.name
                  }}</v-list-item-title>
                  <v-list-item-subtitle
                    class="text-caption text-green-darken-3 font-weight-bold mt-1"
                  >
                    Đã bán: {{ item.total_sold }} cái
                  </v-list-item-subtitle>
                </v-list-item>
                <div
                  v-if="!topProducts.bestSellers.length"
                  class="text-center text-grey py-6"
                >
                  <v-icon size="36" color="grey-lighten-1"
                    >mdi-chart-line-variant</v-icon
                  >
                  <div class="mt-2 text-caption">Chưa có dữ liệu bán hàng.</div>
                </div>
              </v-list>
            </v-card>
          </v-col>

          <!-- Cột Sản phẩm HOT (Lượt xem) -->
          <v-col cols="12" md="6">
            <v-card
              color="white"
              variant="outlined"
              class="rounded-lg overflow-hidden"
              elevation="0"
            >
              <v-card-title
                class="bg-red-lighten-5 text-red-darken-4 font-weight-bold d-flex align-center"
              > Xem Nhiều Nhất
              </v-card-title>
              <v-list
                lines="two"
                class="pa-2 bg-white"
                style="max-height: 400px; overflow-y: auto"
              >
                <v-list-item
                  v-for="(item, i) in topProducts.mostViewed"
                  :key="item.id"
                  class="px-2 rounded-lg product-row"
                >
                  <template v-slot:prepend>
                    <div class="rank-badge mr-3" :class="'rank-' + (i + 1)">
                      {{ i + 1 }}
                    </div>
                    <v-avatar
                      rounded="lg"
                      size="48"
                      color="grey-lighten-3"
                      class="border"
                    >
                      <v-img
                        :src="item.thumbnail || 'https://placehold.co/100'"
                        cover
                      ></v-img>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-body-2">{{
                    item.name
                  }}</v-list-item-title>
                  <v-list-item-subtitle
                    class="text-caption text-blue-darken-3 font-weight-bold mt-1"
                  >
                    Lượt xem: {{ item.views || 0 }} views
                  </v-list-item-subtitle>
                </v-list-item>
                <div
                  v-if="!topProducts.mostViewed.length"
                  class="text-center text-grey py-6"
                >
                  <v-icon size="36" color="grey-lighten-1"
                    >mdi-eye-off-outline</v-icon
                  >
                  <div class="mt-2 text-caption">Chưa có dữ liệu lượt xem.</div>
                </div>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-card>

    <!-- DIALOG HIỂN THỊ DANH SÁCH ĐƠN HÀNG (DÙNG CHUNG) -->
    <v-dialog v-model="dialogOrders" max-width="800px" scrollable>
      <v-card color="white" class="bg-grey-lighten-4 rounded-xl">
        <v-card-title
          class="bg-white pa-4 d-flex justify-space-between align-center elevation-1"
          style="z-index: 10"
        >
          <span class="font-weight-bold text-h6 d-flex align-center">
            <v-icon color="indigo-darken-3" class="mr-2"
              >mdi-format-list-bulleted</v-icon
            >
            Danh sách đơn hàng {{ dialogTitle }}
          </span>
          <v-btn
            icon="mdi-close"
            variant="text"
            density="comfortable"
            @click="dialogOrders = false"
          ></v-btn>
        </v-card-title>
        <v-card-text class="pa-4" style="max-height: 75vh; overflow-y: auto">
          <div
            v-if="!selectedList || selectedList.length === 0"
            class="text-center py-10"
          >
            <v-icon size="60" color="grey-lighten-1"
              >mdi-clipboard-text-outline</v-icon
            >
            <div class="mt-4 text-grey-darken-1">Không có đơn hàng nào.</div>
          </div>
          <v-card
            v-for="order in selectedList"
            :key="order.id"
            color="white"
            class="mb-4 rounded-lg border elevation-0 overflow-hidden order-card"
          >
            <div
              class="d-flex justify-space-between align-center px-4 py-3 border-b bg-white"
            >
              <div class="d-flex align-center gap-2">
                <v-icon color="indigo-darken-3" class="mr-1"
                  >mdi-account-circle-outline</v-icon
                >
                <span class="font-weight-bold text-body-1">{{
                  order.receiver_name
                }}</span>
                <span class="text-caption text-grey-darken-1"
                  >| {{ order.phone_number }}</span
                >
              </div>
              <v-chip size="small" variant="tonal" color="indigo-darken-3"
                >#{{ order.id }}</v-chip
              >
            </div>
            <div class="bg-white" v-if="order.items && order.items.length > 0">
              <div
                v-for="(item, index) in order.items"
                :key="index"
                class="d-flex py-4 px-4"
                :class="{ 'border-b': index !== order.items.length - 1 }"
              >
                <v-img
                  :src="item.image_url || 'https://placehold.co/100'"
                  width="60"
                  height="60"
                  cover
                  class="border bg-grey-lighten-4 flex-grow-0 mr-4 rounded-lg"
                ></v-img>
                <div class="flex-grow-1 d-flex flex-column py-1">
                  <div class="text-body-2 font-weight-medium">
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
                  <div class="text-body-2 font-weight-bold">
                    {{ formatPrice(item.price) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-grey-lighten-5 px-4 py-3">
              <div
                class="d-flex justify-space-between align-center border-t pt-2"
              >
                <span class="text-caption text-grey"
                  >Đặt lúc: {{ formatDate(order.created_at) }}</span
                >
                <div>
                  <span class="text-body-2 mr-2">Tổng thu:</span>
                  <span
                    class="text-subtitle-1 font-weight-bold text-red-darken-2"
                    >{{ formatPrice(order.total_price) }}</span
                  >
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
import VueApexCharts from "vue3-apexcharts";
import Loading from "@/components/Loading.vue";
import api from "@/services/api.service";

// Trạng thái Loading riêng biệt để UI mượt mà hơn
const isChartLoading = ref(true);
const isOverviewLoading = ref(true);
const isProductLoading = ref(true);

// ================= 1. STATE BỘ LỌC ĐỘC LẬP =================
const currentYear = new Date().getFullYear(); // Hoặc set fix 2026

const chartFilter = ref({
  type: "month",
  year1: currentYear,
  year2: null,
});

const overviewFilter = ref({
  period: "month",
  month: new Date().getMonth() + 1,
  quarter: 1,
  year: currentYear,
});

const productFilter = ref({
  period: "month",
  month: new Date().getMonth() + 1,
  quarter: 1,
  year: currentYear,
});

// ================= 2. DATA STATES =================
const chartSeries = ref([]);
const chartOptions = ref({
  chart: {
    fontFamily: "Inter, sans-serif",
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  colors: ["#3f51b5", "#00bcd4"],
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 3 },
  xaxis: { categories: [] },
  yaxis: {
    labels: {
      formatter: (value) =>
        value >= 1000000 ? (value / 1000000).toFixed(1) + "Tr" : value,
    },
  },
  tooltip: { y: { formatter: (val) => formatPrice(val) } },
  legend: { position: "top", horizontalAlign: "right" },
});

const stats = ref({
  revenue: 0,
  profit: 0,
  successOrders: 0,
  cancelledOrders: 0,
  unpaidOrders: 0,
  successOrderList: [],
  cancelledOrderList: [],
  unpaidOrderList: [],
});

const topProducts = ref({ bestSellers: [], mostViewed: [] });

// Data cho Dialog
const dialogOrders = ref(false);
const dialogTitle = ref("");
const selectedList = ref([]);

// ================= HÀM TIỆN ÍCH =================
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

// ================= HÀM GỌI API ĐỘC LẬP =================
const fetchChartData = async () => {
  isChartLoading.value = true;
  try {
    const res = await api.get("/stats/chart-revenue", {
      params: chartFilter.value,
    });
    const { dataYear1, dataYear2 } = res.data;

    const maxPeriod = chartFilter.value.type === "month" ? 12 : 4;
    const categories = Array.from({ length: maxPeriod }, (_, i) =>
      chartFilter.value.type === "month" ? `Tháng ${i + 1}` : `Quý ${i + 1}`,
    );

    const seriesData1 = Array(maxPeriod).fill(0);
    dataYear1.forEach((item) => {
      seriesData1[item.period - 1] = item.revenue;
    });
    const newSeries = [
      { name: `Năm ${chartFilter.value.year1}`, data: seriesData1 },
    ];

    if (chartFilter.value.year2) {
      const seriesData2 = Array(maxPeriod).fill(0);
      dataYear2.forEach((item) => {
        seriesData2[item.period - 1] = item.revenue;
      });
      newSeries.push({
        name: `Năm ${chartFilter.value.year2}`,
        data: seriesData2,
      });
    }

    chartOptions.value = { ...chartOptions.value, xaxis: { categories } };
    chartSeries.value = newSeries;
  } catch (error) {
    console.error("Lỗi vẽ biểu đồ", error);
  } finally {
    isChartLoading.value = false;
  }
};

const fetchOverviewData = async () => {
  isOverviewLoading.value = true;
  try {
    const res = await api.get("/stats/filtered", {
      params: overviewFilter.value,
    });
    stats.value = {
      ...res.data.stats,
      successOrderList: res.data.successOrderList,
      cancelledOrderList: res.data.cancelledOrderList,
      unpaidOrderList: res.data.unpaidOrderList,
    };
  } catch (error) {
    console.error("Lỗi tổng quan", error);
  } finally {
    isOverviewLoading.value = false;
  }
};

const fetchTopProducts = async () => {
  isProductLoading.value = true;
  try {
    const res = await api.get("/stats/top-products", {
      params: productFilter.value,
    });
    topProducts.value = {
      bestSellers: res.data.bestSellers,
      mostViewed: res.data.mostViewed,
    };
  } catch (error) {
    console.error("Lỗi xếp hạng SP", error);
  } finally {
    isProductLoading.value = false;
  }
};

onMounted(() => {
  fetchChartData();
  fetchOverviewData();
  fetchTopProducts();
});
</script>

<script>
export default {
  components: { apexchart: VueApexCharts },
};
</script>

<style scoped>
/* ================= NỀN TRANG ================= */
.admin-stats-page {
  background-color: #f4f6f8;
  background-image: radial-gradient(
    circle at top right,
    rgba(63, 81, 181, 0.06),
    transparent 45%
  );
  min-height: 100vh;
  font-family: "Inter", sans-serif;
}

/* ================= TIỆN ÍCH KHOẢNG CÁCH ================= */
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.opacity-50 {
  opacity: 0.5;
}
.opacity-80 {
  opacity: 0.8;
}
.max-w-1400 {
  max-width: 1400px;
}

/* ================= KHUNG MỤC (SECTION CARD) ================= */
.section-card {
  background-color: #ffffff !important;
}
.header-accent {
  width: 5px;
  height: 32px;
  border-radius: 4px;
  background: linear-gradient(180deg, #3f51b5, #7986cb);
}
.filter-panel :deep(.v-field) {
  border-radius: 10px;
}

/* ================= THẺ KPI (BẮT BUỘC NỀN GRADIENT, KHÔNG BAO GIỜ ĐEN) ================= */
.stat-card {
  position: relative;
  overflow: hidden;
  border: none;
  color: #fff;
  box-shadow: 0 10px 24px -12px rgba(0, 0, 0, 0.35);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}
.stat-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    160deg,
    rgba(255, 255, 255, 0.16),
    rgba(255, 255, 255, 0) 55%
  );
  pointer-events: none;
}
.stat-icon-bg {
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.16);
  border-radius: 10px;
  padding: 6px;
  margin-bottom: 14px;
}
.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 28px -12px rgba(0, 0, 0, 0.4);
}

/* Gradient được gán lại ở đây với !important để không bao giờ bị Vuetify
   ghi đè thành màu nền tối (surface) mặc định gây ra hiện tượng "nền đen" */
.card-gradient-1 {
  background: linear-gradient(135deg, #3f51b5, #283593) !important;
}
.card-gradient-2 {
  background: linear-gradient(135deg, #00897b, #00695c) !important;
}
.card-gradient-3 {
  background: linear-gradient(135deg, #43a047, #2e7d32) !important;
}
.card-gradient-4 {
  background: linear-gradient(135deg, #fb8c00, #ef6c00) !important;
}
.card-gradient-5 {
  background: linear-gradient(135deg, #e53935, #c62828) !important;
}

/* ================= DANH SÁCH XẾP HẠNG SẢN PHẨM ================= */
.product-row {
  transition: background-color 0.2s ease;
}
.product-row:not(:last-child) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.product-row:hover {
  background-color: rgba(63, 81, 181, 0.05);
}

.rank-badge {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  font-size: 12px;
  background: #f5f5f5;
  color: #757575;
}
.rank-1 {
  background: linear-gradient(135deg, #ffd54f, #ff8f00);
  color: #fff;
} /* Vàng */
.rank-2 {
  background: linear-gradient(135deg, #cfd8dc, #90a4ae);
  color: #fff;
} /* Bạc */
.rank-3 {
  background: linear-gradient(135deg, #d7a679, #a1653f);
  color: #fff;
} /* Đồng */

/* ================= DIALOG ĐƠN HÀNG ================= */
.order-card {
  background-color: #ffffff !important;
  transition: box-shadow 0.2s ease;
}
.order-card:hover {
  box-shadow: 0 6px 16px -8px rgba(0, 0, 0, 0.25);
}
</style>
