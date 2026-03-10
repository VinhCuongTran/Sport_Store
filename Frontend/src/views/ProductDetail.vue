<template>
  <div class="product-detail-page bg-white py-6 min-vh-100">
    <v-container
      v-if="isLoading"
      class="d-flex justify-center align-center py-16"
    >
      <v-progress-circular
        indeterminate
        color="black"
        size="64"
      ></v-progress-circular>
    </v-container>

    <v-container v-else-if="product" class="max-w-7xl">
      <div class="mb-4">
        <v-breadcrumbs
          :items="breadcrumbItems"
          class="px-0 py-0 text-caption text-grey-darken-1 text-uppercase"
        >
          <template v-slot:divider><span class="mx-2">/</span></template>
        </v-breadcrumbs>
      </div>

      <v-row>
        <v-col cols="12" md="7" lg="7">
          <div class="product-gallery">
            <div
              class="main-image-container position-relative bg-grey-lighten-4 rounded-0 mb-4 border border-grey-lighten-3"
            >
              <v-img
                :src="mainImage"
                aspect-ratio="1"
                cover
                class="main-image"
              ></v-img>
              <div
                v-if="product.active_discount > 0"
                class="discount-badge bg-red text-white text-caption font-weight-bold px-3 py-1"
              >
                -{{ product.active_discount }}%
              </div>
            </div>

            <v-slide-group
              v-model="selectedImageIndex"
              show-arrows
              class="thumbnail-slider"
            >
              <v-slide-group-item
                v-for="(img, i) in currentGallery"
                :key="i"
                v-slot="{ isSelected }"
              >
                <div
                  :class="[
                    'thumbnail-item cursor-pointer me-3 bg-grey-lighten-4',
                    isSelected ? 'active-thumbnail' : '',
                  ]"
                  @click="setMainImage(img, i)"
                >
                  <v-img :src="img" cover aspect-ratio="1"></v-img>
                </div>
              </v-slide-group-item>
            </v-slide-group>
          </div>
        </v-col>

        <v-col cols="12" md="5" lg="5" class="pl-md-8">
          <div class="product-info-sticky">
            <div
              class="text-uppercase text-grey-darken-2 font-weight-bold text-subtitle-2 mb-1 tracking-widest"
            >
              {{ product.brand_name || "Sport Store" }}
            </div>
            <h1
              class="text-h4 font-weight-black text-black mb-3 text-uppercase product-title"
            >
              {{ product.name }}
            </h1>

            <div
              class="d-flex align-center gap-2 mb-2"
              v-if="reviews.length > 0"
            >
              <v-rating
                :model-value="averageRating"
                color="warning"
                density="compact"
                size="small"
                readonly
                half-increments
              ></v-rating>
              <span class="text-body-2 text-grey-darken-1"
                >({{ reviews.length }} đánh giá)</span
              >
            </div>

            <div class="price-block d-flex align-center gap-3 mb-6">
              <span
                v-if="product.active_discount > 0"
                class="text-h5 font-weight-bold text-red"
              >
                {{ formatPrice(discountedPrice) }}
              </span>
              <span
                :class="[
                  product.active_discount > 0
                    ? 'text-decoration-line-through text-grey text-subtitle-1'
                    : 'text-h5 font-weight-bold text-black',
                ]"
              >
                {{ formatPrice(currentOriginalPrice) }}
              </span>
            </div>

            <v-divider class="mb-6"></v-divider>

            <div class="mb-6" v-if="uniqueColors.length > 0">
              <div class="d-flex justify-space-between align-center mb-3">
                <span class="text-body-1"
                  >Màu Sắc:
                  <strong class="text-black text-uppercase">{{
                    selectedColor || "Chưa chọn"
                  }}</strong></span
                >
              </div>
              <div class="custom-variant">
                <div
                  v-for="color in uniqueColors"
                  :key="color"
                  :class="[
                    'color-swatch',
                    selectedColor === color ? 'actived' : '',
                  ]"
                  @click="selectColor(color)"
                >
                  <v-img :src="getColorImages(color)[0]" cover></v-img>
                </div>
              </div>
            </div>

            <div class="mb-6" v-if="selectedColor && availableSizes.length > 0">
              <div class="d-flex justify-space-between align-center mb-3">
                <span class="text-body-1">Kích Thước</span>
                <a
                  href="#"
                  class="text-caption text-decoration-underline text-grey-darken-2"
                  >Bảng kích thước</a
                >
              </div>
              <div class="size-grid">
                <v-btn
                  v-for="size in availableSizes"
                  :key="size"
                  :variant="selectedSize === size ? 'flat' : 'outlined'"
                  :color="selectedSize === size ? 'black' : 'grey-lighten-1'"
                  class="size-btn text-uppercase font-weight-bold"
                  :class="{ 'text-black': selectedSize !== size }"
                  rounded="0"
                  elevation="0"
                  height="48"
                  @click="selectedSize = size"
                >
                  {{ size }}
                </v-btn>
              </div>
            </div>

            <div class="mb-4">
              <span
                v-if="selectedVariant && selectedVariant.stock > 0"
                class="text-success text-body-2 d-flex align-center"
              >
                <v-icon
                  icon="mdi-check-circle-outline"
                  size="small"
                  class="mr-1"
                ></v-icon>
                Còn {{ selectedVariant.stock }} sản phẩm
              </span>
              <span
                v-else-if="selectedVariant && selectedVariant.stock === 0"
                class="text-red text-body-2 d-flex align-center"
              >
                <v-icon
                  icon="mdi-close-circle-outline"
                  size="small"
                  class="mr-1"
                ></v-icon>
                Hết hàng
              </span>
            </div>

            <div class="d-flex gap-3 mb-8 action-group">
              <div
                class="quantity-box border border-black d-flex align-center bg-white"
              >
                <v-btn
                  icon="mdi-minus"
                  variant="text"
                  density="compact"
                  rounded="0"
                  @click="decreaseQuantity"
                  :disabled="quantity <= 1"
                ></v-btn>
                <input
                  type="text"
                  v-model="quantity"
                  readonly
                  class="text-center font-weight-bold quantity-input"
                />
                <v-btn
                  icon="mdi-plus"
                  variant="text"
                  density="compact"
                  rounded="0"
                  @click="increaseQuantity"
                  :disabled="
                    selectedVariant && quantity >= selectedVariant.stock
                  "
                ></v-btn>
              </div>
              <v-btn
                color="black"
                class="flex-grow-1 add-to-cart-btn text-body-1 font-weight-bold tracking-wide"
                height="54"
                rounded="0"
                elevation="0"
                @click="addToCart"
                :loading="isAddingToCart"
                :disabled="!selectedVariant || selectedVariant.stock === 0"
              >
                THÊM VÀO GIỎ HÀNG
              </v-btn>
            </div>

            <div
              class="promotion-box border pa-4 mt-6 text-body-2"
              style="line-height: 1.8"
            >
              <p>
                <v-icon
                  color="green"
                  icon="mdi-truck-check-outline"
                  size="small"
                  class="mr-2"
                ></v-icon>
                <strong>Miễn phí</strong> giao hàng đơn từ 699k
              </p>
              <p>
                <v-icon
                  color="blue"
                  icon="mdi-sync"
                  size="small"
                  class="mr-2"
                ></v-icon>
                Đổi trả <strong>miễn phí</strong> đến 30 ngày
              </p>
              <p>
                <v-icon
                  color="red"
                  icon="mdi-shield-check-outline"
                  size="small"
                  class="mr-2"
                ></v-icon>
                <strong>100% chính hãng.</strong> Giới thiệu về Sport Store
              </p>
            </div>
          </div>
        </v-col>
      </v-row>

      <v-divider
        class="my-10 border-opacity-50"
        thickness="2"
        color="grey-lighten-1"
      ></v-divider>

      <div class="product-bottom-tabs">
        <v-tabs
          v-model="activeTabBottom"
          color="black"
          align-tabs="center"
          class="mb-8"
          selected-class="font-weight-black tab-active-border"
          show-arrows
        >
          <v-tab
            value="tab-1"
            class="text-subtitle-1 font-weight-bold tracking-wide"
            >MÔ TẢ SẢN PHẨM</v-tab
          >
          <v-tab
            value="tab-2"
            class="text-subtitle-1 font-weight-bold tracking-wide"
            >QUY ĐỊNH ĐỔI TRẢ</v-tab
          >
          <v-tab
            value="tab-3"
            class="text-subtitle-1 font-weight-bold tracking-wide"
            >HƯỚNG DẪN CHĂM SÓC</v-tab
          >
          <v-tab
            value="tab-4"
            class="text-subtitle-1 font-weight-bold tracking-wide"
            >HƯỚNG DẪN BẢO QUẢN</v-tab
          >
          <v-tab
            value="tab-5"
            class="text-subtitle-1 font-weight-bold tracking-wide"
            >VỀ CHÚNG TỐI</v-tab
          >
        </v-tabs>

        <v-window v-model="activeTabBottom" class="px-md-8 px-2 py-4">
          <v-window-item value="tab-1">
            <div
              class="ssp-product-description text-body-1 text-grey-darken-3 html-content"
            >
              <div
                v-if="product.description"
                v-html="formatDescription(product.description)"
              ></div>
              <div v-else>
                <h4 class="text-h6 font-weight-bold mb-3">
                  SẢN PHẨM CHÍNH HÃNG
                </h4>
                <p class="mb-4">Thông tin mô tả sản phẩm đang được cập nhật.</p>
              </div>

              <div class="mt-12 text-center pt-8">
                <v-divider class="mb-8 border-opacity-25"></v-divider>
                <h4 class="text-h6 font-weight-bold mb-4 text-uppercase">
                  Bảng Hướng Dẫn Chọn Size
                </h4>
                <v-img
                  :src="sizeGuideImg"
                  alt="Hướng dẫn chọn size giày"
                  class="mx-auto rounded-lg"
                  max-width="800"
                ></v-img>
              </div>
            </div>
          </v-window-item>

          <v-window-item value="tab-2">
            <div class="html-content text-body-1 text-grey-darken-3">
              <div class="text-h6 tab-heading">QUY ĐỊNH ĐỔI TRẢ HÀNG</div>
              <p class="mb-4 pb-4 border-dashed-bottom">
                <span class="text-red font-weight-medium">
                  Lưu ý: Trong thời gian diễn ra chương trình khuyến mãi, thời
                  gian giao hàng có thể kéo dài hơn so với dự kiến. Rất mong Quý
                  khách thông cảm cho sự bất tiện này.
                </span>
              </p>
              <p class="mb-2">
                <strong>Sản phẩm áp dụng:</strong> Tất cả sản phẩm được giao
                dịch tại Website Supersports Việt Nam
              </p>
              <p class="mb-3"><strong>Sản phẩm không áp dụng:</strong></p>
              <ul class="styled-list mb-6">
                <li>
                  Áo Bra Tập Luyện, Đồ Bơi, Đồ Lót, Phụ Kiện, Dụng Cụ (Ngoại trừ
                  các Phụ kiện bơi lội như: Mắt kính bơi, nhét tai, chân vịt,
                  phao).
                </li>
                <li>Thực Phẩm Chức Năng.</li>
                <li>
                  Không áp dụng cho các sản phẩm mua trực tiếp tại hệ thống cửa
                  hàng của Supersports.
                </li>
              </ul>
              <p class="mb-4 pb-4 border-dashed-bottom">
                <strong>Thời gian đổi trả hàng:</strong> Trong vòng 30 ngày (đối
                với sản phẩm nguyên giá) và 10 ngày (đối với sản phẩm khuyến
                mãi) kể từ ngày khách hàng nhận được sản phẩm từ đơn vị vận
                chuyển.
              </p>
              <p class="pt-2">
                Tham khảo thêm thông tin tại
                <a
                  class="text-blue font-weight-bold text-decoration-none"
                  href="#"
                  >Chính sách đổi trả hàng</a
                >
              </p>
            </div>
          </v-window-item>

          <v-window-item value="tab-3">
            <div class="html-content text-body-1 text-grey-darken-3">
              <ul class="styled-list">
                <li>Bảo quản giày ở nơi thoáng mát và khô ráo</li>
                <li>Tránh ánh nắng trực tiếp để ngăn mất màu và biến dạng</li>
                <li>Sử dụng túi giày để tránh bụi và giữ giày luôn mới</li>
                <li>
                  Tránh nước và độ ẩm cao (đặc biệt là đối với chất liệu da/ da
                  lộn) để hạn chế tình trạng phai màu và bong tróc.
                </li>
                <li>
                  Sử dụng các sản phẩm chăm sóc giày chuyên dụng để vệ sinh giày
                </li>
                <li>
                  Sử dụng bình xịt chống thấm nước để bảo vệ đôi giày của bạn
                  khỏi nước mưa, bùn đất hoặc những vết bẩn khác
                </li>
                <li>
                  Sử dụng bóng khử mùi hoặc xịt khử mùi để ngăn ngừa vi khuẩn
                  gây mùi
                </li>
              </ul>
            </div>
          </v-window-item>

          <v-window-item value="tab-4">
            <div class="html-content text-body-1 text-grey-darken-3">
              <h4 class="tab-heading text-subtitle-1">
                Đối với chất liệu da (Leather)
              </h4>
              <ul class="styled-list mb-8">
                <li>Lau sạch bụi bẩn bằng khăn mềm</li>
                <li>Sử dụng sáp đánh bóng da để giữ độ bóng và mềm mại</li>
                <li>
                  Tránh tiếp xúc với nước để ngăn chất liệu da bị nứt và bong
                  tróc
                </li>
              </ul>

              <h4 class="tab-heading text-subtitle-1">
                Đối với chất liệu lưới hoặc canvas (Mesh & Canvas)
              </h4>
              <ul class="styled-list mb-8">
                <li>Lau sạch bụi và vết bẩn nhỏ bằng khăn ẩm</li>
                <li>
                  Sử dụng nước ấm kết hợp xà phòng dịu nhẹ để làm sạch vết bẩn
                  lớn
                </li>
                <li>Phơi khô dưới bóng râm</li>
              </ul>

              <h4 class="tab-heading text-subtitle-1">
                Đối với chất liệu da lộn hoặc da động vật (Suede & Suede)
              </h4>
              <ul class="styled-list mb-8">
                <li>
                  Sử dụng cọ mềm để làm sạch bụi và vết bẩn (đánh bàn chải theo
                  một chiều đến khi vết bẩn được hoàn toàn loại bỏ)
                </li>
                <li>
                  Lấy khăn sạch chấm nhẹ lên sản phẩm nhằm hút ẩm và đảm bảo da
                  lộn không bị xù bề mặt
                </li>
                <li>
                  Giặt khô là phương pháp tối ưu giúp bảo quản sản phẩm da lộn
                  tốt hơn
                </li>
                <li>Sử dụng xịt chống nước để bảo vệ chất liệu suede</li>
                <li>
                  Phơi khô dưới bóng râm (không phơi trực tiếp dưới ánh nắng mặt
                  trời)
                </li>
              </ul>

              <h4 class="tab-heading text-subtitle-1">
                Đối với chất liệu tổng hợp
              </h4>
              <ul class="styled-list mb-4">
                <li>Lau sạch bụi bẩn bằng khăn ẩm hoặc bàn chải mềm</li>
                <li>Không sử dụng các chất giặt tẩy mạnh</li>
                <li>Phơi khô dưới bóng râm</li>
              </ul>
            </div>
          </v-window-item>

          <v-window-item value="tab-5">
            <div class="html-content text-center">
              <div class="about-supersports-desktop d-none d-md-block">
                <v-img
                  src="https://cdn.shopify.com/s/files/1/0456/5070/6581/files/desktop-aboutus-vn.jpg?v=1759992827"
                  alt="Về Supersports"
                  class="mx-auto"
                  max-width="800"
                ></v-img>
              </div>
              <div class="about-supersports-mobile d-block d-md-none">
                <v-img
                  src="https://cdn.shopify.com/s/files/1/0456/5070/6581/files/mobile-aboutus-vn.jpg?v=1759992826"
                  alt="Về Supersports"
                  class="mx-auto"
                  width="100%"
                ></v-img>
              </div>
            </div>
          </v-window-item>
        </v-window>
      </div>

      <v-divider
        class="my-12 border-opacity-50"
        thickness="2"
        color="grey-lighten-1"
      ></v-divider>

      <div>
        <h2
          class="text-h5 font-weight-black text-center mb-8 text-uppercase tracking-wide"
        >
          ĐÁNH GIÁ SẢN PHẨM ({{ reviews.length }})
        </h2>
        <div
          v-if="reviews.length === 0"
          class="text-center py-10 bg-grey-lighten-4 rounded-lg"
        >
          <v-icon size="60" color="grey">mdi-star-outline</v-icon>
          <h3 class="text-h6 font-weight-bold mt-4">Chưa có đánh giá nào</h3>
          <p class="text-grey-darken-1">
            Hãy mua hàng và trở thành người đầu tiên đánh giá sản phẩm này!
          </p>
        </div>
        <div v-else class="reviews-container max-w-5xl mx-auto">
          <div
            class="d-flex align-center gap-4 mb-8 bg-grey-lighten-4 pa-6 rounded-lg"
          >
            <div class="text-h3 font-weight-black text-warning">
              {{ averageRating }}
            </div>
            <div>
              <v-rating
                :model-value="averageRating"
                color="warning"
                density="compact"
                size="large"
                readonly
                half-increments
              ></v-rating>
              <div class="text-body-2 text-grey-darken-1 mt-1">
                Dựa trên {{ reviews.length }} lượt đánh giá
              </div>
            </div>
          </div>
          <div v-for="review in reviews" :key="review.id" class="border-b py-6">
            <div class="d-flex align-start mb-2">
              <v-avatar
                color="black"
                size="48"
                class="text-white font-weight-bold mr-3 border"
              >
                <v-img
                  v-if="review.user_avatar"
                  :src="review.user_avatar"
                  cover
                ></v-img>
                <span v-else>{{
                  (review.user_name || "U").charAt(0).toUpperCase()
                }}</span>
              </v-avatar>
              <div>
                <div class="font-weight-bold text-subtitle-1">
                  {{ review.user_name || "Khách hàng" }}
                </div>
                <v-rating
                  :model-value="review.rating"
                  color="warning"
                  density="compact"
                  size="small"
                  readonly
                ></v-rating>
                <div class="text-caption text-grey mt-1">
                  {{ formatDate(review.created_at) }}
                </div>
              </div>
            </div>
            <p class="mt-3 text-body-1 text-grey-darken-3 pl-16">
              {{ review.comment }}
            </p>
          </div>
        </div>
      </div>

      <v-divider
        v-if="relatedProducts.length > 0"
        class="my-12 border-opacity-50"
        thickness="2"
        color="grey-lighten-1"
      ></v-divider>

      <div v-if="relatedProducts.length > 0">
        <h2
          class="text-h5 font-weight-black text-center mb-8 text-uppercase tracking-wide"
        >
          CÓ THỂ BẠN QUAN TÂM
        </h2>
        <v-row>
          <v-col cols="6" md="3" v-for="item in relatedProducts" :key="item.id">
            <ProductCard :product="item" />
          </v-col>
        </v-row>
      </div>
    </v-container>

    <v-container v-else class="text-center py-16">
      <h2 class="text-h4 font-weight-bold mb-4">Sản phẩm không tồn tại</h2>
      <v-btn to="/products" color="black" variant="outlined" rounded="0"
        >Quay lại cửa hàng</v-btn
      >
    </v-container>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="bottom right"
      rounded="0"
    >
      <div class="d-flex align-center">
        <v-icon
          :icon="
            snackbar.color === 'success'
              ? 'mdi-check-circle'
              : 'mdi-alert-circle'
          "
          class="mr-2"
        ></v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProductService from "@/services/product.service";
