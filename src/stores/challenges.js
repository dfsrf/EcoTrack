import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'

export const useChallengesStore = defineStore('challenges', () => {
  const userStore = useUserStore()
  
  // 获取用户特定的存储键
  const getUserStorageKey = () => {
    const userId = userStore.userInfo?.id || 'anonymous'
    return `ecotrack_challenges_${userId}`
  }
  
  // 从localStorage获取用户挑战数据
  const getUserChallenges = () => {
    try {
      const key = getUserStorageKey()
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('获取用户挑战失败:', error)
      return []
    }
  }
  
  // 保存用户挑战数据到localStorage
  const saveUserChallenges = (challenges) => {
    try {
      const key = getUserStorageKey()
      localStorage.setItem(key, JSON.stringify(challenges))
    } catch (error) {
      console.error('保存用户挑战失败:', error)
    }
  }
  // 状态
  const challenges = ref([
    {
      id: 'challenge_001',
      title: '一周无外卖挑战',
      description: '连续7天不点外卖，自己做饭或选择堂食',
      type: 'daily',
      duration: 7,
      difficulty: 'medium',
      participants: 1234,
      reward: {
        points: 200,
        badge: { id: 'badge_002', name: '低碳饮食', icon: '🍽️' }
      },
      icon: '🍱',
      color: '#10b981'
    },
    {
      id: 'challenge_002',
      title: '绿色出行月',
      description: '一个月内主要使用公共交通、骑行或步行',
      type: 'monthly',
      duration: 30,
      difficulty: 'hard',
      participants: 856,
      reward: {
        points: 500,
        badge: { id: 'badge_003', name: '绿色先锋', icon: '🚴' }
      },
      icon: '🚇',
      color: '#3b82f6'
    },
    {
      id: 'challenge_003',
      title: '节能达人',
      description: '连续一周每日用电量低于5度',
      type: 'daily',
      duration: 7,
      difficulty: 'easy',
      participants: 2103,
      reward: {
        points: 100,
        badge: { id: 'badge_004', name: '节能卫士', icon: '💡' }
      },
      icon: '⚡',
      color: '#f59e0b'
    },
    {
      id: 'challenge_004',
      title: '素食主义者',
      description: '坚持一周只吃素食',
      type: 'daily',
      duration: 7,
      difficulty: 'medium',
      participants: 654,
      reward: {
        points: 150,
        badge: { id: 'badge_005', name: '素食达人', icon: '🥬' }
      },
      icon: '🥗',
      color: '#22c55e'
    }
  ])

  let currentUserId = userStore.userInfo?.id || 'anonymous'
  const userChallenges = ref(getUserChallenges()) // 立即加载当前用户的挑战数据

  // 初始化用户挑战数据
  const loadUserChallenges = () => {
    const newChallenges = getUserChallenges()
    userChallenges.value = newChallenges
  }

  // 检查用户ID是否改变并重新加载
  const checkAndReloadUserData = () => {
    const newUserId = userStore.userInfo?.id || 'anonymous'
    if (newUserId !== currentUserId) {
      currentUserId = newUserId
      loadUserChallenges()
    }
  }

  // 监听用户状态变化
  const initChallengesStore = () => {
    // 监听用户状态变化，但只在用户ID改变时重新加载数据
    const unwatch = userStore.$subscribe(() => {
      checkAndReloadUserData()
    })
    
    return unwatch
  }

  // 计算属性
  const availableChallenges = computed(() => {
    const userChallengeIds = userChallenges.value.map(uc => uc.challengeId)
    return challenges.value.filter(challenge => !userChallengeIds.includes(challenge.id))
  })

  const activeChallenges = computed(() => {
    return userChallenges.value
      .filter(uc => uc.status === 'in_progress')
      .map(uc => {
        const challenge = challenges.value.find(c => c.id === uc.challengeId)
        return {
          ...uc,
          challenge
        }
      })
  })

  const completedChallenges = computed(() => {
    return userChallenges.value
      .filter(uc => uc.status === 'completed')
      .map(uc => {
        const challenge = challenges.value.find(c => c.id === uc.challengeId)
        return {
          ...uc,
          challenge
        }
      })
  })

  const totalProgress = computed(() => {
    if (activeChallenges.value.length === 0) return 0
    
    const totalProgress = activeChallenges.value.reduce((sum, ac) => {
      return sum + (ac.progress / ac.challenge.duration) * 100
    }, 0)
    
    return Math.round(totalProgress / activeChallenges.value.length)
  })

  // 方法
  const joinChallenge = (challengeId) => {
    const existingChallenge = userChallenges.value.find(uc => uc.challengeId === challengeId)
    if (existingChallenge) {
      return { success: false, message: '您已经参加此挑战' }
    }

    const newUserChallenge = {
      id: `user_challenge_${Date.now()}`,
      challengeId,
      startDate: new Date().toISOString().split('T')[0],
      progress: 0,
      status: 'in_progress',
      completedDays: [],
      lastCheckInDate: null,
      dailyCheckIns: []
    }

    userChallenges.value.push(newUserChallenge)
    saveUserChallenges(userChallenges.value) // 自动保存
    return { success: true, data: newUserChallenge }
  }

  const updateChallengeProgress = (userChallengeId) => {
    const userChallenge = userChallenges.value.find(uc => uc.id === userChallengeId)
    if (!userChallenge || userChallenge.status !== 'in_progress') {
      return { success: false, message: '挑战不存在或已结束' }
    }

    const challenge = challenges.value.find(c => c.id === userChallenge.challengeId)
    const today = new Date().toISOString().split('T')[0]
    
    // 检查今天是否已经打卡
    if (userChallenge.lastCheckInDate === today) {
      return { success: false, message: '今日已打卡，请明天再来！' }
    }
    
    // 执行打卡
    userChallenge.lastCheckInDate = today
    userChallenge.dailyCheckIns.push(today)
    
    // 计算新的进度天数
    const dayCompleted = userChallenge.dailyCheckIns.length
    
    if (!userChallenge.completedDays.includes(dayCompleted)) {
      userChallenge.completedDays.push(dayCompleted)
      userChallenge.progress = userChallenge.completedDays.length

      // 检查是否完成挑战
      if (userChallenge.progress >= challenge.duration) {
        userChallenge.status = 'completed'
        saveUserChallenges(userChallenges.value) // 保存
        return { 
          success: true, 
          completed: true, 
          reward: challenge.reward 
        }
      }
    }

    saveUserChallenges(userChallenges.value) // 自动保存
    return { success: true, completed: false }
  }

  const quitChallenge = (userChallengeId) => {
    const index = userChallenges.value.findIndex(uc => uc.id === userChallengeId)
    if (index > -1) {
      userChallenges.value.splice(index, 1)
      return true
    }
    return false
  }

  const getChallengeById = (challengeId) => {
    return challenges.value.find(challenge => challenge.id === challengeId)
  }

  return {
    challenges,
    userChallenges,
    availableChallenges,
    activeChallenges,
    completedChallenges,
    totalProgress,
    joinChallenge,
    updateChallengeProgress,
    quitChallenge,
    getChallengeById,
    loadUserChallenges,
    initChallengesStore
  }
})