<template>
  <v-container
    fluid
    theme="light"
    class="fill-height d-flex flex-column align-center pa-6"
    style="background-color: #f4f6f8; min-height: 100vh"
  >
    <Loading :visible="isLoading" text="Đang xử lý dữ liệu..." />

    <div class="d-flex justify-space-between align-center w-100 mb-6">
      <div>
        <h2
          class="text-h5 font-weight-bold text-indigo-darken-4"
          style="line-height: 1.2"
        >
          Quản lý Voucher
        </h2>
        <span class="text-caption text-indigo-darken-4"
          >Cấu hình mã giảm giá và khuyến mãi</span
        >
      </div>
      <v-btn
        color="indigo-darken-4"
        prepend-icon="mdi-plus"
        rounded="lg"
        elevation="0"
        variant="elevated"
        class="text-capitalize font-weight-semibold"
        @click="openModal()"
      >
        Thêm Voucher Mới
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
          placeholder="Tìm mã Voucher..."
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
          prepend-icon="mdi-ticket-percent-outline"
        >
          {{ vouchers.length }} voucher
        </v-chip>
      </div>

      <v-divider class="mb-2" />

      <v-data-table
        :headers="headers"
        :items="vouchers"
        :search="search"
        :loading="isLoading"
        hover
        class="bg-white rounded-lg"
        no-data-text="Chưa có mã giảm giá nào"
      >
        <template v-slot:item.index="{ index }">
          <span class="font-weight-bold text-indigo-darken-4">{{
            index + 1
          }}</span>
        </template>

        <template v-slot:item.code="{ item }">
          <v-chip
            size="small"
            color="blue-darken-2"
            variant="outlined"
            class="font-weight-bold text-uppercase"
          >
            <v-icon start size="14">mdi-ticket</v-icon>{{ item.code }}
          </v-chip>
        </template>

        <template v-slot:item.discount="{ item }">
          <div class="text-body-2 font-weight-bold text-red-darken-1 mb-1">
            <span v-if="item.discount_type === 'percent'"
              >Giảm {{ item.discount_value }}%</span
            >
            <span v-else>Giảm {{ formatPrice(item.discount_value) }}</span>
          </div>
          <div v-if="item.max_discount" class="text-caption text-grey-darken-2">
            (Tối đa: {{ formatPrice(item.max_discount) }})
          </div>
        </template>

        <template v-slot:item.condition="{ item }">
          <div class="text-caption text-grey-darken-2">Đơn tối thiểu:</div>
          <div class="text-body-2 font-weight-medium text-black">
            {{ formatPrice(item.min_order_value) }}
          </div>
        </template>

        <template v-slot:item.usage="{ item }">
          <span class="text-body-2 text-black font-weight-bold">{{
            item.used_count
          }}</span>
          <span class="text-caption text-grey-darken-1 mx-1">/</span>
          <span class="text-body-2 text-black">{{
            item.usage_limit || "∞"
          }}</span>
        </template>

        <template v-slot:item.time="{ item }">
          <div class="text-caption text-grey-darken-3 mb-1">
            <span class="font-weight-bold text-green-darken-2">Từ:</span>
            {{ formatDateDisplay(item.start_date) }}
          </div>
          <div class="text-caption text-grey-darken-3">
            <span class="font-weight-bold text-red-darken-2">Đến:</span>
            {{ formatDateDisplay(item.end_date) }}
          </div>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-center align-center gap-2">
            <v-btn
              color="amber-darken-2"
              size="small"
              rounded="lg"
              prepend-icon="mdi-pencil"
              variant="tonal"
              class="text-capitalize"
              @click="openModal(item)"
              >Sửa</v-btn
            >
            <v-btn
              color="red-darken-1"
              size="small"
              rounded="lg"
              prepend-icon="mdi-delete"
              variant="tonal"
              class="text-capitalize"
              @click="handleDelete(item)"
              >Xóa</v-btn
            >
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="showModal" max-width="700px" persistent scrollable>
      <v-card rounded="xl" elevation="8" theme="light" color="white">
        <div
          class="d-flex align-center justify-space-between px-6 py-4"
          style="background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%)"
        >
          <div class="d-flex align-center gap-3">
            <v-icon color="white" size="22">
              {{ isEditMode ? "mdi-pencil-circle" : "mdi-plus-circle" }}
            </v-icon>
            <span class="text-body-1 font-weight-bold text-white">
              {{ isEditMode ? "Cập nhật Voucher" : "Thêm Voucher Mới" }}
            </span>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            size="small"
            @click="closeModal"
            :disabled="isLoading"
          ></v-btn>
        </div>

        <v-card-text
          class="px-6 py-5 bg-white"
          style="max-height: 75vh; overflow-y: auto"
        >
          <form @submit.prevent="handleSave">
            <v-row>
              <v-col cols="12">
                <h4
                  class="text-subtitle-1 font-weight-bold text-indigo-darken-4 mb-2 d-flex align-center"
                >
                  <v-icon size="20" class="mr-2"
                    >mdi-information-outline</v-icon
                  >
                  Thông tin Voucher
                </h4>
              </v-col>
              <v-col cols="12" md="6" class="py-1">
                <label
                  class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                  >Mã Code <span class="text-red">*</span></label
                >
                <input
                  v-model="formData.code"
                  type="text"
                  class="custom-input text-black text-uppercase"
                  required
                  placeholder="VD: SUMMER2024"
                />
              </v-col>
              <v-col cols="12" md="6" class="py-1">
                <label
                  class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                  >Loại giảm giá <span class="text-red">*</span></label
                >
                <select
                  v-model="formData.discount_type"
                  class="custom-input text-black"
                  required
                >
                  <option value="percent">Giảm theo %</option>
                  <option value="fixed_amount">Giảm số tiền cố định</option>
                </select>
              </v-col>

              <v-col cols="12" md="6" class="py-1 mt-2">
                <label
                  class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                  >Giá trị giảm <span class="text-red">*</span></label
                >
                <input
                  v-model="formData.discount_value"
                  type="number"
                  step="0.01"
                  class="custom-input text-black"
                  required
                />
              </v-col>
              <v-col cols="12" md="6" class="py-1 mt-2">
                <label
                  class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                  >Giảm tối đa (Nếu theo %)</label
                >
                <input
                  v-model="formData.max_discount"
                  type="number"
                  class="custom-input text-black"
                  placeholder="Để trống nếu không giới hạn"
                />
              </v-col>

              <v-col cols="12" class="mt-4">
                <h4
                  class="text-subtitle-1 font-weight-bold text-indigo-darken-4 mb-2 d-flex align-center"
                >
                  <v-icon size="20" class="mr-2"
                    >mdi-shield-check-outline</v-icon
                  >
                  Điều kiện áp dụng
                </h4>
              </v-col>
              <v-col cols="12" md="6" class="py-1">
                <label
                  class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                  >Giá trị đơn tối thiểu</label
                >
                <input
                  v-model="formData.min_order_value"
                  type="number"
                  class="custom-input text-black"
                  placeholder="Mặc định: 0"
                />
              </v-col>
              <v-col cols="12" md="6" class="py-1">
                <label
                  class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                  >Số lượng giới hạn</label
                >
                <input
                  v-model="formData.usage_limit"
                  type="number"
                  class="custom-input text-black"
                  placeholder="Để trống là vô hạn"
                />
              </v-col>

              <v-col cols="12" class="mt-4">
                <h4
                  class="text-subtitle-1 font-weight-bold text-indigo-darken-4 mb-2 d-flex align-center"
                >
                  <v-icon size="20" class="mr-2"
                    >mdi-calendar-clock-outline</v-icon
                  >
                  Thời gian hiệu lực
                </h4>
              </v-col>
              <v-col cols="12" md="6" class="py-1">
                <label
                  class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                  >Ngày bắt đầu <span class="text-red">*</span></label
                >
                <input
                  v-model="formData.start_date"
                  type="datetime-local"
                  class="custom-input text-black"
                  required
                />
              </v-col>
              <v-col cols="12" md="6" class="py-1">
                <label
                  class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                  >Ngày kết thúc <span class="text-red">*</span></label
                >
                <input
                  v-model="formData.end_date"
                  type="datetime-local"
                  class="custom-input text-black"
                  required
                />
              </v-col>
            </v-row>
          </form>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="px-6 py-4 gap-3 bg-white">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="tonal"
            rounded="lg"
            min-width="110"
            class="text-capitalize"
            @click="closeModal"
            :disabled="isLoading"
          >
            <v-icon start>mdi-close</v-icon>Hủy bỏ
          </v-btn>
          <v-btn
            color="indigo-darken-4"
            variant="elevated"
            rounded="lg"
            min-width="140"
            class="text-capitalize"
            @click="handleSave"
            :loading="isLoading"
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
import VoucherService from "@/services/voucher.service";
import Loading from "@/components/Loading.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

