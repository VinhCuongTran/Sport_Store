<template>
  <v-app-bar
    color="indigo-darken-4"
    elevation="4"
    height="64"
    style="border-bottom: 2px solid rgba(255, 255, 255, 0.08)"
  >
    <v-app-bar-nav-icon
      @click="$emit('toggle-drawer')"
      color="white"
      variant="text"
    ></v-app-bar-nav-icon>

    <div
      class="d-flex align-center rounded-lg mx-2 px-2 py-1"
      style="background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(4px)"
    >
      <img
        src="../../assets/logo.jpg"
        alt="Admin Logo"
        height="32"
        style="border-radius: 6px"
      />
    </div>

    <v-app-bar-title
      class="font-weight-bold text-uppercase text-body-1 text-white ml-1"
      style="letter-spacing: 1.5px"
    >
      Trang Quản Trị
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <v-menu
      v-model="showNotifications"
      location="bottom end"
      transition="scale-transition"
      :close-on-content-click="false"
    >
      <template v-slot:activator="{ props }">
        <v-btn icon color="white" v-bind="props" class="mr-3">
          <v-badge
            :content="unreadCount"
            :model-value="unreadCount > 0"
            color="red-lighten-1"
            floating
          >
            <v-icon>mdi-bell</v-icon>
          </v-badge>
        </v-btn>
      </template>

      <v-card min-width="320" max-width="360" rounded="lg" elevation="8">
        <v-card-title
          class="d-flex justify-space-between align-center text-subtitle-1 font-weight-bold bg-indigo-darken-4 text-white pa-3"
        >
          Thông báo
          <v-chip
            v-if="unreadCount > 0"
            size="x-small"
            color="white"
            text-color="indigo-darken-4"
            class="font-weight-bold"
          >
            {{ unreadCount }} mới
          </v-chip>
        </v-card-title>
        <v-divider></v-divider>
        <!-- BÊN TRONG MENU THÔNG BÁO ADMIN -->
<v-list lines="two" max-height="400" class="overflow-y-auto pa-0">
  <v-list-item
    v-if="notifications.length === 0"
    class="text-center pa-4 text-grey"
  >
    Không có thông báo nào
  </v-list-item>

  <!-- Thay đổi màu nền: bg-amber-lighten-5 (chưa đọc) vs bg-white (đã đọc) -->
  <v-list-item
    v-for="notify in notifications"
    :key="notify.id"
    :class="!notify.is_read ? 'bg-amber-lighten-5' : 'bg-white'"
    @click="handleNotificationClick(notify)"
    class="border-b py-2"
    link
  >
    <template v-slot:prepend>
      <v-avatar
        :color="notify.type === 'new_order' ? 'success' : 'primary'"
        size="36"
      >
        <v-icon color="white" size="18">
          {{ notify.type === "new_order" ? "mdi-shopping" : "mdi-bell-outline" }}
        </v-icon>
      </v-avatar>
    </template>

    <v-list-item-title
      class="text-subtitle-2 mb-1"
      :class="!notify.is_read ? 'font-weight-black text-black' : 'font-weight-regular text-grey-darken-3'"
    >
      {{ notify.title }}
    </v-list-item-title>

    <v-list-item-subtitle class="text-caption text-grey-darken-2">
      {{ notify.message }}
    </v-list-item-subtitle>

    <template v-slot:append>
      <v-icon v-if="!notify.is_read" color="red-darken-1" size="10">mdi-circle</v-icon>
    </template>
  </v-list-item>
</v-list>
      </v-card>
    </v-menu>

    <v-btn
      prepend-icon="mdi-home"
      variant="tonal"
      color="white"
      class="mr-3 text-capitalize"
      rounded="lg"
      @click="goToHome"
    >
      Trang Khách
    </v-btn>

    <div v-if="user" class="d-none d-sm-flex align-center mr-4">
      <v-avatar
        size="36"
        class="mr-2"
        style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.5);
        "
      >
        <v-icon color="white" size="20">mdi-account</v-icon>
      </v-avatar>
      <div class="d-flex flex-column" style="line-height: 1.2">
        <span class="text-caption text-blue-grey-lighten-3">Xin chào,</span>
        <strong class="text-body-2 text-white">{{
          user.name || user.email
        }}</strong>
      </div>
    </div>

    <v-btn
      prepend-icon="mdi-logout"
      color="red-lighten-1"
      variant="flat"
      class="mr-2 text-capitalize"
      rounded="lg"
      @click="handleLogout"
    >
      Đăng xuất
    </v-btn>
  </v-app-bar>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { io } from "socket.io-client"; // Import socket.io-client
