<template>
  <v-container
    fluid
    class="pa-6"
    style="background-color: #f4f6f8; min-height: 100vh"
  >
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold text-indigo-darken-4">
          Quản lý Phiếu Nhập Kho
        </h2>
        <span class="text-caption text-grey-darken-1"
          >Tìm SP có sẵn để nhập thêm, hoặc gõ tên SP mới để tạo nhanh</span
        >
      </div>
      <v-btn
        color="indigo-darken-4"
        prepend-icon="mdi-plus"
        rounded="lg"
        @click="openCreateDialog"
      >
        Tạo Phiếu Nhập Mới
      </v-btn>
    </div>

    <!-- Bảng danh sách phiếu (Ngoài) -->
    <v-card rounded="xl" elevation="0" color="white" class="pa-4 border">
      <v-data-table
        :headers="ticketHeaders"
        :items="tickets"
        hover
        class="custom-table"
      >
        <template v-slot:item.id="{ item }">
          <span class="font-weight-bold text-indigo-darken-2"
            >#{{ item.id.substring(0, 8).toUpperCase() }}</span
          >
        </template>
        <template v-slot:item.created_at="{ item }">{{
          formatDate(item.created_at)
        }}</template>
        <template v-slot:item.actions="{ item }">
          <v-btn
            color="info"
            size="small"
            variant="tonal"
            rounded="lg"
            @click="openDetailDialog(item)"
            >Xem chi tiết</v-btn
          >
        </template>
      </v-data-table>
    </v-card>

    <!-- DIALOG: TẠO PHIẾU MỚI -->
    <v-dialog v-model="dialogCreate" max-width="1100" persistent scrollable>
      <v-card rounded="xl" color="white">
        <v-card-title
          class="bg-indigo-darken-4 text-white pa-4 font-weight-bold"
        >
          <v-icon start>mdi-file-document-edit</v-icon> Tạo Phiếu Nhập Kho Mới
        </v-card-title>

        <v-card-text class="pa-4 bg-white">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="newTicket.supplier"
                label="Công ty / Nhà cung cấp"
                variant="outlined"
                density="comfortable"
                bg-color="white"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="newTicket.note"
                label="Ghi chú"
                variant="outlined"
                density="comfortable"
                bg-color="white"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-card class="mt-4 border pa-4 bg-white" elevation="0">
            <h3
              class="text-subtitle-1 font-weight-bold mb-3 text-indigo-darken-4"
            >
              Danh sách sản phẩm kiểm/nhập
            </h3>

            <!-- COMBOBOX: Đã fix lỗi dấu cách, chỉ nhận SP mới khi nhấn Enter -->
            <v-combobox
              ref="comboboxRef"
              v-model="selectedProduct"
              v-model:search="searchProduct"
              :items="availableProducts"
              item-title="name"
              label="Tìm tên SP CÓ SẴN, hoặc gõ TÊN SP MỚI và nhấn Enter..."
              variant="outlined"
              prepend-inner-icon="mdi-magnify"
              return-object
              @update:modelValue="handleSelectProduct"
              @keydown.enter.prevent="handleEnterNewProduct"
              hide-details
              class="mb-4"
              color="indigo-darken-4"
              bg-color="white"
            ></v-combobox>

            <v-data-table
              :headers="formHeaders"
              :items="newTicket.items"
              hide-default-footer
              class="border custom-table rounded-lg"
            >
              <template v-slot:item.product_name="{ item }">
                <div
                  v-if="item.product_id"
                  class="font-weight-bold text-indigo-darken-4 pt-2"
                >
                  {{ item.product_name }}
                </div>
                <div v-else class="pt-2">
                  <v-text-field
                    v-model="item.product_name"
                    label="Tên SP (Mới)"
                    density="compact"
                    variant="underlined"
                    color="green"
                    hide-details
                  ></v-text-field>
                  <v-select
                    v-model="item.category_id"
                    :items="categories"
                    item-title="name"
                    item-value="id"
                    label="Chọn danh mục (*)"
                    density="compact"
                    variant="underlined"
                    color="green"
                    hide-details
                    class="mt-1"
                  ></v-select>
                </div>
              </template>

              <!-- Cột Phân Loại (Combobox: Chọn màu xong mới xổ Size tương ứng) -->
              <template v-slot:item.variant_info="{ item }">
                <div class="d-flex gap-2 pt-2 pb-2">
                  <v-combobox
                    v-model="item.color"
                    :items="getAvailableColors(item.product_name)"
                    placeholder="Màu (vd: Đỏ)"
                    density="compact"
                    variant="outlined"
                    hide-details
                    bg-color="white"
                    style="width: 120px"
                    class="text-body-2"
                    @update:modelValue="item.size = ''"
                  ></v-combobox>

                  <v-combobox
                    v-model="item.size"
                    :items="getAvailableSizes(item.product_name, item.color)"
                    placeholder="Size (vd: L)"
                    density="compact"
                    variant="outlined"
                    hide-details
                    bg-color="white"
                    style="width: 100px"
                    class="text-body-2"
                  ></v-combobox>
                </div>
              </template>

              <template v-slot:item.quantity_added="{ item }">
                <v-text-field
                  v-model.number="item.quantity_added"
                  type="number"
                  density="compact"
                  variant="outlined"
                  hide-details
                  min="1"
                  bg-color="white"
                  style="width: 100px"
                ></v-text-field>
              </template>

              <template v-slot:item.import_price="{ item }">
                <v-text-field
                  v-model.number="item.import_price"
                  type="number"
                  density="compact"
                  variant="outlined"
                  hide-details
                  min="0"
                  suffix="đ"
                  bg-color="white"
                  style="width: 140px"
                ></v-text-field>
              </template>

              <template v-slot:item.actions="{ index }">
                <v-btn
                  icon="mdi-delete"
                  color="red"
                  variant="text"
                  size="small"
                  @click="newTicket.items.splice(index, 1)"
                ></v-btn>
              </template>
            </v-data-table>
          </v-card>
        </v-card-text>

        <v-card-actions class="pa-4 bg-white border-t">
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            color="grey-darken-2"
            @click="dialogCreate = false"
            rounded="lg"
            >Hủy</v-btn
          >
          <v-btn
            color="indigo-darken-4"
            variant="elevated"
            @click="submitTicket"
            :loading="isSubmitting"
            rounded="lg"
            >Lưu Phiếu Nhập</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG: XEM CHI TIẾT PHIẾU (HOÀN TOÀN TRẮNG) -->
    <v-dialog v-model="dialogDetail" max-width="800">
      <v-card rounded="xl" color="white">
        <v-card-title
          class="bg-white border-b text-indigo-darken-4 pa-4 font-weight-bold d-flex justify-space-between align-center"
        >
          <span class="text-h6"
            ><v-icon start color="indigo-darken-4">mdi-text-box-search</v-icon>
            Chi tiết Phiếu #{{
              activeTicket?.id?.substring(0, 8).toUpperCase()
            }}</span
          >

          <!-- THÊM NÚT IN TẠI ĐÂY -->
            <v-btn
              color="indigo-darken-4"
              variant="tonal"
              size="small"
              class="mr-3 font-weight-bold"
              @click="printImportTicket"
            >
              <v-icon start>mdi-printer</v-icon>In Phiếu Nhập
            </v-btn>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="dialogDetail = false"
          ></v-btn>
        </v-card-title>

        <v-card-text class="pa-4 bg-white">
          <div
            class="mb-5 pa-4 rounded-lg border bg-white d-flex flex-wrap gap-6 text-body-1"
          >
            <div>
              <v-icon start color="grey-darken-2">mdi-domain</v-icon>
              <strong class="text-grey-darken-2">Công ty:</strong>
              {{ activeTicket?.supplier || "N/A" }}
            </div>
            <div>
              <v-icon start color="grey-darken-2">mdi-account-tie</v-icon>
              <strong class="text-grey-darken-2">Người kiểm:</strong>
              {{ activeTicket?.staff_name }}
            </div>
            <div>
              <v-icon start color="grey-darken-2">mdi-calendar-clock</v-icon>
              <strong class="text-grey-darken-2">Ngày nhập:</strong>
              {{ formatDate(activeTicket?.created_at) }}
            </div>
          </div>

          <v-data-table
            :headers="detailHeaders"
            :items="activeTicketDetails"
            :loading="isLoadingDetails"
            hide-default-footer
            class="border custom-table rounded-lg"
          >
            <template v-slot:item.import_price="{ item }">
              {{ formatPrice(item.import_price) }}đ
            </template>
            <template v-slot:item.total="{ item }">
              <strong class="text-indigo-darken-4"
                >{{ formatPrice(item.quantity * item.import_price) }}đ</strong
              >
            </template>
          </v-data-table>

          <div
            class="d-flex justify-end mt-4 text-h6 font-weight-bold border-t pt-4"
          >
            Tổng giá trị phiếu:
            <span class="text-red-darken-3 ml-2"
              >{{ formatPrice(activeTicket?.total_amount || 0) }}đ</span
            >
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import api from "@/services/api.service";
import { useToast } from "vue-toastification";

