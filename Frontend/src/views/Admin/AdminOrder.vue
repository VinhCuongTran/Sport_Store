<template>
  <div class="order-manager">
    <Loading :visible="isLoading" text="Đang tải dữ liệu..." />

    <div class="header-actions">
      <h2>Quản lý Đơn hàng</h2>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Mã ĐH</th>
          <th>Khách hàng</th>
          <th>Ngày đặt</th>
          <th>Tổng tiền</th>
          <th>Thanh toán</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td>
            <strong>#{{ order.id }}</strong>
          </td>
          <td>
            {{ order.receiver_name }}<br />
            <small>{{ order.phone_number }}</small>
          </td>
          <td>{{ formatDate(order.created_at) }}</td>
          <td>
            <strong class="text-danger">{{
              formatPrice(order.total_price)
            }}</strong>
          </td>
          <td>
            <span :class="['badge', `pay-${order.payment_status}`]">
              {{ getPaymentStatus(order.payment_status) }}
            </span>
          </td>
          <td>
            <span :class="['badge', `status-${order.status}`]">
              {{ getOrderStatus(order.status) }}
            </span>
          </td>
          <td>
            <button @click="openModal(order.id)" class="btn btn-save">
              Chi tiết & Xử lý
            </button>
          </td>
        </tr>
        <tr v-if="orders.length === 0">
          <td colspan="7" class="text-center">Chưa có đơn hàng nào.</td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content scrollable">
        <div class="modal-header">
          <h3>Chi tiết Đơn hàng #{{ selectedOrder?.id }}</h3>
          <button @click="closeModal" class="btn btn-cancel btn-sm">
            X Đóng
          </button>
        </div>

        <div v-if="selectedOrder" class="order-details">
          <div class="info-section">
            <h4>Thông tin giao hàng</h4>
            <p>
              <strong>Người nhận:</strong> {{ selectedOrder.receiver_name }}
            </p>
            <p><strong>Số ĐT:</strong> {{ selectedOrder.phone_number }}</p>
            <p>
              <strong>Địa chỉ:</strong> {{ selectedOrder.shipping_address }}
            </p>
            <p>
              <strong>PT Thanh toán:</strong> {{ selectedOrder.payment_method }}
            </p>
          </div>

          <div class="info-section">
            <h4>Danh sách sản phẩm</h4>
            <table class="data-table mb-3">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Phân loại</th>
                  <th>Đơn giá</th>
                  <th>SL</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedOrder.items" :key="item.id">
                  <td>{{ item.product_name }}</td>
                  <td>{{ item.color }} - {{ item.size }}</td>
                  <td>{{ formatPrice(item.price) }}</td>
                  <td>x{{ item.quantity }}</td>
                  <td>{{ formatPrice(item.price * item.quantity) }}</td>
                </tr>
              </tbody>
            </table>

            <div class="order-summary">
              <p>Tạm tính: {{ formatPrice(selectedOrder.subtotal) }}</p>
              <p>
                Giảm giá (Voucher): -{{
                  formatPrice(selectedOrder.discount_amount)
                }}
              </p>
              <p>
                <strong
                  >Tổng thanh toán:
                  <span class="text-danger">{{
                    formatPrice(selectedOrder.total_price)
                  }}</span></strong
                >
              </p>
            </div>
          </div>

          <div class="info-section update-section">
            <h4>Cập nhật trạng thái</h4>
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Trạng thái thanh toán</label>
                <select v-model="statusForm.payment_status" class="input-text">
                  <option value="unpaid">Chưa thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="refunded">Đã hoàn tiền</option>
                </select>
              </div>
              <div class="form-group flex-1">
                <label>Trạng thái đơn hàng</label>
                <select v-model="statusForm.status" class="input-text">
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="shipping">Đang giao hàng</option>
                  <option value="completed">Giao thành công</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>
            <div class="text-right mt-2">
              <button
                @click="updateStatus"
                class="btn btn-save"
                :disabled="isLoading"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import OrderService from "@/services/order.service";
import Loading from "@/components/Loading.vue";

const orders = ref([]);
const isLoading = ref(false);
const showModal = ref(false);
const selectedOrder = ref(null);

const statusForm = ref({
  status: "",
  payment_status: "",
});

const formatPrice = (val) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    val || 0,
  );
const formatDate = (date) => new Date(date).toLocaleString("vi-VN");

const getOrderStatus = (status) => {
  const map = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    shipping: "Đang giao",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };
  return map[status] || status;
};

const getPaymentStatus = (status) => {
  const map = { unpaid: "Chưa TT", paid: "Đã TT", refunded: "Đã Hoàn" };
  return map[status] || status;
};

const fetchOrders = async () => {
  isLoading.value = true;
  try {
    orders.value = await OrderService.getAll();
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const openModal = async (orderId) => {
  isLoading.value = true;
  try {
    const data = await OrderService.get(orderId);
    selectedOrder.value = data;
    statusForm.value.status = data.status;
    statusForm.value.payment_status = data.payment_status;
    showModal.value = true;
  } catch (error) {
    alert("Lỗi khi tải chi tiết đơn hàng");
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  selectedOrder.value = null;
};

const updateStatus = async () => {
  isLoading.value = true;
  try {
    await OrderService.updateStatus(selectedOrder.value.id, statusForm.value);
    alert("Cập nhật thành công!");
    closeModal();
    await fetchOrders();
  } catch (error) {
    alert(error.response?.data?.message || "Lỗi cập nhật");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => fetchOrders());
</script>

<style scoped>
.order-manager {
  max-width: 1200px;
  margin: auto;
}
.header-actions {
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
.text-center {
  text-align: center;
}
.text-danger {
  color: #dc3545;
}
.text-right {
  text-align: right;
}
.mb-3 {
  margin-bottom: 15px;
}
.mt-2 {
  margin-top: 10px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}
.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}
.btn-save {
  background-color: #007bff;
}
.btn-cancel {
  background-color: #6c757d;
}

/* Badges */
.badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
  color: white;
  display: inline-block;
}
.status-pending {
  background-color: #ffc107;
  color: #000;
}
.status-confirmed {
  background-color: #17a2b8;
}
.status-shipping {
  background-color: #0d6efd;
}
.status-completed {
  background-color: #198754;
}
.status-cancelled {
  background-color: #dc3545;
}

.pay-unpaid {
  background-color: #6c757d;
}
.pay-paid {
  background-color: #198754;
}
.pay-refunded {
  background-color: #fd7e14;
}

/* Modal */
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
  width: 800px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
}
.modal-header h3 {
  margin: 0;
}
.info-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #eee;
}
.info-section h4 {
  margin-top: 0;
  border-bottom: 2px solid #ddd;
  padding-bottom: 5px;
  margin-bottom: 10px;
}
.order-summary {
  text-align: right;
  font-size: 1.1em;
  border-top: 1px dashed #ccc;
  padding-top: 10px;
}
.update-section {
  background: #e9ecef;
}
.form-row {
  display: flex;
  gap: 15px;
}
.form-group {
  flex: 1;
}
.input-text {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 5px;
}
</style>
