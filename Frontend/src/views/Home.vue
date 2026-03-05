<template>
  <div class="home-content">
    <section class="text-center pt-10 pb-16 bg-white">
      <v-container>
        <h1
          class="text-h3 md:text-h2 font-weight-black text-black mb-4 text-uppercase"
        >
          Bứt phá giới hạn <br class="d-md-none" />
          Khẳng định bản thân
        </h1>
        <p class="text-grey-darken-2 text-subtitle-1 mb-8 max-w-2xl mx-auto">
          Hệ thống đồ thể thao chính hãng hàng đầu. Cung cấp trang thiết bị,
          quần áo và phụ kiện xịn xò nhất cho mọi bộ môn.
        </p>
        <ProductSlider />
      </v-container>
    </section>

    <section class="py-16 bg-grey-lighten-5">
      <v-container class="text-center">
        <h3 class="text-h4 font-weight-bold mb-12">
          ✨ Tại sao chọn Sport Store?
        </h3>
        <v-row>
          <v-col
            v-for="(feature, i) in features"
            :key="i"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card
              class="pa-8 h-100 elevation-0 border rounded-xl transition-swing hover-card cursor-pointer bg-white"
            >
              <v-avatar color="black" size="80" class="mb-6 elevation-4">
                <v-icon size="40" color="white">{{ feature.icon }}</v-icon>
              </v-avatar>
              <h4 class="text-h6 font-weight-bold mb-3">{{ feature.title }}</h4>
              <p class="text-body-2 text-grey-darken-1">
                {{ feature.description }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="py-16 bg-white">
      <v-container>
        <div
          class="d-flex justify-space-between align-center mb-10 border-b pb-4"
        >
          <h2 class="text-h4 font-weight-bold text-black">
            🔥 Sản phẩm nổi bật
          </h2>
          <v-btn
            variant="text"
            to="/products"
            color="black"
            append-icon="mdi-arrow-right"
            class="font-weight-bold"
          >
            Xem tất cả
          </v-btn>
        </div>

        <v-row v-if="!isLoading">
          <v-col
            v-for="product in featuredProducts"
            :key="product.id"
            cols="12"
            sm="6"
            md="3"
          >
            <ProductCard :product="product" />
          </v-col>
        </v-row>

        <div v-else class="text-center py-10">
          <v-progress-circular
            indeterminate
            color="black"
            size="50"
          ></v-progress-circular>
        </div>
      </v-container>
    </section>

    <section class="py-16 mb-10">
      <v-container>
        <v-card
          color="black"
          dark
          class="rounded-xl pa-12 text-center elevation-10"
          image="https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
        >
          <div
            style="
              background-color: rgba(0, 0, 0, 0.7);
              position: absolute;
              inset: 0;
            "
          ></div>
          <div class="position-relative z-index-1">
            <h2
              class="text-h3 font-weight-black text-white mb-6 text-uppercase"
            >
              Sẵn sàng để tỏa sáng?
            </h2>
            <p class="text-grey-lighten-2 mb-10 text-h6 font-weight-regular">
              Đăng ký thành viên để nhận ngay Voucher giảm 20% cho đơn hàng đầu
              tiên.
            </p>
            <v-btn
              v-if="!isLoggedIn"
              to="/register"
              color="white"
              class="text-black font-weight-bold px-10"
              size="x-large"
              rounded="pill"
              >Tham gia ngay</v-btn
            >
            <v-btn
              v-else
              to="/products"
              color="white"
              class="text-black font-weight-bold px-10"
              size="x-large"
              rounded="pill"
              >Mua sắm ngay</v-btn
            >
          </div>
        </v-card>
      </v-container>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ProductService from "@/services/product.service";
import ProductCard from "@/components/ProductCard.vue";
import ProductSlider from "@/components/ProductSlider.vue";
// XÓA 2 dòng import Header, Footer

const isLoading = ref(false);
const featuredProducts = ref([]);
const isLoggedIn = ref(false);

const features = ref([
  {
    icon: "mdi-shield-check",
    title: "Cam kết chính hãng",
    description:
      "Hoàn tiền 200% nếu phát hiện hàng giả, hàng nhái. Nguồn gốc rõ ràng.",
  },
  {
    icon: "mdi-truck-fast",
    title: "Giao hàng siêu tốc",
    description:
      "Freeship toàn quốc cho đơn từ 500k. Nhận hàng trong 2-4 ngày làm việc.",
  },
  {
    icon: "mdi-sync",
    title: "Đổi trả miễn phí",
    description:
      "Hỗ trợ đổi size, đổi mẫu trong vòng 15 ngày vô cùng dễ dàng và nhanh chóng.",
  },
]);

const fetchFeaturedProducts = async () => {
  isLoading.value = true;
  try {
    const products = await ProductService.getAll();
    const activeProducts = products.filter((p) => p.status === "active");
    featuredProducts.value = activeProducts
      .sort((a, b) => b.active_discount - a.active_discount)
      .slice(0, 8);
  } catch (error) {
    console.error("Lỗi khi tải sản phẩm:", error);
  } finally {
    isLoading.value = false;
  }
};

const checkLoginStatus = () => {
  isLoggedIn.value = !!localStorage.getItem("token");
};

onMounted(() => {
  fetchFeaturedProducts();
  checkLoginStatus();
});
</script>

<style scoped>
.hover-card {
  transition: all 0.3s ease;
}
.hover-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1) !important;
}
.border-b {
  border-bottom: 2px solid #f0f0f0;
}
.z-index-1 {
  z-index: 1;
}
</style>
