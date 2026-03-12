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
          Quản lý Sản phẩm
        </h2>
        <span class="text-caption text-indigo-darken-4"
          >Danh sách và thông tin chi tiết sản phẩm</span
        >
      </div>
      <v-btn
        color="indigo-darken-4"
        prepend-icon="mdi-plus"
        rounded="lg"
        elevation="0"
        class="text-capitalize font-weight-semibold"
        @click="openCreateModal"
      >
        Thêm Sản Phẩm Mới
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
      <v-row class="mb-2 px-2" align="center">
        <v-col cols="12" md="5" class="py-2">
          <v-text-field
            v-model="search"
            density="compact"
            variant="outlined"
            placeholder="Tìm tên SP, môn TT, phân loại, thương hiệu..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
            rounded="lg"
            color="indigo-darken-3"
          />
        </v-col>

        <v-col cols="12" md="3" class="py-2">
          <v-autocomplete
            v-model="filterCategory"
            :items="leafCategories"
            item-title="name"
            item-value="id"
            placeholder="Lọc theo phân loại"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            rounded="lg"
            color="indigo-darken-3"
          ></v-autocomplete>
        </v-col>

        <v-col cols="12" md="2" class="py-2">
          <v-select
            v-model="filterStatus"
            :items="[
              { title: 'Tất cả', value: null },
              { title: 'Hiển thị', value: 'active' },
              { title: 'Đang ẩn', value: 'hidden' },
            ]"
            item-title="title"
            item-value="value"
            placeholder="Trạng thái"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            rounded="lg"
            color="indigo-darken-3"
          ></v-select>
        </v-col>

        <v-col cols="12" md="2" class="py-2 text-right">
          <v-chip
            color="indigo-lighten-4"
            text-color="indigo-darken-4"
            size="small"
            variant="flat"
            prepend-icon="mdi-format-list-bulleted"
          >
            {{ filteredProducts.length }} sản phẩm
          </v-chip>
        </v-col>
      </v-row>

      <v-divider class="mb-2" />

      <v-data-table
        :headers="headers"
        :items="filteredProducts"
        :loading="isLoading"
        hover
        class="bg-white rounded-lg"
        no-data-text="Không tìm thấy sản phẩm nào"
      >
        <template v-slot:item.id="{ item }">
          <span class="font-weight-black text-indigo-darken-4"
            >#{{ item.id }}</span
          >
        </template>

        <template v-slot:item.thumbnail="{ item }">
          <div class="d-flex justify-center my-2">
            <v-avatar size="60" rounded="lg" class="bg-grey-lighten-4 border">
              <v-img v-if="item.thumbnail" :src="item.thumbnail" cover></v-img>
              <v-icon v-else color="grey-lighten-1"
                >mdi-image-off-outline</v-icon
              >
            </v-avatar>
          </div>
        </template>

        <template v-slot:item.info="{ item }">
          <div class="text-body-2 font-weight-bold text-black mb-1">
            {{ item.name }}
          </div>
          <div class="text-caption text-grey-darken-2">
            Giá từ:
            <span class="text-red-darken-1 font-weight-medium">{{
              formatPrice(item.min_price)
            }}</span>
          </div>
          <v-chip
            v-if="item.active_discount > 0"
            size="x-small"
            color="red-darken-1"
            variant="flat"
            class="mt-1 font-weight-bold"
          >
            <v-icon start size="12">mdi-flash</v-icon> SALE
            {{ item.active_discount }}%
          </v-chip>
        </template>

        <template v-slot:item.category_name="{ item }">
          <v-chip
            size="small"
            color="info"
            variant="tonal"
            class="font-weight-medium"
          >
            {{ item.category_name || "N/A" }}
          </v-chip>
        </template>

        <template v-slot:item.brand_sport="{ item }">
          <div class="text-caption text-black mb-1">
            <v-icon size="14" color="grey-darken-1" class="mr-1"
              >mdi-tag</v-icon
            >
            {{ item.brand_name || "N/A" }}
          </div>
          <div class="text-caption text-black">
            <v-icon size="14" color="grey-darken-1" class="mr-1"
              >mdi-basketball</v-icon
            >
            {{ item.sport_name || "N/A" }}
          </div>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            size="small"
            :color="item.status === 'active' ? 'success' : 'error'"
            variant="flat"
            class="font-weight-medium"
          >
            {{ item.status === "active" ? "Hiển thị" : "Đang ẩn" }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-center gap-2">
            <v-btn
              color="amber-darken-2"
              size="small"
              rounded="lg"
              prepend-icon="mdi-pencil"
              variant="tonal"
              class="text-capitalize"
              @click="openEditModal(item.id)"
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

    <v-dialog v-model="showModal" max-width="900px" persistent scrollable>
      <v-card rounded="xl" elevation="8" theme="light" color="white">
        <div
          class="d-flex align-center justify-space-between px-6 py-4"
          style="background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%)"
        >
          <div class="d-flex align-center gap-3">
            <v-icon color="white" size="22">{{
              isEditMode ? "mdi-pencil-circle" : "mdi-plus-circle"
            }}</v-icon>
            <span class="text-body-1 font-weight-bold text-white">{{
              isEditMode ? "Cập nhật Sản phẩm" : "Thêm Sản phẩm mới"
            }}</span>
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
            <div class="mb-5">
              <h4
                class="text-subtitle-1 font-weight-bold text-indigo-darken-4 mb-3 d-flex align-center"
              >
                <v-icon size="20" class="mr-2">mdi-information-outline</v-icon>
                Thông tiết cơ bản
              </h4>
              <v-row>
                <v-col cols="12" md="8" class="py-1">
                  <label
                    class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                    >Tên Sản phẩm <span class="text-red">*</span></label
                  >
                  <input
                    v-model="formData.name"
                    type="text"
                    class="custom-input text-black"
                    required
                    placeholder="Nhập tên sản phẩm..."
                  />
                </v-col>

                <v-col cols="12" md="4" class="py-1">
                  <label
                    class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                    >Danh mục (Gõ để tìm) <span class="text-red">*</span></label
                  >
                  <v-autocomplete
                    v-model="formData.category_id"
                    :items="leafCategories"
                    item-title="name"
                    item-value="id"
                    placeholder="Chọn danh mục"
                    variant="outlined"
                    density="compact"
                    hide-details
                    color="indigo-darken-3"
                    class="bg-white"
                  ></v-autocomplete>
                </v-col>

                <v-col cols="12" md="6" class="py-1">
                  <label
                    class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                    >Thương hiệu (Gõ để tìm)</label
                  >
                  <v-autocomplete
                    v-model="formData.brand_id"
                    :items="brands"
                    item-title="name"
                    item-value="id"
                    placeholder="Chọn thương hiệu (Bỏ qua nếu không có)"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                    color="indigo-darken-3"
                    class="bg-white"
                  ></v-autocomplete>
                </v-col>

                <v-col cols="12" md="6" class="py-1">
                  <label
                    class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                    >Trạng thái</label
                  >
                  <select
                    v-model="formData.status"
                    class="custom-input text-black"
                  >
                    <option value="active">Active (Hiển thị)</option>
                    <option value="hidden">Hidden (Đang ẩn)</option>
                  </select>
                </v-col>

                <v-col cols="12" class="py-1">
                  <label
                    class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                    >Mô tả chi tiết</label
                  >
                  <textarea
                    v-model="formData.description"
                    class="custom-input text-black"
                    rows="3"
                    placeholder="Nhập mô tả sản phẩm..."
                  ></textarea>
                </v-col>
              </v-row>
            </div>

            <v-divider class="my-5"></v-divider>

            <div class="mb-5">
              <h4
                class="text-subtitle-1 font-weight-bold text-indigo-darken-4 mb-3 d-flex align-center"
              >
                <v-icon size="20" class="mr-2">mdi-sale</v-icon> Cài đặt Khuyến
                mãi (Flash Sale)
              </h4>
              <v-row>
                <v-col cols="12" md="4" class="py-1">
                  <label
                    class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                    >Giảm giá (%)</label
                  >
                  <input
                    v-model="formData.discount_percent"
                    type="number"
                    min="0"
                    max="100"
                    class="custom-input text-black"
                    placeholder="Ví dụ: 20"
                  />
                </v-col>
                <v-col cols="12" md="4" class="py-1">
                  <label
                    class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                    >Thời gian Bắt đầu</label
                  >
                  <input
                    v-model="formData.sale_start"
                    type="datetime-local"
                    class="custom-input text-black"
                  />
                </v-col>
                <v-col cols="12" md="4" class="py-1">
                  <label
                    class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                    >Thời gian Kết thúc</label
                  >
                  <input
                    v-model="formData.sale_end"
                    type="datetime-local"
                    class="custom-input text-black"
                  />
                </v-col>
              </v-row>
            </div>

            <v-divider class="my-5"></v-divider>

            <div class="mb-5">
              <div class="d-flex justify-space-between align-center mb-3">
                <h4
                  class="text-subtitle-1 font-weight-bold text-indigo-darken-4 d-flex align-center"
                >
                  <v-icon size="20" class="mr-2"
                    >mdi-palette-swatch-outline</v-icon
                  >
                  Phân loại (Màu sắc & Kích cỡ)
                </h4>
                <div class="d-flex gap-2">
                  <v-btn
                    color="teal-darken-2"
                    size="small"
                    variant="tonal"
                    prepend-icon="mdi-flash"
                    class="text-capitalize"
                    @click="showQuickSetup = !showQuickSetup"
                  >
                    Tạo Nhanh Size
                  </v-btn>
                  <v-btn
                    color="indigo-darken-1"
                    size="small"
                    variant="elevated"
                    prepend-icon="mdi-plus"
                    class="text-capitalize"
                    @click="addColorGroup"
                  >
                    Thêm Màu Sắc Mới
                  </v-btn>
                </div>
              </div>

              <v-expand-transition>
                <div
                  v-if="showQuickSetup"
                  class="bg-teal-lighten-5 pa-4 rounded-lg border border-teal-lighten-3 mb-4"
                >
                  <div class="d-flex justify-space-between align-center mb-3">
                    <span class="font-weight-bold text-teal-darken-4">
                      <v-icon size="18" class="mr-1">mdi-auto-fix</v-icon>
                      Tạo nhanh danh sách Size cho 1 Màu
                    </span>
                    <v-btn
                      icon="mdi-close"
                      variant="text"
                      size="small"
                      color="teal-darken-4"
                      @click="showQuickSetup = false"
                    ></v-btn>
                  </div>
                  <v-row>
                    <v-col cols="12" md="3" class="py-1">
                      <label
                        class="text-caption font-weight-bold text-teal-darken-3 mb-1 d-block"
                        >Bộ Size mẫu</label
                      >
                      <select
                        v-model="quickSetup.category"
                        class="custom-input text-black border-teal"
                      >
                        <option value="shoes">Giày (US 3.5 - US 9)</option>
                        <option value="clothes">Quần Áo (XS - XXL)</option>
                        <option value="gloves">Găng tay (4 - 12)</option>
                        <option value="phao">Phao (2-12)</option>
                        <option value="accessories">
                          Phụ kiện (Free Size)
                        </option>
                      </select>
                    </v-col>
                    <v-col cols="12" md="3" class="py-1">
                      <label
                        class="text-caption font-weight-bold text-teal-darken-3 mb-1 d-block"
                        >Màu sắc (VD: Đen)</label
                      >
                      <input
                        v-model="quickSetup.color"
                        type="text"
                        class="custom-input text-black border-teal"
                        placeholder="Nhập tên màu..."
                      />
                    </v-col>
                    <v-col cols="12" md="3" class="py-1">
                      <label
                        class="text-caption font-weight-bold text-teal-darken-3 mb-1 d-block"
                        >Giá bán chung</label
                      >
                      <input
                        v-model.number="quickSetup.price"
                        type="number"
                        class="custom-input text-black border-teal"
                        placeholder="0"
                      />
                    </v-col>
                    <v-col cols="12" md="3" class="py-1">
                      <label
                        class="text-caption font-weight-bold text-teal-darken-3 mb-1 d-block"
                        >Tồn kho chung</label
                      >
                      <input
                        v-model.number="quickSetup.stock"
                        type="number"
                        class="custom-input text-black border-teal"
                        placeholder="0"
                      />
                    </v-col>
                  </v-row>
                  <div class="text-right mt-3">
                    <v-btn
                      color="teal-darken-3"
                      class="text-capitalize"
                      @click="generateVariants"
                    >
                      Áp dụng & Tạo danh sách
                    </v-btn>
                  </div>
                </div>
              </v-expand-transition>

              <div
                v-for="(group, gIndex) in colorGroups"
                :key="gIndex"
                class="bg-grey-lighten-5 pa-4 rounded-lg border mb-4"
              >
                <div class="d-flex justify-space-between align-center mb-4">
                  <div class="flex-grow-1 mr-4">
                    <label
                      class="text-caption font-weight-bold text-indigo-darken-3 mb-1 d-block"
                      >Tên Màu Sắc (Bắt buộc)
                      <span class="text-red">*</span></label
                    >
                    <input
                      v-model="group.color"
                      type="text"
                      placeholder="Ví dụ: Đen, Trắng..."
                      class="custom-input text-black font-weight-bold"
                      required
                    />
                  </div>
                  <v-btn
                    icon="mdi-delete-outline"
                    color="red-darken-1"
                    variant="text"
                    size="small"
                    @click="removeColorGroup(gIndex)"
                  ></v-btn>
                </div>

                <div class="mb-4 bg-white pa-3 rounded border border-dashed">
                  <label
                    class="text-caption font-weight-bold text-indigo-darken-3 mb-2 d-block"
                  >
                    <v-icon size="16" class="mr-1">mdi-image-multiple</v-icon>
                    {{
                      isEditMode
                        ? "Tải ảnh mới (Sẽ thay thế toàn bộ ảnh cũ của màu này)"
                        : "Tải hình ảnh"
                    }}
                    cho màu "{{ group.color || "này" }}"
                  </label>

                  <input
                    type="file"
                    @change="(e) => handleColorFileChange(e, gIndex)"
                    @click="(e) => (e.target.value = null)"
                    accept="image/*"
                    multiple
                    class="custom-input text-black file-input mb-1 bg-grey-lighten-4"
                  />

                  <div
                    v-if="group.files && group.files.length > 0"
                    class="d-flex flex-wrap gap-4 mt-3 pa-2 bg-grey-lighten-5 rounded"
                  >
                    <div
                      v-for="(fileObj, fIndex) in group.files"
                      :key="fIndex"
                      class="position-relative border rounded shadow-sm bg-white"
                      style="width: 80px; height: 80px"
                    >
                      <v-img
                        :src="fileObj.preview"
                        cover
                        class="w-100 h-100 rounded"
                      ></v-img>

                      <v-btn
                        icon="mdi-close-circle"
                        size="small"
                        color="red-darken-1"
                        variant="flat"
                        class="position-absolute"
                        style="
                          top: -10px;
                          right: -10px;
                          width: 22px;
                          height: 22px;
                          z-index: 10;
                        "
                        @click="removeFile(gIndex, fIndex)"
                      ></v-btn>

                      <v-btn
                        :icon="
                          fileObj.is_thumbnail ? 'mdi-star' : 'mdi-star-outline'
                        "
                        size="small"
                        :color="
                          fileObj.is_thumbnail
                            ? 'amber-darken-2'
                            : 'grey-lighten-1'
                        "
                        variant="elevated"
                        class="position-absolute"
                        style="
                          bottom: -12px;
                          left: 50%;
                          transform: translateX(-50%);
                          width: 26px;
                          height: 26px;
                          z-index: 10;
                        "
                        @click="setThumbnail(gIndex, fIndex)"
                        :title="
                          fileObj.is_thumbnail
                            ? 'Ảnh đại diện'
                            : 'Chọn làm ảnh đại diện'
                        "
                      ></v-btn>
                    </div>
                  </div>

                  <div
                    v-if="isEditMode"
                    class="text-caption text-red-darken-3 mt-3 d-flex align-center"
                  >
                    <v-icon size="14" class="mr-1"
                      >mdi-alert-circle-outline</v-icon
                    >
                    Lưu ý: Chỉ click nút tải ảnh lên nếu bạn muốn cập nhật lại
                    hình ảnh mới cho màu này.
                  </div>
                </div>

                <div class="pl-4 border-s-lg border-indigo-lighten-3">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <span class="text-caption font-weight-bold"
                      >Danh sách Kích cỡ (Size)</span
                    >
                    <v-btn
                      color="indigo-lighten-1"
                      size="x-small"
                      variant="tonal"
                      prepend-icon="mdi-plus"
                      @click="addSizeToColor(gIndex)"
                      >Thêm Size</v-btn
                    >
                  </div>

                  <v-row
                    v-for="(sizeObj, sIndex) in group.sizes"
                    :key="sIndex"
                    class="align-center mb-2 mx-0"
                    style="gap: 8px"
                  >
                    <v-col class="pa-0">
                      <input
                        v-model="sizeObj.size"
                        placeholder="Size (Ví dụ: 41, M)"
                        class="custom-input text-black"
                        required
                      />
                    </v-col>
                    <v-col class="pa-0">
                      <input
                        v-model="sizeObj.price"
                        type="number"
                        placeholder="Giá (VND)"
                        class="custom-input text-black"
                        required
                      />
                    </v-col>
                    <v-col class="pa-0">
                      <input
                        v-model="sizeObj.stock"
                        type="number"
                        placeholder="Tồn kho"
                        class="custom-input text-black"
                        required
                      />
                    </v-col>
                    <div style="width: 30px" class="text-right">
                      <v-btn
                        icon="mdi-close"
                        color="grey-darken-1"
                        variant="text"
                        size="x-small"
                        @click="removeSizeFromColor(gIndex, sIndex)"
                      ></v-btn>
                    </div>
                  </v-row>

                  <div
                    v-if="group.sizes.length === 0"
                    class="text-caption text-grey font-italic mt-2"
                  >
                    Chưa có size nào. Vui lòng thêm size.
                  </div>
                </div>
              </div>

              <div
                v-if="colorGroups.length === 0"
                class="text-center py-6 text-body-2 text-grey-darken-1 font-italic bg-grey-lighten-4 rounded-lg border border-dashed"
              >
                Sản phẩm chưa có màu sắc và kích cỡ nào.
              </div>
            </div>
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
import { ref, onMounted, computed } from "vue";
import ProductService from "@/services/product.service";
import CategoryService from "@/services/category.service";
import BrandService from "@/services/brand.service";
import Loading from "@/components/Loading.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

const products = ref([]);
const categories = ref([]);
const brands = ref([]);

const search = ref("");
const filterCategory = ref(null);
const filterStatus = ref(null);

const showModal = ref(false);
const isLoading = ref(false);
const isEditMode = ref(false);
const confirmDialogRef = ref(null);
const snackbar = ref({ show: false, text: "", color: "success" });

// === KHAI BÁO LOGIC TẠO NHANH ===
const showQuickSetup = ref(false);
const quickSetup = ref({
  category: "shoes",
  color: "",
  price: null,
  stock: null,
});
const sizePresets = {
  shoes: [
    "US 3.5",
    "US 4",
    "US 4.5",
    "US 5",
    "US 5.5",
    "US 6",
    "US 6.5",
    "US 7",
    "US 7.5",
    "US 8",
    "US 8.5",
    "US 9",
  ],
  clothes: ["XS", "S", "M", "L", "XL", "XXL"],
  accessories: ["Free Size"],
  gloves: [4, 5, 6, 7, 8, 9, 10, 11, 12],
  phao: ["2-6yrs", "7-12yrs"],
};

const generateVariants = () => {
  if (!quickSetup.value.color) {
    showMessage("Vui lòng nhập tên màu sắc", "error");
    return;
  }

  const selectedSizes = sizePresets[quickSetup.value.category];
  if (!selectedSizes) return;

  let targetGroup = colorGroups.value.find(
    (g) => g.color.toLowerCase() === quickSetup.value.color.toLowerCase(),
  );

  if (!targetGroup) {
    targetGroup = {
      color: quickSetup.value.color,
      sizes: [],
      files: [],
    };
    colorGroups.value.push(targetGroup);
  } else {
    if (targetGroup.sizes.length === 1 && !targetGroup.sizes[0].size) {
      targetGroup.sizes = [];
    }
  }

  let addedCount = 0;
  selectedSizes.forEach((sizeStr) => {
    if (!targetGroup.sizes.some((s) => s.size === sizeStr)) {
      targetGroup.sizes.push({
        size: sizeStr,
        price: quickSetup.value.price,
        stock: quickSetup.value.stock,
      });
      addedCount++;
    }
  });

  if (addedCount > 0) {
    showMessage(`Đã tạo nhanh ${addedCount} size cho màu ${targetGroup.color}`);
    showQuickSetup.value = false;
  } else {
    showMessage(
      `Các size này đã tồn tại trong màu ${targetGroup.color}`,
      "warning",
    );
  }
};

const sizeWeight = {
  XXS: 1,
  XS: 2,
  S: 3,
  M: 4,
  L: 5,
  XL: 6,
  XXL: 7,
  "2XL": 7,
  "3XL": 8,
};

const sortSizes = (a, b) => {
  const valA =
    (typeof a === "object" ? a.size : a)?.toString().trim().toUpperCase() || "";
  const valB =
    (typeof b === "object" ? b.size : b)?.toString().trim().toUpperCase() || "";

  const matchA = valA.match(/[\d.]+/);
  const matchB = valB.match(/[\d.]+/);

  const numA = matchA ? parseFloat(matchA[0]) : NaN;
  const numB = matchB ? parseFloat(matchB[0]) : NaN;

  const hasNumA = !isNaN(numA);
  const hasNumB = !isNaN(numB);

  if (hasNumA && hasNumB) {
    if (numA !== numB) return numA - numB;
    return valA.localeCompare(valB);
  }
  if (hasNumA && !hasNumB) return -1;
  if (!hasNumA && hasNumB) return 1;
  if (sizeWeight[valA] && sizeWeight[valB]) {
    return sizeWeight[valA] - sizeWeight[valB];
  }
  return valA.localeCompare(valB);
};

const headers = [
  { title: "ID", key: "id", width: "80px", align: "center", sortable: false },
  {
    title: "Ảnh",
    key: "thumbnail",
    width: "100px",
    align: "center",
    sortable: false,
  },
  { title: "Thông tin Sản phẩm", key: "info", align: "start", sortable: false },
  { title: "Phân loại", key: "category_name", align: "start", sortable: false },
  {
    title: "Thương hiệu / Môn TT",
    key: "brand_sport",
    align: "start",
    sortable: false,
  },
  { title: "Trạng thái", key: "status", align: "center", sortable: false },
  {
    title: "Thao tác",
    key: "actions",
    sortable: false,
    align: "center",
    width: "180px",
  },
];

const formatForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date - tzOffset).toISOString().slice(0, 16);
};

