<template>
  <div ref="chatContainerRef">
    <button class="chat-toggle-btn" v-if="!isOpen" @click="isOpen = true">
      <span class="btn-inner">
        <span class="btn-icon-wrap">
          <v-icon color="white" size="small"
            >mdi-chat-processing-outline</v-icon
          >
        </span>
        <span class="btn-label">{{
          isAdmin ? "Quản lý Chat" : "Chat với Shop"
        }}</span>
      </span>
      <span class="unread-dot" v-if="totalUnread > 0">{{
        totalUnread > 99 ? "99+" : totalUnread
      }}</span>
    </button>

    <v-card
      v-show="isOpen"
      class="chat-floating-window d-flex rounded-xl elevation-6 border overflow-hidden"
    >
      <div class="chat-sidebar border-e bg-white d-flex flex-column">
        <div class="pa-4 border-b d-flex align-center">
          <h2 class="text-h6 font-weight-black mb-0">Tin nhắn</h2>
        </div>

        <div class="px-4 py-3 border-b">
          <v-text-field
            v-model="search"
            density="compact"
            variant="outlined"
            :placeholder="isAdmin ? 'Tìm khách hàng...' : 'Tìm kiếm...'"
            prepend-inner-icon="mdi-magnify"
            hide-details
            rounded="lg"
            color="black"
            bg-color="grey-lighten-4"
          ></v-text-field>
        </div>

        <v-list
          class="flex-grow-1 overflow-y-auto pa-0 bg-transparent"
          lines="two"
        >
          <v-list-item
            v-for="contact in filteredContacts"
            :key="contact.id"
            :value="contact.id"
            :active="activeContact?.id == contact.id"
            active-color="black"
            class="chat-contact-item border-b px-4 py-3"
            @click="selectContact(contact)"
          >
            <template v-slot:prepend>
              <v-badge
                :color="contact.is_online ? 'success' : 'grey-lighten-1'"
                dot
                location="bottom right"
                offset-x="3"
                offset-y="3"
              >
                <v-avatar size="48" class="border bg-grey-lighten-3">
                  <v-img
                    :src="contact.avatar || 'https://placehold.co/100'"
                  ></v-img>
                </v-avatar>
              </v-badge>
            </template>

            <v-list-item-title class="font-weight-bold text-body-1">{{
              contact.name
            }}</v-list-item-title>

            <v-list-item-subtitle
              class="text-caption mt-1 d-flex justify-space-between align-center"
            >
              <span
                class="text-truncate pr-2"
                :class="{ 'font-weight-bold text-black': contact.unread }"
              >
                <span
                  v-if="contact.last_sender_id == currentUser.id"
                  class="text-grey-darken-1"
                  >Bạn:
                </span>
                {{ contact.last_message }}
              </span>
            </v-list-item-subtitle>

            <template v-slot:append>
              <v-badge
                v-if="contact.unread"
                color="red"
                :content="contact.unread"
                inline
              ></v-badge>
            </template>
          </v-list-item>
        </v-list>
      </div>

      <div
        class="chat-main bg-grey-lighten-4 d-flex flex-column flex-grow-1 relative"
      >
        <template v-if="activeContact">
          <div
            class="pa-4 bg-white border-b d-flex justify-space-between align-center elevation-1 z-10"
          >
            <div class="d-flex align-center">
              <v-avatar size="40" class="mr-3 border">
                <v-img
                  :src="activeContact.avatar || 'https://placehold.co/100'"
                ></v-img>
              </v-avatar>
              <div>
                <div class="font-weight-bold text-body-1">
                  {{ activeContact.name }}
                </div>
                <div
                  class="text-caption d-flex align-center"
                  :class="
                    activeContact.is_online ? 'text-success' : 'text-grey'
                  "
                >
                  <v-icon size="x-small" class="mr-1">mdi-circle</v-icon>
                  {{
                    activeContact.is_online ? "Đang hoạt động" : "Ngoại tuyến"
                  }}
                </div>
              </div>
            </div>
            <v-btn
              icon="mdi-minus"
              variant="text"
              color="black"
              density="comfortable"
              @click="isOpen = false"
              title="Thu gọn"
            ></v-btn>
          </div>

          <div
            v-if="orderContext"
            class="bg-white border-b px-4 py-2 d-flex align-center justify-space-between"
          >
            <div class="d-flex align-center text-truncate pr-2">
              <v-icon color="grey-darken-2" class="mr-2"
                >mdi-shopping-outline</v-icon
              >
              <span class="text-body-2 font-weight-medium text-truncate">
                Trao đổi về đơn hàng:
                <strong class="text-black">#{{ orderContext.id }}</strong>
              </span>
            </div>
          </div>

          <div
            v-else-if="productContext"
            class="bg-white border-b px-4 py-2 d-flex align-center justify-space-between"
          >
            <div class="d-flex align-center text-truncate pr-2">
              <v-avatar size="30" class="mr-3 border rounded">
                <v-img
                  :src="
                    productContext.thumbnail ||
                    productContext.image_url ||
                    productContext.images?.[0]?.image_url ||
                    'https://placehold.co/100'
                  "
                ></v-img>
              </v-avatar>
              <span class="text-body-2 font-weight-medium text-truncate">
                Trao đổi về:
                <strong class="text-black">{{ productContext.name }}</strong>
              </span>
            </div>
            <v-btn
              size="small"
              variant="text"
              color="blue"
              class="text-none flex-shrink-0"
              :to="`/product/${productContext.id}`"
              >Chi tiết</v-btn
            >
          </div>

          <div
            class="messages-container flex-grow-1 overflow-y-auto pa-5"
            ref="messagesContainer"
          >
            <div
              v-for="(msg, index) in messages"
              :key="index"
              class="d-flex mb-4"
              :class="
                msg.sender_id == currentUser.id
                  ? 'justify-end'
                  : 'justify-start'
              "
            >
              <div style="max-width: 75%">
                <div
                  v-if="msg.product_id"
                  class="mb-1 pa-2 bg-white border rounded-lg d-flex align-center cursor-pointer elevation-1"
                  @click="$router.push(`/product/${msg.product_id}`)"
                  style="max-width: 250px; opacity: 0.95"
                >
                  <v-avatar
                    size="36"
                    rounded
                    class="mr-2 border bg-grey-lighten-4"
                  >
                    <v-img
                      :src="msg.product_image || 'https://placehold.co/100'"
                    ></v-img>
                  </v-avatar>
                  <div class="overflow-hidden">
                    <div
                      class="text-caption font-weight-bold text-truncate"
                      style="line-height: 1.2"
                    >
                      {{ msg.product_name || "Sản phẩm" }}
                    </div>
                    <div class="text-grey" style="font-size: 10px !important">
                      Đang quan tâm
                    </div>
                  </div>
                </div>

                <div
                  v-if="msg.order_id"
                  class="mb-1 pa-2 bg-white border rounded-lg d-flex align-center cursor-pointer elevation-1"
                  @click="goToOrder(msg.order_id)"
                  style="max-width: 250px; opacity: 0.95"
                >
                  <v-icon color="grey-darken-2" class="mr-2"
                    >mdi-receipt-text-outline</v-icon
                  >
                  <div>
                    <div class="text-caption font-weight-bold text-truncate">
                      Đơn hàng: #{{ msg.order_id }}
                    </div>
                    <div class="text-grey" style="font-size: 10px !important">
                      Nhấn để xem chi tiết
                    </div>
                  </div>
                </div>

                <div
                  class="pa-3 text-body-2 message-bubble"
                  :class="
                    msg.sender_id == currentUser.id
                      ? 'bg-black text-white bubble-me'
                      : 'bg-white border text-black bubble-them'
                  "
                >
                  {{ msg.content }}
                </div>

                <div
                  class="text-caption text-grey mt-1 d-flex align-center"
                  :class="
                    msg.sender_id == currentUser.id
                      ? 'justify-end'
                      : 'justify-start'
                  "
                >
                  <span>{{ msg.time }}</span>
                  <template v-if="msg.sender_id == currentUser.id">
                    <v-icon
                      v-if="msg.is_read || msg.is_read == 1"
                      size="14"
                      color="blue-darken-1"
                      class="ml-1"
                      title="Đã đọc"
                      >mdi-check-all</v-icon
                    >
                    <v-icon
                      v-else
                      size="14"
                      color="grey-lighten-1"
                      class="ml-1"
                      title="Đã gửi"
                      >mdi-check</v-icon
                    >
                  </template>
                </div>
              </div>
            </div>
          </div>

          <div class="chat-input-area bg-white border-t pa-3">
            <div class="d-flex align-center mb-2 px-2">
              <v-btn
                icon="mdi-image-outline"
                variant="text"
                density="comfortable"
                color="black"
              ></v-btn>
              <v-btn
                icon="mdi-file-document-outline"
                variant="text"
                density="comfortable"
                color="black"
              ></v-btn>
            </div>
            <div class="d-flex align-end">
              <v-textarea
                v-model="newMessage"
                variant="outlined"
                density="compact"
                placeholder="Nhập tin nhắn..."
                rows="1"
                max-rows="3"
                auto-grow
                hide-details
                class="flex-grow-1 custom-textarea"
                bg-color="grey-lighten-4"
                color="black"
                @keyup.enter.exact.prevent="sendMessage"
              ></v-textarea>
              <v-btn
                color="black"
                class="ml-2 mb-1 rounded-lg px-0"
                min-width="48"
                height="44"
                variant="flat"
                :disabled="!newMessage.trim()"
                @click="sendMessage"
              >
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </div>
          </div>
        </template>

        <div v-else class="h-100 d-flex flex-column bg-grey-lighten-4">
          <div class="pa-3 d-flex justify-end align-center z-10">
            <v-btn
              icon="mdi-minus"
              variant="text"
              color="black"
              density="comfortable"
              @click="isOpen = false"
              title="Thu gọn"
            ></v-btn>
          </div>
          <div
            class="flex-grow-1 d-flex flex-column align-center justify-center text-grey pb-10"
          >
            <v-icon size="60" color="grey-lighten-2" class="mb-4"
              >mdi-chat-processing-outline</v-icon
            >
            <h3 class="text-subtitle-1 font-weight-bold text-black">
              Hệ thống Chat
            </h3>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import { io } from "socket.io-client";
