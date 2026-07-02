<template>
  <v-container
    fluid
    theme="light"
    class="fill-height d-flex flex-column align-center pa-6"
    style="background-color: #f4f6f8; min-height: 100vh"
  >
    <div
      class="d-flex justify-space-between align-center w-100 mb-6 flex-wrap gap-4"
    >
      <div>
        <h2
          class="text-h5 font-weight-bold text-red-darken-4"
          style="line-height: 1.2"
        >
          <v-icon color="red-darken-4" class="mr-2">mdi-alert-decagram</v-icon>
          Sản phẩm sắp hết hàng
        </h2>
        <span class="text-caption text-grey-darken-2"
          >Danh sách các biến thể sản phẩm có số lượng tồn kho thấp</span
        >
      </div>

      <div class="d-flex align-center">
        <v-text-field
          v-model="searchKeyword"
          prepend-inner-icon="mdi-magnify"
          label="Tìm kiếm sản phẩm..."
          variant="outlined"
          density="compact"
          bg-color="white"
          hide-details
          class="mr-4 rounded-lg"
          style="min-width: 250px"
        ></v-text-field>

        <v-btn
          color="green-darken-3"
          prepend-icon="mdi-file-excel"
          rounded="lg"
          variant="elevated"
          class="text-capitalize mr-3"
          @click="exportToExcel"
          :disabled="lowStockItems.length === 0"
        >
          Xuất báo cáo
        </v-btn>

        <v-btn
          color="red-darken-4"
          prepend-icon="mdi-refresh"
          rounded="lg"
          variant="tonal"
          class="text-capitalize"
          @click="fetchLowStock"
          :loading="isLoading"
        >
          Làm Mới
        </v-btn>
      </div>
    </div>

    <v-card
      color="white"
      width="100%"
      elevation="0"
      rounded="xl"
      class="pa-4"
      style="
        border: 1px solid rgba(211, 47, 47, 0.15);
        box-shadow: 0 4px 24px rgba(211, 47, 47, 0.1);
      "
    >
      <v-data-table
        :headers="headers"
        :items="lowStockItems"
        :search="searchKeyword"
        :loading="isLoading"
        hover
        class="bg-white rounded-lg custom-table"
        no-data-text="Tuyệt vời! Hiện không có sản phẩm nào sắp hết hàng."
      >
        <template v-slot:item.index="{ index }">
          <span class="font-weight-medium text-grey-darken-1">{{
            index + 1
          }}</span>
        </template>
        <template v-slot:item.product_name="{ item }">
          <span class="font-weight-bold text-indigo-darken-4">{{
            item.product_name
          }}</span>
        </template>
        <template v-slot:item.variant="{ item }">
          <v-chip
            size="small"
            color="blue-grey"
            variant="outlined"
            class="mr-1"
            >{{ item.color || "N/A" }}</v-chip
          >
          <v-chip size="small" color="blue-grey" variant="outlined">{{
            item.size || "N/A"
          }}</v-chip>
        </template>
        <template v-slot:item.stock="{ item }">
          <v-chip
            size="small"
            :color="item.stock === 0 ? 'red-darken-4' : 'amber-darken-4'"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.stock }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "vue-toastification";
import api from "@/services/api.service";
import * as XLSX from "xlsx"; // Import thư viện xuất Excel

const toast = useToast();
const isLoading = ref(false);
const lowStockItems = ref([]);
const searchKeyword = ref("");

// Đã gỡ bỏ cột "Thao tác"
const headers = [
  {
    title: "STT",
    key: "index",
    align: "center",
    sortable: false,
    width: "70px",
  },
  {
    title: "Tên Sản phẩm",
    key: "product_name",
    align: "start",
    sortable: true,
  },
  { title: "Phân loại", key: "variant", align: "start", sortable: false },
  {
    title: "Tồn kho",
    key: "stock",
    align: "center",
    sortable: true,
    width: "150px",
  },
];

const fetchLowStock = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/stats");
    lowStockItems.value = response.data.lowStockProducts || [];
  } catch (error) {
    toast.error("Không thể tải dữ liệu tồn kho.");
  } finally {
    isLoading.value = false;
  }
};

// Hàm xử lý xuất file Excel
const exportToExcel = () => {
  if (lowStockItems.value.length === 0) {
    toast.warning("Không có dữ liệu để xuất!");
    return;
  }

  // 1. Chuyển đổi dữ liệu thô thành định dạng cột rõ ràng cho Excel
  const excelData = lowStockItems.value.map((item, index) => ({
    STT: index + 1,
    "Tên Sản phẩm": item.product_name,
    "Màu sắc": item.color || "N/A",
    "Kích cỡ": item.size || "N/A",
    "Tồn kho hiện tại": item.stock,
  }));

  // 2. Tạo một Worksheet mới từ dữ liệu
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // 3. Tùy chỉnh độ rộng của các cột cho đẹp mắt
  const colWidths = [
    { wch: 6 }, // STT
    { wch: 45 }, // Tên Sản phẩm
    { wch: 15 }, // Màu sắc
    { wch: 10 }, // Kích cỡ
    { wch: 18 }, // Tồn kho
  ];
  worksheet["!cols"] = colWidths;

  // 4. Khởi tạo một Workbook (File Excel) và gắn sheet vào
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sản phẩm sắp hết");

  // 5. Đặt tên file kèm theo ngày tháng hiện tại
  const today = new Date();
  const dateString = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
  const fileName = `Bao_Cao_Sap_Het_Hang_${dateString}.xlsx`;

  // 6. Kích hoạt tải xuống
  XLSX.writeFile(workbook, fileName);
  toast.success("Tải báo cáo Excel thành công!");
};

onMounted(() => fetchLowStock());
</script>

<style scoped>
:deep(.custom-table th) {
  background-color: #ffffff !important;
  color: #333 !important;
}
:deep(.custom-table th:hover) {
  background-color: #f1f5f9 !important;
  transition: background-color 0.2s;
}
:deep(.v-data-table__tr:hover td) {
  background-color: #f8fafc !important;
}
</style>
