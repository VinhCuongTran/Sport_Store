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
          Quản lý Đơn hàng
        </h2>
        <span class="text-caption text-indigo-darken-4"
          >Theo dõi và xử lý đơn đặt hàng</span
        >
      </div>
      <v-btn
        color="indigo-darken-4"
        prepend-icon="mdi-refresh"
        rounded="lg"
        elevation="0"
        class="text-capitalize font-weight-semibold"
        @click="fetchOrders"
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
          placeholder="Tìm mã ĐH, tên, SĐT..."
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
          {{ orders.length }} đơn hàng
        </v-chip>
      </div>

      <v-divider class="mb-2" />

      <v-data-table
        :headers="headers"
        :items="orders"
        :search="search"
        :loading="isLoading"
        hover
        class="bg-white rounded-lg"
        no-data-text="Chưa có đơn hàng nào"
      >
        <template v-slot:item.id="{ item }">
          <span class="font-weight-black text-indigo-darken-4"
            >{{ item.id }}</span
          >
        </template>

        <template v-slot:item.customer="{ item }">
          <div class="text-body-2 font-weight-bold text-black">
            {{ item.receiver_name }}
          </div>
          <div class="text-caption text-grey-darken-2 d-flex align-center mt-1">
            <v-icon size="12" class="mr-1">mdi-phone</v-icon
            >{{ item.phone_number }}
          </div>
        </template>

        <template v-slot:item.created_at="{ item }">
          <span class="text-body-2 text-black">{{
            formatDate(item.created_at)
          }}</span>
        </template>

        <template v-slot:item.total_price="{ item }">
          <span class="text-body-2 font-weight-bold text-red-darken-1">
            {{ formatPrice(item.total_price) }}
          </span>
        </template>

        <template v-slot:item.payment_status="{ item }">
          <v-chip
            size="small"
            :color="getPaymentColor(item.payment_status)"
            variant="flat"
            class="font-weight-medium"
          >
            {{ getPaymentStatus(item.payment_status) }}
          </v-chip>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            size="small"
            :color="getStatusColor(item.status)"
            variant="flat"
            class="font-weight-medium"
          >
            {{ getOrderStatus(item.status) }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            color="indigo-darken-1"
            size="small"
            rounded="lg"
            prepend-icon="mdi-eye"
            variant="tonal"
            class="text-capitalize"
            @click="openModal(item.id)"
          >
            Chi tiết
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="showModal" max-width="900px" persistent scrollable>
      <v-card
        rounded="xl"
        elevation="8"
        theme="light"
        color="white"
        v-if="selectedOrder"
      >
        <div
          class="d-flex align-center justify-space-between px-6 py-4"
          style="background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%)"
        >
          <div class="d-flex align-center gap-3">
            <v-icon color="white" size="22">mdi-information-outline</v-icon>
            <span class="text-body-1 font-weight-bold text-white">
              Chi tiết Đơn hàng #{{ selectedOrder.id }}
            </span>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            size="small"
            @click="closeModal"
            :disabled="isUpdating"
          ></v-btn>
        </div>

        <v-card-text
          class="px-6 py-5 bg-white"
          style="max-height: 75vh; overflow-y: auto"
        >
          <v-row>
            <v-col cols="12" md="6">
              <div class="info-card h-100">
                <h4
                  class="text-subtitle-1 font-weight-bold text-indigo-darken-4 mb-3 d-flex align-center"
                >
                  <v-icon size="20" class="mr-2">mdi-map-marker-outline</v-icon>
                  Thông tin giao hàng
                </h4>
                <div class="text-body-2 text-black line-height-2">
                  <p class="mb-2">
                    <span class="text-grey-darken-2">Người nhận:</span>
                    <strong class="text-black">{{
                      selectedOrder.receiver_name
                    }}</strong>
                  </p>
                  <p class="mb-2">
                    <span class="text-grey-darken-2">Số điện thoại:</span>
                    <strong class="text-black">{{
                      selectedOrder.phone_number
                    }}</strong>
                  </p>
                  <p class="mb-2">
                    <span class="text-grey-darken-2">Địa chỉ:</span>
                    <strong class="text-black">{{
                      selectedOrder.shipping_address
                    }}</strong>
                  </p>
                  <p class="mb-0">
                    <span class="text-grey-darken-2">PT Thanh toán:</span>
                    <strong class="text-black text-uppercase">{{
                      selectedOrder.payment_method
                    }}</strong>
                  </p>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-card update-card h-100">
                <h4
                  class="text-subtitle-1 font-weight-bold text-indigo-darken-4 mb-3 d-flex align-center"
                >
                  <v-icon size="20" class="mr-2">mdi-update</v-icon> Cập nhật
                  trạng thái
                </h4>

                <div class="mb-4">
                  <label
                    class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                    >Trạng thái đơn hàng</label
                  >
                  <select
                    v-model="statusForm.status"
                    class="custom-input text-black"
                  >
                    <option value="pending">Chờ xác nhận</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="shipping">Đang giao hàng</option>
                    <option value="completed">Giao thành công</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>

                <div>
                  <label
                    class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                  >
                    Trạng thái thanh toán
                    <span
                      v-if="statusForm.status === 'completed'"
                      class="text-green-darken-2 text-caption ml-1"
                    >
                      (Đã tự động cập nhật)
                    </span>
                  </label>
                  <select
                    v-model="statusForm.payment_status"
                    class="custom-input text-black"
                    :disabled="statusForm.status === 'completed'"
                    :class="{
                      'bg-grey-lighten-3 text-grey-darken-1':
                        statusForm.status === 'completed',
                    }"
                  >
                    <option value="unpaid">Chưa thanh toán</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="refunded">Đã hoàn tiền</option>
                  </select>
                </div>
              </div>
            </v-col>
          </v-row>

          <div class="mt-6">
            <h4
              class="text-subtitle-1 font-weight-bold text-indigo-darken-4 mb-3 d-flex align-center"
            >
              <v-icon size="20" class="mr-2">mdi-format-list-bulleted</v-icon>
              Danh sách sản phẩm
            </h4>
            <v-table hover class="rounded-lg overflow-hidden border">
              <thead
                style="
                  background: linear-gradient(90deg, #e8eaf6 0%, #f3f4f6 100%);
                "
              >
                <tr>
                  <th class="text-left text-indigo-darken-3 font-weight-bold">
                    Sản phẩm
                  </th>
                  <th class="text-left text-indigo-darken-3 font-weight-bold">
                    Phân loại
                  </th>
                  <th class="text-right text-indigo-darken-3 font-weight-bold">
                    Đơn giá
                  </th>
                  <th class="text-center text-indigo-darken-3 font-weight-bold">
                    SL
                  </th>
                  <th class="text-right text-indigo-darken-3 font-weight-bold">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedOrder.items" :key="item.id">
                  <td>
                    <span class="text-body-2 font-weight-medium text-black">{{
                      item.product_name
                    }}</span>
                  </td>
                  <td>
                    <span class="text-body-2 text-grey-darken-2"
                      >{{ item.color }} - {{ item.size }}</span
                    >
                  </td>
                  <td class="text-right">
                    <span class="text-body-2 text-black">{{
                      formatPrice(item.price)
                    }}</span>
                  </td>
                  <td class="text-center">
                    <span class="text-body-2 text-black"
                      >x{{ item.quantity }}</span
                    >
                  </td>
                  <td class="text-right">
                    <span class="text-body-2 font-weight-bold text-black">{{
                      formatPrice(item.price * item.quantity)
                    }}</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>

          <div class="d-flex justify-end mt-4">
            <div
              class="summary-box bg-grey-lighten-5 rounded-lg border pa-4"
              style="min-width: 320px"
            >
              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-2 text-grey-darken-2">Tạm tính:</span>
                <span class="text-body-2 text-black font-weight-medium">{{
                  formatPrice(selectedOrder.subtotal)
                }}</span>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-2 text-grey-darken-2"
                  >Giảm giá (Voucher):</span
                >
                <span class="text-body-2 text-green-darken-2 font-weight-medium"
                  >-{{ formatPrice(selectedOrder.discount_amount) }}</span
                >
              </div>
              <v-divider class="my-3"></v-divider>
              <div class="d-flex justify-space-between align-center">
                <span class="text-body-1 font-weight-bold text-black"
                  >Tổng thanh toán:</span
                >
                <span class="text-h6 font-weight-bold text-red-darken-1">{{
                  formatPrice(selectedOrder.total_price)
                }}</span>
              </div>
            </div>
          </div>
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
            :disabled="isUpdating"
          >
            <v-icon start>mdi-close</v-icon>Đóng
          </v-btn>
          <v-btn
            color="indigo-darken-4"
            variant="elevated"
            rounded="lg"
            min-width="140"
            class="text-capitalize"
            @click="updateStatus"
            :loading="isUpdating"
          >
            <v-icon start>mdi-content-save</v-icon>Lưu Thay Đổi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { ref, onMounted, watch } from "vue";
import OrderService from "@/services/order.service";

const orders = ref([]);
const isLoading = ref(false);
const isUpdating = ref(false);
const showModal = ref(false);
const selectedOrder = ref(null);
const search = ref("");
const snackbar = ref({ show: false, text: "", color: "success" });

const statusForm = ref({
  status: "",
  payment_status: "",
});

const headers = [
  { title: "Mã ĐH", key: "id", align: "center", width: "90px" },
  { title: "Khách hàng", key: "customer", align: "start" },
  { title: "Ngày đặt", key: "created_at", align: "center" },
  { title: "Tổng tiền", key: "total_price", align: "end" },
  { title: "Thanh toán", key: "payment_status", align: "center" },
  { title: "Trạng thái", key: "status", align: "center" },
  {
    title: "Thao tác",
    key: "actions",
    sortable: false,
    align: "center",
    width: "120px",
  },
];

watch(
  () => statusForm.value.status,
  (newStatus) => {
    if (newStatus === "completed") {
      statusForm.value.payment_status = "paid";
    }
  },
);

const showMessage = (text, color = "success") => {
  snackbar.value = { show: true, text, color };
};

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

const getStatusColor = (status) => {
  const map = {
    pending: "amber-darken-2",
    confirmed: "info",
    shipping: "primary",
    completed: "success",
    cancelled: "error",
  };
  return map[status] || "grey";
};

const getPaymentStatus = (status) => {
  const map = { unpaid: "Chưa TT", paid: "Đã TT", refunded: "Đã Hoàn" };
  return map[status] || status;
};

const getPaymentColor = (status) => {
  const map = { unpaid: "grey-darken-1", paid: "success", refunded: "warning" };
  return map[status] || "grey";
};

const fetchOrders = async () => {
  isLoading.value = true;
  try {
    orders.value = await OrderService.getAll();
    orders.value = orders.value.map((o) => ({
      ...o,
      customer: `${o.receiver_name} ${o.phone_number}`,
    }));
  } catch (error) {
    showMessage("Lỗi khi tải danh sách đơn hàng", "error");
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
    showMessage("Lỗi khi tải chi tiết đơn hàng", "error");
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  selectedOrder.value = null;
};

const updateStatus = async () => {
  isUpdating.value = true;
  try {
    await OrderService.updateStatus(selectedOrder.value.id, statusForm.value);
    showMessage("Cập nhật đơn hàng thành công!");
    closeModal();
    await fetchOrders();
  } catch (error) {
    showMessage(
      error.response?.data?.message || "Lỗi cập nhật đơn hàng",
      "error",
    );
  } finally {
    isUpdating.value = false;
  }
};

onMounted(() => fetchOrders());
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
.custom-input:focus:not(:disabled) {
  border-color: #3949ab;
  box-shadow: 0 0 0 3px rgba(57, 73, 171, 0.12);
  background: #fff;
}
select.custom-input {
  cursor: pointer;
}
select.custom-input:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.border {
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.info-card {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.update-card {
  background: #f4f6f8;
}
.line-height-2 p {
  line-height: 1.6;
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