import AuthService from "../../services/auth.service";
import NotificationService from "../../services/notification.service";

const router = useRouter();
const toast = useToast();
const user = ref(null);
const notifications = ref([]);
const showNotifications = ref(false);
let socket = null;

// Tính số lượng thông báo chưa đọc
const unreadCount = computed(() => {
  return notifications.value.filter((n) => !n.is_read).length;
});

// Lấy danh sách thông báo khi mới load trang
const fetchNotifications = async () => {
  try {
    const data = await NotificationService.getAll();
    notifications.value = data || [];
  } catch (error) {
    console.error("Lỗi lấy thông báo:", error);
  }
};

onMounted(() => {
  const userData = localStorage.getItem("user");
  if (userData) {
    user.value = JSON.parse(userData);
    fetchNotifications();

    // 1. Kết nối Socket (Nhớ đổi URL cổng Backend nếu cần)
    socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log("✅ Admin Socket đã kết nối thành công!");

      // SỬA Ở ĐÂY: Dùng "user_connected" khớp với server.js
      socket.emit("user_connected", user.value.id);
    });

    // SỬA Ở ĐÂY: Dùng "new_notification" khớp với server.js
    socket.on("new_notification", (newNotify) => {
      console.log("🔔 Có thông báo mới:", newNotify);

      // Đẩy thông báo mới lên đầu danh sách chuông
      notifications.value.unshift(newNotify);

      // Phân loại màu sắc: 'warning' (màu vàng/cam) cho cảnh báo kho, 'info' (màu xanh dương) cho đơn hàng
      const toastType = newNotify.type === "system" ? "warning" : "info";

      // Hiện popup thông báo nổi
      toast(newNotify.title + " - " + newNotify.message, {
        position: "bottom-right", // Chuyển thông báo xuống góc dưới bên phải
        type: toastType,          // Thay đổi màu sắc dựa theo ngữ cảnh cho đẹp mắt
        timeout: 5000,            // Tự động tắt sau 5 giây
        closeOnClick: true,
        pauseOnHover: true,
        onClick: () => {
          // Bắt sự kiện click vào popup để chuyển hướng tới đúng trang xử lý
          handleNotificationClick(newNotify);
        }
      });
    });
  }
});

// Dọn dẹp kết nối socket khi rời khỏi component (để tránh rò rỉ bộ nhớ)
onUnmounted(() => {
  if (socket) {
    socket.disconnect();
  }
});

// Xử lý khi Admin click vào một thông báo
const handleNotificationClick = async (notification) => {
  try {
    if (!notification.is_read) {
      await NotificationService.markAsRead(notification.id);
      notification.is_read = true;
    }

    showNotifications.value = false;

    // Điều hướng và tự động mở chi tiết đơn hàng
    if (notification.type === "new_order" || notification.type === "order") {
      router.push({
        name: "admin-order",
        query: { open_order: notification.reference_id },
      });
    }
    // 2. Nếu là cảnh báo hệ thống (Sắp hết hàng) -> Điều hướng tới trang Sắp hết hàng & mở form
    else if (notification.type === "system") {
      router.push({
        name: "admin-low-stock",
        query: { open_import: notification.reference_id } // <-- Thêm dòng này
      });
    }
  } catch (error) {
    console.error("Lỗi khi click thông báo:", error);
  }
};

const handleLogout = () => {
  AuthService.logout();
  router.push({ name: "login" });
};

const goToHome = () => {
  router.push({ name: "home" });
};
</script>

<style scoped>
.v-app-bar {
  background: linear-gradient(
    90deg,
    #1a237e 0%,
    #283593 60%,
    #303f9f 100%
  ) !important;
}
</style>
