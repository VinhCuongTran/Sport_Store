<template>
  <header class="custom-header border-b">
    <!-- HÀNG TRÊN: LOGO, TÌM KIẾM, GIỎ HÀNG, THÔNG BÁO -->
    <v-container class="py-3">
      <v-row align="center" density="compact">
        <v-col
          cols="12"
          md="3"
          class="d-flex align-center justify-center justify-md-start mb-3 mb-md-0"
        >
          <router-link to="/" class="text-decoration-none custom-logo-wrap">
            <img src="../assets/logo.jpg" alt="Logo" class="custom-logo-img" />
            <span
              class="custom-logo-text d-none d-sm-inline font-weight-black text-white"
            >
              Sport Store
            </span>
          </router-link>
        </v-col>

        <v-col cols="12" md="5" class="px-md-4 mb-3 mb-md-0">
          <v-text-field
            v-model="searchKeyword"
            placeholder="Bạn đang tìm gì?"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            bg-color="white"
            color="black"
            rounded="pill"
            @keyup.enter="handleSearch"
          >
            <template v-slot:append-inner>
              <v-icon
                @click="startVoiceSearch"
                color="grey-darken-1"
                class="cursor-pointer mr-2 hover-red"
                title="Tìm kiếm bằng giọng nói"
              >
                mdi-microphone-outline
              </v-icon>
              <v-icon @click="handleSearch" class="cursor-pointer text-black">
                mdi-arrow-right-circle
              </v-icon>
            </template>
          </v-text-field>
        </v-col>

        <v-col
          cols="12"
          md="4"
          class="d-flex justify-center justify-md-end align-center gap-4"
        >
          <!-- Thông báo -->
          <template v-if="user">
            <v-menu
              offset-y
              transition="scale-transition"
              :close-on-content-click="false"
              v-model="notiMenuOpen"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  v-bind="props"
                  variant="text"
                  class="hover-green-target text-white"
                >
                  <v-badge
                    v-if="unreadCount > 0"
                    :content="unreadCount"
                    color="red"
                  >
                    <v-icon size="28">mdi-bell-outline</v-icon>
                  </v-badge>
                  <v-icon v-else size="28">mdi-bell-outline</v-icon>
                </v-btn>
              </template>

              <v-card
                width="350"
                max-height="400"
                class="overflow-y-auto hide-scrollbar"
              >
                <v-card-title
                  class="text-subtitle-1 font-weight-bold border-b py-3 bg-grey-lighten-4"
                >
                  Thông báo của bạn
                </v-card-title>
                <v-list density="compact" class="pa-0">
                  <v-list-item
                    v-if="notifications.length === 0"
                    class="pa-4 text-center text-grey"
                  >
                    Không có thông báo nào
                  </v-list-item>
                  <v-list-item
                    v-for="noti in notifications"
                    :key="noti.id"
                    :class="{ 'bg-blue-grey-lighten-5': !noti.is_read }"
                    @click="handleNotificationClick(noti)"
                    class="border-b py-2 pointer-cursor"
                  >
                    <template v-slot:prepend>
                      <v-icon :color="!noti.is_read ? 'primary' : 'grey'"
                        >mdi-bell-ring</v-icon
                      >
                    </template>
                    <v-list-item-title
                      class="font-weight-bold text-subtitle-2 text-wrap"
                      >{{ noti.title }}</v-list-item-title
                    >
                    <v-list-item-subtitle
                      class="text-caption text-grey-darken-1 text-wrap mt-1"
                      >{{ noti.message }}</v-list-item-subtitle
                    >
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </template>

          <!-- Giỏ hàng -->
          <v-btn
            icon
            to="/cart"
            variant="text"
            class="hover-green-target text-white"
          >
            <v-badge v-if="cartCount > 0" :content="cartCount" color="red">
              <v-icon size="28">mdi-cart-outline</v-icon>
            </v-badge>
            <v-icon v-else size="28">mdi-cart-outline</v-icon>
          </v-btn>

          <!-- Menu User -->
          <template v-if="user">
            <v-menu offset-y transition="scale-transition">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  variant="outlined"
                  class="text-none px-2 rounded-pill border hover-green-target text-white"
                >
                  <v-avatar size="28" class="mr-2">
                    <v-img
                      :src="user.avatar || defaultAvatar"
                      alt="Avatar"
                      cover
                    ></v-img>
                  </v-avatar>
                  <span class="font-weight-bold d-none d-sm-inline">{{
                    user.name || user.email
                  }}</span>
                  <v-icon right>mdi-chevron-down</v-icon>
                </v-btn>
              </template>
              <v-list density="compact" class="py-2">
                <v-list-item to="/profile" prepend-icon="mdi-account-circle"
                  ><v-list-item-title
                    >Hồ sơ cá nhân</v-list-item-title
                  ></v-list-item
                >
                <v-list-item
                  to="/orders"
                  prepend-icon="mdi-clipboard-text-outline"
                  ><v-list-item-title
                    >Đơn hàng của tôi</v-list-item-title
                  ></v-list-item
                >
                <v-list-item
                  v-if="isAdminOrStaff"
                  to="/admin"
                  prepend-icon="mdi-view-dashboard"
                  ><v-list-item-title
                    >Quản trị hệ thống</v-list-item-title
                  ></v-list-item
                >
                <v-divider class="my-2"></v-divider>
                <v-list-item
                  @click="logout"
                  prepend-icon="mdi-logout"
                  class="text-red"
                  ><v-list-item-title>Đăng xuất</v-list-item-title></v-list-item
                >
              </v-list>
            </v-menu>
          </template>
          <template v-else>
            <v-btn
              variant="outlined"
              class="text-none font-weight-bold rounded-pill px-6 hover-green-target text-white"
              to="/login"
            >
              Tham gia với chúng tôi
            </v-btn>
          </template>
        </v-col>
      </v-row>
    </v-container>

    <!-- HÀNG DƯỚI: MENU DANH MỤC VÀ NAVIGATION -->
    <div class="custom-header-nav">
      <v-container
        class="py-0 d-flex align-center overflow-x-auto hide-scrollbar"
      >
        <!-- Mega Menu Danh Mục -->
        <v-menu
          v-model="menuOpen"
          open-on-hover
          :close-on-content-click="false"
          transition="slide-y-transition"
          location="bottom left"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              class="text-none font-weight-bold px-5 py-3 h-100 rounded-0 hover-green-target text-white"
            >
              <v-icon left class="mr-2">mdi-menu</v-icon>
              Danh mục
            </v-btn>
          </template>

          <SportCategoryMenu @close-menu="closeMenu" />
        </v-menu>

        <!-- Các đường link -->
        <div class="d-flex flex-nowrap pl-4 gap-2">
          <v-btn
            variant="text"
            to="/"
            exact
            class="text-none font-weight-medium hover-green-target text-white"
            >Trang chủ</v-btn
          >
          <v-btn
            variant="text"
            to="/products"
            class="text-none font-weight-medium hover-green-target text-white"
            >Tất cả sản phẩm</v-btn
          >
          <v-btn
            variant="text"
            to="/All-Brands"
            class="text-none font-weight-medium hover-green-target text-white"
            >Thương hiệu nổi bật</v-btn
          >
          <v-btn
            variant="text"
            to="/New-Arrivals"
            class="text-none font-weight-medium hover-green-target text-white"
            >Hàng mới về</v-btn
          >
          <v-btn
            variant="text"
            to="/About-Us"
            class="text-none font-weight-medium hover-green-target text-white"
            >Về chúng tôi</v-btn
          >
        </div>
      </v-container>
    </div>

    <!-- DIALOG VOICE SEARCH -->
    <v-dialog v-model="voiceDialog" max-width="400" persistent>
      <v-card class="pa-8 text-center rounded-xl" elevation="10">
        <div class="mic-pulse-wrapper">
          <div
            class="mic-pulse-ring"
            :style="{ transform: `scale(${audioVolume})` }"
          ></div>
          <v-avatar color="red" size="80" class="mic-avatar elevation-4">
            <v-icon size="45" color="white">mdi-microphone</v-icon>
          </v-avatar>
        </div>

        <h3
          class="text-h6 font-weight-regular mt-8 mb-6 text-grey-darken-3"
          style="min-height: 32px"
        >
          {{ voiceText }}
        </h3>

        <v-btn
          variant="tonal"
          color="grey-darken-1"
          rounded="pill"
          @click="closeVoiceSearch"
          class="font-weight-bold px-8 mx-auto"
        >
          Hủy
        </v-btn>
      </v-card>
    </v-dialog>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import AuthService from "@/services/auth.service.js";
