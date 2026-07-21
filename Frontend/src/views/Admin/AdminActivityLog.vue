<template>
  <v-container
    fluid
    theme="light"
    class="fill-height d-flex flex-column align-center pa-6"
    style="background-color: #f4f6f8; min-height: 100vh"
  >
    <div
      class="d-flex justify-space-between align-center w-100 mb-6 flex-wrap gap-4"
    >
      <div>
        <h2
          class="text-h5 font-weight-bold text-indigo-darken-4"
          style="line-height: 1.2"
        >
          <v-icon color="indigo-darken-4" class="mr-2">mdi-history</v-icon>
          Lịch sử Thao tác Hệ thống
        </h2>
        <span class="text-caption text-grey-darken-2"
          >Theo dõi các hành động của người dùng và quản trị viên</span
        >
      </div>

      <div class="d-flex align-center gap-3">
        <v-text-field
          v-model="searchKeyword"
          prepend-inner-icon="mdi-magnify"
          label="Tìm kiếm người dùng, hành động..."
          variant="outlined"
          density="compact"
          bg-color="white"
          hide-details
          class="rounded-lg"
          style="width: 300px"
        ></v-text-field>

        <v-btn
          color="indigo-darken-4"
          prepend-icon="mdi-refresh"
          rounded="lg"
          variant="tonal"
          class="text-capitalize"
          @click="fetchLogs"
          :loading="isLoading"
        >
          Làm Mới
        </v-btn>
      </div>
    </div>

    <v-card
      color="white"
      width="100%"
      elevation="0"
      rounded="xl"
      class="pa-4"
      style="
        border: 1px solid rgba(26, 35, 126, 0.15);
        box-shadow: 0 4px 24px rgba(26, 35, 126, 0.08);
      "
    >
      <v-data-table
        :headers="headers"
        :items="logs"
        :search="searchKeyword"
        :loading="isLoading"
        hover
        class="bg-white rounded-lg custom-table"
        no-data-text="Chưa có dữ liệu lịch sử thao tác nào."
      >
        <template v-slot:item.index="{ index }">
          <span class="font-weight-medium text-grey-darken-1">{{
            index + 1
          }}</span>
        </template>

        <template v-slot:item.created_at="{ item }">
          <span class="text-body-2">{{ formatDate(item.created_at) }}</span>
        </template>

        <!-- Hiển thị tên người dùng và vai trò dựa trên query JOIN trong model -->
        <template v-slot:item.user_name="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-bold text-indigo-darken-4">{{
              item.user_name || "Hệ thống"
            }}</span>
            <div class="mt-1">
              <v-chip
                size="x-small"
                :color="item.role === 'admin' ? 'red-darken-2' : 'blue-grey'"
                variant="outlined"
              >
                {{ item.role ? item.role.toUpperCase() : "N/A" }}
              </v-chip>
            </div>
          </div>
        </template>

        <template v-slot:item.action="{ item }">
          <v-chip
            size="small"
            color="indigo"
            variant="flat"
            class="font-weight-bold text-uppercase"
          >
            {{ item.action }}
          </v-chip>
        </template>

        <template v-slot:item.description="{ item }">
          <span class="text-caption text-grey-darken-4">{{
            item.description || ""
          }}</span>
          <br v-if="item.target_id" />
          <v-chip
            v-if="item.target_id"
            size="x-small"
            color="grey-darken-2"
            variant="tonal"
            class="mt-1"
          >
            Target ID: {{ item.target_id }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "vue-toastification";
import api from "@/services/api.service";

const toast = useToast();
const isLoading = ref(false);
const logs = ref([]);
const searchKeyword = ref("");

// Khai báo header khớp với các trường được query từ ActivityLog.getAllLogs()
const headers = [
  {
    title: "STT",
    key: "index",
    align: "center",
    sortable: false,
    width: "60px",
  },
  {
    title: "Thời gian",
    key: "created_at",
    align: "start",
    sortable: true,
    width: "160px",
  },
  {
    title: "Người thực hiện",
    key: "user_name",
    align: "start",
    sortable: true,
    width: "180px",
  },
  {
    title: "Hành động",
    key: "action",
    align: "center",
    sortable: true,
    width: "150px",
  },
  {
    title: "Chi tiết thao tác",
    key: "description",
    align: "start",
    sortable: false,
  },
];

const fetchLogs = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/activity-logs"); 
    logs.value = response.data || [];
  } catch (error) {
    console.error("Lỗi tải lịch sử thao tác:", error);
    toast.error("Không thể tải dữ liệu lịch sử thao tác.");
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

onMounted(() => fetchLogs());
</script>

<style scoped>
:deep(.custom-table th) {
  background-color: #ffffff !important;
  color: #333 !important;
}
:deep(.custom-table th:hover) {
  background-color: #e8eaf6 !important;
  transition: background-color 0.2s;
}
:deep(.v-data-table__tr:hover td) {
  background-color: #f8fafc !important;
}
</style>
