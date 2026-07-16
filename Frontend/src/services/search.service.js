import { reactive } from 'vue';

export const searchState = reactive({
  keyword: '',
  searchType: 'text', // 'text' hoặc 'image'
  
  // Dành cho tìm kiếm hình ảnh
  imageFile: null,
  imagePreview: null,
  isNewImageUpload: false, // Cờ báo hiệu có ảnh mới cần call API
  
  // Lưu trữ kết quả
  results: [], 
});