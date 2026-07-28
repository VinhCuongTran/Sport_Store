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
      >
        Làm Mới
      </v-btn>
    </div>

    <!-- Hàng thẻ thống kê số liệu -->
    <v-row class="w-100 mb-4" density="compact">
      <v-col cols="12" md="4">
        <v-card
          color="orange-lighten-5"
          class="border pa-4 rounded-xl d-flex align-center justify-space-between"
          elevation="0"
        >
          <div>
            <div
              class="text-subtitle-2 text-orange-darken-4 font-weight-bold mb-1"
            >
              Số lượng chờ duyệt
            </div>
            <div class="text-h4 font-weight-black text-orange-darken-4">
              {{ pendingCount }}
            </div>
          </div>
          <v-icon color="orange-darken-2" size="48" opacity="0.3"
            >mdi-clock-outline</v-icon
          >
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card
          color="green-lighten-5"
          class="border pa-4 rounded-xl d-flex align-center justify-space-between"
          elevation="0"
        >
          <div>
            <div
              class="text-subtitle-2 text-green-darken-4 font-weight-bold mb-1"
            >
              Số lượng đã duyệt (AI & Admin)
            </div>
            <div class="text-h4 font-weight-black text-green-darken-4">
              {{ approvedCount }}
            </div>
          </div>
          <v-icon color="green-darken-2" size="48" opacity="0.3"
            >mdi-check-circle-outline</v-icon
          >
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card
          color="grey-lighten-4"
          class="border pa-4 rounded-xl d-flex align-center justify-space-between"
          elevation="0"
        >
          <div>
            <div
              class="text-subtitle-2 text-grey-darken-3 font-weight-bold mb-1"
            >
              Số lượng đã ẩn
            </div>
            <div class="text-h4 font-weight-black text-grey-darken-3">
              {{ rejectedCount }}
            </div>
          </div>
          <v-icon color="grey-darken-1" size="48" opacity="0.3"
            >mdi-eye-off-outline</v-icon
          >
        </v-card>
      </v-col>
    </v-row>

    <v-card
      color="white"
      width="100%"
      elevation="0"
      rounded="xl"
      class="pa-4 border"
    >
      <div class="d-flex justify-space-between align-center mb-4">
        <v-tabs v-model="activeTab" color="indigo-darken-4">
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

        <!-- Chức năng xử lý hàng loạt -->
        <div
          v-if="selectedReviews.length > 0"
          class="d-flex align-center gap-3 bg-indigo-lighten-5 pa-2 rounded-lg"
        >
          <span class="text-body-2 font-weight-bold text-indigo-darken-4 mx-2"
            >Đã chọn: {{ selectedReviews.length }}</span
          >
          <v-btn
            color="success"
            size="small"
            variant="flat"
            prepend-icon="mdi-check-all"
            @click="handleBulkAction('approved')"
          >
            Duyệt
          </v-btn>
          <v-btn
            color="warning"
            size="small"
            variant="flat"
            prepend-icon="mdi-eye-off"
            @click="handleBulkAction('rejected')"
          >
            Từ chối
          </v-btn>
          <v-btn
            color="grey-darken-2"
            size="small"
            variant="text"
            prepend-icon="mdi-close"
            @click="selectedReviews = []"
          >
            Bỏ chọn
          </v-btn>
        </div>
      </div>

      <v-data-table
        v-model="selectedReviews"
        :headers="headers"
        :items="filteredReviews"
        :search="search"
        :loading="isLoading"
        show-select
        item-value="id"
        hover
        class="bg-white rounded-lg custom-table"
      >
        <template v-slot:item.comment="{ item }">
          <div
            class="text-truncate text-body-2"
            style="max-width: 250px"
            :title="item.comment"
          >
            {{ item.comment }}
          </div>
        </template>

        <template v-slot:item.ai_label="{ item }">
          <v-chip
            size="small"
            variant="flat"
            :color="getLabelColor(item.ai_label)"
            class="font-weight-bold"
          >
            {{ item.ai_label || "Chưa phân loại" }}
          </v-chip>
        </template>

        <!-- Màu Độ tin cậy theo nhãn AI -->
        <template v-slot:item.ai_confidence="{ item }">
          <span
            class="font-weight-medium"
            :class="`text-${getLabelColor(item.ai_label)}`"
          >
            {{ item.ai_confidence }}%
          </span>
        </template>

        <template v-slot:item.product_name="{ item }">
          <span class="text-body-2 font-weight-medium text-indigo-darken-3">{{
            item.product_name
          }}</span>
        </template>

        <template v-slot:item.details="{ item }">
          <v-btn
            color="info"
            size="small"
            variant="text"
            prepend-icon="mdi-information-outline"
            class="text-none font-weight-medium"
            @click="openDetail(item)"
          >
            Xem chi tiết
          </v-btn>
        </template>

        <template v-slot:item.actions="{ item }">
          <div
            class="d-flex flex-column gap-2 py-3 mx-auto"
            style="width: 100px"
          >
            <v-btn
              v-if="['pending', 'reported'].includes(item.status)"
              color="success"
              size="small"
              variant="tonal"
              prepend-icon="mdi-check"
              @click="changeStatus(item.id, 'approved')"
            >
              Duyệt
            </v-btn>

            <v-btn
              v-if="
                ['approved', 'auto_approved', 'pending', 'reported'].includes(
                  item.status,
                )
              "
              color="warning"
              size="small"
              variant="tonal"
              prepend-icon="mdi-eye-off"
              @click="changeStatus(item.id, 'rejected')"
            >
              Ẩn
            </v-btn>

            <v-btn
              v-if="isSuperAdmin"
              color="red-darken-1"
              size="small"
              variant="text"
              prepend-icon="mdi-delete"
              @click="handleDelete(item)"
            >
              Xóa
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="detailDialog.isOpen" max-width="650px">
      <v-card
        theme="light"
        color="white"
        rounded="xl"
        v-if="detailItem"
        class="pa-2"
      >
        <v-card-title
          class="text-h6 font-weight-bold text-indigo-darken-4 d-flex justify-space-between align-center"
        >
          <span
            >Đánh giá: #{{ detailItem.id }} -
            {{ detailItem.product_name }}</span
          >
          <v-btn
            icon="mdi-close"
            variant="text"
            density="comfortable"
            @click="detailDialog.isOpen = false"
          ></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pt-4">
          <v-row density="compact" class="mb-4 bg-grey-lighten-4 pa-3 rounded-lg">
            <v-col cols="12" sm="6">
              <div class="text-caption text-grey-darken-1">
                Họ tên người đánh giá
              </div>
              <div class="font-weight-bold text-black">
                {{ detailItem.user }}
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-caption text-grey-darken-1">Ngày mua hàng</div>
              <div class="font-weight-bold text-black">
                {{ detailItem.purchase_date || "Không có dữ liệu" }}
              </div>
            </v-col>
            <v-col cols="12">
              <div class="text-caption text-grey-darken-1">
                Lịch sử đánh giá của khách hàng này
              </div>
              <div class="font-weight-bold text-black">
                Đã có {{ detailItem.previous_reviews_count || 0 }} đánh giá
                trước đó
              </div>
            </v-col>
          </v-row>

          <div class="mb-4">
            <div class="text-caption text-grey-darken-1 mb-1">
              Nội dung đánh giá ({{ detailItem.rating }}
              <v-icon color="amber" size="x-small" class="pb-1">mdi-star</v-icon
              >)
            </div>
            <v-card
              variant="outlined"
              class="pa-3 bg-indigo-lighten-5 border-indigo-lighten-4 text-body-1 text-black"
            >
              "{{ detailItem.comment }}"
            </v-card>
          </div>

          <div class="border rounded-lg pa-4">
            <div class="d-flex align-center gap-2 mb-3">
              <v-icon color="indigo">mdi-robot-outline</v-icon>
              <span class="font-weight-bold text-indigo-darken-3"
                >Kết quả phân tích AI</span
              >
            </div>

            <v-row density="compact" class="mb-3">
              <v-col cols="6">
                <div class="text-caption text-black">Nhãn dự đoán</div>
                <v-chip
                  size="small"
                  :color="getLabelColor(detailItem.ai_label)"
                  class="font-weight-bold mt-1"
                >
                  {{ detailItem.ai_label || "N/A" }}
                </v-chip>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-black">Độ tin cậy</div>
                <!-- Màu Độ tin cậy trong Dialog -->
                <div
                  class="font-weight-bold text-h6"
                  :class="`text-${getLabelColor(detailItem.ai_label)}`"
                >
                  {{ detailItem.ai_confidence || 0 }}%
                </div>
              </v-col>
            </v-row>

            <div class="text-caption font-weight-medium mb-2 text-black">
              Phân bổ xác suất:
            </div>
            <!-- Đã loại bỏ nhãn Spam, chỉ giữ lại 2 nhãn Hợp lệ và Vi phạm -->
            <div class="d-flex gap-4">
              <div
                class="flex-grow-1 text-center bg-green-lighten-5 pa-2 rounded text-caption text-black"
              >
                <div class="font-weight-bold text-green-darken-3">
                  {{ detailItem.ai_probs?.valid || 0 }}%
                </div>
                Hợp lệ
              </div>
              <div
                class="flex-grow-1 text-center bg-red-lighten-5 pa-2 rounded text-caption text-black"
              >
                <div class="font-weight-bold text-red-darken-3">
                  <!-- Hỗ trợ đọc cả key 'invalid' (từ API cũ) hoặc 'violation' -->
                  {{
                    detailItem.ai_probs?.violation !== undefined
                      ? detailItem.ai_probs?.violation
                      : detailItem.ai_probs?.invalid || 0
                  }}%
                </div>
                Vi phạm
              </div>
            </div>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 justify-end gap-2">
          <v-btn
            v-if="
              ['pending', 'reported', 'rejected'].includes(detailItem.status)
            "
            color="success"
            variant="elevated"
            prepend-icon="mdi-check"
            min-width="120"
            @click="handleDetailAction('approved')"
          >
            Duyệt
          </v-btn>
          <v-btn
            v-if="
              ['approved', 'auto_approved', 'pending', 'reported'].includes(
                detailItem.status,
              )
            "
            color="warning"
            variant="elevated"
            prepend-icon="mdi-eye-off"
            min-width="120"
            @click="handleDetailAction('rejected')"
          >
            Ẩn bình luận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmDialog ref="confirmDialog" />
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top right"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import ReviewService from "@/services/review.service";
import api from "@/services/api.service";
import Loading from "@/components/Loading.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import AuthService from "@/services/auth.service";

