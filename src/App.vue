<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-md sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-2">
            <el-icon :size="28" color="#10b981">
              <Leaf />
            </el-icon>
            <h1 class="text-xl font-bold text-eco-dark">EcoTrack</h1>
          </div>
          
          <!-- 导航菜单 -->
          <div class="hidden md:flex items-center space-x-8">
            <router-link 
              to="/" 
              class="nav-link"
              :class="{ 'nav-link-active': $route.path === '/' }"
            >
              <el-icon><House /></el-icon>
              <span>仪表盘</span>
            </router-link>
            <router-link 
              to="/records" 
              class="nav-link"
              :class="{ 'nav-link-active': $route.path === '/records' }"
            >
              <el-icon><Document /></el-icon>
              <span>记录</span>
            </router-link>
            <router-link 
              to="/challenges" 
              class="nav-link"
              :class="{ 'nav-link-active': $route.path === '/challenges' }"
            >
              <el-icon><Trophy /></el-icon>
              <span>挑战</span>
            </router-link>
            <router-link 
              to="/community" 
              class="nav-link"
              :class="{ 'nav-link-active': $route.path === '/community' }"
            >
              <el-icon><User /></el-icon>
              <span>社区</span>
            </router-link>
          </div>

          <!-- 用户菜单 -->
          <div class="flex items-center space-x-4">
            <template v-if="userStore.isAuthenticated">
              <el-badge :value="userStore.points" type="success">
                <el-button type="success" size="small" plain>
                  <el-icon><Coin /></el-icon>
                  积分
                </el-button>
              </el-badge>
              <el-dropdown @command="handleUserAction">
                <el-avatar :size="32" :src="userStore.userInfo.avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <div class="flex items-center justify-between">
                      <span>{{ userStore.userInfo.name }}</span>
                      <span class="text-xs text-gray-500">Lv.{{ userStore.userInfo.level }}</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <template v-else>
              <router-link to="/login">
                <el-button style="background-color: #d1fae5; border-color: #a7f3d0; color: #065f46;">
                  登录
                </el-button>
              </router-link>
              <router-link to="/register">
                <el-button type="success" style="background-color: #d1fae5; border-color: #a7f3d0; color: #065f46;">
                  注册
                </el-button>
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>

    <!-- 底部导航 (移动端) -->
    <nav 
      v-if="userStore.isAuthenticated"
      class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200"
    >
      <div class="grid grid-cols-4 h-16">
        <router-link 
          to="/" 
          class="mobile-nav-item"
          :class="{ 'mobile-nav-active': $route.path === '/' }"
        >
          <el-icon :size="20"><House /></el-icon>
          <span class="text-xs">仪表盘</span>
        </router-link>
        <router-link 
          to="/records" 
          class="mobile-nav-item"
          :class="{ 'mobile-nav-active': $route.path === '/records' }"
        >
          <el-icon :size="20"><Document /></el-icon>
          <span class="text-xs">记录</span>
        </router-link>
        <router-link 
          to="/challenges" 
          class="mobile-nav-item"
          :class="{ 'mobile-nav-active': $route.path === '/challenges' }"
        >
          <el-icon :size="20"><Trophy /></el-icon>
          <span class="text-xs">挑战</span>
        </router-link>
        <router-link 
          to="/community" 
          class="mobile-nav-item"
          :class="{ 'mobile-nav-active': $route.path === '/community' }"
        >
          <el-icon :size="20"><User /></el-icon>
          <span class="text-xs">社区</span>
        </router-link>
      </div>
    </nav>

    <!-- 移动端底部占位 -->
    <div class="h-16 md:hidden"></div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const userStore = useUserStore()
const router = useRouter()

// 初始化时检查认证状态
userStore.checkAuth()

const handleUserAction = (command) => {
  switch (command) {
    case 'logout':
      handleLogout()
      break
    default:
      break
  }
}

const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  }).catch(() => {
    // 用户取消
  })
}
</script>

<style scoped>
.nav-link {
  @apply flex items-center space-x-2 text-gray-600 hover:text-eco-green transition-colors duration-200;
}

.nav-link-active {
  @apply text-eco-green;
}

.mobile-nav-item {
  @apply flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-eco-green transition-colors duration-200;
}

.mobile-nav-active {
  @apply text-eco-green;
  background: linear-gradient(to top, #10b98110, transparent);
}
</style>