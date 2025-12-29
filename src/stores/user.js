import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 认证状态
  const isAuthenticated = ref(false)
  const token = ref(null)

  // 用户基本信息
  const userInfo = ref({
    id: '',
    name: '',
    email: '',
    avatar: '/avatars/default.jpg',
    joinDate: '',
    level: 1
  })
  
  const points = ref(0)
  const badges = ref([
    { id: 'badge_001', name: '新手入门', icon: '🌱', obtained: false },
    { id: 'badge_002', name: '一周低碳', icon: '🌿', obtained: false },
    { id: 'badge_003', name: '月度冠军', icon: '🏆', obtained: false },
    { id: 'badge_004', name: '环保卫士', icon: '🌍', obtained: false }
  ])

  // 计算属性
  const totalCarbonSaved = computed(() => {
    // 模拟计算已节省的碳排放量
    return 0
  })

  const levelProgress = computed(() => {
    return (points.value % 500) / 500 * 100
  })

  // 认证相关方法
  const login = async (credentials) => {
    try {
      // 模拟登录请求
      const { email, password } = credentials
      
      // 模拟验证逻辑
      if (email && password) {
        // 模拟成功登录
        const userData = {
          id: 'user_' + email.replace(/[^a-zA-Z0-9]/g, '_'), // 使用email作为唯一标识
          name: credentials.name || email.split('@')[0],
          email: email,
          avatar: '/avatars/default.jpg',
          joinDate: new Date().toISOString().split('T')[0],
          level: 1
        }
        
        userInfo.value = userData
        token.value = 'mock_token_' + Date.now()
        isAuthenticated.value = true
        points.value = 0
        
        // 设置一个徽章作为欢迎礼物
        badges.value[0].obtained = true
        
        // 保存到localStorage
        localStorage.setItem('userToken', token.value)
        localStorage.setItem('userInfo', JSON.stringify(userData))
        
        // 触发重新加载用户数据（如果需要）
        return { success: true, message: '登录成功' }
      } else {
        return { success: false, message: '邮箱和密码不能为空' }
      }
    } catch (error) {
      return { success: false, message: '登录失败，请重试' }
    }
  }

  const register = async (userData) => {
    try {
      const { name, email, password, confirmPassword } = userData
      
      if (!name || !email || !password) {
        return { success: false, message: '请填写完整信息' }
      }
      
      if (password !== confirmPassword) {
        return { success: false, message: '两次密码输入不一致' }
      }
      
      if (password.length < 6) {
        return { success: false, message: '密码长度至少6位' }
      }
      
      // 模拟注册成功后自动登录
      return await login({ email, password })
    } catch (error) {
      return { success: false, message: '注册失败，请重试' }
    }
  }

  const logout = () => {
    // 不删除用户的记录数据，保留数据持久化
    // 只是清理当前会话的认证信息
    isAuthenticated.value = false
    token.value = null
    userInfo.value = {
      id: '',
      name: '',
      email: '',
      avatar: '/avatars/default.jpg',
      joinDate: '',
      level: 1
    }
    points.value = 0
    badges.value = badges.value.map(badge => ({ ...badge, obtained: false }))
    
    // 清除认证信息
    localStorage.removeItem('userToken')
    localStorage.removeItem('userInfo')
  }

  const checkAuth = () => {
    const savedToken = localStorage.getItem('userToken')
    const savedUserInfo = localStorage.getItem('userInfo')
    
    if (savedToken && savedUserInfo) {
      try {
        token.value = savedToken
        userInfo.value = JSON.parse(savedUserInfo)
        isAuthenticated.value = true
        points.value = 100 // 模拟一些初始积分
        return true
      } catch (error) {
        console.error('User Store - 检查认证失败:', error)
        logout()
        return false
      }
    }
    return false
  }

  // 用户数据相关方法
  const addPoints = (amount) => {
    points.value += amount
    
    // 检查是否升级
    const newLevel = Math.floor(points.value / 500) + 1
    if (newLevel > userInfo.value.level) {
      userInfo.value.level = newLevel
      return { levelUp: true, newLevel }
    }
    return { levelUp: false }
  }

  const addBadge = (badge) => {
    const existingBadge = badges.value.find(b => b.id === badge.id)
    if (existingBadge && !existingBadge.obtained) {
      existingBadge.obtained = true
      return true
    }
    return false
  }

  return {
    // 认证状态
    isAuthenticated,
    token,
    
    // 用户信息
    userInfo,
    points,
    badges,
    totalCarbonSaved,
    levelProgress,
    
    // 认证方法
    login,
    register,
    logout,
    checkAuth,
    
    // 用户数据方法
    addPoints,
    addBadge
  }
})