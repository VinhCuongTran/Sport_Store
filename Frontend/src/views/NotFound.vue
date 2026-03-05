<template>
  <v-app>
    <v-main class="bg-white d-flex flex-column align-center justify-center min-vh-100">
      
      <div class="image-wrapper">
        
        <v-img
          :src="notFoundImg"
          max-width="1000px" 
          class="mx-auto"
          contain
        ></v-img>

        <v-btn
          to="/"
          class="btn-go-home font-weight-bold"
          height="56"
          rounded="pill"
          elevation="4"
        >
          <v-icon left size="24" class="mr-2">mdi-cart-arrow-right</v-icon>
          TIẾP TỤC MUA SẮM
        </v-btn>

      </div>

    </v-main>
  </v-app>
</template>

<script setup>
import notFoundImg from "@/assets/notfound.png";
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}


.image-wrapper {
  position: relative;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.btn-go-home {
  position: absolute; 
  z-index: 10; 
  
  top: 350px;    /* Tăng số này thì nút tụt XUỐNG DƯỚI, giảm thì nút chạy LÊN TRÊN */
  right: 80px;  /* Tăng số này thì nút chạy sang TRÁI, giảm thì nút chạy sang PHẢI */



  background-color: #ef4444 !important; /* Màu đỏ tươi/san hô */
  color: #ffffff !important;
  font-size: 16px;
  letter-spacing: 1px;
  padding: 0 40px !important;
  transition: all 0.3s ease;
}

/* Hiệu ứng nhấc nút lên và bóng đổ màu đỏ nhẹ khi đưa chuột vào */
.btn-go-home:hover {
  background-color: #dc2626 !important; /* Đỏ sậm hơn khi hover */
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4) !important;
}

/* Bổ sung: Khi màn hình điện thoại nhỏ lại, bạn có thể chỉnh lại px cho vừa đt */
@media (max-width: 768px) {
  .btn-go-home {
    top: 50%;
    right: auto;
    left: 50%;
    transform: translate(-50%, -50%); /* Tự động đưa ra giữa màn hình trên ĐT */
  }
  .btn-go-home:hover {
    transform: translate(-50%, -55%);
  }
}
</style>