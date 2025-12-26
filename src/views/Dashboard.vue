<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-eco-dark mb-2">
        你好，{{ userStore.userInfo.name }}！
      </h1>
      <p class="text-gray-600">
        今天是你环保的第 {{ daysSinceJoined }} 天，继续加油！
        <span v-if="daysSinceJoined === 1" class="text-eco-green font-medium">
          🌱 欢迎开始环保之旅！
        </span>
      </p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- 今日碳排放 -->
      <div class="eco-card p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-eco-light rounded-lg">
            <el-icon :size="24" color="#10b981">
              <Leaf />
            </el-icon>
          </div>
          <span class="text-sm text-gray-500">今日</span>
        </div>
        <div class="text-2xl font-bold text-eco-dark mb-1">
          {{ recordsStore.todayCarbon.toFixed(2) }} kg
        </div>
        <div class="text-sm text-gray-600">碳排放量</div>
        <div class="mt-2">
          <el-progress 
            :percentage="dailyProgress" 
            :color="getProgressColor(recordsStore.todayCarbon)"
            :show-text="false"
          />
        </div>
      </div>

      <!-- 本周碳排放 -->
      <div class="eco-card p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-blue-100 rounded-lg">
            <el-icon :size="24" color="#3b82f6">
              <Calendar />
            </el-icon>
          </div>
          <span class="text-sm text-gray-500">本周</span>
        </div>
        <div class="text-2xl font-bold text-eco-dark mb-1">
          {{ recordsStore.weekCarbon.toFixed(2) }} kg
        </div>
        <div class="text-sm text-gray-600">碳排放量</div>
        <div class="text-xs text-gray-500 mt-2">
          日均: {{ (recordsStore.weekCarbon / 7).toFixed(2) }} kg
        </div>
      </div>

      <!-- 本月碳排放 -->
      <div class="eco-card p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-orange-100 rounded-lg">
            <el-icon :size="24" color="#f59e0b">
              <PieChart />
            </el-icon>
          </div>
          <span class="text-sm text-gray-500">本月</span>
        </div>
        <div class="text-2xl font-bold text-eco-dark mb-1">
          {{ recordsStore.monthCarbon.toFixed(2) }} kg
        </div>
        <div class="text-sm text-gray-600">碳排放量</div>
        <div class="text-xs text-gray-500 mt-2">
          日均: {{ (recordsStore.monthCarbon / new Date().getDate()).toFixed(2) }} kg
        </div>
      </div>

      <!-- 环保积分 -->
      <div class="eco-card p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-yellow-100 rounded-lg">
            <el-icon :size="24" color="#eab308">
              <Coin />
            </el-icon>
          </div>
          <span class="text-sm text-gray-500">积分</span>
        </div>
        <div class="text-2xl font-bold text-eco-dark mb-1">
          {{ userStore.points }}
        </div>
        <div class="text-sm text-gray-600">环保积分</div>
        <div class="mt-2">
          <el-progress 
            :percentage="userStore.levelProgress" 
            color="#10b981"
            :show-text="false"
          />
        </div>
      </div>
    </div>

    <!-- 快速记录和图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- 快速记录 -->
      <div class="eco-card p-6">
        <h3 class="text-lg font-semibold text-eco-dark mb-4">快速记录</h3>
        <div class="space-y-3">
          <div 
            v-for="category in quickRecordCategories" 
            :key="category.key"
            class="w-full flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-eco-light cursor-pointer transition-colors"
            @click="openQuickRecord(category.key)"
          >
            <span class="w-8 text-center text-lg flex-shrink-0">{{ category.icon }}</span>
            <span class="ml-3">{{ category.name }}</span>
          </div>
        </div>
      </div>

      <!-- 简单图表展示 -->
      <div class="lg:col-span-2">
        <div class="eco-card p-6">
          <h3 class="text-lg font-semibold text-eco-dark mb-4">7天碳排放趋势</h3>
          <div class="h-64">
            <CarbonTrendChart 
              :data="trendData" 
              height="256px"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 环保小贴士 -->
    <div class="eco-card p-6">
      <h3 class="text-lg font-semibold text-eco-dark mb-4">今日环保贴士</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          v-for="tip in ecoTips" 
          :key="tip.id"
          class="flex items-start space-x-3 p-3 bg-eco-light rounded-lg"
        >
          <span class="text-xl">{{ tip.icon }}</span>
          <div>
            <h4 class="font-medium text-eco-dark">{{ tip.title }}</h4>
            <p class="text-sm text-gray-600 mt-1">{{ tip.content }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速记录对话框 -->
    <el-dialog v-model="quickRecordVisible" title="快速记录" width="600px">
      <div class="p-4">
        <QuickRecordForm 
          @success="handleQuickRecordSuccess" 
          @cancel="quickRecordVisible = false"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRecordsStore } from '@/stores/records'
import { ElMessage } from 'element-plus'
import CarbonTrendChart from '@/components/charts/CarbonTrendChart.vue'
import CategoryChart from '@/components/charts/CategoryChart.vue'
import QuickRecordForm from '@/components/common/QuickRecordForm.vue'

const userStore = useUserStore()
const recordsStore = useRecordsStore()

// 快速记录相关
const quickRecordVisible = ref(false)

// 快速记录分类
const quickRecordCategories = [
  { key: 'transport', name: '出行交通', icon: '🚇' },
  { key: 'diet', name: '饮食消费', icon: '🍱' },
  { key: 'energy', name: '能源消耗', icon: '💡' },
  { key: 'shopping', name: '购物消费', icon: '🛍️' }
]

// 环保贴士
const ecoTips = ref([
  {
    id: 1,
    icon: '🚶',
    title: '步行出行',
    content: '今天天气不错，短途出行可以考虑步行，既健康又环保！'
  },
  {
    id: 2,
    icon: '♻️',
    title: '垃圾分类',
    content: '记得做好垃圾分类，让资源得到有效回收利用。'
  },
  {
    id: 3,
    icon: '🌱',
    title: '绿色饮食',
    content: '减少红肉摄入，多选择蔬菜水果，对健康和环境都有好处。'
  }
])

// 计算属性
const daysSinceJoined = computed(() => {
  const joinDate = new Date(userStore.userInfo.joinDate)
  const today = new Date()
  const daysDifference = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24))
  return Math.max(1, daysDifference + 1) // 确保至少显示1天
})

const dailyProgress = computed(() => {
  const dailyCarbon = recordsStore.todayCarbon
  if (dailyCarbon <= 2) return 20
  if (dailyCarbon <= 5) return 40
  if (dailyCarbon <= 10) return 60
  if (dailyCarbon <= 15) return 80
  return 100
})

// 7天趋势数据
const trendData = computed(() => {
  const data = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    // 模拟数据（实际项目中应该从store获取）
    const carbon = Math.random() * 15 + 2
    
    data.push({
      date: dateStr,
      carbon: parseFloat(carbon.toFixed(2))
    })
  }
  
  return data
})

// 方法
const getProgressColor = (carbon) => {
  if (carbon <= 2) return '#10b981'
  if (carbon <= 5) return '#22c55e'
  if (carbon <= 10) return '#f59e0b'
  if (carbon <= 15) return '#ef4444'
  return '#dc2626'
}

const openQuickRecord = (category) => {
  quickRecordVisible.value = true
}

const handleQuickRecordSuccess = (record) => {
  console.log('快速记录成功:', record)
  ElMessage.success('碳足迹记录成功！')
  quickRecordVisible.value = false
}
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>