const isSuperAdmin = computed(() => AuthService.isSuperAdmin());
const reviews = ref([]);
const selectedReviews = ref([]);
const isLoading = ref(false);
const search = ref("");
const activeTab = ref("all");
const confirmDialog = ref(null);
const snackbar = ref({ show: false, text: "", color: "success" });

const detailDialog = ref({ isOpen: false });
const detailItem = ref(null);

const pendingCount = computed(
  () => reviews.value.filter((r) => r.status === "pending").length,
);
const approvedCount = computed(
  () =>
    reviews.value.filter(
      (r) => r.status === "auto_approved" || r.status === "approved",
    ).length,
);
const rejectedCount = computed(
  () => reviews.value.filter((r) => r.status === "rejected").length,
);
const reportedCount = computed(
  () => reviews.value.filter((r) => r.status === "reported").length,
);

const filteredReviews = computed(() => {
  if (activeTab.value === "all") return reviews.value;
  return reviews.value.filter((r) => r.status === activeTab.value);
});

const headers = [
  { title: "Nội dung", key: "comment", align: "start", sortable: false },
  { title: "Nhãn AI dự đoán", key: "ai_label", align: "center" },
  { title: "Độ tin cậy", key: "ai_confidence", align: "center" },
  { title: "Sản phẩm", key: "product_name", align: "start" },
  {
    title: "Chi tiết",
    key: "details",
    align: "center",
    sortable: false,
    width: "140px",
  },
  {
    title: "Thao tác",
    key: "actions",
    align: "center",
    sortable: false,
    width: "120px",
  },
];

