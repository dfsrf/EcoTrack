<template>
  <div class="challenges">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-eco-dark mb-2">环保挑战中心</h1>
      <p class="text-gray-600">参与环保挑战，养成绿色生活习惯</p>
    </div>

    <!-- 用户挑战统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="eco-card p-6 text-center">
        <div class="text-3xl mb-2">🏆</div>
        <div class="text-2xl font-bold text-eco-dark">
          {{ challengesStore.completedChallenges.length }}
        </div>
        <div class="text-sm text-gray-600">已完成挑战</div>
      </div>
      
      <div class="eco-card p-6 text-center">
        <div class="text-3xl mb-2">🎯</div>
        <div class="text-2xl font-bold text-eco-dark">
          {{ challengesStore.activeChallenges.length }}
        </div>
        <div class="text-sm text-gray-600">进行中挑战</div>
      </div>
      
      <div class="eco-card p-6 text-center">
        <div class="text-3xl mb-2">🔥</div>
        <div class="text-2xl font-bold text-eco-dark">
          {{ challengesStore.totalProgress }}%
        </div>
        <div class="text-sm text-gray-600">总体进度</div>
      </div>
      
      <div class="eco-card p-6 text-center">
        <div class="text-3xl mb-2">💎</div>
        <div class="text-2xl font-bold text-eco-dark">
          {{ totalRewardPoints }}
        </div>
        <div class="text-sm text-gray-600">累计奖励积分</div>
      </div>
    </div>

    <!-- 标签页切换 -->
    <el-tabs v-model="activeTab" class="mb-8">
      <el-tab-pane label="进行中" name="active">
        <div v-if="challengesStore.activeChallenges.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">😴</div>
          <p class="text-gray-600 text-lg">暂无进行中的挑战</p>
          <el-button type="primary" class="mt-4" @click="switchToAvailable">
            去发现新挑战
          </el-button>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="userChallenge in challengesStore.activeChallenges" 
            :key="userChallenge.id"
            class="eco-card p-6"
          >
            <div class="flex items-center gap-3 mb-4">
              <span class="text-2xl">{{ userChallenge.challenge.icon }}</span>
              <div>
                <h3 class="font-semibold text-eco-dark">
                  {{ userChallenge.challenge.title }}
                </h3>
                <p class="text-sm text-gray-600">
                  {{ userChallenge.progress }}/{{ userChallenge.challenge.duration }} 天
                </p>
              </div>
            </div>
            
            <el-progress 
              :percentage="(userChallenge.progress / userChallenge.challenge.duration) * 100"
              :color="userChallenge.challenge.color"
              :show-text="false"
            />
            
            <div class="mt-4">
              <el-button 
                size="small" 
                type="primary" 
                @click="handleUpdateProgress(userChallenge)"
                :disabled="isTodayCheckedIn(userChallenge)"
                :class="{ 'opacity-50 cursor-not-allowed': isTodayCheckedIn(userChallenge) }"
              >
                {{ isTodayCheckedIn(userChallenge) ? '✓ 已打卡' : '今日打卡' }}
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="可参加" name="available">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="challenge in challengesStore.availableChallenges" 
            :key="challenge.id"
            class="eco-card p-6 hover:shadow-xl transition-shadow"
          >
            <div class="flex items-center gap-3 mb-4">
              <span class="text-2xl">{{ challenge.icon }}</span>
              <div>
                <h3 class="font-semibold text-eco-dark">{{ challenge.title }}</h3>
                <el-tag 
                  :type="getDifficultyType(challenge.difficulty)" 
                  size="small"
                >
                  {{ getDifficultyText(challenge.difficulty) }}
                </el-tag>
              </div>
            </div>

            <p class="text-gray-600 text-sm mb-4">{{ challenge.description }}</p>

            <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <el-icon><Calendar /></el-icon>
              <span>{{ challenge.duration }} 天</span>
              <el-icon><User /></el-icon>
              <span>{{ challenge.participants }} 人参与</span>
            </div>

            <el-button 
              type="primary" 
              class="w-full"
              @click="handleJoinChallenge(challenge)"
              :style="{ backgroundColor: challenge.color, borderColor: challenge.color }"
            >
              参加挑战
            </el-button>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="已完成" name="completed">
        <div v-if="challengesStore.completedChallenges.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">🏅</div>
          <p class="text-gray-600 text-lg">还没有完成任何挑战</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="userChallenge in challengesStore.completedChallenges" 
            :key="userChallenge.id"
            class="eco-card p-6"
          >
            <div class="text-center">
              <div class="text-2xl mb-2">🎉</div>
              <h3 class="font-semibold text-eco-dark">
                {{ userChallenge.challenge.title }}
              </h3>
              <p class="text-sm text-eco-green mt-2">
                已完成，获得 {{ userChallenge.challenge.reward.points }} 积分
              </p>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useChallengesStore } from '@/stores/challenges'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const challengesStore = useChallengesStore()
const userStore = useUserStore()

const activeTab = ref('available')

const totalRewardPoints = computed(() => {
  return challengesStore.completedChallenges.reduce((total, uc) => {
    return total + (uc.challenge?.reward?.points || 0)
  }, 0)
})

const getDifficultyType = (difficulty) => {
  const typeMap = {
    'easy': 'success',
    'medium': 'warning',
    'hard': 'danger'
  }
  return typeMap[difficulty] || 'info'
}

const getDifficultyText = (difficulty) => {
  const textMap = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return textMap[difficulty] || '未知'
}

const switchToAvailable = () => {
  activeTab.value = 'available'
}

const handleJoinChallenge = (challenge) => {
  const result = challengesStore.joinChallenge(challenge.id)
  if (result.success) {
    ElMessage.success('成功参加挑战！')
    activeTab.value = 'active'
  } else {
    ElMessage.error(result.message || '参加挑战失败')
  }
}

// 检查今天是否已打卡
const isTodayCheckedIn = (userChallenge) => {
  const today = new Date().toISOString().split('T')[0]
  return userChallenge.lastCheckInDate === today
}

const handleUpdateProgress = (userChallenge) => {
  const result = challengesStore.updateChallengeProgress(userChallenge.id)
  
  if (result.success) {
    if (result.completed) {
      ElMessage.success('🎉 恭喜完成挑战！')
      userStore.addPoints(result.reward.points)
    } else {
      ElMessage.success('今日打卡成功！')
    }
  } else {
    ElMessage.error(result.message || '更新进度失败')
  }
}
</script>