const formData = ref({
  id: null,
  name: "",
  description: "",
  category_id: null,
  brand_id: null,
  status: "active",
  discount_percent: null,
  sale_start: "",
  sale_end: "",
});

const colorGroups = ref([]);

const leafCategories = computed(() => {
  const parentIds = new Set(
    categories.value.map((c) => c.parent_id).filter((id) => id !== null),
  );
  return categories.value.filter((c) => !parentIds.has(c.id));
});

const formatPrice = (value) => {
  if (!value) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const filteredProducts = computed(() => {
  let result = products.value;

  if (filterCategory.value) {
    result = result.filter((item) => item.category_id === filterCategory.value);
  }

  if (filterStatus.value) {
    result = result.filter((item) => item.status === filterStatus.value);
  }

  if (search.value) {
    const keyword = search.value.toLowerCase().trim();
    result = result.filter((item) => {
      const matchName = item.name?.toLowerCase().includes(keyword);
      const matchSport = item.sport_name?.toLowerCase().includes(keyword);
      const matchCategory = item.category_name?.toLowerCase().includes(keyword);
      const matchBrand = item.brand_name?.toLowerCase().includes(keyword);

      return matchName || matchSport || matchCategory || matchBrand;
    });
  }

  return result;
});

const showMessage = (text, color = "success") => {
  snackbar.value = { show: true, text, color };
};

const fetchData = async () => {
  isLoading.value = true;
  try {
    const [prodRes, catRes, brandRes] = await Promise.all([
      ProductService.getAll(),
      CategoryService.getAll(),
      BrandService.getAll(),
    ]);
    products.value = prodRes;
    categories.value = catRes;
    brands.value = brandRes;
  } catch (error) {
    showMessage("Lỗi khi tải dữ liệu", "error");
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = async (item) => {
  const isConfirmed = await confirmDialogRef.value.open(
    "Xóa Sản Phẩm",
    `Bạn có chắc chắn muốn xóa sản phẩm "${item.name}"? Dữ liệu không thể khôi phục.`,
  );
  if (isConfirmed) {
    isLoading.value = true;
    try {
      await ProductService.delete(item.id);
      showMessage("Xóa sản phẩm thành công");
      await fetchData();
    } catch (error) {
      showMessage("Lỗi khi xóa sản phẩm", "error");
    } finally {
      isLoading.value = false;
    }
  }
};

const cleanupPreviews = () => {
  colorGroups.value.forEach((group) => {
    if (group.files) {
      group.files.forEach((fileObj) => {
        if (fileObj.preview) URL.revokeObjectURL(fileObj.preview);
      });
    }
  });
};

const openCreateModal = () => {
  isEditMode.value = false;

  formData.value = {
    id: null,
    name: "",
    description: "",
    category_id: null,
    brand_id: null,
    status: "active",
    discount_percent: null,
    sale_start: "",
    sale_end: "",
  };

  quickSetup.value = {
    category: "shoes",
    color: "",
    price: null,
    stock: null,
  };
  showQuickSetup.value = false;

  cleanupPreviews();
  colorGroups.value = [];
  showModal.value = true;
};

const openEditModal = async (id) => {
  isLoading.value = true;
  showQuickSetup.value = false;

  try {
    const productDetail = await ProductService.get(id);
    isEditMode.value = true;

    formData.value = {
      id: productDetail.id,
      name: productDetail.name,
      description: productDetail.description,
      category_id: productDetail.category_id,
      brand_id: productDetail.brand_id,
      status: productDetail.status,
      discount_percent: productDetail.discount_percent || null,
      sale_start: formatForInput(productDetail.sale_start),
      sale_end: formatForInput(productDetail.sale_end),
    };

    const existingVariants = productDetail.variants || [];
    const grouped = {};
    existingVariants.forEach((v) => {
      if (!grouped[v.color]) {
        grouped[v.color] = { color: v.color, sizes: [], files: [] };
      }
      grouped[v.color].sizes.push({
        id: v.id,
        size: v.size,
        price: v.price,
        stock: v.stock,
      });
    });

    Object.values(grouped).forEach((group) => {
      group.sizes.sort(sortSizes);
    });

    cleanupPreviews();
    colorGroups.value = Object.values(grouped);
    showModal.value = true;
  } catch (error) {
    showMessage("Không thể tải chi tiết sản phẩm", "error");
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  cleanupPreviews();
  showModal.value = false;
};

const addColorGroup = () => {
  colorGroups.value.push({
    color: "",
    sizes: [{ size: "", price: null, stock: null }],
    files: [],
  });
};

const removeColorGroup = (index) => {
  if (colorGroups.value[index].files) {
    colorGroups.value[index].files.forEach((f) =>
      URL.revokeObjectURL(f.preview),
    );
  }
  colorGroups.value.splice(index, 1);
  checkAndSetDefaultThumbnail();
};

const addSizeToColor = (groupIndex) => {
  colorGroups.value[groupIndex].sizes.push({
    size: "",
    price: null,
    stock: null,
  });
};

const removeSizeFromColor = (groupIndex, sizeIndex) => {
  colorGroups.value[groupIndex].sizes.splice(sizeIndex, 1);
};

const checkAndSetDefaultThumbnail = () => {
  colorGroups.value.forEach((group) => {
    if (group.files && group.files.length > 0) {
      let hasThumbnail = false;
      for (const fileObj of group.files) {
        if (fileObj.is_thumbnail) {
          hasThumbnail = true;
          break;
        }
      }
      if (!hasThumbnail) {
        group.files[0].is_thumbnail = true;
      }
    }
  });
};

const handleColorFileChange = (event, groupIndex) => {
  if (colorGroups.value[groupIndex].files) {
    colorGroups.value[groupIndex].files.forEach((f) =>
      URL.revokeObjectURL(f.preview),
    );
  }

  const selectedFiles = Array.from(event.target.files);

  colorGroups.value[groupIndex].files = selectedFiles.map((file) => ({
    file: file,
    preview: URL.createObjectURL(file),
    is_thumbnail: false,
  }));
  checkAndSetDefaultThumbnail();
};

const setThumbnail = (groupIndex, fileIndex) => {
  if (colorGroups.value[groupIndex].files) {
    colorGroups.value[groupIndex].files.forEach(
      (f) => (f.is_thumbnail = false),
    );
  }

  colorGroups.value[groupIndex].files[fileIndex].is_thumbnail = true;
};

const removeFile = (groupIndex, fileIndex) => {
  const fileObj = colorGroups.value[groupIndex].files[fileIndex];
  URL.revokeObjectURL(fileObj.preview);
  colorGroups.value[groupIndex].files.splice(fileIndex, 1);
  checkAndSetDefaultThumbnail();
};

const handleSave = async () => {
  if (!formData.value.name || !formData.value.category_id) {
    showMessage("Vui lòng điền Tên sản phẩm và chọn Danh mục (*)", "error");
    return;
  }

  if (colorGroups.value.length === 0) {
    showMessage("Vui lòng tạo ít nhất 1 biến thể màu sắc", "error");
    return;
  }
  for (let group of colorGroups.value) {
    if (!group.color) {
      showMessage("Tên màu sắc không được để trống", "error");
      return;
    }
    if (group.sizes.length === 0) {
      showMessage(`Vui lòng thêm kích cỡ cho màu ${group.color}`, "error");
      return;
    }
  }

  isLoading.value = true;
  try {
    const flatVariants = [];
    const flatFiles = [];
    const imagesMeta = [];
    const colorsToReplace = [];

    const tempFiles = [];

    colorGroups.value.forEach((group) => {
      group.sizes.forEach((sizeObj) => {
        flatVariants.push({
          id: sizeObj.id,
          color: group.color,
          size: sizeObj.size,
          price: sizeObj.price,
          stock: sizeObj.stock,
        });
      });

      if (group.files && group.files.length > 0) {
        colorsToReplace.push(group.color);
        group.files.forEach((fileObj) => {
          tempFiles.push({
            file: fileObj.file,
            color: group.color,
            is_thumbnail: fileObj.is_thumbnail,
          });
        });
      }
    });

    tempFiles.sort(
      (a, b) => (b.is_thumbnail ? 1 : 0) - (a.is_thumbnail ? 1 : 0),
    );

    tempFiles.forEach((item) => {
      flatFiles.push(item.file);
      imagesMeta.push({
        color: item.color,
        is_thumbnail: item.is_thumbnail,
      });
    });

    if (!isEditMode.value || flatFiles.length > 0) {
      const data = new FormData();
      data.append("name", formData.value.name);
      data.append("description", formData.value.description || "");
      data.append("category_id", formData.value.category_id);
      if (formData.value.brand_id)
        data.append("brand_id", formData.value.brand_id);
      data.append("status", formData.value.status);
      data.append("discount_percent", formData.value.discount_percent || 0);
      if (formData.value.sale_start)
        data.append("sale_start", formData.value.sale_start);
      if (formData.value.sale_end)
        data.append("sale_end", formData.value.sale_end);

      data.append("variants", JSON.stringify(flatVariants));

      if (flatFiles.length > 0) {
        data.append("images_meta", JSON.stringify(imagesMeta));

        flatFiles.forEach((file) => {
          data.append("images", file);
        });
      }

      if (!isEditMode.value) {
        await ProductService.create(data);
        showMessage("Thêm sản phẩm thành công");
      } else {
        data.append("replace_image_colors", JSON.stringify(colorsToReplace));
        data.append("_method", "PUT");

        await ProductService.update(formData.value.id, data);
        showMessage("Cập nhật sản phẩm và hình ảnh thành công");
      }
    } else {
      const payload = {
        ...formData.value,
        variants: flatVariants,
      };
      await ProductService.update(formData.value.id, payload);
      showMessage("Cập nhật sản phẩm thành công");
    }

    closeModal();
    await fetchData();
  } catch (error) {
    showMessage(
      error.response?.data?.message || "Lỗi khi lưu dữ liệu",
      "error",
    );
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.border-teal {
  border-color: #4db6ac !important;
}
.border-teal:focus {
  border-color: #00796b !important;
  box-shadow: 0 0 0 3px rgba(0, 150, 136, 0.12) !important;
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
textarea.custom-input {
  resize: vertical;
  min-height: 80px;
}
select.custom-input,
input[type="datetime-local"].custom-input,
input[type="file"].custom-input {
  cursor: pointer;
}
.file-input {
  padding: 6px 10px;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}
.border {
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.border-amber {
  border: 1px dashed rgba(255, 143, 0, 0.5);
}
.border-dashed {
  border-style: dashed !important;
  border-width: 1.5px !important;
  border-color: #c5cae9 !important;
}

:deep(.v-field__input) {
  padding-top: 8px !important;
  padding-bottom: 8px !important;
  min-height: 42px !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.v-input--density-compact .v-field) {
  min-height: 42px !important;
}
:deep(.v-field--variant-outlined .v-field__outline__start) {
  border-radius: 8px 0 0 8px;
}
:deep(.v-field--variant-outlined .v-field__outline__end) {
  border-radius: 0 8px 8px 0;
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
