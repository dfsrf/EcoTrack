import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { useUserStore } from './user'

export const useRecordsStore = defineStore('records', () => {
  const userStore = useUserStore()
  // 获取用户特定的存储键
  const getUserStorageKey = () => {
    const userStore = useUserStore()
    const userId = userStore.userInfo?.id || 'anonymous'
    const key = `ecotrack_records_${userId}`
    return key
  }
  
  // 从localStorage获取用户记录
  const getUserRecords = () => {
    try {
      const key = getUserStorageKey()
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('获取用户记录失败:', error)
      return []
    }
  }
  
  // 保存用户记录到localStorage
  const saveUserRecords = (records) => {
    try {
      const key = getUserStorageKey()
      localStorage.setItem(key, JSON.stringify(records))
    } catch (error) {
      console.error('保存用户记录失败:', error)
    }
  }
  
  // 状态
  let currentUserId = userStore.userInfo?.id || 'anonymous'
  const records = ref(getUserRecords()) // 立即加载当前用户的数据

  // 初始化用户数据
  const loadUserRecords = () => {
    const newRecords = getUserRecords()
    records.value = newRecords
  }

  // 检查用户ID是否改变并重新加载
  const checkAndReloadUserData = () => {
    const newUserId = userStore.userInfo?.id || 'anonymous'
    if (newUserId !== currentUserId) {
      currentUserId = newUserId
      records.value = [] // 先清空，再加载
      loadUserRecords()
    }
  }

  // 监听用户状态变化
  const initRecordsStore = () => {
    // 监听用户状态变化，但只在用户ID改变时重新加载数据
    const unwatch = userStore.$subscribe(() => {
      checkAndReloadUserData()
    })
    
    return unwatch
  }

  const carbonCalculator = {
    transport: {
      '地铁': 0.14,      // kg CO2/km
      '公交': 0.22,      // kg CO2/km
      '共享单车': 0,
      '步行': 0,
      '私家车': 0.21,    // kg CO2/km
      '出租车': 0.28,    // kg CO2/km
      '飞机': 0.115,     // kg CO2/km
      '高铁': 0.045       // kg CO2/km
    },
    diet: {
      '牛肉': 27.0,      // kg CO2/kg
      '猪肉': 12.1,      // kg CO2/kg
      '鸡肉': 6.9,       // kg CO2/kg
      '鱼类': 5.4,       // kg CO2/kg
      '素食': 2.0,       // kg CO2/kg
      '素食午餐': 1.2,
      '普通午餐': 3.5,
      '咖啡': 0.4,       // kg CO2/杯
      '奶茶': 0.8        // kg CO2/杯
    },
    energy: {
      '家庭用电': 0.92,  // kg CO2/kWh
      '燃气': 2.18,      // kg CO2/m³
      '自来水': 0.34,     // kg CO2/m³
      '空调用电': 0.92,  // kg CO2/kWh
      '暖气': 2.18       // kg CO2/m³
    },
    shopping: {
      '衣物': 15.0,      // kg CO2/件
      '电子产品': 50.0,  // kg CO2/件
      '书籍': 2.5,       // kg CO2/本
      '日常用品': 3.0,   // kg CO2/件
      '外卖包装': 0.5     // kg CO2/次
    }
  }

  // 计算属性
  const todayCarbon = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return records.value
      .filter(record => record.date === today)
      .reduce((total, record) => {
        const carbon = parseFloat(record.carbon) || 0
        return total + carbon
      }, 0)
  })

  const weekCarbon = computed(() => {
    const weekStart = dayjs().subtract(6, 'day').startOf('day')
    return records.value
      .filter(record => dayjs(record.date).isAfter(weekStart) || dayjs(record.date).isSame(weekStart))
      .reduce((total, record) => {
        const carbon = parseFloat(record.carbon) || 0
        return total + carbon
      }, 0)
  })

  const monthCarbon = computed(() => {
    const monthStart = dayjs().startOf('month')
    return records.value
      .filter(record => dayjs(record.date).isAfter(monthStart) || dayjs(record.date).isSame(monthStart))
      .reduce((total, record) => {
        const carbon = parseFloat(record.carbon) || 0
        return total + carbon
      }, 0)
  })

  const categoryCarbon = computed(() => {
    const categories = {
      transport: 0,
      diet: 0,
      energy: 0,
      shopping: 0
    }
    
    records.value.forEach(record => {
      if (categories.hasOwnProperty(record.category)) {
        const carbon = parseFloat(record.carbon) || 0
        categories[record.category] += carbon
      }
    })
    
    return categories
  })

  const dailyTrend = computed(() => {
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
      const dayCarbon = records.value
        .filter(record => record.date === date)
        .reduce((total, record) => {
          const carbon = parseFloat(record.carbon) || 0
          return total + carbon
        }, 0)
      
      last7Days.push({
        date: dayjs().subtract(i, 'day').format('MM-DD'),
        carbon: parseFloat(dayCarbon.toFixed(1))
      })
    }
    return last7Days
  })

  // 方法
  const calculateCarbon = (category, type, amount) => {
    const factor = carbonCalculator[category]?.[type]
    if (factor === undefined) return 0
    return Math.round((amount * factor) * 100) / 100
  }

  const addRecord = (recordData) => {
    const newRecord = {
      id: `record_${Date.now()}`,
      date: dayjs().format('YYYY-MM-DD'),
      category: recordData.category,
      type: recordData.type,
      amount: recordData.amount || recordData.value, // 兼容两种字段名
      carbon: parseFloat(recordData.carbon) || calculateCarbon(recordData.category, recordData.type, recordData.amount || recordData.value),
      note: recordData.note || ''
    }
    
    records.value.push(newRecord)
    saveUserRecords(records.value) // 自动保存到localStorage
    return newRecord
  }

  const deleteRecord = (recordId) => {
    const index = records.value.findIndex(record => record.id === recordId)
    if (index > -1) {
      records.value.splice(index, 1)
      saveUserRecords(records.value) // 自动保存到localStorage
      return true
    }
    return false
  }

  const getRecordsByDateRange = (startDate, endDate) => {
    return records.value.filter(record => 
      dayjs(record.date).isAfter(startDate) && 
      dayjs(record.date).isBefore(endDate)
    )
  }

  return {
    records,
    carbonCalculator,
    todayCarbon,
    weekCarbon,
    monthCarbon,
    categoryCarbon,
    dailyTrend,
    calculateCarbon,
    addRecord,
    deleteRecord,
    getRecordsByDateRange,
    loadUserRecords,
    initRecordsStore,
    checkAndReloadUserData
  }
})