import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChallengesStore = defineStore('challenges', () => {
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

  const userChallenges = ref([
    {
      id: 'user_challenge_001',
      challengeId: 'challenge_001',
      startDate: '2024-03-10',
      progress: 5,
      status: 'in_progress', // 'not_started', 'in_progress', 'completed', 'expired'
      completedDays: [1, 2, 3, 4, 5], // 完成的天数
      lastCheckInDate: '2024-03-15', // 最后打卡日期
      dailyCheckIns: ['2024-03-11', '2024-03-12', '2024-03-13', '2024-03-14', '2024-03-15'] // 每日打卡记录
    },
    {
      id: 'user_challenge_002',
      challengeId: 'challenge_003',
      startDate: '2024-03-14',
      progress: 1,
      status: 'in_progress',
      completedDays: [1],
      lastCheckInDate: '2024-03-14',
      dailyCheckIns: ['2024-03-14']
    }
  ])

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
        return { 
          success: true, 
          completed: true, 
          reward: challenge.reward 
        }
      }
    }

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
    getChallengeById
  }
})