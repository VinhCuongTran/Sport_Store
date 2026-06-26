<template>
  <v-container
    fluid
    theme="light"
    class="fill-height d-flex flex-column align-center pa-6"
    style="background-color: #f4f6f8; min-height: 100vh"
  >
    <div
      class="d-flex justify-space-between align-center w-100 mb-6 flex-wrap gap-4"
    >
      <div>
        <h2
          class="text-h5 font-weight-bold text-red-darken-4"
          style="line-height: 1.2"
        >
          <v-icon color="red-darken-4" class="mr-2">mdi-alert-decagram</v-icon>
          Sản phẩm sắp hết hàng
        </h2>
        <span class="text-caption text-grey-darken-2"
          >Danh sách các biến thể sản phẩm có số lượng tồn kho thấp</span
        >
      </div>

      <div class="d-flex align-center">
        <v-text-field
          v-model="searchKeyword"
          prepend-inner-icon="mdi-magnify"
          label="Tìm kiếm sản phẩm..."
          variant="outlined"
          density="compact"
          bg-color="white"
          hide-details
          class="mr-4 rounded-lg"
          style="min-width: 250px"
        ></v-text-field>

        <v-btn
          color="red-darken-4"
          prepend-icon="mdi-refresh"
          rounded="lg"
          variant="tonal"
          class="text-capitalize"
          @click="fetchLowStock"
          :loading="isLoading"
        >
          Làm Mới
        </v-btn>
      </div>
    </div>

    <v-card
      color="white"
      width="100%"
      elevation="0"
      rounded="xl"
      class="pa-4"
      style="
        border: 1px solid rgba(211, 47, 47, 0.15);
        box-shadow: 0 4px 24px rgba(211, 47, 47, 0.1);
      "
    >
      <v-data-table
        :headers="headers"
        :items="lowStockItems"
        :search="searchKeyword"
        :loading="isLoading"
        hover
        class="bg-white rounded-lg custom-table"
        no-data-text="Tuyệt vời! Hiện không có sản phẩm nào sắp hết hàng."
      >
        <template v-slot:item.index="{ index }">
          <span class="font-weight-medium text-grey-darken-1">{{
            index + 1
          }}</span>
        </template>
        <template v-slot:item.product_name="{ item }">
          <span class="font-weight-bold text-indigo-darken-4">{{
            item.product_name
          }}</span>
        </template>
        <template v-slot:item.variant="{ item }">
          <v-chip
            size="small"
            color="blue-grey"
            variant="outlined"
            class="mr-1"
            >{{ item.color || "N/A" }}</v-chip
          >
          <v-chip size="small" color="blue-grey" variant="outlined">{{
            item.size || "N/A"
          }}</v-chip>
        </template>
        <template v-slot:item.stock="{ item }">
          <v-chip
            size="small"
            :color="item.stock === 0 ? 'red-darken-4' : 'amber-darken-4'"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.stock }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn
            color="green-darken-2"
            size="small"
            variant="tonal"
            rounded="lg"
            prepend-icon="mdi-package-down"
            @click="openImportDialog(item)"
          >
            Nhập kho
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialogImportStock" max-width="450" persistent>
      <v-card rounded="xl">
        <v-card-title
          class="text-h6 font-weight-bold bg-green-darken-3 text-white pa-4"
        >
          <v-icon class="mr-2">mdi-package-down</v-icon>
          Phiếu Nhập Kho Mới
        </v-card-title>

        <v-card-text class="pt-6">
          <div class="mb-2">
            <span class="font-weight-bold">Sản phẩm:</span>
            <span class="text-indigo-darken-4 ml-1">{{
              selectedVariant?.product_name
            }}</span>
          </div>
          <div class="mb-4">
            <span class="font-weight-bold">Phân loại:</span>
            <v-chip size="small" class="ml-2 mr-1">{{
              selectedVariant?.color || "N/A"
            }}</v-chip>
            <v-chip size="small">{{ selectedVariant?.size || "N/A" }}</v-chip>
          </div>
          <div
            class="mb-5 bg-grey-lighten-4 pa-3 rounded-lg border d-flex align-center justify-space-between"
          >
            <span>Tồn kho hiện tại:</span>
            <strong
              :class="
                selectedVariant?.stock === 0
                  ? 'text-red'
                  : 'text-amber-darken-4'
              "
              class="text-h5"
            >
              {{ selectedVariant?.stock }}
            </strong>
          </div>

          <v-text-field
            v-model.number="stockToAdd"
            label="Số lượng nhập thêm"
            type="number"
            min="1"
            variant="outlined"
            density="comfortable"
            color="green-darken-3"
            prepend-inner-icon="mdi-counter"
            class="mb-2"
          ></v-text-field>
          <v-text-field
            v-model.number="importPrice"
            label="Giá nhập (VNĐ / 1 sản phẩm)"
            type="number"
            min="0"
            variant="outlined"
            density="comfortable"
            color="green-darken-3"
            prepend-inner-icon="mdi-currency-usd"
            hint="Dùng để thống kê lợi nhuận"
            persistent-hint
          ></v-text-field>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            color="grey-darken-2"
            class="text-capitalize px-4"
            @click="dialogImportStock = false"
            rounded="lg"
            >Hủy bỏ</v-btn
          >
          <v-btn
            color="green-darken-3"
            variant="elevated"
            class="text-capitalize px-6"
            :loading="isUpdating"
            @click="submitImportStock"
            rounded="lg"
            >Lưu Phiếu Nhập</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import api from "@/services/api.service";

