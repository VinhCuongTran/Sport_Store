<template>
  <div class="default-layout">
    <Header />

    <v-main class="bg-white min-vh-100">
      <router-view />
    </v-main>
    <Chatbot />
    <Footer />
  </div>
</template>

<script setup>
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import Chatbot from "@/components/chatbot.vue";
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
