<template>
  <v-dialog v-model="isOpen" max-width="400px" persistent>
    <v-card rounded="xl" elevation="8" class="custom-bg text-white">
      <v-card-text class="pa-6 text-center">
        <v-icon
          :color="options.iconColor || 'amber-lighten-1'"
          size="64"
          class="mb-4"
        >
          {{ options.icon || "mdi-alert-circle-outline" }}
        </v-icon>

        <h3 class="text-h6 font-weight-bold text-white mb-2">
          {{ title }}
        </h3>

        <p class="text-body-2 text-grey-lighten-1 mb-6">
          {{ message }}
        </p>

        <div class="d-flex justify-center gap-3">
          <v-btn
            v-if="!options.isAlert"
            color="white"
            variant="outlined"
            rounded="lg"
            min-width="110"
            class="text-capitalize"
            @click="cancel"
          >
            {{ options.cancelText || "Hủy bỏ" }}
          </v-btn>

          <v-btn
            :color="options.confirmColor || 'red-lighten-1'"
            variant="elevated"
            rounded="lg"
            min-width="110"
            class="text-capitalize text-white font-weight-bold"
            @click="confirm"
          >
            {{ options.confirmText || "Đồng ý" }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from "vue";

const isOpen = ref(false);
const title = ref("");
const message = ref("");
const options = ref({});

let resolvePromise = null;

/**
 *
 * @param {String} dialogTitle
 * @param {String} dialogMessage
 * @param {Object} dialogOptions
 */
const open = (dialogTitle, dialogMessage, dialogOptions = {}) => {
  title.value = dialogTitle;
  message.value = dialogMessage;
  options.value = dialogOptions;
  isOpen.value = true;

  return new Promise((resolve) => {
    resolvePromise = resolve;
  });
};

const confirm = () => {
  isOpen.value = false;
  if (resolvePromise) resolvePromise(true);
};

const cancel = () => {
  isOpen.value = false;
  if (resolvePromise) resolvePromise(false);
};

defineExpose({ open });
</script>

<style scoped>
.custom-bg {
  background-color: #001a2d !important;
}

.gap-3 {
  gap: 12px;
}
</style>