import CartService from "@/services/cart.service";
import ReviewService from "@/services/review.service";
import ProductCard from "@/components/ProductCard.vue";

import sizeGuideImg from "@/assets/Shoe_size_guide.jpg";

const route = useRoute();
const router = useRouter();

const isLoading = ref(true);
const isAddingToCart = ref(false);
const product = ref(null);
const quantity = ref(1);

const reviews = ref([]);
const relatedProducts = ref([]);

const mainImage = ref("");
const selectedImageIndex = ref(0);
const selectedColor = ref(null);
const selectedSize = ref(null);
const snackbar = ref({ show: false, text: "", color: "success" });
const activeTabBottom = ref("tab-1");

const currentGallery = ref([]);

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

const fetchProductDetail = async () => {
  isLoading.value = true;
  try {
    const data = await ProductService.get(route.params.id);
    if (data.status !== "active") throw new Error("Sản phẩm không khả dụng");
    product.value = data;

    if (uniqueColors.value.length > 0) {
      selectColor(uniqueColors.value[0]);
    } else {
      const sortedImages = [...productImages.value].sort((a, b) => {
        const isThumbA = a.is_thumbnail ? 1 : 0;
        const isThumbB = b.is_thumbnail ? 1 : 0;
        return isThumbB - isThumbA;
      });

      currentGallery.value = sortedImages.map((img) => img.image_url);
      mainImage.value =
        currentGallery.value[0] || "https://placehold.co/600x600?text=No+Image";
    }

    fetchReviews(data.id);
    fetchRelatedProducts(data.category_id || data.parent_id);
  } catch (error) {
    product.value = null;
  } finally {
    isLoading.value = false;
  }
};

