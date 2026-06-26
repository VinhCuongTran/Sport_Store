<template>
  <v-container fluid theme="light" class="fill-height d-flex flex-column align-center pa-6" style="background-color: #f4f6f8; min-height: 100vh">
    <div class="d-flex justify-space-between align-center w-100 mb-6 flex-wrap gap-4">
      <div>
        <h2 class="text-h5 font-weight-bold text-indigo-darken-4" style="line-height: 1.2">
          <v-icon color="indigo-darken-4" class="mr-2">mdi-history</v-icon>
          Lịch sử Nhập / Xuất Kho
        </h2>
        <span class="text-caption text-grey-darken-2">Theo dõi chi tiết luồng biến động tồn kho và giá nhập</span>
      </div>

      <div class="d-flex align-center gap-3">
        <v-select
          v-model="filterType"
          :items="[{ title: 'Tất cả', value: 'all' }, { title: 'Nhập kho', value: 'import' }, { title: 'Xuất kho', value: 'export' }]"
          item-title="title"
          item-value="value"
          variant="outlined"
          density="compact"
          bg-color="white"
          hide-details
          style="width: 150px"
        ></v-select>

        <v-text-field
          v-model="searchKeyword"
          prepend-inner-icon="mdi-magnify"
          label="Tìm sản phẩm..."
          variant="outlined"
          density="compact"
          bg-color="white"
          hide-details
          class="rounded-lg"
          style="width: 250px"
        ></v-text-field>

        <v-btn color="indigo-darken-4" prepend-icon="mdi-refresh" rounded="lg" variant="tonal" class="text-capitalize" @click="fetchLogs" :loading="isLoading">
          Làm Mới
        </v-btn>
      </div>
    </div>

    <v-card color="white" width="100%" elevation="0" rounded="xl" class="pa-4" style="border: 1px solid rgba(26, 35, 126, 0.15); box-shadow: 0 4px 24px rgba(26, 35, 126, 0.08);">
      <v-data-table :headers="headers" :items="filteredLogs" :search="searchKeyword" :loading="isLoading" hover class="bg-white rounded-lg custom-table" no-data-text="Chưa có dữ liệu lịch sử nào.">
        <template v-slot:item.index="{ index }">
          <span class="font-weight-medium text-grey-darken-1">{{ index + 1 }}</span>
        </template>
        
        <template v-slot:item.created_at="{ item }">
          <span class="text-body-2">{{ formatDate(item.created_at) }}</span>
        </template>

        <template v-slot:item.product_name="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-bold text-indigo-darken-4">{{ item.product_name || 'Không xác định' }}</span>
            <div class="mt-1">
              <v-chip size="x-small" color="blue-grey" variant="outlined" class="mr-1">{{ item.color || "N/A" }}</v-chip>
              <v-chip size="x-small" color="blue-grey" variant="outlined">{{ item.size || "N/A" }}</v-chip>
            </div>
          </div>
        </template>

        <template v-slot:item.type="{ item }">
          <v-chip size="small" :color="item.type === 'import' ? 'green-darken-2' : 'orange-darken-4'" variant="flat" class="font-weight-bold text-uppercase">
            <v-icon start size="14">{{ item.type === 'import' ? 'mdi-arrow-down-bold' : 'mdi-arrow-up-bold' }}</v-icon>
            {{ item.type === 'import' ? 'Nhập kho' : 'Xuất kho' }}
          </v-chip>
        </template>

        <template v-slot:item.quantity="{ item }">
          <span class="font-weight-black" :class="item.type === 'import' ? 'text-green-darken-3' : 'text-orange-darken-4'">
            {{ item.type === 'import' ? '+' : '-' }}{{ item.quantity }}
          </span>
        </template>

        <template v-slot:item.import_price="{ item }">
          <span v-if="item.type === 'import' && item.import_price" class="text-grey-darken-3 font-weight-medium">
            {{ formatPrice(item.import_price) }}đ
          </span>
          <span v-else class="text-grey-lighten-1">-</span>
        </template>

        <template v-slot:item.note="{ item }">
          <span class="text-caption text-grey-darken-1">{{ item.note || '' }}</span>
          <br v-if="item.reference_id" />
          <v-chip v-if="item.reference_id" size="x-small" color="grey-darken-2" variant="tonal" class="mt-1">
            Ref: {{ item.reference_id }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";
import api from "@/services/api.service";

const toast = useToast();
const isLoading = ref(false);
const logs = ref([]);
const searchKeyword = ref("");
const filterType = ref("all");

const headers = [
  { title: "STT", key: "index", align: "center", sortable: false, width: "60px" },
  { title: "Thời gian", key: "created_at", align: "start", sortable: true, width: "150px" },
  { title: "Sản phẩm", key: "product_name", align: "start", sortable: true },
  { title: "Loại", key: "type", align: "center", sortable: true, width: "120px" },
  { title: "Số lượng", key: "quantity", align: "center", sortable: true, width: "100px" },
  { title: "Giá nhập", key: "import_price", align: "end", sortable: true, width: "130px" },
  { title: "Ghi chú / Đơn hàng", key: "note", align: "start", sortable: false },
];

const filteredLogs = computed(() => {
  if (filterType.value === "all") return logs.value;
  return logs.value.filter(log => log.type === filterType.value);
});

const fetchLogs = async () => {
  isLoading.value = true;
  try {
    // Yêu cầu Backend viết API GET /stats/inventory-logs
    const response = await api.get("/stats/inventory-logs");
    logs.value = response.data || [];
  } catch (error) {
    console.error("Lỗi tải lịch sử:", error);
    toast.error("Không thể tải dữ liệu lịch sử kho.");
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', { 
    day: '2-digit', month: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price);
};

onMounted(() => fetchLogs());
</script>

<style scoped>
:deep(.custom-table th) { background-color: #ffffff !important; color: #333 !important; }
:deep(.custom-table th:hover) { background-color: #e8eaf6 !important; transition: background-color 0.2s; }
:deep(.v-data-table__tr:hover td) { background-color: #f8fafc !important; }
</style>