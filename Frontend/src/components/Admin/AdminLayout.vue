<template>
    <div class="admin-layout">
        <AdminHeader />
        <div class="admin-container">
            <aside class="sidebar">
                <nav>
                    <router-link :to="{ name: 'admin-stats' }" class="nav-link">Thống kê</router-link>
                    <router-link :to="{ name: 'admin-category' }" class="nav-link">Quản lý Danh mục</router-link>
                    <router-link :to="{ name: 'admin-brand' }" class="nav-link">Quản lý Thương hiệu</router-link>
                    <router-link :to="{ name: 'admin-user' }" class="nav-link">Quản lý Người dùng</router-link>
                    </nav>
            </aside>
            <main class="content">
                <router-view /> </main>
        </div>
    </div>
</template>

<script setup>
import AdminHeader from './AdminHeader.vue';
</script>

<style scoped>
.admin-layout { display: flex; flex-direction: column; min-height: 100vh; }
.admin-container { display: flex; flex: 1; }
.sidebar { width: 250px; background-color: #f4f6f9; padding: 20px 0; border-right: 1px solid #ddd; }
.nav-link { display: block; padding: 12px 20px; color: #333; text-decoration: none; border-bottom: 1px solid #eee; }
.nav-link:hover, .router-link-active { background-color: #e2e6ea; font-weight: bold; color: #007bff; }
.content { flex: 1; padding: 30px; background-color: #fff; overflow-y: auto; }
</style>