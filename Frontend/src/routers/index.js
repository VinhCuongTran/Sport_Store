import { createWebHistory, createRouter } from "vue-router";
import AuthService from "../services/auth.service";

const routes = [
  // 1. CÁC TRANG DÀNH CHO ADMIN
  {
    path: "/admin",
    component: () => import("../components/Admin/AdminLayout.vue"),
    meta: { requiresAdmin: true },
    children: [
      {
        path: "",
        name: "admin-stats",
        component: () => import("../views/Admin/AdminStats.vue"),
      },
      {
        path: "categories",
        name: "admin-category",
        component: () => import("../views/Admin/AdminCategory.vue"),
      },
      {
        path: "brands",
        name: "admin-brand",
        component: () => import("../views/Admin/AdminBrand.vue"),
      },
      {
        path: "users",
        name: "admin-user",
        component: () => import("../views/Admin/AdminUser.vue"),
      },
      {
        path: "products",
        name: "admin-product",
        component: () => import("../views/Admin/AdminProduct.vue"),
      },
      {
        path: "vouchers",
        name: "admin-voucher",
        component: () => import("../views/Admin/AdminVoucher.vue"),
      },
      {
        path: "reviews",
        name: "admin-review",
        component: () => import("../views/Admin/AdminReview.vue"),
      },
      {
        path: "orders",
        name: "admin-order",
        component: () => import("../views/Admin/AdminOrder.vue"),
      },
    ],
  },

  // 2. CÁC TRANG CỦA KHÁCH CÓ HEADER & FOOTER
  {
    path: "/",
    component: () => import("../components/DefaultLayout.vue"),
    children: [
      {
        path: "",
        name: "home",
        component: () => import("../views/Home.vue"),
      },
      {
        path: "products",
        name: "products",
        component: () => import("../views/Products.vue"),
      },
      {
        path: "product/:id",
        name: "product-detail",
        component: () => import("../views/ProductDetail.vue"),
      },
      {
        path: "cart",
        name: "cart",
        component: () => import("../views/Cart.vue"),
      },
      {
        path: "profile",
        name: "profile",
        component: () => import("../views/Profile.vue"),
      },
      {
        path: "checkout",
        name: "checkout",
        component: () => import("../views/Checkout.vue"),
      },
      {
        path: "orders",
        name: "orders",
        component: () => import("../views/Order.vue"),
      },
      // ĐEM TRANG 404 VÀO TRONG NÀY ĐỂ NÓ CÓ HEADER VÀ FOOTER
      {
        path: "/:pathMatch(.*)*",
        name: "notfound",
        component: () => import("../views/NotFound.vue"),
      },
    ],
  },

  // 3. CÁC TRANG ĐỘC LẬP (Không dùng Header/Footer chung)
  {
    path: "/login",
    name: "login",
    component: () => import("../views/Login.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from) => {
  // Kiểm tra xem route chuẩn bị vào có yêu cầu quyền Admin không
  if (to.matched.some((record) => record.meta.requiresAdmin)) {
    // Nếu không phải là Admin hoặc Staff thì ĐẨY về trang đăng nhập
    if (!AuthService.isAdmin()) {
      return { name: "login" }; // Dùng return thay vì gọi next({ name: "login" })
    }
  }

  // Nếu hợp lệ, không cần gọi next(), chỉ cần không return gì cả (hoặc return true)
  // Vue Router 4 sẽ tự động cho phép đi tiếp!
  return true;
});

export default router;