const productImages = computed(() => product.value?.images || []);
const uniqueColors = computed(() => [
  ...new Set((product.value?.variants || []).map((v) => v.color)),
]);

const getColorImages = (color) => {
  const allImgs = productImages.value;
  const filtered = allImgs.filter((img) => img.color === color);

  if (filtered.length === 0)
    return ["https://placehold.co/600x600?text=No+Image"];

  filtered.sort((a, b) => {
    const isThumbA = a.is_thumbnail ? 1 : 0;
    const isThumbB = b.is_thumbnail ? 1 : 0;
    return isThumbB - isThumbA;
  });

  return filtered.map((img) => img.image_url);
};

const selectColor = (color) => {
  selectedColor.value = color;
  selectedSize.value = null;

  currentGallery.value = getColorImages(color);
  setMainImage(currentGallery.value[0], 0);
  quantity.value = 1;
};

const setMainImage = (img, index) => {
  mainImage.value = img;
  selectedImageIndex.value = index;
};

const availableSizes = computed(() => {
  const sizes = (product.value?.variants || [])
    .filter((v) => v.color === selectedColor.value)
    .map((v) => v.size);
  return sizes.sort(sortSizes);
});
const selectedVariant = computed(() =>
  (product.value?.variants || []).find(
    (v) => v.color === selectedColor.value && v.size === selectedSize.value,
  ),
);
const currentOriginalPrice = computed(() => {
  if (selectedVariant.value) {
    return selectedVariant.value.price;
  }
  if (product.value?.variants && product.value.variants.length > 0) {
    const colorVariants = product.value.variants.filter(
      (v) => v.color === selectedColor.value,
    );
    const targetVariants =
      colorVariants.length > 0 ? colorVariants : product.value.variants;
    return Math.min(...targetVariants.map((v) => Number(v.price) || 0));
  }
  return product.value?.min_price || 0;
});
const discountedPrice = computed(
  () =>
    currentOriginalPrice.value *
    (1 - (product.value?.active_discount || 0) / 100),
);