const toast = useToast();
const route = useRoute();
const router = useRouter();

const isLoading = ref(false);
const lowStockItems = ref([]);
const searchKeyword = ref("");

const dialogImportStock = ref(false);
const isUpdating = ref(false);
const selectedVariant = ref(null);
const stockToAdd = ref(1);
const importPrice = ref(0);

const headers = [
  {
    title: "STT",
    key: "index",
    align: "center",
    sortable: false,
    width: "70px",
  },
  {
    title: "Tên Sản phẩm",
    key: "product_name",
    align: "start",
    sortable: true,
  },
  { title: "Phân loại", key: "variant", align: "start", sortable: false },
  {
    title: "Tồn kho",
    key: "stock",
    align: "center",
    sortable: true,
    width: "120px",
  },
  {
    title: "Thao tác",
    key: "actions",
    sortable: false,
    align: "center",
    width: "160px",
  },
];

const fetchLowStock = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/stats");
    lowStockItems.value = response.data.lowStockProducts || [];

    // --- LOGIC TỰ ĐỘNG MỞ FORM NẾU CÓ QUERY PARAM ---
    if (route.query.open_import) {
      const targetId = String(route.query.open_import);

      // Tìm sản phẩm có id, product_id hoặc variant_id trùng khớp
      const targetItem = lowStockItems.value.find(
        (item) =>
          String(item.product_id) === targetId ||
          String(item.variant_id) === targetId ||
          String(item.id) === targetId,
      );

      if (targetItem) {
        openImportDialog(targetItem);
      }

      // Xóa query trên URL để khi người dùng F5 không bị mở lại form cũ
      router.replace({ query: {} });
    }
  } catch (error) {
    toast.error("Không thể tải dữ liệu tồn kho.");
  } finally {
    isLoading.value = false;
  }
};

const openImportDialog = (item) => {
  selectedVariant.value = item.raw || item;
  stockToAdd.value = 1;
  importPrice.value = 0;
  dialogImportStock.value = true;
};

const submitImportStock = async () => {
  if (stockToAdd.value < 1) return toast.error("Số lượng nhập phải lớn hơn 0");
  if (importPrice.value < 0) return toast.error("Giá nhập không được để số âm");

  isUpdating.value = true;
  try {
    const variantId =
      selectedVariant.value.variant_id || selectedVariant.value.id;
    await api.post(`/products/variants/${variantId}/import`, {
      quantity_added: stockToAdd.value,
      import_price: importPrice.value,
    });

    const newStock = selectedVariant.value.stock + stockToAdd.value;
    selectedVariant.value.stock = newStock;

    if (newStock > 20) {
      lowStockItems.value = lowStockItems.value.filter(
        (item) => (item.variant_id || item.id) !== variantId,
      );
    }

    toast.success("Đã lưu phiếu nhập kho thành công!");
    dialogImportStock.value = false;
  } catch (error) {
    toast.error("Nhập kho thất bại. Vui lòng thử lại.");
  } finally {
    isUpdating.value = false;
  }
};

// Theo dõi thay đổi của route để tự mở nếu người dùng đang ở sẵn trang admin-low-stock mà bấm vào thông báo khác
watch(
  () => route.query.open_import,
  (newId) => {
    if (newId && lowStockItems.value.length > 0) {
      const targetItem = lowStockItems.value.find(
        (item) =>
          String(item.product_id) === String(newId) ||
          String(item.variant_id) === String(newId) ||
          String(item.id) === String(newId),
      );
      if (targetItem) {
        openImportDialog(targetItem);
        router.replace({ query: {} });
      }
    }
  },
);

onMounted(() => fetchLowStock());
</script>

<style scoped>
:deep(.custom-table th) {
  background-color: #ffffff !important;
  color: #333 !important;
}
:deep(.custom-table th:hover) {
  background-color: #f1f5f9 !important;
  transition: background-color 0.2s;
}
:deep(.v-data-table__tr:hover td) {
  background-color: #f8fafc !important;
}
</style>