import api from "@/services/api.service";

const isOpen = ref(false);
const chatContainerRef = ref(null);
const router = useRouter();

const SOCKET_URL = "http://localhost:3000";
let socket = null;

const currentUser = ref(
  JSON.parse(localStorage.getItem("user")) || {
    id: 1,
    name: "Khách",
    role: "customer",
  },
);
const isAdmin = computed(
  () =>
    currentUser.value.role === "admin" || currentUser.value.role === "staff",
);

const search = ref("");
const activeContact = ref(null);
const newMessage = ref("");
const messagesContainer = ref(null);
const orderContext = ref(null);
const productContext = ref(null);
const messages = ref([]);
const contacts = ref([]);

const filteredContacts = computed(() => {
  if (!search.value) return contacts.value;
  return contacts.value.filter((c) =>
    c.name.toLowerCase().includes(search.value.toLowerCase()),
  );
});

const totalUnread = computed(() =>
  contacts.value.reduce((sum, c) => sum + (c.unread || 0), 0),
);

const goToOrder = (orderId) => {
  isOpen.value = false;
  if (isAdmin.value) router.push("/admin/orders");
  else router.push("/orders");
};

const loadContacts = async () => {
  try {
    const res = await api.get("/chats/contacts");
    contacts.value = res.data || [];
  } catch (error) {
    console.error("Lỗi lấy danh sách liên hệ:", error);
  }
};

