<template>
  <div class="chatbot-container">
    <button class="chat-toggle-btn" @click="isOpen = !isOpen">
      <span class="btn-inner">
        <span v-if="!isOpen" class="btn-icon-wrap">
          <img src="@/assets/chatbot_avatar.png" alt="AI" class="btn-avatar" />
        </span>
        <span v-else class="btn-close-icon">✕</span>
        <span class="btn-label">{{ !isOpen ? "Tư vấn AI" : "Đóng" }}</span>
      </span>
      <span class="btn-pulse" v-if="!isOpen"></span>
    </button>

    <transition name="chat-slide">
      <div v-if="isOpen" class="chat-window">
        <div class="chat-header">
          <div class="header-avatar">
            <img
              src="@/assets/chatbot_avatar.png"
              alt="AI Avatar"
              class="avatar-img"
            />
            <span class="online-dot"></span>
          </div>
          <div class="header-info">
            <span class="header-name">Tư vấn viên AI</span>
            <span class="header-status">● Đang hoạt động</span>
          </div>
        </div>

        <div class="chat-body" ref="chatBody">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="message-wrapper"
          >
            <div v-if="msg.sender === 'bot'" class="bot-row">
              <div class="bot-avatar-mini">
                <img src="@/assets/chatbot_avatar.png" alt="bot" />
              </div>
              <div class="message bot" v-html="formatMessage(msg.text)"></div>
            </div>
            <div
              v-else
              class="message user"
              v-html="formatMessage(msg.text)"
            ></div>

            <div
              v-if="msg.products && msg.products.length > 0"
              class="product-carousel"
            >
              <div
                v-for="product in msg.products"
                :key="product.id"
                class="product-card"
                @click="goToProduct(product.id)"
              >
                <div class="product-img-wrapper">
                  <img
                    :src="product.thumbnail || require('@/assets/logo.jpg')"
                    :alt="product.name"
                    class="product-img"
                  />
                  <span
                    v-if="product.active_discount > 0"
                    class="discount-badge"
                  >
                    -{{ product.active_discount }}%
                  </span>
                </div>
                <div class="product-info">
                  <div v-if="product.brand_name" class="product-brand">
                    {{ product.brand_name }}
                  </div>
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-price">
                    <span class="price-main">{{
                      formatPrice(product.min_price)
                    }}</span>
                    <span
                      v-if="
                        product.max_price &&
                        product.max_price !== product.min_price
                      "
                      class="price-max"
                      >– {{ formatPrice(product.max_price) }}</span
                    >
                  </div>
                </div>
                <button
                  class="product-btn"
                  @click.stop="goToProduct(product.id)"
                >
                  👁 Xem chi tiết
                </button>
              </div>
            </div>
          </div>

          <div v-if="isLoading" class="bot-row">
            <div class="bot-avatar-mini">
              <img src="@/assets/chatbot_avatar.png" alt="bot" />
            </div>
            <div class="message bot typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <div class="chat-footer">
          <div class="input-wrapper">
            <input
              v-model="userInput"
              @keyup.enter="sendMessage"
              placeholder="Nhập yêu cầu của bạn..."
              class="chat-input"
              :disabled="isLoading"
            />
            <button
              class="send-btn"
              @click="sendMessage"
              :disabled="isLoading || !userInput.trim()"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <p class="footer-note">Trả lời bởi AI · Chỉ mang tính tham khảo</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import apiService from "@/services/api.service";

export default {
  data() {
    return {
      isOpen: false,
      isLoading: false,
      userInput: "",
      messages: [
        {
          sender: "bot",
          text: "Chào bạn! 👋 Mình có thể giúp bạn tìm kiếm giày, vợt hoặc dụng cụ thể thao nào hôm nay?",
          products: null,
        },
      ],
    };
  },
  methods: {
    async sendMessage() {
      if (!this.userInput.trim()) return;

      const messageText = this.userInput;
      this.messages.push({ sender: "user", text: messageText, products: null });
      this.userInput = "";
      this.isLoading = true;
      this.scrollToBottom();

      try {
        const response = await apiService.post("/chatbot", {
          message: messageText,
        });
        this.messages.push({
          sender: "bot",
          text: response.data.reply,
          products: response.data.products || [],
        });
      } catch (error) {
        this.messages.push({
          sender: "bot",
          text: "Xin lỗi, hệ thống đang bận. Bạn vui lòng thử lại sau nhé!",
        });
      } finally {
        this.isLoading = false;
        this.scrollToBottom();
      }
    },

    goToProduct(productId) {
      this.$router.push({ name: "product-detail", params: { id: productId } });
      this.isOpen = false;
    },

    formatPrice(price) {
      if (!price) return "Liên hệ";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
    },

    formatMessage(text) {
      if (!text) return "";
      return text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const body = this.$refs.chatBody;
        if (body) body.scrollTop = body.scrollHeight;
      });
    },
  },
};
</script>