const vouchers = ref([]);
const showModal = ref(false);
const isEditMode = ref(false);
const isLoading = ref(false);
const search = ref("");
const confirmDialogRef = ref(null);
const snackbar = ref({ show: false, text: "", color: "success" });
const headers = [
  {
    title: "STT",
    key: "index",
    width: "70px",
    align: "center",
    sortable: false,
  },
  { title: "Mã Voucher", key: "code", align: "start", width: "160px" },
  { title: "Loại / Giá trị", key: "discount", align: "start" },
  { title: "Điều kiện", key: "condition", align: "start" },
  { title: "Đã dùng / Giới hạn", key: "usage", align: "center" },
  { title: "Thời gian", key: "time", align: "start" },
  {
    title: "Thao tác",
    key: "actions",
    sortable: false,
    align: "center",
    width: "180px",
  },
];

const formData = ref({
  id: null,
  code: "",
  discount_type: "percent",
  discount_value: 0,
  min_order_value: 0,
  max_discount: null,
  usage_limit: null,
  start_date: "",
  end_date: "",
});

const showMessage = (text, color = "success") => {
  snackbar.value = { show: true, text, color };
};

const formatPrice = (value) => {
  if (!value) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const formatForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date - tzOffset).toISOString().slice(0, 16);
};