import SportCategoryMenu from "@/components/SportCategoryMenu.vue";
import { io } from "socket.io-client";
import { useToast } from "vue-toastification";
import NotificationService from "@/services/notification.service.js";

const router = useRouter();
const route = useRoute();
const user = ref(null);
const isAdminOrStaff = ref(false);
const cartCount = ref(0);
const searchKeyword = ref("");
const menuOpen = ref(false);
const defaultAvatar =
  "https://res.cloudinary.com/dosb4fmpo/image/upload/v1772181216/Male_gqcp4c.jpg";

const socket = ref(null);
const notifications = ref([]);
const notiMenuOpen = ref(false);
const toast = useToast();

// --- STATE TÌM KIẾM GIỌNG NÓI ---
const voiceDialog = ref(false);
const voiceText = ref("Đang lắng nghe...");
const audioVolume = ref(1);

let recognitionInstance = null;
let audioContext = null;
let analyser = null;
let mediaStream = null;
let animationId = null;

const playBeep = (type = "start") => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  if (type === "start") {
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
  } else {
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
  }

  osc.start(ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.15);
  osc.stop(ctx.currentTime + 0.15);
};

const startVisualizer = async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();

    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(analyser);
    analyser.fftSize = 256;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      let avg = sum / dataArray.length;

      audioVolume.value = 1 + (avg / 128) * 0.8;
      animationId = requestAnimationFrame(updateVolume);
    };
    updateVolume();
  } catch (error) {
    console.warn("Không thể khởi tạo visualizer âm thanh:", error);
  }
};