<style scoped>
/* ── Variables ─────────────────────────────────────────── */
:root {
  --primary: #2563eb;
  --primary-light: #3b82f6;
  --primary-dark: #1d4ed8;
  --surface: #ffffff;
  --bg: #f0f4ff;
  --text: #1e293b;
  --text-muted: #64748b;
  --border: rgba(0, 0, 0, 0.07);
  --radius: 20px;
  --shadow: 0 20px 60px rgba(37, 99, 235, 0.18), 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* ── Container ─────────────────────────────────────────── */
.chatbot-container {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
}

/* ── Toggle Button ─────────────────────────────────────── */
.chat-toggle-btn {
  position: relative;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 22px 12px 14px;
  font-size: 14px;
  font-weight: 600;
  font-family: "Be Vietnam Pro", "Segoe UI", sans-serif;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(37, 99, 235, 0.45);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  letter-spacing: 0.01em;
  overflow: hidden;
}

.chat-toggle-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 10px 32px rgba(37, 99, 235, 0.55);
}

.chat-toggle-btn:active {
  transform: scale(0.97);
}

.btn-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
}

.btn-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.btn-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-close-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 13px;
}

.btn-label {
  font-weight: 600;
}

/* Pulse ring */
.btn-pulse {
  position: absolute;
  top: 50%;
  right: 18px;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.6);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(74, 222, 128, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
  }
}

/* ── Chat Window Transition ────────────────────────────── */
.chat-slide-enter-active {
  animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.chat-slide-leave-active {
  animation: slideDown 0.25s ease-in forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes slideDown {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(16px) scale(0.95);
  }
}

/* ── Chat Window ───────────────────────────────────────── */
.chat-window {
  width: 420px;
  height: 600px;
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(37, 99, 235, 0.12);
}

/* ── Header ────────────────────────────────────────────── */
.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  position: relative;
}

.chat-header::after {
  content: "";
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}

.header-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-img {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2.5px solid rgba(255, 255, 255, 0.7);
}

.online-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 10px;
  height: 10px;
  background: #4ade80;
  border-radius: 50%;
  border: 2px solid white;
}

.header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
  z-index: 1;
}

.header-name {
  color: white;
  font-size: 15px;
  font-weight: 700;
  font-family: "Be Vietnam Pro", "Segoe UI", sans-serif;
}

.header-status {
  color: rgba(255, 255, 255, 0.75);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

/* ── Chat Body ─────────────────────────────────────────── */
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  background: #f6f8ff;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
}

.chat-body::-webkit-scrollbar {
  width: 4px;
}
.chat-body::-webkit-scrollbar-track {
  background: transparent;
}
.chat-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

/* ── Message Rows ──────────────────────────────────────── */
.message-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bot-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.bot-avatar-mini {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid #dbeafe;
}

.bot-avatar-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ── Messages ──────────────────────────────────────────── */
.message {
  max-width: 80%;
  padding: 11px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.55;
  word-break: break-word;
  font-family: "Be Vietnam Pro", "Segoe UI", sans-serif;
}

.message.bot {
  background: white;
  color: #1e293b;
  border-bottom-left-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.07);
  border: 1px solid #e8edf8;
}

.message.user {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 5px;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
}

/* ── Typing Indicator ──────────────────────────────────── */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 14px 18px;
}

.typing-indicator span {
  width: 7px;
  height: 7px;
  background: #93c5fd;
  border-radius: 50%;
  animation: bounce 1.2s infinite ease-in-out;
}
.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0.7);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.1);
    opacity: 1;
  }
}

/* ── Product Carousel ──────────────────────────────────── */
.product-carousel {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 2px 10px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.product-carousel::-webkit-scrollbar {
  height: 4px;
}
.product-carousel::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.product-card {
  flex-shrink: 0;
  width: 168px;
  background: white;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  border: 1.5px solid #e8edf8;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  border-color: #93c5fd;
  box-shadow: 0 10px 28px rgba(37, 99, 235, 0.18);
}

.product-img-wrapper {
  position: relative;
  height: 130px;
  overflow: hidden;
  background: #f0f4ff;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card:hover .product-img {
  transform: scale(1.06);
}

.discount-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 20px;
  z-index: 1;
}

.product-info {
  padding: 10px 10px 6px;
  flex: 1;
}

.product-brand {
  font-size: 10.5px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 3px;
}

.product-name {
  font-size: 12.5px;
  font-weight: 700;
  color: #1e293b;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  margin-bottom: 5px;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.price-main {
  font-size: 13px;
  font-weight: 700;
  color: #e11d48;
}

.price-max {
  font-size: 11px;
  color: #94a3b8;
}

.product-btn {
  margin: 0 8px 8px;
  padding: 7px;
  background: #eff6ff;
  color: #2563eb;
  border: 1.5px solid #bfdbfe;
  border-radius: 9px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.product-btn:hover {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

/* ── Footer ────────────────────────────────────────────── */
.chat-footer {
  padding: 12px 14px 10px;
  background: white;
  border-top: 1px solid #e8edf8;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f6f8ff;
  border: 1.5px solid #e0e8ff;
  border-radius: 50px;
  padding: 6px 6px 6px 16px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.input-wrapper:focus-within {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.25);
}

.chat-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #1e293b;
  font-family: "Be Vietnam Pro", "Segoe UI", sans-serif;
  caret-color: #2563eb;
}

.chat-input::placeholder {
  color: #94a3b8;
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.4);
}

.send-btn svg {
  width: 16px;
  height: 16px;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.12);
  box-shadow: 0 5px 16px rgba(37, 99, 235, 0.5);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.footer-note {
  text-align: center;
  font-size: 10.5px;
  color: #cbd5e1;
  margin: 7px 0 0;
  font-family: "Be Vietnam Pro", "Segoe UI", sans-serif;
  letter-spacing: 0.01em;
}
</style>