const formatDateDisplay = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("vi-VN");
};

const fetchVouchers = async () => {
  isLoading.value = true;
  try {
    vouchers.value = await VoucherService.getAll();
  } catch (error) {
    showMessage("Lỗi khi tải dữ liệu voucher", "error");
  } finally {
    isLoading.value = false;
  }
};

const openModal = (voucher = null) => {
  if (voucher) {
    isEditMode.value = true;
    formData.value = {
      ...voucher,
      start_date: formatForInput(voucher.start_date),
      end_date: formatForInput(voucher.end_date),
    };
  } else {
    isEditMode.value = false;
    formData.value = {
      id: null,
      code: "",
      discount_type: "percent",
      discount_value: 0,
      min_order_value: 0,
      max_discount: null,
      usage_limit: null,
      start_date: "",
      end_date: "",
    };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleSave = async () => {
  if (
    !formData.value.code ||
    !formData.value.start_date ||
    !formData.value.end_date
  ) {
    showMessage("Vui lòng điền các trường bắt buộc (*)", "error");
    return;
  }

  isLoading.value = true;
  try {
    const payload = {
      ...formData.value,
      max_discount: formData.value.max_discount || null,
      usage_limit: formData.value.usage_limit || null,
    };

    if (new Date(payload.start_date) >= new Date(payload.end_date)) {
      showMessage("Ngày kết thúc phải sau ngày bắt đầu!", "error");
      isLoading.value = false;
      return;
    }

    if (isEditMode.value) {
      await VoucherService.update(payload.id, payload);
      showMessage("Cập nhật voucher thành công!");
    } else {
      await VoucherService.create(payload);
      showMessage("Thêm voucher mới thành công!");
    }

    closeModal();
    await fetchVouchers();
  } catch (error) {
    showMessage(
      error.response?.data?.message || "Lỗi khi lưu dữ liệu",
      "error",
    );
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = async (voucher) => {
  const isConfirmed = await confirmDialogRef.value.open(
    "Xóa Voucher",
    `Bạn có chắc chắn muốn xóa mã giảm giá "${voucher.code}"?`,
  );

  if (!isConfirmed) return;

  isLoading.value = true;
  try {
    await VoucherService.delete(voucher.id);
    showMessage("Xóa voucher thành công!");
    await fetchVouchers();
  } catch (error) {
    showMessage("Không thể xóa voucher này.", "error");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchVouchers();
});
</script>

<style scoped>
.custom-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #c5cae9;
  border-radius: 10px;
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
select.custom-input,
input[type="datetime-local"].custom-input {
  cursor: pointer;
}
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