const stopVisualizer = () => {
  if (animationId) cancelAnimationFrame(animationId);
  if (audioContext) audioContext.close();
  if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
  audioVolume.value = 1;
};

const startVoiceSearch = async () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    toast.error("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.");
    return;
  }

  voiceDialog.value = true;
  voiceText.value = "Hãy nói gì đó...";

  playBeep("start");
  await startVisualizer();

  recognitionInstance = new SpeechRecognition();
  recognitionInstance.lang = "vi-VN";
  recognitionInstance.interimResults = true;
  recognitionInstance.maxAlternatives = 1;

  recognitionInstance.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    voiceText.value = transcript;

    if (event.results[0].isFinal) {
      searchKeyword.value = transcript.replace(/[.!?]$/, "");
      playBeep("end");

      setTimeout(() => {
        closeVoiceSearch();
        handleSearch();
      }, 1000);
    }
  };

  recognitionInstance.onerror = (event) => {
    if (event.error === "not-allowed") {
      toast.error("Vui lòng cấp quyền Micro cho trình duyệt.");
    } else if (event.error !== "aborted") {
      toast.error("Lỗi nhận diện: " + event.error);
    }
    closeVoiceSearch();
  };

  recognitionInstance.onend = () => {
    if (voiceDialog.value && voiceText.value === "Hãy nói gì đó...") {
      closeVoiceSearch();
    }
  };

  recognitionInstance.start();
};

const closeVoiceSearch = () => {
  if (recognitionInstance) {
    recognitionInstance.stop();
  }
  stopVisualizer();
  voiceDialog.value = false;
};

// --- MENU VÀ USER LOGIC ---
const closeMenu = () => {
  menuOpen.value = false;
};

const unreadCount = computed(
  () => notifications.value.filter((n) => !n.is_read).length,
);

