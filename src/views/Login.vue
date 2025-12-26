<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
    <div class="w-full max-w-md">
      <div class="eco-card p-8">
        <!-- Logo和标题 -->
        <div class="text-center mb-8">
          <div class="flex justify-center items-center space-x-2 mb-4">
            <el-icon :size="36" color="#10b981">
              <Leaf />
            </el-icon>
            <h1 class="text-2xl font-bold text-eco-dark">EcoTrack</h1>
          </div>
          <h2 class="text-xl font-semibold text-eco-dark mb-2">欢迎回来</h2>
          <p class="text-gray-600">登录您的绿色生活账户</p>
        </div>

        <!-- 登录表单 -->
        <el-form 
          :model="loginForm" 
          :rules="loginRules" 
          ref="loginFormRef"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="email">
            <el-input
              v-model="loginForm.email"
              placeholder="邮箱地址"
              prefix-icon="Message"
              size="large"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              size="large"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="loginForm.remember">
              记住我
            </el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              :loading="loading"
              @click="handleLogin"
              class="w-full"
              style="background-color: #d1fae5; border-color: #a7f3d0; color: #065f46;"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 其他操作 -->
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            还没有账户？
            <router-link to="/register" class="text-eco-green hover:text-green-600 font-medium">
              立即注册
            </router-link>
          </p>
        </div>

        <!-- 演示账号信息 -->
        <div class="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 class="text-sm font-semibold text-blue-800 mb-2">演示账号</h4>
          <p class="text-xs text-blue-600 mb-1">邮箱: demo@ecotrack.com</p>
          <p class="text-xs text-blue-600 mb-2">密码: 任意非空密码</p>
          <p class="text-xs text-blue-500">您可以输入任意邮箱和密码进行体验</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  email: '',
  password: '',
  remember: false
})

const loginRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    const result = await userStore.login(loginForm)
    
    if (result.success) {
      ElMessage.success(result.message)
      router.push('/')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.eco-card {
  @apply bg-white rounded-xl shadow-lg border border-gray-100;
  backdrop-filter: blur(10px);
}

:deep(.el-input__wrapper) {
  @apply border-gray-200 rounded-lg;
}

:deep(.el-input__wrapper:hover) {
  @apply border-eco-green;
}

:deep(.el-input__wrapper.is-focus) {
  @apply border-eco-green shadow-sm;
}
</style>