const toast = useToast();
const isSubmitting = ref(false);

const tickets = ref([]);
const availableProducts = ref([]);
const categories = ref([]);

// Biến cho Combobox
const selectedProduct = ref(null);
const searchProduct = ref("");
const comboboxRef = ref(null);

const dialogCreate = ref(false);
const dialogDetail = ref(false);

const activeTicket = ref(null);
const activeTicketDetails = ref([]);
const isLoadingDetails = ref(false);

const newTicket = ref({
  supplier: "",
  note: "Nhập hàng",
  items: [],
});

const ticketHeaders = [
  { title: "Mã Phiếu", key: "id", align: "start" },
  { title: "Thời gian", key: "created_at" },
  { title: "Công ty cung cấp", key: "supplier" },
  { title: "Người kiểm", key: "staff_name" },
  { title: "Tổng SP", key: "total_items", align: "center" },
  { title: "Thao tác", key: "actions", sortable: false, align: "center" },
];

const formHeaders = [
  { title: "Sản phẩm", key: "product_name", width: "250px" },
  { title: "Phân loại", key: "variant_info", width: "220px" },
  { title: "SL Nhập", key: "quantity_added", width: "120px" },
  { title: "Giá nhập", key: "import_price", width: "160px" },
  {
    title: "",
    key: "actions",
    sortable: false,
    width: "60px",
    align: "center",
  },
];

