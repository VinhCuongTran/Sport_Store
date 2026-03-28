<template>
  <v-card
    flat
    class="rounded-xl border elevation-0 bg-white sticky-sidebar text-black"
  >
    <div class="pa-5 border-b d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <h2 class="text-h6 font-weight-bold mb-0 text-black">Bộ lọc</h2>
      </div>
      <v-btn
        v-if="hasActiveSidebarFilters"
        variant="text"
        color="error"
        size="small"
        class="text-none"
        @click="$emit('clearFilters')"
      >
        Xóa tất cả
      </v-btn>
    </div>

    <v-expansion-panels
      multiple
      v-model="activePanelsModel"
      variant="accordion"
      class="text-black"
    >
      <v-expansion-panel value="price">
        <v-expansion-panel-title
          class="font-weight-bold text-subtitle-2 text-black"
        >
          CHỌN GIÁ
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="d-flex align-center mb-4 gap-2">
            <v-text-field
              v-model.number="priceRangeModel[0]"
              type="number"
              density="compact"
              variant="outlined"
              hide-details
              suffix="đ"
              class="text-black price-input"
            ></v-text-field>
            <span class="text-grey-darken-1">-</span>
            <v-text-field
              v-model.number="priceRangeModel[1]"
              type="number"
              density="compact"
              variant="outlined"
              hide-details
              suffix="đ"
              class="text-black price-input"
            ></v-text-field>
          </div>
          <v-range-slider
            v-model="priceRangeModel"
            :max="maxPriceLimit"
            :min="0"
            step="50000"
            color="black"
            track-color="grey-lighten-2"
            strict
            hide-details
          ></v-range-slider>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel value="category" v-if="availableCategories.length">
        <v-expansion-panel-title
          class="font-weight-bold text-subtitle-2 text-black"
        >
          LOẠI SẢN PHẨM
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-checkbox
            v-for="cat in visibleCategories"
            :key="cat.id"
            v-model="filterCategoriesModel"
            :value="cat.id"
            density="compact"
            hide-details
            color="black"
            class="custom-checkbox"
          >
            <template v-slot:label>
              <span class="text-black">{{ cat.name }}</span>
            </template>
          </v-checkbox>
          <div
            class="mt-2 text-center"
            v-if="availableCategories.length > limits.category"
          >
            <v-btn
              variant="text"
              size="small"
              color="blue-darken-2"
              class="text-none font-weight-bold"
              @click="showMore('category')"
            >
              + Xem thêm
            </v-btn>
            <v-btn
              v-if="limits.category > 5"
              variant="text"
              size="small"
              color="grey-darken-2"
              class="text-none font-weight-bold ml-2"
              @click="showLess('category')"
            >
              - Thu gọn
            </v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel value="brand" v-if="availableBrands.length">
        <v-expansion-panel-title
          class="font-weight-bold text-subtitle-2 text-black"
        >
          CHỌN THƯƠNG HIỆU
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-checkbox
            v-for="brand in visibleBrands"
            :key="brand.id"
            v-model="filterBrandsModel"
            :value="brand.id"
            density="compact"
            hide-details
            color="black"
            class="custom-checkbox"
          >
            <template v-slot:label>
              <span class="text-black">{{ brand.name }}</span>
            </template>
          </v-checkbox>
          <div
            class="mt-2 text-center"
            v-if="availableBrands.length > limits.brand"
          >
            <v-btn
              variant="text"
              size="small"
              color="blue-darken-2"
              class="text-none font-weight-bold"
              @click="showMore('brand')"
            >
              + Xem thêm
            </v-btn>
            <v-btn
              v-if="limits.brand > 5"
              variant="text"
              size="small"
              color="grey-darken-2"
              class="text-none font-weight-bold ml-2"
              @click="showLess('brand')"
            >
              - Thu gọn
            </v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel value="color" v-if="availableColors.length">
        <v-expansion-panel-title
          class="font-weight-bold text-subtitle-2 text-black"
        >
          CHỌN MÀU
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="d-flex flex-column gap-1">
            <v-checkbox
              v-for="color in visibleColors"
              :key="color"
              v-model="filterColorsModel"
              :value="color"
              density="compact"
              hide-details
              color="black"
              class="custom-checkbox"
            >
              <template v-slot:label>
                <span class="text-black">{{ color }}</span>
              </template>
            </v-checkbox>
          </div>
          <div
            class="mt-2 text-center"
            v-if="availableColors.length > limits.color"
          >
            <v-btn
              variant="text"
              size="small"
              color="blue-darken-2"
              class="text-none font-weight-bold"
              @click="showMore('color')"
            >
              + Xem thêm
            </v-btn>
            <v-btn
              v-if="limits.color > 5"
              variant="text"
              size="small"
              color="grey-darken-2"
              class="text-none font-weight-bold ml-2"
              @click="showLess('color')"
            >
              - Thu gọn
            </v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  availableCategories: { type: Array, default: () => [] },
  availableBrands: { type: Array, default: () => [] },
  availableColors: { type: Array, default: () => [] },
  maxPriceLimit: { type: Number, default: 10000000 },
  hasActiveSidebarFilters: { type: Boolean, default: false },

  // v-model props
  activePanels: { type: Array, default: () => [] },
  priceRange: { type: Array, default: () => [0, 10000000] },
  filterCategories: { type: Array, default: () => [] },
  filterBrands: { type: Array, default: () => [] },
  filterColors: { type: Array, default: () => [] },
  limits: {
    type: Object,
    default: () => ({ brand: 5, category: 5, color: 5 }),
  },
});