const selectContact = async (contact) => {
  activeContact.value = contact;
  contact.unread = 0;
  try {
    const res = await api.get(`/chats/${contact.id}`);
    messages.value = res.data || [];
    scrollToBottom();

    if (socket) {
      socket.emit("mark_read", {
        sender_id: contact.id,
        receiver_id: currentUser.value.id,
      });
    }
  } catch (error) {
    console.error("Lỗi lấy lịch sử tin nhắn:", error);
  }
};

const openChatWithOrder = async (orderId) => {
  isOpen.value = true;
  orderContext.value = { id: orderId };
  productContext.value = null;
  if (contacts.value.length === 0) await loadContacts();
  if (contacts.value.length > 0) await selectContact(contacts.value[0]);
};

const openChatWithProduct = async (product) => {
  isOpen.value = true;
  productContext.value = product;
  orderContext.value = null;
  if (contacts.value.length === 0) await loadContacts();
  if (contacts.value.length > 0) await selectContact(contacts.value[0]);
};

defineExpose({ openChatWithOrder, openChatWithProduct });

const initSocket = () => {
  socket = io(SOCKET_URL, { query: { userId: currentUser.value.id } });

  socket.emit("user_connected", String(currentUser.value.id));

  // Khởi tạo các user đang online lúc vừa load web
  socket.on("initial_online_users", (onlineIds) => {
    contacts.value.forEach((contact) => {
      if (onlineIds.map(String).includes(String(contact.id))) {
        contact.is_online = true;
      }
    });
    if (
      activeContact.value &&
      onlineIds.map(String).includes(String(activeContact.value.id))
    ) {
      activeContact.value.is_online = true;
    }
  });

  socket.on("receive_message", (data) => {
    if (activeContact.value && data.sender_id == activeContact.value.id) {
      messages.value.push(data);
      scrollToBottom();
      socket.emit("mark_read", {
        sender_id: data.sender_id,
        receiver_id: currentUser.value.id,
      });

      activeContact.value.last_message = data.content;
      activeContact.value.last_sender_id = data.sender_id;
      // Đẩy lên đầu
      contacts.value = [
        activeContact.value,
        ...contacts.value.filter((c) => c.id != activeContact.value.id),
      ];
    } else {
      const contact = contacts.value.find((c) => c.id == data.sender_id);
      if (contact) {
        contact.unread = (contact.unread || 0) + 1;
        contact.last_message = data.content;
        contact.last_sender_id = data.sender_id;
        // Đẩy lên đầu
        contacts.value = [
          contact,
          ...contacts.value.filter((c) => c.id != contact.id),
        ];
      } else {
        loadContacts();
      }
    }
  });

  socket.on("user_status", (data) => {
    const contact = contacts.value.find((c) => c.id == data.userId);
    if (contact) contact.is_online = data.status === "online";
    if (activeContact.value && activeContact.value.id == data.userId) {
      activeContact.value.is_online = data.status === "online";
    }
  });

  socket.on("messages_read", (data) => {
    if (activeContact.value && activeContact.value.id == data.reader_id) {
      messages.value.forEach((msg) => {
        if (msg.sender_id == currentUser.value.id) msg.is_read = 1;
      });
    }
  });
};

