<template>
  <v-container class="py-8" max-width="900">
    <v-card elevation="2" rounded="lg">
      <!-- HEADER TRANG THÔNG BÁO -->
      <v-card-title
        class="pa-6 bg-primary text-white d-flex flex-column flex-sm-row justify-space-between align-sm-center gap-4"
      >
        <div class="d-flex align-center">
          <v-icon size="32" class="mr-3">mdi-bell-ring-outline</v-icon>
          <div>
            <h1 class="text-h6 text-sm-h5 font-weight-bold mb-1">
              Tất cả thông báo
            </h1>
            <p class="text-caption text-blue-lighten-4 mb-0">
              Bạn có {{ unreadCount }} thông báo chưa đọc
            </p>
          </div>
        </div>

        <v-btn
          v-if="unreadCount > 0"
          variant="elevated"
          color="white"
          class="text-primary text-none font-weight-bold"
          prepend-icon="mdi-check-all"
          @click="markAllAsRead"
          :loading="loadingMarkAll"
        >
          Đánh dấu tất cả đã đọc
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- THANH CÔNG CỤ LỌC -->
      <div
        class="pa-4 bg-grey-lighten-4 d-flex align-center justify-space-between"
      >
        <v-tabs v-model="activeTab" color="primary" density="compact">
          <v-tab value="all" class="text-none font-weight-bold">
            Tất cả ({{ notifications.length }})
          </v-tab>
          <v-tab value="unread" class="text-none font-weight-bold">
            Chưa đọc ({{ unreadCount }})
          </v-tab>
          <v-tab value="read" class="text-none font-weight-bold">
            Đã đọc ({{ notifications.length - unreadCount }})
          </v-tab>
        </v-tabs>
      </div>

      <!-- DANH SÁCH THÔNG BÁO -->
      <v-card-text class="pa-0">
        <div v-if="loading" class="pa-8 text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="48"
          ></v-progress-circular>
          <p class="mt-3 text-grey">Đang tải thông báo...</p>
        </div>

        <div
          v-else-if="filteredNotifications.length === 0"
          class="pa-12 text-center text-grey"
        >
          <v-icon size="64" color="grey-lighten-2" class="mb-3"
            >mdi-bell-sleep-outline</v-icon
          >
          <p class="text-body-1 font-weight-medium">
            Không có thông báo nào trong mục này
          </p>
        </div>

        <v-list v-else lines="three" class="pa-0">
          <v-list-item
            v-for="noti in filteredNotifications"
            :key="noti.id"
            :class="!noti.is_read ? 'bg-blue-lighten-5' : 'bg-white'"
            @click="handleNotificationClick(noti)"
            class="border-b pa-4 transition-all hover-row"
          >
            <template v-slot:prepend>
              <v-avatar
                :color="!noti.is_read ? 'primary' : 'grey-lighten-1'"
                size="48"
                class="mr-4"
              >
                <v-icon color="white" size="24">
                  {{ getIconByType(noti.type) }}
                </v-icon>
              </v-avatar>
            </template>

            <v-list-item-title
              class="text-body-1 mb-1"
              :class="
                !noti.is_read
                  ? 'font-weight-black text-primary'
                  : 'font-weight-medium text-grey-darken-3'
              "
            >
              {{ noti.title }}
            </v-list-item-title>

            <v-list-item-subtitle class="text-body-2 text-grey-darken-2 mb-2">
              {{ noti.message }}
            </v-list-item-subtitle>

            <div class="d-flex align-center text-caption text-grey">
              <v-icon size="14" class="mr-1"
                >mdi-clock-time-four-outline</v-icon
              >
              <span>{{ formatDate(noti.created_at) }}</span>
            </div>

            <template v-slot:append>
              <div class="d-flex align-center">
                <v-tooltip location="top" text="Đánh dấu đã đọc">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-if="!noti.is_read"
                      v-bind="props"
                      icon="mdi-circle-medium"
                      color="primary"
                      variant="text"
                      size="large"
                      @click.stop="markSingleAsRead(noti)"
                    ></v-btn>
                  </template>
                </v-tooltip>
                <v-icon color="grey-lighten-1">mdi-chevron-right</v-icon>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import NotificationService from "@/services/notification.service.js";
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();

const notifications = ref([]);
const loading = ref(true);
const loadingMarkAll = ref(false);
const activeTab = ref("all");

const unreadCount = computed(() => {
  return notifications.value.filter((n) => !n.is_read).length;
});

const filteredNotifications = computed(() => {
  if (activeTab.value === "unread") {
    return notifications.value.filter((n) => !n.is_read);
  }
  if (activeTab.value === "read") {
    return notifications.value.filter((n) => n.is_read);
  }
  return notifications.value;
});

const fetchNotifications = async () => {
  loading.value = true;
  try {
    const res = await NotificationService.getAll();
    notifications.value = res || [];
  } catch (error) {
    toast.error("Không thể tải danh sách thông báo");
  } finally {
    loading.value = false;
  }
};

const markSingleAsRead = async (noti) => {
  try {
    await NotificationService.markAsRead(noti.id);
    noti.is_read = true;
  } catch (error) {
    console.error("Lỗi đánh dấu đã đọc:", error);
  }
};

const markAllAsRead = async () => {
  loadingMarkAll.value = true;
  try {
    // Gọi API đánh dấu tất cả đã đọc (nếu backend chưa có hàm markAllAsRead, có thể lặp qua từng id)
    if (NotificationService.markAllAsRead) {
      await NotificationService.markAllAsRead();
    } else {
      const unreadList = notifications.value.filter((n) => !n.is_read);
      await Promise.all(
        unreadList.map((n) => NotificationService.markAsRead(n.id)),
      );
    }
    notifications.value.forEach((n) => (n.is_read = true));
    toast.success("Đã đánh dấu đọc tất cả thông báo");
  } catch (error) {
    toast.error("Có lỗi xảy ra, vui lòng thử lại!");
  } finally {
    loadingMarkAll.value = false;
  }
};

const handleNotificationClick = async (noti) => {
  if (!noti.is_read) {
    await markSingleAsRead(noti);
  }

  // Lấy ID đối tượng (đơn hàng hoặc sản phẩm)
  const targetId = noti.reference_id || noti.order_id;
f
  switch (noti.type) {
    case "order":
    case "new_order":
      // Điều hướng tới trang đơn hàng kèm theo query open_order
      router.push({
        path: "/orders",
        query: targetId ? { open_order: targetId } : {},
      });
      break;
    case "new_product":
      if (targetId) {
        router.push(`/products/${targetId}`);
      }
      break;
    default:
      break;
  }
};

const getIconByType = (type) => {
  switch (type) {
    case "order":
    case "new_order":
      return "mdi-shopping-outline";
    case "new_product":
      return "mdi-tag-heart-outline";
    case "system":
      return "mdi-alert-circle-outline";
    default:
      return "mdi-bell-outline";
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "Vừa xong";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

onMounted(() => {
  fetchNotifications();
});
</script>

<style scoped>
.hover-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.hover-row:hover {
  filter: brightness(0.97);
}
</style>