const showMessage = (text, color = "success") => {
  snackbar.value = { show: true, text, color };
};

// Chuẩn hóa màu sắc: Valid -> Xanh lá, Violation -> Đỏ
const getLabelColor = (label) => {
  const map = {
    valid: "success",
    violation: "red",
    invalid: "red", // Fallback nếu API trả về invalid
    "Hợp lệ": "success",
    "Vi phạm": "red",
    "Không hợp lệ": "red",
  };
  return map[label] || "grey";
};

const fetchReviews = async () => {
  isLoading.value = true;
  try {
    const res = await ReviewService.getAll();
    reviews.value = res.map((r) => {
      // Khởi tạo object xác suất 2 nhãn
      let parsedProbs = { valid: 0, violation: 0 };
      if (r.ai_probs) {
        try {
          parsedProbs =
            typeof r.ai_probs === "string"
              ? JSON.parse(r.ai_probs)
              : r.ai_probs;
        } catch (e) {}
      }
      return { ...r, user: r.user_name, ai_probs: parsedProbs };
    });
  } catch (error) {
    showMessage("Lỗi tải dữ liệu", "error");
  } finally {
    isLoading.value = false;
  }
};

const changeStatus = async (id, status) => {
  try {
    await api.patch(`/reviews/${id}/status`, { status });
    showMessage("Cập nhật trạng thái thành công");
    fetchReviews();

    if (detailItem.value && detailItem.value.id === id) {
      detailItem.value.status = status;
    }
  } catch (error) {
    showMessage("Lỗi cập nhật", "error");
  }
};

const handleBulkAction = async (status) => {
  if (selectedReviews.value.length === 0) return;
  isLoading.value = true;
  try {
    await Promise.all(
      selectedReviews.value.map((id) =>
        api.patch(`/reviews/${id}/status`, { status }),
      ),
    );
    showMessage(`Đã xử lý ${selectedReviews.value.length} đánh giá thành công`);
    selectedReviews.value = [];
    fetchReviews();
  } catch (error) {
    showMessage("Có lỗi xảy ra khi xử lý hàng loạt", "error");
  } finally {
    isLoading.value = false;
  }
};

const openDetail = (item) => {
  detailItem.value = { ...item };
  detailDialog.value.isOpen = true;
};

const handleDetailAction = async (status) => {
  if (!detailItem.value) return;
  await changeStatus(detailItem.value.id, status);
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
.gap-4 {
  gap: 16px;
}

:deep(.v-data-table tbody tr td) {
  border-bottom: 1px solid #e0e0e0 !important;
  vertical-align: middle;
}

:deep(.v-data-table tbody tr:last-child td) {
  border-bottom: none !important;
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
</style>
