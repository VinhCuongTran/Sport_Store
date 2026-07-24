<template>
  <div class="default-layout">
    <Header />

    <v-main class="bg-white min-vh-100">
      <router-view />
    </v-main>
    
    <!-- Render Chatbot hiện tại của bạn -->
    <Chatbot />
    
    <!-- Thêm component Chat mới vào đây để nó hiển thị toàn cục -->
    <Chat />
    
    <Footer />
  </div>
</template>

<script setup>
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import Chatbot from "@/components/Chatbot.vue";

// Import file chat của bạn (Source 1)
// Lưu ý: Đổi tên file 'ChatWidget.vue' cho đúng với tên file thực tế trong project của bạn
import Chat from "@/components/Chat.vue"; 
</script>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.min-vh-100 {
  min-height: 100vh;
}
</style>