const sendMessage = () => {
  if (!newMessage.value.trim() || !activeContact.value) return;

  let pImage = null;
  if (productContext.value) {
    pImage =
      productContext.value.thumbnail ||
      productContext.value.image_url ||
      productContext.value.images?.[0]?.image_url;
  }

  const msgData = {
    sender_id: currentUser.value.id,
    receiver_id: activeContact.value.id,
    order_id: orderContext.value?.id || null,
    product_id: productContext.value?.id || null,
    product_name: productContext.value?.name || null,
    product_image: pImage || null,
    content: newMessage.value.trim(),
    is_read: 0,
    time: new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  messages.value.push(msgData);
  socket.emit("send_message", msgData);

  // Cập nhật realtime cho sidebar của mình
  activeContact.value.last_message = msgData.content;
  activeContact.value.last_sender_id = currentUser.value.id;
  contacts.value = [
    activeContact.value,
    ...contacts.value.filter((c) => c.id != activeContact.value.id),
  ];

  newMessage.value = "";
  scrollToBottom();
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const closeWhenChatbotOpens = () => {
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (
    isOpen.value &&
    chatContainerRef.value &&
    !chatContainerRef.value.contains(event.target)
  ) {
    isOpen.value = false;
  }
};

watch(isOpen, (newVal) => {
  if (newVal) {
    window.dispatchEvent(new CustomEvent("chatbox-opened"));
    setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 50);
  } else {
    document.removeEventListener("click", handleClickOutside);
  }
});

onMounted(() => {
  initSocket();
  loadContacts();
  window.addEventListener("chatbot-opened", closeWhenChatbotOpens);
});

onUnmounted(() => {
  if (socket) socket.disconnect();
  window.removeEventListener("chatbot-opened", closeWhenChatbotOpens);
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.chat-toggle-btn {
  position: fixed;
  bottom: 95px;
  right: 28px;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #111111 0%, #333333 100%);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 22px 12px 14px;
  font-size: 14px;
  font-weight: 600;
  font-family: "Be Vietnam Pro", "Segoe UI", sans-serif;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  letter-spacing: 0.01em;
  z-index: 9998;
}

.chat-toggle-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.5);
}

.btn-inner {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-icon-wrap {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

/* CHỈNH LẠI CSS CHẤM ĐỎ ĐỂ HIỂN THỊ CHỮ SỐ BÊN TRONG */
.unread-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background-color: #f44336;
  color: white;
  border-radius: 10px;
  border: 2px solid white;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-floating-window {
  position: fixed;
  bottom: 95px;
  right: 28px;
  width: 750px;
  height: 550px;
  z-index: 9998;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-sidebar {
  width: 280px;
  min-width: 280px;
}
.chat-main {
  min-width: 0;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #bdbdbd;
}

.chat-contact-item {
  transition: all 0.2s;
  cursor: pointer;
}
.chat-contact-item:hover {
  background-color: #f5f5f5 !important;
}
.chat-contact-item.v-list-item--active {
  background-color: #f0f0f0 !important;
}

.message-bubble {
  border-radius: 16px;
  line-height: 1.5;
  word-break: break-word;
}
.bubble-me {
  border-bottom-right-radius: 4px;
}
.bubble-them {
  border-bottom-left-radius: 4px;
}

.custom-textarea :deep(.v-field__outline) {
  display: none;
}
.custom-textarea :deep(.v-field) {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.custom-textarea :deep(.v-field--focused) {
  border-color: #000;
}
</style>
