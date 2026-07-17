<template>
  <v-container
    fluid
    theme="light"
    class="fill-height d-flex flex-column align-start pa-6"
    style="background-color: #f4f6f8; min-height: 100vh"
  >
    <Loading :visible="isLoading" text="Đang xử lý dữ liệu..." />

    <div class="d-flex justify-space-between align-center w-100 mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold text-indigo-darken-4">
          Quản lý Đánh giá & Kiểm duyệt AI
        </h2>
        <span class="text-caption text-indigo-darken-4"
          >Kiểm duyệt các phản hồi bị AI nghi ngờ vi phạm hoặc bị khách hàng báo
          cáo</span
        >
      </div>
      <v-btn
        color="indigo-darken-4"
        prepend-icon="mdi-refresh"
        rounded="lg"
        @click="fetchReviews"
        :loading="isLoading"
        >Làm Mới</v-btn
      >
    </div>

    <v-card
      color="white"
      width="100%"
      elevation="0"
      rounded="xl"
      class="pa-4 border"
    >
      <v-tabs v-model="activeTab" color="indigo-darken-4" class="mb-4">
        <v-tab value="all">Tất cả</v-tab>
        <v-tab value="pending">
          <v-badge
            color="orange"
            :content="pendingCount"
            :model-value="pendingCount > 0"
            floating
          >
            <v-icon start>mdi-robot-outline</v-icon> AI Bắt Lỗi
          </v-badge>
        </v-tab>
        <v-tab value="reported">
          <v-badge
            color="red"
            :content="reportedCount"
            :model-value="reportedCount > 0"
            floating
          >
            <v-icon start>mdi-flag-triangle</v-icon> Bị Báo Cáo
          </v-badge>
        </v-tab>
      </v-tabs>

      <v-data-table
        :headers="headers"
        :items="filteredReviews"
        :search="search"
        :loading="isLoading"
        hover
        class="bg-white rounded-lg"
      >
        <template v-slot:item.product_name="{ item }">
          <span class="text-body-2 font-weight-medium text-indigo-darken-3">{{
            item.product_name
          }}</span>
        </template>

        <template v-slot:item.rating="{ item }">
          <v-rating
            :model-value="item.rating"
            color="amber-darken-2"
            density="compact"
            size="small"
            readonly
          ></v-rating>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            size="small"
            variant="flat"
            class="font-weight-bold"
            :color="getStatusColor(item.status)"
          >
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-2 justify-center">
            <v-btn
              v-if="['pending', 'reported'].includes(item.status)"
              color="success"
              size="small"
              variant="tonal"
              prepend-icon="mdi-check"
              @click="changeStatus(item.id, 'approved')"
              >Duyệt</v-btn
            >
            <v-btn
              v-if="['approved', 'pending', 'reported'].includes(item.status)"
              color="warning"
              size="small"
              variant="tonal"
              prepend-icon="mdi-eye-off"
              @click="changeStatus(item.id, 'rejected')"
              >Từ chối</v-btn
            >
            <v-btn
              v-if="isSuperAdmin"
              color="red-darken-1"
              size="small"
              variant="tonal"
              icon="mdi-delete"
              @click="handleDelete(item)"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>
    <ConfirmDialog ref="confirmDialog" />
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top right"
      >{{ snackbar.text }}</v-snackbar
    >
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import ReviewService from "@/services/review.service";
// Nếu bạn chưa viết ReviewService.updateStatus trong Frontend, hãy import api.service:
import api from "@/services/api.service";
import Loading from "@/components/Loading.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import AuthService from "@/services/auth.service";

const isSuperAdmin = computed(() => AuthService.isSuperAdmin());
const reviews = ref([]);
const isLoading = ref(false);
const search = ref("");
const activeTab = ref("all");
const confirmDialog = ref(null);
const snackbar = ref({ show: false, text: "", color: "success" });

const pendingCount = computed(
  () => reviews.value.filter((r) => r.status === "pending").length,
);
const reportedCount = computed(
  () => reviews.value.filter((r) => r.status === "reported").length,
);

const filteredReviews = computed(() => {
  if (activeTab.value === "all") return reviews.value;
  return reviews.value.filter((r) => r.status === activeTab.value);
});

const headers = [
  { title: "KH", key: "user", align: "start" },
  { title: "Sản phẩm", key: "product_name", align: "start" },
  { title: "Đánh giá", key: "rating", align: "center", width: "110px" },
  { title: "Nội dung", key: "comment", align: "start", sortable: false },
  { title: "Trạng thái", key: "status", align: "center", width: "120px" },
  {
    title: "Thao tác",
    key: "actions",
    sortable: false,
    align: "center",
    width: "230px",
  },
];

const showMessage = (text, color = "success") => {
  snackbar.value = { show: true, text, color };
};

const getStatusColor = (status) => {
  const map = {
    approved: "success",
    pending: "orange-darken-3",
    reported: "red-darken-3",
    rejected: "grey-darken-2",
  };
  return map[status] || "grey";
};

const getStatusText = (status) => {
  const map = {
    approved: "Hợp lệ",
    pending: "AI Tạm Ẩn",
    reported: "Bị Báo Cáo",
    rejected: "Đã Ẩn",
  };
  return map[status] || status;
};

const fetchReviews = async () => {
  isLoading.value = true;
  try {
    const res = await ReviewService.getAll();
    reviews.value = res.map((r) => ({ ...r, user: r.user_name }));
  } catch (error) {
    showMessage("Lỗi tải dữ liệu", "error");
  } finally {
    isLoading.value = false;
  }
};

const changeStatus = async (id, status) => {
  try {
    // Tự gọi API nếu chưa định nghĩa trong Service
    await api.patch(`/reviews/${id}/status`, { status });
    showMessage("Cập nhật trạng thái thành công");
    fetchReviews();
  } catch (error) {
    showMessage("Lỗi cập nhật", "error");
  }
};

const handleDelete = async (item) => {
  const isConfirmed = await confirmDialog.value.open(
    "Xóa",
    `Xóa đánh giá này?`,
  );
  if (!isConfirmed) return;
  try {
    await ReviewService.delete(item.id);
    showMessage("Đã xóa");
    fetchReviews();
  } catch (error) {
    showMessage("Lỗi xóa", "error");
  }
};

onMounted(() => fetchReviews());
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}

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
