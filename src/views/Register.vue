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
          <h2 class="text-xl font-semibold text-eco-dark mb-2">加入我们</h2>
          <p class="text-gray-600">开启您的绿色生活之旅</p>
        </div>

        <!-- 注册表单 -->
        <el-form 
          :model="registerForm" 
          :rules="registerRules" 
          ref="registerFormRef"
          @submit.prevent="handleRegister"
        >
          <el-form-item prop="name">
            <el-input
              v-model="registerForm.name"
              placeholder="用户名"
              prefix-icon="User"
              size="large"
              clearable
            />
          </el-form-item>

          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="邮箱地址"
              prefix-icon="Message"
              size="large"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              size="large"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="确认密码"
              prefix-icon="Lock"
              size="large"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="registerForm.agreement">
              我同意 
              <a href="#" class="text-eco-green hover:text-green-600">用户协议</a> 和 
              <a href="#" class="text-eco-green hover:text-green-600">隐私政策</a>
            </el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              :loading="loading"
              @click="handleRegister"
              class="w-full"
              style="background-color: #d1fae5; border-color: #a7f3d0; color: #065f46;"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 其他操作 -->
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            已有账户？
            <router-link to="/login" class="text-eco-green hover:text-green-600 font-medium">
              立即登录
            </router-link>
          </p>
        </div>

        <!-- 环保理念 -->
        <div class="mt-8 p-4 bg-eco-light rounded-lg">
          <h4 class="text-sm font-semibold text-eco-dark mb-2">🌿 加入EcoTrack</h4>
          <ul class="text-xs text-gray-600 space-y-1">
            <li>• 记录您的碳足迹，了解环保影响力</li>
            <li>• 参与环保挑战，养成绿色习惯</li>
            <li>• 与环保达人交流，分享生活经验</li>
            <li>• 获得积分奖励，提升环保等级</li>
          </ul>
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

const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

const registerRules = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在2到20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6到20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次密码输入不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  agreement: [
    { 
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请同意用户协议和隐私政策'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate()
    loading.value = true
    
    const result = await userStore.register(registerForm)
    
    if (result.success) {
      ElMessage.success(result.message)
      router.push('/')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error('注册失败，请重试')
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

:deep(.el-checkbox__label) {
  @apply text-sm;
}
</style>