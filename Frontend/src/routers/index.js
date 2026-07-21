import { createWebHistory, createRouter } from "vue-router";
import AuthService from "../services/auth.service";

const routes = [
  {
    path: "/admin",
    component: () => import("../components/Admin/AdminLayout.vue"),
    meta: { requiresAdmin: true },
    children: [
      {
        path: "",
        name: "admin-stats",
        component: () => import("../views/Admin/AdminStats.vue"),
        meta: { requiresSuperAdmin: true },
      },
      {
        path: "transactions",
        name: "admin-transaction",
        component: () => import("../views/Admin/AdminTransaction.vue"),
      },
      {
        path: "activity-logs",
        name: "admin-activity-log",
        component: () => import("../views/Admin/AdminActivityLog.vue"),
      },
      {
        path: "categories",
        name: "admin-category",
        component: () => import("../views/Admin/AdminCategory.vue"),
      },
      {
        path: "sports",
        name: "admin-sport",
        component: () => import("../views/Admin/AdminSport.vue"),
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
        meta: { requiresSuperAdmin: true },
      },
      {
        path: "products",
        name: "admin-product",
        component: () => import("../views/Admin/AdminProduct.vue"),
      },
      // --- THÊM ROUTE CHO LỊCH SỬ KHO TẠI ĐÂY ---
      {
        path: "inventory-logs",
        name: "admin-inventory-log",
        component: () => import("../views/Admin/AdminInventoryLog.vue"),
      },
      // ------------------------------------------
      {
        path: "orders",
        name: "admin-order",
        component: () => import("../views/Admin/AdminOrder.vue"),
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
        path: "low-stock",
        name: "admin-low-stock",
        component: () => import("../views/Admin/AdminLowStock.vue"),
      },
      {
        path: "stock-take",
        name: "admin-stock-take",
        component: () => import("../views/Admin/AdminStockTake.vue"),
      },
    ],
  },
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
        path: "search",
        name: "search",
        component: () => import("../views/Search.vue"),
      },
      {
        path: "about-us",
        name: "about",
        component: () => import("../views/AboutUs.vue"),
      },
      {
        path: "All-Brands",
        name: "All-Brands",
        component: () => import("../views/AllBrands.vue"),
      },
      {
        path: "New-Arrivals",
        name: "New-Arrivals",
        component: () => import("../views/NewArrivals.vue"),
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
        path: "checkout",
        name: "checkout",
        component: () => import("../views/Checkout.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "orders",
        name: "order",
        component: () => import("../views/Order.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "profile",
        name: "profile",
        component: () => import("../views/Profile.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "favorites",
        name: "favorites",
        component: () => import("../views/Favorite.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "/:pathMatch(.*)*",
        name: "notfound",
        component: () => import("../views/NotFound.vue"),
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/Auth.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/Auth.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: "smooth" };
    }
  },
});

router.beforeEach((to, from) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const isAuthenticated = !!(user && token);

  if (to.matched.some((record) => record.meta.requiresAdmin)) {
    if (!AuthService.isAdmin()) {
      return { name: "home" };
    }
    if (to.meta.requiresSuperAdmin && !AuthService.isSuperAdmin()) {
      return { name: "admin-order" };
    }
  }

  if (
    to.matched.some((record) => record.meta.requiresAuth) &&
    !isAuthenticated
  ) {
    return { name: "login", query: { redirect: to.fullPath } };
  }
});

export default router;
