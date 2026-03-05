<template>
  <div class="voucher-manager">
    <Loading :visible="isLoading" text="Đang xử lý dữ liệu..." />

    <div class="header-actions">
      <h2>Quản lý Voucher (Mã giảm giá)</h2>
      <button @click="openModal()" class="btn btn-add">+ Thêm Voucher</button>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>STT</th>
          <th>Mã Voucher</th>
          <th>Loại / Giá trị</th>
          <th>Điều kiện</th>
          <th>Đã dùng / Giới hạn</th>
          <th>Thời gian</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(voucher, index) in vouchers" :key="voucher.id">
          <td>{{ index + 1 }}</td>
          <td>
            <strong>{{ voucher.code }}</strong>
          </td>
          <td>
            <span v-if="voucher.discount_type === 'percent'"
              >{{ voucher.discount_value }}%</span
            >
            <span v-else>{{ formatPrice(voucher.discount_value) }}</span>
            <br />
            <small v-if="voucher.max_discount" class="text-muted"
              >Tối đa: {{ formatPrice(voucher.max_discount) }}</small
            >
          </td>
          <td>
            Đơn tối thiểu:<br />{{ formatPrice(voucher.min_order_value) }}
          </td>
          <td>{{ voucher.used_count }} / {{ voucher.usage_limit || "∞" }}</td>
          <td>
            <small>Từ: {{ formatDateDisplay(voucher.start_date) }}</small
            ><br />
            <small>Đến: {{ formatDateDisplay(voucher.end_date) }}</small>
          </td>
          <td>
            <button @click="openModal(voucher)" class="btn btn-edit">
              Sửa
            </button>
            <button @click="handleDelete(voucher.id)" class="btn btn-delete">
              Xóa
            </button>
          </td>
        </tr>
        <tr v-if="vouchers.length === 0">
          <td colspan="7" class="text-center">Chưa có mã giảm giá nào.</td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content scrollable">
        <h3>{{ isEditMode ? "Cập nhật Voucher" : "Thêm Voucher Mới" }}</h3>

        <form @submit.prevent="handleSave">
          <div class="form-row">
            <div class="form-group flex-1">
              <label>Mã Code *</label>
              <input
                v-model="formData.code"
                type="text"
                class="input-text"
                required
                placeholder="VD: SUMMER2024"
              />
            </div>
            <div class="form-group flex-1">
              <label>Loại giảm giá *</label>
              <select
                v-model="formData.discount_type"
                class="input-text"
                required
              >
                <option value="percent">Giảm theo %</option>
                <option value="fixed_amount">Giảm số tiền cố định</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label>Giá trị giảm *</label>
              <input
                v-model="formData.discount_value"
                type="number"
                step="0.01"
                class="input-text"
                required
              />
            </div>
            <div class="form-group flex-1">
              <label>Giảm tối đa (Nếu theo %)</label>
              <input
                v-model="formData.max_discount"
                type="number"
                class="input-text"
                placeholder="Để trống nếu không giới hạn"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label>Giá trị đơn tối thiểu</label>
              <input
                v-model="formData.min_order_value"
                type="number"
                class="input-text"
                placeholder="Mặc định: 0"
              />
            </div>
            <div class="form-group flex-1">
              <label>Số lượng giới hạn</label>
              <input
                v-model="formData.usage_limit"
                type="number"
                class="input-text"
                placeholder="Để trống là vô hạn"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label>Ngày bắt đầu *</label>
              <input
                v-model="formData.start_date"
                type="datetime-local"
                class="input-text"
                required
              />
            </div>
            <div class="form-group flex-1">
              <label>Ngày kết thúc *</label>
              <input
                v-model="formData.end_date"
                type="datetime-local"
                class="input-text"
                required
              />
            </div>
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn btn-save" :disabled="isLoading">
              Lưu lại
            </button>
            <button
              type="button"
              @click="closeModal"
              class="btn btn-cancel"
              :disabled="isLoading"
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import VoucherService from "@/services/voucher.service";
import Loading from "@/components/Loading.vue";

const vouchers = ref([]);
const showModal = ref(false);
const isEditMode = ref(false);
const isLoading = ref(false);

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

const formatPrice = (value) => {
  if (!value) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

// Hàm chuyển Date của SQL sang định dạng "YYYY-MM-DDTHH:mm" để bind vào <input type="datetime-local">
const formatForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  const localISOTime = new Date(date - tzOffset).toISOString().slice(0, 16);
  return localISOTime;
};

// Định dạng ngày giờ hiển thị ở bảng
const formatDateDisplay = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("vi-VN");
};

const fetchVouchers = async () => {
  isLoading.value = true;
  try {
    vouchers.value = await VoucherService.getAll();
  } catch (error) {
    console.error("Lỗi khi tải voucher", error);
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
  isLoading.value = true;
  try {
    const payload = {
      ...formData.value,
      // Đảm bảo null nếu để trống
      max_discount: formData.value.max_discount || null,
      usage_limit: formData.value.usage_limit || null,
    };

    if (new Date(payload.start_date) >= new Date(payload.end_date)) {
      alert("Ngày kết thúc phải sau ngày bắt đầu!");
      isLoading.value = false;
      return;
    }

    if (isEditMode.value) {
      await VoucherService.update(payload.id, payload);
    } else {
      await VoucherService.create(payload);
    }

    closeModal();
    await fetchVouchers();
  } catch (error) {
    alert(error.response?.data?.message || "Lỗi khi lưu dữ liệu");
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = async (id) => {
  if (!confirm("Bạn có chắc chắn muốn xóa voucher này?")) return;
  isLoading.value = true;
  try {
    await VoucherService.delete(id);
    await fetchVouchers();
  } catch (error) {
    alert("Không thể xóa voucher.");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchVouchers();
});
</script>

<style scoped>
/* Có thể dùng lại CSS y hệt của AdminProduct.vue hoặc AdminBrand.vue */
.voucher-manager {
  max-width: 1100px;
  margin: auto;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}
.data-table th,
.data-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
  vertical-align: middle;
}
.data-table th {
  background-color: #f4f6f9;
}
.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  margin-right: 5px;
}
.btn-add {
  background-color: #28a745;
}
.btn-edit {
  background-color: #ffc107;
  color: #000;
}
.btn-delete {
  background-color: #dc3545;
}
.btn-save {
  background-color: #007bff;
}
.btn-cancel {
  background-color: #6c757d;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.input-text {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin-top: 5px;
}
.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}
.form-group {
  margin-bottom: 15px;
}
.flex-1 {
  flex: 1;
}
.text-muted {
  color: #6c757d;
  font-size: 0.85em;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  width: 650px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
