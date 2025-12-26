<template>
  <div class="community">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-eco-dark mb-2">社区动态</h1>
          <p class="text-gray-600">与环保达人交流，分享你的绿色生活</p>
        </div>
          <button 
            @click="openPublishDialog"
            class="px-6 py-3 rounded-lg font-medium shadow-lg border-2 transition-colors"
            style="background-color: #d1fae5; border-color: #a7f3d0; color: #065f46;"
          >
            ✏️ 发布动态
          </button>
      </div>
    </div>

    <!-- 排行榜 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- 本周减排榜 -->
      <div class="eco-card p-6">
        <h3 class="text-lg font-semibold text-eco-dark mb-4 flex items-center gap-2">
          <el-icon color="#f59e0b"><Trophy /></el-icon>
          本周减排榜
        </h3>
        <div class="space-y-3">
          <div 
            v-for="(user, index) in weeklyRanking" 
            :key="user.id"
            class="flex items-center gap-3"
          >
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              :class="getRankingClass(index)"
            >
              {{ index + 1 }}
            </div>
            <el-avatar :size="36" :src="user.avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="flex-1">
              <div class="font-medium text-eco-dark">{{ user.name }}</div>
              <div class="text-sm text-gray-600">{{ user.reduction }} kg CO₂</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 挑战达人榜 -->
      <div class="eco-card p-6">
        <h3 class="text-lg font-semibold text-eco-dark mb-4 flex items-center gap-2">
          <el-icon color="#10b981"><Star /></el-icon>
          挑战达人榜
        </h3>
        <div class="space-y-3">
          <div 
            v-for="(user, index) in challengeRanking" 
            :key="user.id"
            class="flex items-center gap-3"
          >
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              :class="getRankingClass(index)"
            >
              {{ index + 1 }}
            </div>
            <el-avatar :size="36" :src="user.avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="flex-1">
              <div class="font-medium text-eco-dark">{{ user.name }}</div>
              <div class="text-sm text-gray-600">{{ user.challenges }} 个挑战</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 新人榜 -->
      <div class="eco-card p-6">
        <h3 class="text-lg font-semibold text-eco-dark mb-4 flex items-center gap-2">
          <el-icon color="#3b82f6"><UserFilled /></el-icon>
          环保新星榜
        </h3>
        <div class="space-y-3">
          <div 
            v-for="(user, index) in newUsersRanking" 
            :key="user.id"
            class="flex items-center gap-3"
          >
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-blue-500 text-white"
            >
              NEW
            </div>
            <el-avatar :size="36" :src="user.avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="flex-1">
              <div class="font-medium text-eco-dark">{{ user.name }}</div>
              <div class="text-sm text-gray-600">{{ user.days }} 天</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 社区动态 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 动态列表 -->
      <div class="lg:col-span-2">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-eco-dark">最新动态</h3>
          <el-button size="small" @click="refreshFeeds">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>

        <div class="space-y-4">
          <div 
            v-for="feed in communityFeeds" 
            :key="feed.id"
            class="eco-card p-6"
          >
            <!-- 用户信息 -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <el-avatar :size="40" :src="feed.user.avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <div>
                  <div class="font-medium text-eco-dark">{{ feed.user.name }}</div>
                  <div class="text-sm text-gray-500">{{ feed.createTime }}</div>
                </div>
              </div>
            </div>

            <!-- 内容 -->
            <div class="mb-4">
              <p class="text-gray-700 leading-relaxed mb-3">{{ feed.content }}</p>
              
              <!-- 标签 -->
              <div v-if="feed.tags && feed.tags.length > 0" class="flex flex-wrap gap-2 mb-3">
                <el-tag
                  v-for="tag in feed.tags"
                  :key="tag"
                  size="small"
                >
                  #{{ tag }}
                </el-tag>
              </div>
            </div>

            <!-- 互动数据 -->
            <div class="flex items-center gap-4 text-sm text-gray-500">
              <button class="flex items-center gap-1 hover:text-eco-green transition-colors">
                <el-icon><Heart /></el-icon>
                <span>{{ feed.likes }}</span>
              </button>
              
              <button class="flex items-center gap-1 hover:text-eco-green transition-colors">
                <el-icon><ChatDotRound /></el-icon>
                <span>{{ feed.comments }}</span>
              </button>
              
              <button class="flex items-center gap-1 hover:text-eco-green transition-colors">
                <el-icon><Share /></el-icon>
                <span>{{ feed.shares }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 侧边栏 -->
      <div class="space-y-6">
        <!-- 环保小知识 -->
        <div class="eco-card p-6">
          <h3 class="text-lg font-semibold text-eco-dark mb-4">🌿 环保小知识</h3>
          <div class="space-y-3">
            <div 
              v-for="tip in ecoTips" 
              :key="tip.id"
              class="p-3 bg-eco-light rounded-lg"
            >
              <h4 class="font-medium text-eco-dark text-sm mb-1">{{ tip.title }}</h4>
              <p class="text-xs text-gray-600">{{ tip.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 发布对话框 -->
    <el-dialog
      v-model="publishDialogVisible"
      title="发布动态"
      width="600px"
      :before-close="handleClose"
    >
      <el-form :model="publishForm" :rules="publishRules" ref="publishFormRef" label-width="80px">
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="publishForm.content"
            type="textarea"
            :rows="4"
            placeholder="分享你的环保生活..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="标签">
          <div class="flex flex-wrap gap-2 mb-2">
            <el-tag
              v-for="tag in publishForm.tags"
              :key="tag"
              closable
              @close="removeTag(tag)"
              class="mb-1"
            >
              #{{ tag }}
            </el-tag>
          </div>
          <div class="flex gap-2">
            <el-input
              v-model="newTag"
              placeholder="添加标签"
              size="small"
              style="width: 150px"
              @keyup.enter="addTag"
            />
            <el-button size="small" @click="addTag">添加</el-button>
          </div>
          <div class="mt-2">
            <span class="text-xs text-gray-500">推荐标签：</span>
            <div class="flex flex-wrap gap-1 mt-1">
              <el-tag
                v-for="tag in recommendedTags"
                :key="tag"
                size="small"
                type="info"
                class="cursor-pointer hover:bg-blue-100"
                @click="addRecommendedTag(tag)"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="publishDialogVisible = false">取消</el-button>
          <el-button 
            @click="submitPublish" 
            :loading="publishing"
            style="background-color: #d1fae5; border-color: #a7f3d0; color: #065f46;"
          >
            发布
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

// 对话框状态
const publishDialogVisible = ref(false)
const publishing = ref(false)
const publishFormRef = ref(null)
const newTag = ref('')

// 发布表单
const publishForm = ref({
  content: '',
  tags: []
})

// 表单验证规则
const publishRules = {
  content: [
    { required: true, message: '请输入动态内容', trigger: 'blur' },
    { min: 10, max: 500, message: '内容长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

// 推荐标签
const recommendedTags = ref([
  '环保挑战', '节能减排', '绿色出行', '垃圾分类', '素食主义',
  '低碳生活', '节能技巧', '环保心得', '可持续生活'
])

// 模拟数据
const weeklyRanking = ref([
  { id: 1, name: '环保达人小李', avatar: '/avatars/user1.jpg', reduction: 12.5 },
  { id: 2, name: '绿色生活家', avatar: '/avatars/user2.jpg', reduction: 10.8 },
  { id: 3, name: '低碳先锋', avatar: '/avatars/user3.jpg', reduction: 9.2 },
  { id: 4, name: '地球卫士', avatar: '/avatars/user4.jpg', reduction: 8.7 }
])

const challengeRanking = ref([
  { id: 1, name: '挑战王者', avatar: '/avatars/user5.jpg', challenges: 15, points: 1250 },
  { id: 2, name: '环保达人', avatar: '/avatars/user1.jpg', challenges: 12, points: 980 },
  { id: 3, name: '低碳生活', avatar: '/avatars/user6.jpg', challenges: 10, points: 850 },
  { id: 4, name: '绿色先锋', avatar: '/avatars/user7.jpg', challenges: 8, points: 720 }
])

const newUsersRanking = ref([
  { id: 1, name: '新人小明', avatar: '/avatars/user8.jpg', days: 3, reduction: 5.2 },
  { id: 2, name: '环保小白', avatar: '/avatars/user9.jpg', days: 5, reduction: 4.8 },
  { id: 3, name: '绿色新手', avatar: '/avatars/user10.jpg', days: 7, reduction: 6.1 },
  { id: 4, name: '低碳新人', avatar: '/avatars/user11.jpg', days: 10, reduction: 7.3 }
])

const communityFeeds = ref([
  {
    id: 1,
    user: { id: 1, name: '环保达人小李', avatar: '/avatars/user1.jpg' },
    content: '今天完成了"一周无外卖"挑战，不仅健康了，还减少了碳排放！大家一起来试试吧！🌱',
    tags: ['无外卖挑战', '健康饮食'],
    likes: 42,
    comments: 8,
    shares: 3,
    createTime: '2小时前'
  },
  {
    id: 2,
    user: { id: 2, name: '绿色生活家', avatar: '/avatars/user2.jpg' },
    content: '分享一个环保小技巧：洗澡时等待热水的冷水可以用来浇花或冲厕所，一年下来能节约不少水呢！💧',
    tags: ['节水技巧', '生活小窍门'],
    likes: 28,
    comments: 5,
    shares: 12,
    createTime: '4小时前'
  }
])

const ecoTips = ref([
  {
    id: 1,
    title: 'LED灯的节能效果',
    content: 'LED灯比传统白炽灯节能80%，寿命长25倍。'
  },
  {
    id: 2,
    title: '塑料瓶回收利用',
    content: '一个塑料瓶回收可减少约0.08kg碳排放。'
  },
  {
    id: 3,
    title: '公共交通优势',
    content: '公交车人均碳排放是私家车的1/8。'
  }
])

// 方法
const getRankingClass = (index) => {
  const classes = [
    'bg-yellow-500 text-white',
    'bg-gray-400 text-white', 
    'bg-orange-600 text-white'
  ]
  return classes[index] || 'bg-gray-200 text-gray-700'
}

// 标签管理
const addTag = () => {
  if (newTag.value.trim() && !publishForm.value.tags.includes(newTag.value.trim())) {
    publishForm.value.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

const addRecommendedTag = (tag) => {
  if (!publishForm.value.tags.includes(tag)) {
    publishForm.value.tags.push(tag)
  }
}

const removeTag = (tag) => {
  const index = publishForm.value.tags.indexOf(tag)
  if (index > -1) {
    publishForm.value.tags.splice(index, 1)
  }
}

// 对话框管理
const openPublishDialog = () => {
  // 检查用户是否登录
  if (!userStore.isAuthenticated) {
    ElMessage.warning('请先登录后再发布动态')
    router.push('/login')
    return
  }
  
  publishDialogVisible.value = true
  publishForm.value = {
    content: '',
    tags: []
  }
}

const handleClose = () => {
  publishDialogVisible.value = false
}

// 发布功能
const submitPublish = async () => {
  if (!publishFormRef.value) return
  
  try {
    await publishFormRef.value.validate()
    publishing.value = true
    
    // 模拟发布过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 创建新动态
    const newFeed = {
      id: Date.now(),
      user: { 
        id: userStore.userInfo.id, 
        name: userStore.userInfo.name, 
        avatar: userStore.userInfo.avatar
      },
      content: publishForm.value.content,
      tags: [...publishForm.value.tags],
      likes: 0,
      comments: 0,
      shares: 0,
      createTime: '刚刚'
    }
    
    // 添加到动态列表开头
    communityFeeds.value.unshift(newFeed)
    
    ElMessage.success('发布成功！')
    publishDialogVisible.value = false
    
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('发布失败，请重试')
  } finally {
    publishing.value = false
  }
}

const refreshFeeds = () => {
  console.log('刷新动态')
  ElMessage.success('动态已刷新')
}
</script>

<style scoped>
.community {
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

button {
  outline: none;
  border: none;
  background: none;
  cursor: pointer;
}
</style>