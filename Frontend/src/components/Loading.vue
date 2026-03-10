<template>
  <div v-if="visible" class="loading-overlay">
    <div class="loader"></div>
    <p class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: "Đang xử lý...",
  },
});
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loader {
  width: 60px;
  aspect-ratio: 1;
  display: grid;
  border: 4px solid #0000;
  border-radius: 50%;
  border-right-color: #77e51f;
  animation: l15 1s infinite linear;
}

.loader::before,
.loader::after {
  content: "";
  grid-area: 1/1;
  margin: 2px;
  border: inherit;
  border-radius: 50%;
  animation: l15 2s infinite;
}

.loader::after {
  margin: 8px;
  animation-duration: 3s;
}

@keyframes l15 {
  100% {
    transform: rotate(1turn);
  }
}

.loading-text {
  margin-top: 20px;
  font-size: 16px;
  font-weight: 800;
  color: #001a2d;
  text-transform: uppercase;
  letter-spacing: 1px;
}
</style>
