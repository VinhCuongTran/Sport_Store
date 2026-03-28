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
        <h2
          class="text-h5 font-weight-bold text-indigo-darken-4"
          style="line-height: 1.2"
        >
          Quản lý Đánh giá
        </h2>
        <span class="text-caption text-indigo-darken-4"
          >Kiểm duyệt và quản lý phản hồi từ khách hàng</span
        >
      </div>
      <v-btn
        color="indigo-darken-4"
        prepend-icon="mdi-refresh"
        rounded="lg"
        elevation="0"
        class="text-capitalize font-weight-semibold"
        @click="fetchReviews"
        :loading="isLoading"
      >
        Làm Mới
      </v-btn>
    </div>

    <v-card
      color="white"
      width="100%"
      elevation="0"
      rounded="xl"
      class="pa-4"
      style="
        border: 1px solid rgba(99, 102, 241, 0.15);
        box-shadow: 0 4px 24px rgba(99, 102, 241, 0.1);
      "
    >
      <div class="d-flex align-center gap-3 mb-4 px-2">
        <v-text-field
          v-model="search"
          density="compact"
          variant="outlined"
          placeholder="Tìm người dùng, sản phẩm..."
          prepend-inner-icon="mdi-magnify"
          hide-details
          clearable
          rounded="lg"
          color="indigo-darken-3"
          style="max-width: 320px"
        />
        <v-spacer />
        <v-chip
          color="indigo-lighten-4"
          text-color="indigo-darken-4"
          size="small"
          variant="flat"
          prepend-icon="mdi-comment-multiple-outline"
        >
          {{ reviews.length }} đánh giá
        </v-chip>
      </div>

      <v-divider class="mb-2" />

      <v-data-table
        :headers="headers"
        :items="reviews"
        :search="search"
        :loading="isLoading"
        hover
        class="bg-white rounded-lg"
        no-data-text="Chưa có đánh giá nào"
      >
        <template v-slot:item.id="{ item }">
          <span class="font-weight-black text-indigo-darken-4"
            >#{{ item.id }}</span
          >
        </template>

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
            half-increments
          ></v-rating>
        </template>

        <template v-slot:item.comment="{ item }">
          <span
            class="text-body-2 text-grey-darken-3"
            style="white-space: pre-wrap"
            >{{ item.comment }}</span
          >
        </template>

        <template v-slot:item.created_at="{ item }">
          <span class="text-body-2 text-black">{{
            formatDate(item.created_at)
          }}</span>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            v-if="isSuperAdmin"
            color="red-darken-1"
            size="small"
            rounded="lg"
            prepend-icon="mdi-delete"
            variant="tonal"
            class="text-capitalize"
            @click="handleDelete(item)"
          >
            Xóa
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <ConfirmDialog ref="confirmDialog" />

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top right"
    >
      <div class="d-flex align-center gap-2">
        <v-icon size="18">{{
          snackbar.color === "success" ? "mdi-check-circle" : "mdi-alert-circle"
        }}</v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import ReviewService from "@/services/review.service";
import Loading from "@/components/Loading.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import AuthService from "@/services/auth.service";

const isSuperAdmin = computed(() => AuthService.isSuperAdmin());
const reviews = ref([]);
const isLoading = ref(false);
const search = ref("");
const confirmDialog = ref(null);
const snackbar = ref({ show: false, text: "", color: "success" });

const headers = [
  { title: "ID", key: "id", width: "80px", align: "center" },
  { title: "Khách hàng", key: "user", align: "start" },
  { title: "Sản phẩm", key: "product_name", align: "start" },
  { title: "Đánh giá", key: "rating", align: "center", width: "130px" },
  { title: "Nội dung", key: "comment", align: "start", sortable: false },
  { title: "Ngày đăng", key: "created_at", align: "center", width: "160px" },
  {
    title: "Thao tác",
    key: "actions",
    sortable: false,
    align: "center",
    width: "120px",
  },
];

const showMessage = (text, color = "success") => {
  snackbar.value = { show: true, text, color };
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  return (
    d.toLocaleDateString("vi-VN") +
    " " +
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  );
};

const fetchReviews = async () => {
  isLoading.value = true;
  try {
    const res = await ReviewService.getAll();
    reviews.value = res.map((r) => ({
      ...r,
      user: `${r.user_name || ""} ${r.user_email || ""}`,
    }));
  } catch (error) {
    showMessage("Lỗi khi tải dữ liệu đánh giá", "error");
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = async (item) => {
  const isConfirmed = await confirmDialog.value.open(
    "Xóa Đánh Giá",
    `Bạn có chắc chắn muốn xóa đánh giá của khách hàng "${item.user_name || "Khách"}" cho sản phẩm "${item.product_name}"? Hành động này không thể hoàn tác.`,
  );

  if (!isConfirmed) return;

  isLoading.value = true;
  try {
    await ReviewService.delete(item.id);
    showMessage("Đã xóa đánh giá thành công");
    await fetchReviews();
  } catch (error) {
    showMessage(
      error.response?.data?.message || "Không thể xóa đánh giá",
      "error",
    );
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchReviews();
});
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
