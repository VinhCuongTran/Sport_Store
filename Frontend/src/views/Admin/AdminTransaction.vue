<template>
  <v-container fluid theme="light" class="fill-height d-flex flex-column align-center pa-6" style="background-color: #f4f6f8; min-height: 100vh">
    <Loading :visible="isLoading" text="Đang tải lịch sử dòng tiền..." />

    <div class="d-flex justify-space-between align-center w-100 mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold text-indigo-darken-4" style="line-height: 1.2">
          Quản lý Dòng tiền
        </h2>
        <span class="text-caption text-indigo-darken-4">
          Theo dõi lịch sử Thu / Hoàn tiền của hệ thống
        </span>
      </div>
      <!-- Dòng tiền không có nút thêm mới vì nó hoàn toàn tự động -->
      <v-chip color="indigo-darken-4" variant="flat" prepend-icon="mdi-shield-check">
        Dữ liệu được bảo mật tự động
      </v-chip>
    </div>

    <v-card color="white" width="100%" elevation="0" rounded="xl" class="pa-4" style="border: 1px solid rgba(99, 102, 241, 0.15); box-shadow: 0 4px 24px rgba(99, 102, 241, 0.1);">
      <div class="d-flex align-center gap-3 mb-4 px-2">
        <v-text-field
          v-model="search"
          density="compact"
          variant="outlined"
          placeholder="Tìm mã GD, Mã đơn..."
          prepend-inner-icon="mdi-magnify"
          hide-details
          clearable
          rounded="lg"
          color="indigo-darken-3"
          style="max-width: 320px"
        />
        <v-spacer />
        <v-chip color="indigo-lighten-4" text-color="indigo-darken-4" size="small" variant="flat" prepend-icon="mdi-swap-horizontal">
          {{ transactions.length }} giao dịch
        </v-chip>
      </div>

      <v-divider class="mb-2" />

      <v-data-table
        :headers="headers"
        :items="transactions"
        :search="search"
        :loading="isLoading"
        hover
        class="bg-white rounded-lg"
        no-data-text="Chưa có giao dịch nào phát sinh"
      >
        <template v-slot:item.id="{ item }">
          <span class="font-weight-bold text-indigo-darken-4 text-uppercase">#{{ item.id }}</span>
        </template>

        <template v-slot:item.order_id="{ item }">
  <v-btn variant="text" color="blue-darken-2" size="small" class="font-weight-bold text-none px-2" :to="{ name: 'admin-order', query: { open_order: item.order_id } }">
    #{{ item.order_id }}
  </v-btn>
</template>

        <template v-slot:item.transaction_type="{ item }">
          <v-chip size="small" :color="item.transaction_type === 'payment' ? 'success' : 'red-darken-2'" variant="flat" class="font-weight-bold text-uppercase">
            <v-icon start size="14">{{ item.transaction_type === 'payment' ? 'mdi-arrow-bottom-left-thick' : 'mdi-arrow-top-right-thick' }}</v-icon>
            {{ item.transaction_type === 'payment' ? 'Thu Tiền' : 'Hoàn Tiền' }}
          </v-chip>
        </template>

        <template v-slot:item.amount="{ item }">
          <span class="font-weight-black text-body-1" :class="item.transaction_type === 'payment' ? 'text-success' : 'text-red-darken-2'">
            {{ item.transaction_type === 'payment' ? '+' : '-' }}{{ formatPrice(item.amount) }}
          </span>
        </template>

        <template v-slot:item.payment_method="{ item }">
          <div class="d-flex align-center">
            <v-icon size="18" class="mr-1" color="grey-darken-2">
              {{ item.payment_method === 'Cash' || item.payment_method === 'COD' ? 'mdi-cash' : 'mdi-credit-card-outline' }}
            </v-icon>
            <span class="text-body-2 font-weight-medium">{{ item.payment_method }}</span>
          </div>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip size="small" :color="getStatusColor(item.status)" variant="tonal" class="font-weight-bold text-uppercase">
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <template v-slot:item.note="{ item }">
          <div class="text-caption text-grey-darken-3" style="max-width: 250px; white-space: normal;">
            {{ item.note }}
          </div>
        </template>

        <template v-slot:item.created_at="{ item }">
          <div class="text-caption text-grey-darken-3 font-weight-medium">
            {{ formatDateDisplay(item.created_at) }}
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import TransactionService from "@/services/transaction.service";
import Loading from "@/components/Loading.vue";

const transactions = ref([]);
const isLoading = ref(false);
const search = ref("");

const headers = [
  { title: "Mã GD", key: "id", align: "start", width: "100px" },
  { title: "Đơn hàng", key: "order_id", align: "start", width: "100px" },
  { title: "Loại GD", key: "transaction_type", align: "center", width: "130px" },
  { title: "Số tiền", key: "amount", align: "end", width: "130px" },
  { title: "Phương thức", key: "payment_method", align: "start", width: "140px" },
  { title: "Trạng thái", key: "status", align: "center", width: "120px" },
  { title: "Nội dung", key: "note", align: "start" },
  { title: "Thời gian", key: "created_at", align: "start", width: "150px" },
];

const formatPrice = (value) => {
  if (!value) return "0 đ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
};

const formatDateDisplay = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("vi-VN");
};

const getStatusColor = (status) => {
  const map = { pending: "amber-darken-4", success: "green-darken-2", failed: "red-darken-2" };
  return map[status] || "grey";
};

const getStatusText = (status) => {
  const map = { pending: "Chờ xử lý", success: "Thành công", failed: "Thất bại" };
  return map[status] || status;
};

const fetchTransactions = async () => {
  isLoading.value = true;
  try {
    transactions.value = await TransactionService.getAll();
  } catch (error) {
    console.error("Lỗi tải dòng tiền:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchTransactions();
});
</script>

<style scoped>
:deep(.v-data-table th.v-data-table__th) {
  background: linear-gradient(90deg, #e8eaf6 0%, #f3f4f6 100%) !important;
  color: #283593 !important;
  font-weight: 700 !important;
  font-size: 0.9rem !important;
}
:deep(.v-data-table th.v-data-table__th:hover),
:deep(.v-data-table th.v-data-table__th:hover .v-data-table-header__sort-icon) {
  color: #1a237e !important;
}
:deep(.v-data-table td) {
  vertical-align: middle;
}
</style>