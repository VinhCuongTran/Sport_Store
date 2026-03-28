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
          Quản lý Môn thể thao
        </h2>
        <span class="text-caption text-indigo-darken-4"
          >Thêm, chỉnh sửa và xóa các môn thể thao trong hệ thống</span
        >
      </div>
      <v-btn
        color="indigo-darken-4"
        prepend-icon="mdi-plus"
        rounded="lg"
        elevation="0"
        class="text-capitalize font-weight-semibold"
        @click="openCreateDialog"
      >
        Thêm môn thể thao
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
          placeholder="Tìm kiếm môn thể thao..."
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
          prepend-icon="mdi-run"
        >
          {{ sports.length }} môn thể thao
        </v-chip>
      </div>

      <v-divider class="mb-2" />

      <v-data-table
        :headers="headers"
        :items="sports"
        :search="search"
        :loading="isLoading"
        hover
        class="bg-white rounded-lg"
        no-data-text="Chưa có môn thể thao nào"
      >
        <template v-slot:item.id="{ item }">
          <span class="font-weight-black text-indigo-darken-4">{{
            item.id
          }}</span>
        </template>

        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center gap-2">
            <span class="text-body-2 font-weight-bold text-black">{{
              item.name
            }}</span>
          </div>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-2 justify-center">
            <v-btn
              color="indigo-darken-3"
              size="small"
              rounded="lg"
              prepend-icon="mdi-pencil"
              variant="tonal"
              class="text-capitalize"
              @click="openEditDialog(item)"
            >
              Sửa
            </v-btn>
            <v-btn
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
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog.show" max-width="480" persistent>
      <v-card rounded="xl" elevation="8">
        <v-card-title
          class="pa-5 pb-3 d-flex align-center gap-2"
          style="background: linear-gradient(90deg, #e8eaf6 0%, #f3f4f6 100%)"
        >
          <v-icon color="indigo-darken-4">
            {{ dialog.isEdit ? "mdi-pencil-circle" : "mdi-plus-circle" }}
          </v-icon>
          <span class="font-weight-bold text-indigo-darken-4">
            {{
              dialog.isEdit ? "Chỉnh sửa môn thể thao" : "Thêm môn thể thao mới"
            }}
          </span>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-5">
          <v-text-field
            v-model="form.name"
            label="Tên môn thể thao"
            variant="outlined"
            rounded="lg"
            color="indigo-darken-3"
            prepend-inner-icon="mdi-run"
            :rules="[(v) => !!v || 'Vui lòng nhập tên môn thể thao']"
            placeholder="Ví dụ: Bóng đá, Cầu lông..."
            autofocus
          />
        </v-card-text>

        <v-card-actions class="pa-5 pt-0 gap-2">
          <v-spacer />
          <v-btn
            variant="tonal"
            rounded="lg"
            class="text-capitalize"
            @click="dialog.show = false"
          >
            Hủy
          </v-btn>
          <v-btn
            color="indigo-darken-4"
            variant="flat"
            rounded="lg"
            class="text-capitalize font-weight-bold"
            :loading="isLoading"
            @click="handleSubmit"
          >
            {{ dialog.isEdit ? "Lưu thay đổi" : "Thêm mới" }}
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
import { ref, onMounted } from "vue";
import SportService from "@/services/sport.service";
import Loading from "@/components/Loading.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

const sports = ref([]);
const isLoading = ref(false);
const search = ref("");
const confirmDialog = ref(null);
const snackbar = ref({ show: false, text: "", color: "success" });

const dialog = ref({ show: false, isEdit: false });
const form = ref({ name: "" });
const editingId = ref(null);

const headers = [
  { title: "ID", key: "id", width: "100px", align: "center" },
  { title: "Tên môn thể thao", key: "name", align: "start" },
  {
    title: "Thao tác",
    key: "actions",
    sortable: false,
    align: "center",
    width: "180px",
  },
];

const showMessage = (text, color = "success") => {
  snackbar.value = { show: true, text, color };
};

const fetchSports = async () => {
  isLoading.value = true;
  try {
    sports.value = await SportService.getAll();
  } catch (error) {
    showMessage("Lỗi khi tải danh sách môn thể thao", "error");
  } finally {
    isLoading.value = false;
  }
};

const openCreateDialog = () => {
  form.value = { name: "" };
  editingId.value = null;
  dialog.value = { show: true, isEdit: false };
};

const openEditDialog = (item) => {
  form.value = { name: item.name };
  editingId.value = item.id;
  dialog.value = { show: true, isEdit: true };
};

const handleSubmit = async () => {
  if (!form.value.name?.trim()) {
    showMessage("Vui lòng nhập tên môn thể thao", "error");
    return;
  }

  isLoading.value = true;
  try {
    if (dialog.value.isEdit) {
      await SportService.update(editingId.value, form.value);
      showMessage("Cập nhật môn thể thao thành công");
    } else {
      await SportService.create(form.value);
      showMessage("Thêm môn thể thao thành công");
    }
    dialog.value.show = false;
    await fetchSports();
  } catch (error) {
    showMessage(
      error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại",
      "error",
    );
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = async (item) => {
  const isConfirmed = await confirmDialog.value.open(
    "Xóa Môn Thể Thao",
    `Bạn có chắc chắn muốn xóa môn thể thao "${item.name}"? Các danh mục liên quan cũng có thể bị ảnh hưởng.`,
  );

  if (!isConfirmed) return;

  isLoading.value = true;
  try {
    await SportService.delete(item.id);
    showMessage("Đã xóa môn thể thao thành công");
    await fetchSports();
  } catch (error) {
    showMessage(
      error.response?.data?.message || "Không thể xóa môn thể thao",
      "error",
    );
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchSports();
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}

/* CSS Tùy chỉnh màu Gradient và font chữ cho Header của Data Table */
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
