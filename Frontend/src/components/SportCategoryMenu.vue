<template>
  <v-card
    class="mega-menu-card bg-white pa-8 rounded-b-xl rounded-t-0"
    elevation="8"
  >
    <v-row>
      <v-col
        v-for="sport in sports"
        :key="'sport-' + sport.id"
        cols="12"
        sm="6"
        md="3"
        class="mb-6"
      >
        <router-link
          :to="`/products?sport=${sport.id}`"
          class="parent-link font-weight-black text-black d-block mb-3 text-subtitle-1 text-uppercase border-b pb-2"
          @click="closeMenu"
        >
          {{ sport.name }}
        </router-link>

        <div class="child-menu d-flex flex-column gap-2">
          <router-link
            v-for="category in getCategoriesBySport(sport.id)"
            :key="'cat-' + category.id"
            :to="`/products?category=${category.id}`"
            class="child-link text-grey-darken-3"
            @click="closeMenu"
          >
            {{ category.name }}
          </router-link>

          <span
            v-if="getCategoriesBySport(sport.id).length === 0"
            class="text-grey text-caption"
          >
            Đang cập nhật...
          </span>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from "vue";
import SportService from "@/services/sport.service.js";
import CategoryService from "@/services/category.service.js";

const emit = defineEmits(["close-menu"]);

const sports = ref([]);
const categories = ref([]);

const loadData = async () => {
  try {
    const [sportsData, categoriesData] = await Promise.all([
      SportService.getAll(),
      CategoryService.getAll(),
    ]);
    sports.value = sportsData;
    categories.value = categoriesData;
  } catch (error) {
    console.error("Lỗi khi tải menu danh mục:", error);
  }
};

const getCategoriesBySport = (sportId) => {
  return categories.value.filter((c) => c.sport_id === sportId);
};

const closeMenu = () => {
  emit("close-menu");
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.mega-menu-card {
  width: 900px;
  max-width: 95vw;
  max-height: 80vh;
  overflow-y: auto;
  border-top: none;
}

.parent-link {
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  letter-spacing: 0.5px;
}

.parent-link:hover {
  color: #d32f2f !important;
  text-decoration: underline !important;
  text-underline-offset: 4px;
}

.child-menu .child-link {
  text-decoration: none;
  font-size: 15px;
  transition: all 0.2s ease-in-out;
}

.child-menu .child-link:hover {
  color: #d32f2f !important;
  font-weight: bold;
  padding-left: 6px;
  text-decoration: underline !important;
  text-underline-offset: 4px;
}

.gap-2 {
  gap: 12px;
}
</style>
