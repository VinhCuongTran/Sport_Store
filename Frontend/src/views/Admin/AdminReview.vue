<template>
  <div class="review-manager">
    <Loading :visible="isLoading" text="Đang tải dữ liệu đánh giá..." />

    <div class="header-actions">
      <h2>Quản lý Đánh giá (Reviews)</h2>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>STT</th>
          <th>Sản phẩm</th>
          <th>Người dùng</th>
          <th>Đánh giá</th>
          <th>Bình luận</th>
          <th>Ngày tạo</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(review, index) in reviews" :key="review.id">
          <td>{{ index + 1 }}</td>
          <td>
            <strong>{{ review.product_name }}</strong>
          </td>
          <td>
            <div class="user-info">
              <img
                :src="review.user_avatar || defaultAvatar"
                class="avatar-sm"
              />
              <span>{{ review.user_name }}</span>
            </div>
          </td>
          <td>
            <div class="stars">
              <span
                v-for="n in 5"
                :key="n"
                :class="{ 'star-filled': n <= review.rating }"
                >★</span
              >
            </div>
            <small>{{ review.rating }} sao</small>
          </td>
          <td class="comment-cell">
            {{ review.comment || "Không có bình luận" }}
          </td>
          <td>{{ new Date(review.created_at).toLocaleDateString("vi-VN") }}</td>
          <td>
            <button @click="handleDelete(review.id)" class="btn btn-delete">
              Xóa
            </button>
          </td>
        </tr>
        <tr v-if="reviews.length === 0">
          <td colspan="7" class="text-center">Chưa có đánh giá nào.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ReviewService from "@/services/review.service";
import Loading from "@/components/Loading.vue";

const reviews = ref([]);
const isLoading = ref(false);
const defaultAvatar =
  "https://res.cloudinary.com/dosb4fmpo/image/upload/v1772181216/Male_gqcp4c.jpg";

const fetchReviews = async () => {
  isLoading.value = true;
  try {
    reviews.value = await ReviewService.getAll();
  } catch (error) {
    console.error("Lỗi khi tải đánh giá", error);
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = async (id) => {
  if (
    !confirm(
      "Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.",
    )
  )
    return;
  isLoading.value = true;
  try {
    await ReviewService.delete(id);
    await fetchReviews();
  } catch (error) {
    alert(error.response?.data?.message || "Không thể xóa đánh giá.");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchReviews();
});
</script>

<style scoped>
.review-manager {
  max-width: 1100px;
  margin: auto;
}
.header-actions {
  margin-bottom: 20px;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}
.data-table th,
.data-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
  vertical-align: middle;
}
.data-table th {
  background-color: #f4f6f9;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.avatar-sm {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.stars {
  color: #ccc;
  font-size: 1.2rem;
}
.star-filled {
  color: #ffc107; /* Màu vàng cho sao */
}

.comment-cell {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}
.btn-delete {
  background-color: #dc3545;
}
.text-center {
  text-align: center;
}
</style>
