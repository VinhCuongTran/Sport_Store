<template>
  <v-container
    fluid
    theme="light"
    class="fill-height d-flex flex-column align-start pa-6"
    style="background-color: #f4f6f8; min-height: 100vh"
  >
    <div class="d-flex justify-space-between align-center w-100 mb-6">
      <div>
        <h2
          class="text-h5 font-weight-bold text-indigo-darken-4"
          style="line-height: 1.2"
        >
          Quản lý Danh mục
        </h2>
        <span class="text-caption text-indigo-darken-4">
          Tổ chức và phân loại hệ thống sản phẩm
        </span>
      </div>
      <v-btn
        color="indigo-darken-4"
        prepend-icon="mdi-plus"
        rounded="lg"
        elevation="0"
        class="text-capitalize font-weight-semibold"
        @click="openDialog()"
      >
        Thêm Danh Mục
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
          placeholder="Tìm theo tên hoặc môn thể thao (VD: Cầu lông)..."
          prepend-inner-icon="mdi-magnify"
          hide-details
          clearable
          rounded="lg"
          color="indigo-darken-3"
          style="max-width: 400px"
        />
        <v-spacer />
        <v-chip
          color="indigo-lighten-4"
          text-color="indigo-darken-4"
          size="small"
          variant="flat"
          prepend-icon="mdi-format-list-bulleted"
        >
          {{ categories.length }} danh mục
        </v-chip>
      </div>

      <v-divider class="mb-2" />

      <v-data-table
        :headers="headers"
        :items="categories"
        :loading="loading"
        :search="search"
        :custom-filter="customFilter"
        hover
        class="bg-white rounded-lg"
        loading-text="Đang tải dữ liệu..."
        no-data-text="Không có danh mục nào"
      >
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@6" />
        </template>

        <template v-slot:item.id="{ item }">
          <span class="font-weight-black text-indigo-darken-4">{{
            item.id
          }}</span>
        </template>

        <template v-slot:item.parent_id="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            :color="item.parent_id ? 'indigo-darken-1' : 'grey-darken-1'"
            class="font-weight-medium"
          >
            {{ getParentName(item.parent_id) }}
          </v-chip>
        </template>

        <template v-slot:item.sport_id="{ item }">
          <v-chip
            size="small"
            variant="flat"
            :color="item.sport_id ? 'teal-darken-1' : 'grey-lighten-2'"
            :text-color="item.sport_id ? 'white' : 'grey-darken-2'"
          >
            {{ getSportName(item.sport_id) }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-center gap-2">
            <v-btn
              color="indigo-darken-3"
              size="small"
              rounded="lg"
              prepend-icon="mdi-pencil"
              variant="tonal"
              class="text-capitalize"
              @click="openDialog(item)"
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
              @click="confirmDelete(item)"
            >
              Xóa
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500px" persistent scrollable>
      <v-card rounded="xl" elevation="8" theme="light" color="white">
        <div
          class="d-flex align-center justify-space-between px-6 py-4"
          style="background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%)"
        >
          <div class="d-flex align-center gap-3">
            <v-icon color="white" size="22">
              {{ isEditing ? "mdi-pencil-circle" : "mdi-plus-circle" }}
            </v-icon>
            <span class="text-body-1 font-weight-bold text-white">
              {{ isEditing ? "Cập nhật Danh mục" : "Thêm Danh mục mới" }}
            </span>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            size="small"
            @click="closeDialog"
            :disabled="saving"
          />
        </div>

        <v-card-text class="px-6 py-5 bg-white">
          <v-form ref="formRef" @submit.prevent="save">
            <v-text-field
              v-model="editedItem.name"
              label="Tên danh mục"
              placeholder="Nhập tên danh mục..."
              variant="outlined"
              density="comfortable"
              color="indigo-darken-3"
              rounded="lg"
              class="mb-4"
              prepend-inner-icon="mdi-tag-outline"
              :rules="[(v) => !!v?.trim() || 'Tên danh mục là bắt buộc']"
              required
            >
              <template v-slot:label>
                Tên danh mục <span class="text-red ml-1">*</span>
              </template>
            </v-text-field>

            <v-autocomplete
              v-model="editedItem.parent_id"
              :items="parentCategoryOptions"
              item-title="displayPath"
              item-value="id"
              label="Danh mục cha"
              placeholder="Để trống nếu là danh mục gốc"
              variant="outlined"
              density="comfortable"
              color="indigo-darken-3"
              rounded="lg"
              class="mb-4"
              prepend-inner-icon="mdi-folder-open-outline"
              no-data-text="Không tìm thấy danh mục"
              auto-select-first
              clearable
            />

            <v-autocomplete
              v-model="editedItem.sport_id"
              :items="sports"
              item-title="name"
              item-value="id"
              :label="editedItem.sport_id ? '' : 'Không thuộc môn nào'"
              variant="outlined"
              density="comfortable"
              color="indigo-darken-3"
              rounded="lg"
              prepend-inner-icon="mdi-trophy-outline"
              hide-details
              no-data-text="Không tìm thấy môn thể thao"
              auto-select-first
              clearable
              @click:clear="editedItem.sport_id = null"
            />
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="px-6 py-4 bg-white">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="tonal"
            rounded="lg"
            min-width="110"
            class="text-capitalize mr-2"
            @click="closeDialog"
            :disabled="saving"
          >
            <v-icon start>mdi-close</v-icon>Hủy bỏ
          </v-btn>
          <v-btn
            color="indigo-darken-4"
            variant="elevated"
            rounded="lg"
            min-width="140"
            class="text-capitalize"
            :loading="saving"
            @click="save"
          >
            <v-icon start>mdi-content-save</v-icon>Lưu lại
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmDialog ref="confirmDialogRef" />

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top right"
      rounded="lg"
      elevation="4"
    >
      <div class="d-flex align-center gap-2">
        <v-icon size="18">
          {{
            snackbar.color === "success"
              ? "mdi-check-circle"
              : "mdi-alert-circle"
          }}
        </v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import CategoryService from "@/services/category.service.js";
import SportService from "@/services/sport.service.js";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

const loading = ref(false);
const saving = ref(false);
const dialog = ref(false);
const search = ref("");
const formRef = ref(null);
const confirmDialogRef = ref(null);

const categories = ref([]);
const sports = ref([]);
const snackbar = ref({ show: false, text: "", color: "success" });

const headers = [
  { title: "ID", key: "id", width: "80px", align: "center" },
  { title: "Tên danh mục", key: "name", align: "start" },
  { title: "Danh mục cha", key: "parent_id", align: "center" },
  { title: "Môn thể thao", key: "sport_id", align: "center" },
  {
    title: "Thao tác",
    key: "actions",
    sortable: false,
    align: "center",
    width: "180px",
  },
];

const defaultItem = { id: null, name: "", parent_id: null, sport_id: null };
const editedItem = ref({ ...defaultItem });

const isEditing = computed(() => !!editedItem.value.id);

const parentCategoryOptions = computed(() => {
  return categories.value
    .filter((c) => c.id !== editedItem.value.id)
    .map((c) => {
      const parentName = getParentName(c.parent_id);
      return {
        ...c,
        displayPath:
          c.parent_id && parentName !== "Trống (Gốc)"
            ? `${parentName} \\ ${c.name}`
            : c.name,
      };
    })
    .sort((a, b) => a.displayPath.localeCompare(b.displayPath));
});

const customFilter = (value, query, item) => {
  if (!query) return true;

  const searchText = query.toString().toLowerCase();
  const categoryName = item.raw.name?.toLowerCase() || "";
  const sportName = getSportName(item.raw.sport_id).toLowerCase();
  const parentName = getParentName(item.raw.parent_id).toLowerCase();

  return (
    categoryName.includes(searchText) ||
    sportName.includes(searchText) ||
    parentName.includes(searchText)
  );
};

const loadData = async () => {
  loading.value = true;
  try {
    const [catData, sportData] = await Promise.all([
      CategoryService.getAll(),
      SportService.getAll(),
    ]);
    categories.value = catData;
    sports.value = sportData;
  } catch (error) {
    showMessage("Lỗi khi tải dữ liệu", "error");
  } finally {
    loading.value = false;
  }
};

const getParentName = (parentId) => {
  if (!parentId) return "Trống (Gốc)";
  const parent = categories.value.find((c) => c.id === parentId);
  return parent ? parent.name : "Không rõ";
};

const getSportName = (sportId) => {
  if (!sportId) return "Dùng chung";
  const sport = sports.value.find((s) => s.id === sportId);
  return sport ? sport.name : "Không rõ";
};

const openDialog = (item = null) => {
  editedItem.value = item ? { ...item } : { ...defaultItem };
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  setTimeout(() => {
    editedItem.value = { ...defaultItem };
    formRef.value?.resetValidation();
  }, 300);
};

const save = async () => {
  const { valid } = await formRef.value?.validate();
  if (!valid) return;

  saving.value = true;
  try {
    const payload = {
      name: editedItem.value.name.trim(),
      parent_id: editedItem.value.parent_id || null,
      sport_id: editedItem.value.sport_id || null,
    };

    if (isEditing.value) {
      await CategoryService.update(editedItem.value.id, payload);
      showMessage("Cập nhật danh mục thành công");
    } else {
      await CategoryService.create(payload);
      showMessage("Thêm danh mục thành công");
    }
    await loadData();
    closeDialog();
  } catch (error) {
    showMessage(error.response?.data?.message || "Có lỗi xảy ra", "error");
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (item) => {
  const isConfirmed = await confirmDialogRef.value.open(
    "Xóa Danh Mục",
    `Bạn có chắc chắn muốn xóa danh mục "${item.name}"? Các danh mục con hoặc sản phẩm thuộc danh mục này có thể bị ảnh hưởng.`,
  );

  if (isConfirmed) {
    try {
      await CategoryService.delete(item.id);
      showMessage("Đã xóa danh mục thành công");
      await loadData();
    } catch (error) {
      showMessage("Không thể xóa danh mục này", "error");
    }
  }
};

const showMessage = (text, color = "success") => {
  snackbar.value = { show: true, text, color };
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}

/* Background Header bảng giống y hệt trang Sport */
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
