<template>
  <div
    class="pa-0 ma-0 w-100"
    style="overflow-x: hidden; border-radius: 16px; overflow: hidden"
  >
    <div
      v-if="featuredProducts.length > 0"
      class="smooth-slider"
      aria-live="polite"
    >
      <div
        class="slider-track"
        :class="{ 'no-transition': isResetting }"
        :style="{
          transform: `translate3d(-${currentSlide * 100}%, 0, 0)`,
        }"
        @transitionend="handleTransitionEnd"
      >
        <div
          v-for="(product, index) in sliderProducts"
          :key="`${product.id}-${index}`"
          class="slider-slide"
        >
          <v-row density="compact" class="w-100 h-100 ma-0">
            <v-col cols="12" md="5" class="bg-grey-lighten-3 pa-0">
              <div
                class="h-100 d-flex align-center justify-center pa-4 image-container"
              >
                <v-img
                  :src="
                    product.thumbnail ||
                    'https://placehold.co/600x600?text=No+Image'
                  "
                  class="rounded-lg shadow-lg slider-img"
                  contain
                />
              </div>
            </v-col>

            <v-col
              cols="12"
              md="7"
              class="pa-0 d-flex flex-column justify-center custom-bg text-white"
            >
              <div class="content-inner px-8 py-6">
                <h2 class="text-h4 font-weight-bold mb-3 line-clamp-2">
                  {{ product.name }}
                </h2>

                <p class="text-body-2 mb-2 text-white">
                  Thương hiệu:
                  <span class="font-weight-bold">{{
                    product.brand_name || "Khác"
                  }}</span>
                </p>

                <div
                  v-if="product.description"
                  class="text-body-2 mb-6 text-white rich-description line-clamp-2"
                  v-html="renderDescription(product.description)"
                ></div>
                <p v-else class="text-body-2 mb-6 text-white line-clamp-2">
                  Khám phá ngay sản phẩm thể thao chất lượng cao giúp bạn bứt
                  phá giới hạn của bản thân.
                </p>

                <div>
                  <v-btn
                    :to="`/product/${product.id}`"
                    color="white"
                    variant="outlined"
                    size="large"
                    class="text-capitalize font-weight-bold px-6 rounded-pill hover-btn-white"
                  >
                    Xem Chi Tiết
                    <v-icon right class="ml-2">mdi-arrow-right</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </div>
    </div>

    <div
      v-else
      class="d-flex justify-center align-center bg-grey-lighten-3"
      style="height: 450px; border-radius: 16px"
    >
      <v-progress-circular
        indeterminate
        color="#001a2d"
        size="64"
      ></v-progress-circular>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import ProductService from "@/services/product.service";

const featuredProducts = ref([]);
const currentSlide = ref(0);
const isResetting = ref(false);
let sliderTimer;

const sliderProducts = computed(() => {
  if (featuredProducts.value.length <= 1) return featuredProducts.value;
  return [...featuredProducts.value, featuredProducts.value[0]];
});

const renderDescription = (description) => {
  if (!description) return "";
  if (/<[a-z][\s\S]*>/i.test(description)) return description;
  return description.replace(/\r?\n/g, "<br />");
};

const fetchRandomProducts = async () => {
  try {
    const products = await ProductService.getAll();
    if (products && products.length > 0) {
      const activeProducts = products.filter((p) => p.status === "active");
      const shuffled = [...activeProducts].sort(() => 0.5 - Math.random());
      featuredProducts.value = shuffled.slice(0, 5);
      currentSlide.value = 0;
      isResetting.value = false;
      startSlider();
    }
  } catch (error) {
    console.error("Lỗi khi tải slider:", error);
  }
};

const startSlider = () => {
  clearInterval(sliderTimer);
  if (featuredProducts.value.length <= 1) return;

  sliderTimer = setInterval(() => {
    isResetting.value = false;
    currentSlide.value++;
  }, 4000);
};

const handleTransitionEnd = (event) => {
  if (
    event.propertyName !== "transform" ||
    currentSlide.value !== featuredProducts.value.length
  ) {
    return;
  }

  isResetting.value = true;
  currentSlide.value = 0;
  requestAnimationFrame(() => {
    isResetting.value = false;
  });
};

watch(
  () => featuredProducts.value.length,
  () => {
    currentSlide.value = 0;
    isResetting.value = false;
    startSlider();
  },
);

onMounted(() => {
  fetchRandomProducts();
});

onUnmounted(() => {
  clearInterval(sliderTimer);
});
</script>

<style scoped>
.custom-bg {
  background-color: #001a2d !important;
}

.smooth-slider {
  height: 450px;
  overflow: hidden;
  position: relative;
  border-radius: 16px;
  isolation: isolate;
  background-color: #001a2d !important;
}

.slider-track {
  display: flex;
  width: 100%;
  height: 100%;
  transform: translate3d(0, 0, 0);
  transition: transform 900ms cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform;
}

.slider-track.no-transition {
  transition: none;
}

.slider-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 450px;
  min-width: 100%;
  overflow: hidden;
}

.smooth-slider,
.slider-track,
.slider-slide {
  backface-visibility: hidden;
}

.image-container {
  height: 100%;
  width: 100%;
}

:deep(.slider-img .v-img__img) {
  object-fit: contain !important;
}

.slider-img {
  width: 100%;
  height: 100%;
  max-height: 400px;
}

.content-inner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.hover-btn-white:hover {
  background-color: white !important;
  color: #001a2d !important;
  transition: all 0.3s ease;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.rich-description {
  max-height: 3.2em;
  overflow: hidden;
  line-height: 1.6;
}

.rich-description :deep(p),
.rich-description :deep(div),
.rich-description :deep(ul),
.rich-description :deep(ol),
.rich-description :deep(h1),
.rich-description :deep(h2),
.rich-description :deep(h3),
.rich-description :deep(h4),
.rich-description :deep(h5),
.rich-description :deep(h6) {
  margin: 0;
}

.rich-description :deep(ul),
.rich-description :deep(ol) {
  padding-left: 20px;
}
</style>