const fetchNotifications = async () => {
  if (!user.value) return;
  try {
    notifications.value = await NotificationService.getAll();
  } catch (error) {
    console.error("Lỗi lấy thông báo:", error);
  }
};

const handleNotificationClick = async (noti) => {
  if (!noti.is_read) {
    try {
      await NotificationService.markAsRead(noti.id);
      noti.is_read = true;
    } catch (error) {
      console.error("Lỗi cập nhật thông báo:", error);
    }
  }
  const targetRoute = getNotificationRoute(noti);
  if (targetRoute) {
    router.push(targetRoute);
    notiMenuOpen.value = false;
  }
};

const setupSocket = () => {
  if (!user.value) return;
  socket.value = io("http://localhost:3000");
  socket.value.emit("user_connected", user.value.id);
  socket.value.on("new_notification", (data) => {
    toast.info(`${data.title}: ${data.message}`, {
      timeout: 4000,
      onClick: () => handleNotificationClick(data),
    });
    notifications.value.unshift(data);
  });
};

const checkUserStatus = () => {
  const userData = localStorage.getItem("user");
  if (userData) {
    try {
      user.value = JSON.parse(userData);
      isAdminOrStaff.value = AuthService.isAdmin();
      fetchNotifications();
      if (!socket.value) setupSocket();
    } catch (e) {
      user.value = null;
      isAdminOrStaff.value = false;
    }
  } else {
    user.value = null;
    isAdminOrStaff.value = false;
    if (socket.value) socket.value.disconnect();
  }
};

const logout = () => {
  if (socket.value) socket.value.disconnect();
  AuthService.logout();
  checkUserStatus();
  router.push("/login");
};

const handleSearch = () => {
  if (searchKeyword.value.trim() !== "") {
    router.push({
      path: "/products",
      query: { search: searchKeyword.value.trim() },
    });
  } else {
    router.push({ path: "/products" });
  }
};

onMounted(() => {
  checkUserStatus();
  window.addEventListener("storage", checkUserStatus);
  if (route.query.search) {
    searchKeyword.value = route.query.search;
  }
});

onBeforeUnmount(() => {
  if (socket.value) socket.value.disconnect();
});

watch(
  () => route.path,
  () => checkUserStatus(),
);
watch(
  () => route.query.search,
  (newVal) => (searchKeyword.value = newVal || ""),
);

const getNotificationRoute = (noti) => {
  switch (noti.type) {
    case "order":
      return `/orders`;
    case "new_product":
      return `/products/${noti.reference_id}`;
    case "system":
      return null;
    default:
      return "/";
  }
};
</script>

<style scoped>
.hover-red {
  transition: color 0.2s ease;
}
.hover-red:hover {
  color: #f44336 !important;
}

.mic-pulse-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
.mic-pulse-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  background-color: rgba(244, 67, 54, 0.15);
  border-radius: 50%;
  transition: transform 0.05s linear;
  box-shadow: 0 0 20px rgba(244, 67, 54, 0.3);
}
.mic-avatar {
  z-index: 2;
}

.pointer-cursor {
  cursor: pointer;
}
.text-wrap {
  white-space: normal !important;
  line-height: 1.4 !important;
}
.custom-header {
  background-color: #001a2d;
  color: #ffffff;
}
.custom-header-nav {
  background-color: rgba(0, 0, 0, 0.2);
}
.hover-green-target {
  transition: color 0.3s ease;
}
.hover-green-target:hover {
  color: #77e51f !important;
}
:deep(.v-btn.hover-green-target .v-btn__overlay) {
  background-color: rgba(255, 255, 255, 0.03) !important;
}
:deep(.v-btn.hover-green-target .v-ripple__animation) {
  background-color: rgba(150, 150, 150, 0.3) !important;
}
.custom-logo-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.custom-logo-img {
  height: 40px;
  border-radius: 6px;
}
.custom-logo-text {
  font-size: 24px;
}
.gap-2 {
  gap: 8px;
}
.gap-4 {
  gap: 16px;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
