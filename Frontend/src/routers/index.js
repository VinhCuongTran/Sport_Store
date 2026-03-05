import { createWebHistory, createRouter } from "vue-router";
import AuthService from "../services/auth.service";

const routes = [
  // === CÁC TRANG DÀNH CHO ADMIN ===
  {
    path: "/admin",
    component: () => import("../components/Admin/AdminLayout.vue"),
    meta: { requiresAdmin: true }, // Đánh dấu cần quyền Admin
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
      }
    ],
  },

  // === CÁC TRANG DÀNH CHO KHÁCH (CLIENT) ===
  {
    path: "/",
    name: "home",
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/Login.vue"), // Dùng 1 trang Login duy nhất
  },
  {
    path: "/:pathMatch(.*)*",
    name: "notfound",
    component: () => import("../views/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation Guard: Bảo vệ các trang Admin
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAdmin)) {
    if (!AuthService.isAdmin()) {
      // Nếu không phải admin, đẩy về trang login chung
      next({ name: "login" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
