<template>
  <v-dialog v-model="isOpen" max-width="650px" scrollable persistent>
    <v-card class="rounded-xl bg-grey-lighten-5">
      <v-card-title
        class="bg-black text-white pa-4 d-flex justify-space-between align-center"
      >
        <span class="text-h6 font-weight-bold">
          <v-icon left class="mr-2">mdi-map-marker-multiple</v-icon>
          {{
            isFormView
              ? isEdit
                ? "Cập nhật địa chỉ"
                : "Thêm địa chỉ mới"
              : "Sổ địa chỉ của tôi"
          }}
        </span>
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          @click="closeDialog"
          density="comfortable"
        ></v-btn>
      </v-card-title>

      <v-card-text class="pa-4 pa-sm-6" style="max-height: 75vh">
        <div v-if="isLoading" class="d-flex justify-center py-10">
          <v-progress-circular
            indeterminate
            color="black"
            size="40"
          ></v-progress-circular>
        </div>

        <div v-else-if="!isFormView">
          <v-alert
            v-if="addresses.length >= 5"
            type="info"
            variant="tonal"
            class="mb-4 text-caption"
            density="compact"
          >
            Bạn đã đạt giới hạn lưu 5 địa chỉ.
          </v-alert>

          <div v-if="addresses.length === 0" class="text-center py-10">
            <v-icon size="64" color="grey-lighten-2" class="mb-3"
              >mdi-map-marker-off-outline</v-icon
            >
            <p class="text-grey-darken-1">Bạn chưa có địa chỉ nhận hàng nào.</p>
          </div>

          <v-card
            v-for="addr in addresses"
            :key="addr.id"
            class="mb-4 rounded-lg border elevation-0 pa-4 bg-white"
          >
            <div class="d-flex justify-space-between align-start">
              <div class="pr-2">
                <div class="d-flex align-center flex-wrap gap-2 mb-1">
                  <span class="font-weight-bold text-subtitle-1">{{
                    addr.receiver_name
                  }}</span>
                  <span class="text-grey-lighten-1">|</span>
                  <span class="text-grey-darken-2 text-subtitle-2">{{
                    addr.phone_number
                  }}</span>
                </div>
                <p class="text-body-2 text-grey-darken-3 mb-2">
                  {{ addr.shipping_address }}
                </p>
                <v-chip
                  v-if="addr.is_default"
                  color="red-darken-2"
                  size="small"
                  variant="outlined"
                  class="font-weight-bold"
                >
                  Mặc định
                </v-chip>
              </div>

              <v-menu location="bottom end">
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    variant="text"
                    size="small"
                    v-bind="props"
                    color="grey-darken-2"
                  ></v-btn>
                </template>
                <v-list density="compact" class="elevation-2 border">
                  <v-list-item
                    @click="openForm(addr)"
                    prepend-icon="mdi-pencil-outline"
                  >
                    <v-list-item-title class="text-blue-darken-2"
                      >Cập nhật</v-list-item-title
                    >
                  </v-list-item>
                  <v-list-item
                    v-if="!addr.is_default"
                    @click="setDefault(addr.id)"
                    prepend-icon="mdi-check-circle-outline"
                  >
                    <v-list-item-title class="text-black"
                      >Đặt làm mặc định</v-list-item-title
                    >
                  </v-list-item>
                  <v-list-item
                    v-if="!addr.is_default"
                    @click="deleteAddress(addr.id)"
                    prepend-icon="mdi-trash-can-outline"
                  >
                    <v-list-item-title class="text-red-darken-2"
                      >Xóa</v-list-item-title
                    >
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-card>

          <v-btn
            block
            color="black"
            size="x-large"
            class="mt-4 rounded-lg font-weight-bold"
            prepend-icon="mdi-plus"
            @click="openForm(null)"
            :disabled="addresses.length >= 5"
          >
            THÊM ĐỊA CHỈ MỚI
          </v-btn>
        </div>

        <div v-else class="bg-white pa-4 rounded-lg border">
          <v-form ref="formRef" @submit.prevent="submitForm">
            <v-row density="compact">
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.receiver_name"
                  label="Họ và tên"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Bắt buộc nhập']"
                  color="black"
                  class="mb-2"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.phone_number"
                  label="Số điện thoại"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Bắt buộc nhập']"
                  color="black"
                  class="mb-2"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-autocomplete
              v-model="selectedProvId"
              :items="provinces"
              item-title="name"
              item-value="id"
              label="Tỉnh / Thành phố"
              variant="outlined"
              density="comfortable"
              :rules="[(v) => !!v || 'Vui lòng chọn Tỉnh/Thành phố']"
              color="black"
              class="mb-2"
              no-data-text="Đang tải dữ liệu Tỉnh..."
              @update:model-value="onProvinceChange"
            ></v-autocomplete>

            <v-autocomplete
              v-model="selectedCommuneId"
              :items="communes"
              item-title="name"
              item-value="id"
              label="Phường / Xã"
              variant="outlined"
              density="comfortable"
              :rules="[(v) => !!v || 'Vui lòng chọn Phường/Xã']"
              color="black"
              class="mb-2"
              :disabled="!selectedProvId"
              :loading="isLoadingCommunes"
              no-data-text="Không tìm thấy Phường/Xã"
            ></v-autocomplete>

            <v-text-field
              v-model="formData.detailed_address"
              label="Số nhà, Tên đường, Ấp/Khu phố..."
              variant="outlined"
              density="comfortable"
              :rules="[
                (v) => !!v || 'Vui lòng nhập địa chỉ chi tiết',
                (v) =>
                  (v && v.trim().length >= 5) ||
                  'Vui lòng nhập rõ ràng (tối thiểu 5 ký tự)',
              ]"
              color="black"
              class="mb-2"
              placeholder="VD: Số 12, Đường Lê Lợi, Ấp 1"
            ></v-text-field>

            <v-checkbox
              v-model="formData.is_default"
              label="Đặt làm địa chỉ mặc định"
              color="red-darken-2"
              hide-details
              class="mb-6"
            ></v-checkbox>

            <div class="d-flex gap-3">
              <v-btn
                class="flex-grow-1 font-weight-bold"
                variant="outlined"
                color="black"
                size="large"
                @click="isFormView = false"
                >Hủy bỏ</v-btn
              >
              <v-btn
                class="flex-grow-1 font-weight-bold"
                color="black"
                size="large"
                type="submit"
                :loading="isSaving"
                >Lưu địa chỉ</v-btn
              >
            </div>
          </v-form>
        </div>
      </v-card-text>
    </v-card>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="2500"
      location="top"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import AddressService from "@/services/address.service";