const detailHeaders = [
  { title: "Sản phẩm", key: "product_name" },
  { title: "Phân loại", key: "variant_info" },
  { title: "SL Nhập", key: "quantity", align: "center" },
  { title: "Đơn giá", key: "import_price", align: "end" },
  { title: "Thành tiền", key: "total", align: "end" },
];

// ==========================================
// CÁC HÀM XỬ LÝ COMBOBOX
// ==========================================

// 1. Xử lý khi click chọn SP CÓ SẴN từ danh sách xổ xuống
const handleSelectProduct = (selection) => {
  // Chỉ thực thi nếu selection là một Object (Sản phẩm có sẵn)
  if (selection && typeof selection === "object") {
    addProductToTicket(selection);
  }
};

// 2. Xử lý khi nhấn ENTER để xác nhận tạo SP MỚI
const handleEnterNewProduct = () => {
  // Ưu tiên lấy giá trị đang gõ (searchProduct) hoặc giá trị string của model
  const typedName = searchProduct.value || selectedProduct.value;

  if (typeof typedName === "string" && typedName.trim() !== "") {
    addProductToTicket(typedName.trim());
  }
};

// 3. Hàm cốt lõi đưa dữ liệu xuống bảng
const addProductToTicket = (selection) => {
  if (!selection) return;

  const isNew = typeof selection === "string";

  newTicket.value.items.push({
    product_id: isNew ? null : selection.id,
    product_name: isNew ? selection : selection.name,
    category_id: isNew ? null : selection.category_id,
    color: "",
    size: "",
    quantity_added: 1,
    import_price: 0,
  });

  // Sử dụng nextTick để đảm bảo UI kịp render xong trước khi reset
  nextTick(() => {
    selectedProduct.value = null; // Xóa item đã chọn
    searchProduct.value = ""; // Xóa chữ người dùng vừa gõ
    comboboxRef.value?.blur(); // Tắt focus để đóng menu dropdown
  });
};