const emit = defineEmits([
  "update:activePanels",
  "update:priceRange",
  "update:filterCategories",
  "update:filterBrands",
  "update:filterColors",
  "update:limits",
  "clearFilters",
]);

// Computed wrappers để liên kết hai chiều với component cha
const activePanelsModel = computed({
  get: () => props.activePanels,
  set: (val) => emit("update:activePanels", val),
});
const priceRangeModel = computed({
  get: () => props.priceRange,
  set: (val) => emit("update:priceRange", val),
});
const filterCategoriesModel = computed({
  get: () => props.filterCategories,
  set: (val) => emit("update:filterCategories", val),
});
const filterBrandsModel = computed({
  get: () => props.filterBrands,
  set: (val) => emit("update:filterBrands", val),
});
const filterColorsModel = computed({
  get: () => props.filterColors,
  set: (val) => emit("update:filterColors", val),
});

// Xử lý các logic hiển thị mở rộng / thu gọn
const defaultLimit = 5;

const showMore = (type) => {
  const newLimits = { ...props.limits };
  newLimits[type] += 5;
  emit("update:limits", newLimits);
};

const showLess = (type) => {
  const newLimits = { ...props.limits };
  newLimits[type] = defaultLimit;
  emit("update:limits", newLimits);
};

// Dữ liệu cắt theo giới hạn
const visibleCategories = computed(() =>
  props.availableCategories.slice(0, props.limits.category),
);
const visibleBrands = computed(() =>
  props.availableBrands.slice(0, props.limits.brand),
);
const visibleColors = computed(() =>
  props.availableColors.slice(0, props.limits.color),
);
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.gap-1 {
  gap: 4px;
}

:deep(.v-expansion-panel) {
  background-color: transparent !important;
}

:deep(.v-expansion-panel-title) {
  padding: 16px 20px !important;
}
:deep(.v-expansion-panel-text__wrapper) {
  padding: 0 20px 20px 20px !important;
}
:deep(.v-expansion-panel-title__icon i) {
  color: black !important;
}

/* --- Tối ưu ô nhập giá --- */
:deep(.price-input input[type="number"]::-webkit-outer-spin-button),
:deep(.price-input input[type="number"]::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
:deep(.price-input input[type="number"]) {
  -moz-appearance: textfield;
  font-size: 14px !important;
  text-align: center !important;
}
:deep(.price-input .v-field__input) {
  padding-left: 0 !important;
  padding-right: 0 !important;
  justify-content: center;
}
:deep(.price-input .v-field__append-inner) {
  padding-left: 2px !important;
  padding-right: 12px !important;
}

/* --- Tối ưu Checkbox --- */
:deep(.custom-checkbox .v-selection-control) {
  flex-direction: row-reverse;
  justify-content: space-between;
  width: 100%;
}
:deep(.custom-checkbox .v-selection-control__input > .v-icon) {
  border: 1.5px solid #000;
  border-radius: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
}
:deep(
  .custom-checkbox
    .v-selection-control--dirty
    .v-selection-control__input
    > .v-icon
) {
  border: none;
  opacity: 1;
}

.sticky-sidebar {
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}
.sticky-sidebar::-webkit-scrollbar {
  width: 4px;
}
.sticky-sidebar::-webkit-scrollbar-thumb {
  background-color: #e0e0e0;
  border-radius: 4px;
}
</style>