const increaseQuantity = () => {
  if (selectedVariant.value && quantity.value < selectedVariant.value.stock)
    quantity.value++;
};
const decreaseQuantity = () => {
  if (quantity.value > 1) quantity.value--;
};
const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value || 0,
  );
const formatDate = (date) => new Date(date).toLocaleDateString("vi-VN");
const formatDescription = (desc) => (desc ? desc.replace(/\n/g, "<br />") : "");
const showMessage = (text, color = "success") => {
  snackbar.value = { show: true, text, color };
};

const addToCart = async () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    showMessage("Vui lòng đăng nhập", "error");
    setTimeout(() => router.push("/login"), 1500);
    return;
  }
  isAddingToCart.value = true;
  try {
    const user = JSON.parse(userStr);
    const cartRes = await CartService.getCart(user.id);
    const cartItems = cartRes.items || [];
    const existingItem = cartItems.find(
      (i) => i.variant_id === selectedVariant.value.id,
    );
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const availableToAdd = selectedVariant.value.stock - currentQtyInCart;

    if (availableToAdd <= 0) {
      showMessage(
        `Bạn đã có ${currentQtyInCart} sản phẩm này trong giỏ hàng, đã đạt mức giới hạn tồn kho.`,
        "error",
      );
      isAddingToCart.value = false;
      return;
    }

    let finalQtyToAdd = quantity.value;
    let isAdjusted = false;

    if (quantity.value > availableToAdd) {
      finalQtyToAdd = availableToAdd;
      isAdjusted = true;
    }

    await CartService.addToCart({
      user_id: user.id,
      product_id: product.value.id,
      variant_id: selectedVariant.value.id,
      quantity: finalQtyToAdd,
    });

    if (isAdjusted) {
      showMessage(
        `Thành công! Chỉ có thể thêm ${finalQtyToAdd} sản phẩm nữa do giới hạn.`,
        "warning",
      );
    } else {
      showMessage("Đã thêm vào giỏ hàng thành công!");
    }
  } catch (error) {
    showMessage("Lỗi khi thêm vào giỏ", "error");
  } finally {
    isAddingToCart.value = false;
  }
};

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0;
  const total = reviews.value.reduce((sum, rv) => sum + rv.rating, 0);
  return (total / reviews.value.length).toFixed(1);
});
const fetchReviews = async (productId) => {
  try {
    const res = await ReviewService.getByProduct(productId);
    reviews.value = res.data || res || [];
  } catch (e) {}
};
const fetchRelatedProducts = async (categoryId) => {
  try {
    const res = await ProductService.getAll({
      category: categoryId,
      limit: 15,
    });
    relatedProducts.value = (res.data || res || [])
      .filter((p) => p.id !== product.value.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  } catch (e) {}
};

const breadcrumbItems = computed(() => {
  if (!product.value) return [];
  const items = [
    { title: "Trang chủ", disabled: false, to: "/" },
    { title: "Sản phẩm", disabled: false, to: "/products" },
  ];

  if (product.value.parent_category_name) {
    items.push({
      title: product.value.parent_category_name,
      disabled: false,
      to: `/products?category=${product.value.parent_id}`,
    });
  }

  if (product.value.category_name) {
    items.push({
      title: product.value.category_name,
      disabled: false,
      to: `/products?category=${product.value.category_id}`,
    });
  } else if (product.value.sport_name) {
    items.push({
      title: product.value.sport_name,
      disabled: false,
      to: `/products?sport=${product.value.sport_id}`,
    });
  }

  items.push({ title: product.value.name, disabled: true });
  return items;
});

onMounted(() => fetchProductDetail());
watch(
  () => route.params.id,
  (newId) => {
    if (newId) fetchProductDetail();
  },
);
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}
.max-w-7xl {
  max-width: 1280px;
  margin: 0 auto;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.tracking-widest {
  letter-spacing: 0.1em !important;
}
.tracking-wide {
  letter-spacing: 0.05em !important;
}

/* Hình ảnh Gallery */
.main-image-container {
  overflow: hidden;
}
.discount-badge {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}
.thumbnail-item {
  width: 80px;
  height: 80px;
  border: 1px solid transparent;
  transition: all 0.2s;
  opacity: 0.6;
}
.active-thumbnail {
  border-color: #000;
  opacity: 1;
}

/* Swatch MÀU SẮC */
.custom-variant {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.color-swatch {
  width: 80px;
  height: 80px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.color-swatch.actived {
  border-color: #000;
  padding: 2px;
}
.color-swatch .v-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #f5f5f5;
}

.product-info-sticky {
  position: sticky;
  top: 20px;
}
.size-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
}
.size-btn {
  width: 100%;
  border: 1px solid #e0e0e0 !important;
}
.v-btn--active.size-btn {
  border-color: #000 !important;
}
.quantity-box {
  width: 120px;
  height: 54px;
}
.quantity-input {
  width: 100%;
  text-align: center;
  outline: none;
  font-size: 1.1rem;
}
.product-bottom-tabs :deep(.v-tab) {
  text-transform: none;
}
.tab-active-border {
  border-bottom: 2px solid #000 !important;
}
.html-content {
  line-height: 1.8;
}

.border-dashed-bottom {
  border-bottom: 1px dashed #e0e0e0;
}

.tab-heading {
  border-bottom: 2px solid #000;
  padding-bottom: 8px;
  margin-bottom: 20px;
  font-weight: 700;
  text-transform: uppercase;
  color: #212121;
}

.styled-list {
  list-style-type: none;
  padding-left: 0;
}

.styled-list li {
  border-bottom: 1px dashed #e0e0e0;
  padding: 12px 0 12px 24px;
  position: relative;
  color: #424242;
}

.styled-list li:last-child {
  border-bottom: none;
}

.styled-list li::before {
  content: "";
  position: absolute;
  left: 4px;
  top: 20px;
  width: 6px;
  height: 6px;
  background-color: #000;
  border-radius: 50%;
}
</style>