const submitTicket = async () => {
  if (newTicket.value.items.length === 0)
    return toast.warning("Phiếu chưa có sản phẩm!");

  for (let item of newTicket.value.items) {
    if (!item.product_id && !item.category_id) {
      return toast.error(
        `Sản phẩm mới "${item.product_name}" bắt buộc phải chọn Danh mục!`,
      );
    }
  }

  isSubmitting.value = true;
  try {
    await api.post("/products/stock-tickets", newTicket.value);
    toast.success("Lưu phiếu thành công!");
    dialogCreate.value = false;
    fetchTickets();
  } catch (err) {
    toast.error("Lỗi khi lưu phiếu");
  } finally {
    isSubmitting.value = false;
  }
};

const openDetailDialog = async (ticket) => {
  activeTicket.value = ticket;
  dialogDetail.value = true;
  isLoadingDetails.value = true;
  try {
    const response = await api.get(`/products/stock-tickets/${ticket.id}`);
    // Backend cần nối chuỗi "Màu - Size" trả về trường variant_info
    activeTicketDetails.value =
      response.data.items.map((item) => ({
        ...item,
        variant_info: `${item.color || "N/A"} - ${item.size || "N/A"}`,
      })) || [];
  } catch (error) {
    toast.error("Không thể tải chi tiết phiếu.");
  } finally {
    isLoadingDetails.value = false;
  }
};

const fetchTickets = async () => {
  const res = await api.get("/products/stock-tickets");
  tickets.value = res.data;
};

// Biến lưu trữ chi tiết các biến thể để gợi ý
const allVariantsData = ref([]);

// Hàm 1: Lấy danh sách MÀU dựa theo Tên sản phẩm
const getAvailableColors = (productName) => {
  if (!productName) return [];

  const colors = allVariantsData.value
    .filter((v) => v.product_name === productName && v.color)
    .map((v) => v.color.trim().toUpperCase());

  return [...new Set(colors)]; // Dùng Set để xóa các màu trùng lặp
};

// Hàm 2: Lấy danh sách SIZE dựa theo Tên sản phẩm VÀ Màu đã chọn
const getAvailableSizes = (productName, selectedColor) => {
  if (!productName) return [];

  // Lấy tất cả size của sản phẩm đó trước
  let filtered = allVariantsData.value.filter(
    (v) => v.product_name === productName && v.size,
  );

  // ÉP BUỘC: Nếu Admin ĐÃ GÕ/CHỌN MÀU, thì chỉ giữ lại những size thuộc đúng màu đó
  if (selectedColor) {
    filtered = filtered.filter(
      (v) =>
        v.color && v.color.toUpperCase() === selectedColor.trim().toUpperCase(),
    );
  }

  // Trích xuất ra mảng danh sách size cuối cùng và xóa trùng lặp
  const sizes = filtered.map((v) => v.size.trim().toUpperCase());
  return [...new Set(sizes)];
};

const fetchProductsAndCategories = async () => {
  try {
    const resProd = await api.get("/products");
    availableProducts.value = resProd.data;

    // Gọi API lấy toàn bộ biến thể (API mà lúc nãy ta đã viết ở bước trước)
    const resVar = await api.get("/products/all-variants");
    allVariantsData.value = resVar.data || [];

    const resCat = await api.get("/categories");
    categories.value = resCat.data;
  } catch (e) {
    console.log(e);
  }
};

const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN").format(price);
};

const openCreateDialog = () => {
  newTicket.value = { supplier: "", note: "Nhập hàng", items: [] };
  dialogCreate.value = true;
};

