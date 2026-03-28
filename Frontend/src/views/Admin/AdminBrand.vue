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
          Quản lý Thương hiệu
        </h2>
        <span class="text-caption text-indigo-darken-4"
          >Danh sách và thông tin các thương hiệu</span
        >
      </div>
      <v-btn
        color="indigo-darken-4"
        prepend-icon="mdi-plus"
        rounded="lg"
        elevation="0"
        class="text-capitalize font-weight-semibold"
        @click="openDialog()"
      >
        Thêm Thương Hiệu
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
          placeholder="Tìm kiếm thương hiệu..."
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
          prepend-icon="mdi-format-list-bulleted"
        >
          {{ brands.length }} thương hiệu
        </v-chip>
      </div>

      <v-divider class="mb-2" />

      <v-data-table
        :headers="headers"
        :items="brands"
        :loading="loading"
        :search="search"
        hover
        class="bg-white rounded-lg"
        no-data-text="Chưa có thương hiệu nào"
      >
        <template v-slot:item.id="{ item }">
          <span class="font-weight-black text-indigo-darken-4">{{
            item.id
          }}</span>
        </template>

        <template v-slot:item.logo_url="{ item }">
          <div class="d-flex justify-center align-center my-2">
            <div
              style="
                width: 80px;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 4px;
              "
              class="bg-grey-lighten-4 rounded-lg border"
            >
              <v-img
                v-if="item.logo_url"
                :src="item.logo_url"
                max-height="100%"
                max-width="100%"
              ></v-img>
              <v-icon v-else color="grey-lighten-1"
                >mdi-image-off-outline</v-icon
              >
            </div>
          </div>
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
              {{ isEditing ? "Cập nhật Thương hiệu" : "Thêm Thương hiệu mới" }}
            </span>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            size="small"
            @click="closeDialog"
            :disabled="saving"
          ></v-btn>
        </div>

        <v-card-text class="px-6 py-5 bg-white">
          <form @submit.prevent="save">
            <div class="mb-4">
              <label
                class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
              >
                Tên thương hiệu <span class="text-red">*</span>
              </label>
              <input
                v-model="editedItem.name"
                type="text"
                class="custom-input text-black"
                required
                placeholder="Nhập tên thương hiệu..."
              />
            </div>

            <div class="mb-2">
              <label
                class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
              >
                Logo Thương hiệu
              </label>
              <input
                type="file"
                @change="handleFileChange"
                accept="image/*"
                class="custom-input file-input text-black"
              />
              <div
                v-if="isEditing && editedItem.logo_url && !selectedFile"
                class="mt-3 d-flex align-center"
              >
                <span class="text-caption text-grey-darken-1 mr-3"
                  >Logo hiện tại:</span
                >
                <div
                  style="
                    width: 60px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2px;
                  "
                  class="border rounded bg-grey-lighten-4"
                >
                  <v-img
                    :src="editedItem.logo_url"
                    max-height="100%"
                    max-width="100%"
                  ></v-img>
                </div>
              </div>
            </div>
          </form>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="px-6 py-4 gap-3 bg-white">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="tonal"
            rounded="lg"
            min-width="110"
            class="text-capitalize"
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
import BrandService from "@/services/brand.service.js";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

const loading = ref(false);
const saving = ref(false);
const dialog = ref(false);
const search = ref("");
const confirmDialogRef = ref(null);

const brands = ref([]);
const snackbar = ref({ show: false, text: "", color: "success" });

const headers = [
  { title: "ID", key: "id", width: "80px", align: "center" },
  {
    title: "Logo",
    key: "logo_url",
    width: "120px",
    align: "center",
    sortable: false,
  },
  { title: "Tên thương hiệu", key: "name", align: "center" },
  {
    title: "Thao tác",
    key: "actions",
    sortable: false,
    align: "center",
    width: "200px",
  },
];

const defaultItem = { id: null, name: "", logo_url: "" };
const editedItem = ref({ ...defaultItem });
const selectedFile = ref(null);

const isEditing = computed(() => !!editedItem.value.id);

const loadData = async () => {
  loading.value = true;
  try {
    brands.value = await BrandService.getAll();
  } catch (error) {
    showMessage("Lỗi khi tải dữ liệu", "error");
  } finally {
    loading.value = false;
  }
};

const openDialog = (item = null) => {
  if (item) {
    editedItem.value = { ...item };
  } else {
    editedItem.value = { ...defaultItem };
  }
  selectedFile.value = null;
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  setTimeout(() => {
    editedItem.value = { ...defaultItem };
    selectedFile.value = null;
  }, 300);
};

const handleFileChange = (event) => {
  if (event.target.files.length > 0) {
    selectedFile.value = event.target.files[0];
  } else {
    selectedFile.value = null;
  }
};

const save = async () => {
  if (!editedItem.value.name || !editedItem.value.name.trim()) {
    showMessage("Tên thương hiệu là bắt buộc", "error");
    return;
  }

  saving.value = true;
  try {
    const data = new FormData();
    data.append("name", editedItem.value.name.trim());
    if (selectedFile.value) {
      data.append("logo", selectedFile.value);
    }

    if (isEditing.value) {
      await BrandService.update(editedItem.value.id, data);
      showMessage("Cập nhật thương hiệu thành công");
    } else {
      await BrandService.create(data);
      showMessage("Thêm thương hiệu thành công");
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
    "Xóa Thương Hiệu",
    `Bạn có chắc chắn muốn xóa thương hiệu "${item.name}"? Các sản phẩm thuộc thương hiệu này có thể bị ảnh hưởng.`,
  );

  if (isConfirmed) {
    try {
      await BrandService.delete(item.id);
      showMessage("Đã xóa thương hiệu thành công");
      await loadData();
    } catch (error) {
      showMessage("Không thể xóa thương hiệu này", "error");
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

.custom-input {
  width: 100%;
  padding: 8px 12px;
  border: 1.5px solid #c5cae9;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  background: #fafbff;
  color: #000;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.custom-input:focus {
  border-color: #3949ab;
  box-shadow: 0 0 0 3px rgba(57, 73, 171, 0.12);
  background: #fff;
}
.file-input {
  padding: 6px 10px;
  cursor: pointer;
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