const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(["update:modelValue"]);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const addresses = ref([]);
const isLoading = ref(false);
const isFormView = ref(false);
const isEdit = ref(false);
const isSaving = ref(false);
const formRef = ref(null);
const snackbar = ref({ show: false, text: "", color: "success" });

const provinces = ref([]);
const communes = ref([]);
const isLoadingCommunes = ref(false);

const selectedProvId = ref(null);
const selectedCommuneId = ref(null);

const formData = ref({
  id: null,
  receiver_name: "",
  phone_number: "",
  detailed_address: "",
  is_default: false,
});

const showMessage = (text, color = "success") => {
  snackbar.value = { show: true, text, color };
};

// ================= API TỈNH/XÃ VIỆT NAM (CẬP NHẬT SAU SÁP NHẬP 2025) =================
// Nguồn: provinces.open-api.vn/api/v2 — hỗ trợ CORS, cập nhật sau sáp nhập 2025
const ADDR_API = "https://provinces.open-api.vn/api/v2";

const fetchProvinces = async () => {
  try {
    const response = await fetch(`${ADDR_API}/p/`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    // API v2 trả về mảng: [{ code, name, ... }]
    provinces.value = data.map((p) => ({
      id: p.code,
      name: p.name,
    }));
  } catch (error) {
    console.error("Lỗi lấy Tỉnh:", error);
    showMessage("Không thể tải danh sách Tỉnh/Thành phố", "error");
  }
};

const fetchCommunes = async (provCode) => {
  isLoadingCommunes.value = true;
  communes.value = [];
  try {
    // GET /w/?province={code} — 1 request lấy toàn bộ xã/phường thuộc tỉnh
    const response = await fetch(
      `${ADDR_API}/w/?province=${parseInt(provCode)}`,
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    // API v2 trả về mảng trực tiếp: [{ code, name, ... }]
    communes.value = data.map((c) => ({
      id: c.code,
      name: c.name,
    }));
  } catch (error) {
    console.error("Lỗi lấy Xã:", error);
    showMessage("Không thể tải danh sách Phường/Xã", "error");
  } finally {
    isLoadingCommunes.value = false;
  }
};
const onProvinceChange = async (newProvId) => {
  selectedCommuneId.value = null;
  communes.value = [];
  if (newProvId) await fetchCommunes(newProvId);
};

// ================= CRUD SỔ ĐỊA CHỈ =================
const fetchUserAddresses = async () => {
  isLoading.value = true;
  try {
    addresses.value = await AddressService.getAll();
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

watch(isOpen, (newVal) => {
  if (newVal) {
    isFormView.value = false;
    fetchUserAddresses();
    if (provinces.value.length === 0) fetchProvinces();
  }
});

const openForm = async (item) => {
  isFormView.value = true;

  if (provinces.value.length === 0) fetchProvinces();

  if (item) {
    isEdit.value = true;

    const parts = item.shipping_address.split(", ");

    if (parts.length >= 3) {
      const pName = parts[parts.length - 1].trim();
      const cName = parts[parts.length - 2].trim();

      // Tìm tỉnh theo tên (so sánh không phân biệt hoa thường để tăng độ khớp)
      const p = provinces.value.find(
        (x) => x.name.toLowerCase() === pName.toLowerCase(),
      );
      if (p) {
        selectedProvId.value = p.id;
        await fetchCommunes(p.id);

        // Tìm xã/phường theo tên
        const c = communes.value.find(
          (x) => x.name.toLowerCase() === cName.toLowerCase(),
        );
        if (c) selectedCommuneId.value = c.id;
      }
      formData.value.detailed_address = parts
        .slice(0, parts.length - 2)
        .join(", ");
    } else {
      formData.value.detailed_address = item.shipping_address;
      selectedProvId.value = null;
      selectedCommuneId.value = null;
    }

    formData.value.id = item.id;
    formData.value.receiver_name = item.receiver_name;
    formData.value.phone_number = item.phone_number;
    formData.value.is_default = Boolean(item.is_default);
  } else {
    isEdit.value = false;
    selectedProvId.value = null;
    selectedCommuneId.value = null;
    formData.value = {
      id: null,
      receiver_name: "",
      phone_number: "",
      detailed_address: "",
      is_default: false,
    };
  }
};

const closeDialog = () => {
  isOpen.value = false;
};

const submitForm = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  isSaving.value = true;
  try {
    const pName =
      provinces.value.find((x) => x.id === selectedProvId.value)?.name || "";
    const cName =
      communes.value.find((x) => x.id === selectedCommuneId.value)?.name || "";

    const combinedAddress = `${formData.value.detailed_address.trim()}, ${cName}, ${pName}`;

    const payload = {
      receiver_name: formData.value.receiver_name,
      phone_number: formData.value.phone_number,
      shipping_address: combinedAddress,
      is_default: formData.value.is_default,
    };

    if (isEdit.value) {
      await AddressService.update(formData.value.id, payload);
      showMessage("Cập nhật địa chỉ thành công");
    } else {
      await AddressService.create(payload);
      showMessage("Đã thêm địa chỉ mới");
    }
    await fetchUserAddresses();
    isFormView.value = false;
  } catch (error) {
    showMessage(error.response?.data?.message || "Có lỗi xảy ra", "error");
  } finally {
    isSaving.value = false;
  }
};

const deleteAddress = async (id) => {
  if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
  try {
    await AddressService.delete(id);
    showMessage("Đã xóa địa chỉ");
    await fetchUserAddresses();
  } catch (error) {
    showMessage(error.response?.data?.message || "Không thể xóa", "error");
  }
};

const setDefault = async (id) => {
  try {
    await AddressService.setDefault(id);
    showMessage("Đã thiết lập mặc định");
    await fetchUserAddresses();
  } catch (error) {
    showMessage("Lỗi khi thiết lập", "error");
  }
};
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
</style>