const printImportTicket = () => {
  if (!activeTicket.value || activeTicketDetails.value.length === 0) return;
  
  const ticketDate = new Date(activeTicket.value.created_at);
  let rows = '';
  let totalQty = 0;

  activeTicketDetails.value.forEach((item, index) => {
    totalQty += item.quantity;
    rows += `
      <tr>
        <td class="text-center">${index + 1}</td>
        <td>${item.product_name} (${item.variant_info})</td>
        <td class="text-center">Cái</td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">${formatPrice(item.import_price)}</td>
        <td class="text-right">${formatPrice(item.import_price * item.quantity)}</td>
      </tr>
    `;
  });

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Phiếu Nhập Kho - ${activeTicket.value.id}</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 30px; color: #000; font-size: 15px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .company-info h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
          .company-info p { margin: 3px 0; font-size: 14px; }
          .ticket-meta p { margin: 3px 0; font-size: 14px; }
          .ticket-title { text-align: center; margin: 30px 0; }
          .ticket-title h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
          .ticket-title p { margin: 5px 0; font-style: italic; }
          .info-section { margin-bottom: 20px; line-height: 1.6; }
          .info-section p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; text-align: center; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
          .signature-box { text-align: center; width: 33%; }
          .signature-box p { margin: 0; }
          .signature-box .title { font-weight: bold; }
          .signature-box .sub { font-style: italic; font-size: 13px; margin-bottom: 90px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h2>SPORT STORE</h2>
            <p>Địa chỉ: 123 Đường 3/2, Phường Ninh Kiều, Thành phố Cần Thơ</p>
            <p>SĐT: 0987654321 - Email: sportstore@gmail.com</p>
          </div>
          <div class="ticket-meta text-right">
            <p>Mã phiếu nhập: <strong>${activeTicket.value.id.substring(0,8).toUpperCase()}</strong></p>
          </div>
        </div>
        
        <div class="ticket-title">
          <h1>PHIẾU NHẬP KHO</h1>
          <p>Ngày ${ticketDate.getDate()} tháng ${ticketDate.getMonth() + 1} năm ${ticketDate.getFullYear()}</p>
        </div>
        
        <div class="info-section">
          <p><strong>Nhà cung cấp:</strong> ${activeTicket.value.supplier || 'N/A'}</p>
          <p><strong>Nhập tại kho:</strong> Kho tổng Sport Store</p>
          <p><strong>Người kiểm hàng:</strong> ${activeTicket.value.staff_name}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">STT</th>
              <th>Tên sản phẩm (Phân loại)</th>
              <th style="width: 60px;">ĐVT</th>
              <th style="width: 80px;">Số lượng</th>
              <th style="width: 120px;">Đơn giá</th>
              <th style="width: 130px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <th colspan="3" class="text-right">Tổng cộng:</th>
              <th class="text-center">${totalQty}</th>
              <th></th>
              <th class="text-right">${formatPrice(activeTicket.value.total_amount)}</th>
            </tr>
          </tfoot>
        </table>
        
        <div class="signatures">
          <div class="signature-box">
            <p class="title">Người lập phiếu</p>
            <p class="sub">(Ký, họ tên)</p>
          </div>
          <div class="signature-box">
            <p class="title">Người giao hàng</p>
            <p class="sub">(Ký, họ tên)</p>
          </div>
          <div class="signature-box">
            <p class="title">Thủ kho</p>
            <p class="sub">(Ký, họ tên)</p>
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

onMounted(() => {
  fetchTickets();
  fetchProductsAndCategories();
});
</script>

<style scoped>
/* ÉP XUNG TOÀN BỘ BẢNG VÀ CÁC Ô TRỞ THÀNH MÀU TRẮNG, CHỮ MÀU ĐEN */
:deep(.custom-table),
:deep(.custom-table .v-table__wrapper > table) {
  background-color: #ffffff !important;
  color: #333333 !important; /* Ép màu chữ tổng thể của bảng */
}

:deep(.custom-table th),
:deep(.custom-table td) {
  background-color: #ffffff !important;
}

:deep(.custom-table td) {
  color: #333333 !important; /* Ép chữ trong các ô dữ liệu thành màu xám đen để dễ đọc */
}

:deep(.custom-table th) {
  color: #1a237e !important;
  font-weight: bold !important;
  border-bottom: 1px solid #e0e0e0 !important;
}

:deep(.custom-table .v-data-table__tr:hover td) {
  background-color: #f8fafc !important; /* Tạo màu hover cực nhạt để dễ nhìn từng dòng */
}
</style>
