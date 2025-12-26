import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

export const useRecordsStore = defineStore('records', () => {
  // 状态
  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  
  const records = ref([
    {
      id: 'record_001',
      date: today,
      category: 'transport',
      type: '地铁',
      amount: 15, // 公里
      carbon: 2.1, // kg CO2
      note: '上班通勤'
    },
    {
      id: 'record_002',
      date: today,
      category: 'diet',
      type: '素食午餐',
      amount: 1,
      carbon: 1.2,
      note: '素食环保餐'
    },
    {
      id: 'record_003',
      date: yesterday,
      category: 'energy',
      type: '家庭用电',
      amount: 5.2, // kWh
      carbon: 4.8,
      note: '日常用电'
    }
  ])

  const carbonCalculator = {
    transport: {
      '地铁': 0.14,      // kg CO2/km
      '公交': 0.22,      // kg CO2/km
      '共享单车': 0,
      '步行': 0,
      '私家车': 0.21,    // kg CO2/km
      '出租车': 0.28,    // kg CO2/km
      '飞机': 0.115      // kg CO2/km
    },
    diet: {
      '牛肉': 27.0,      // kg CO2/kg
      '猪肉': 12.1,      // kg CO2/kg
      '鸡肉': 6.9,       // kg CO2/kg
      '鱼类': 5.4,       // kg CO2/kg
      '素食': 2.0,       // kg CO2/kg
      '素食午餐': 1.2,
      '普通午餐': 3.5
    },
    energy: {
      '家庭用电': 0.92,  // kg CO2/kWh
      '燃气': 2.18,      // kg CO2/m³
      '自来水': 0.34     // kg CO2/m³
    },
    shopping: {
      '衣物': 15.0,      // kg CO2/件
      '电子产品': 50.0,  // kg CO2/件
      '书籍': 2.5,       // kg CO2/本
      '日常用品': 3.0    // kg CO2/件
    }
  }

  // 计算属性
  const todayCarbon = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return records.value
      .filter(record => record.date === today)
      .reduce((total, record) => total + (record.carbon || 0), 0)
  })

  const weekCarbon = computed(() => {
    const weekStart = dayjs().subtract(6, 'day').startOf('day')
    return records.value
      .filter(record => dayjs(record.date).isAfter(weekStart) || dayjs(record.date).isSame(weekStart))
      .reduce((total, record) => total + (record.carbon || 0), 0)
  })

  const monthCarbon = computed(() => {
    const monthStart = dayjs().startOf('month')
    return records.value
      .filter(record => dayjs(record.date).isAfter(monthStart) || dayjs(record.date).isSame(monthStart))
      .reduce((total, record) => total + (record.carbon || 0), 0)
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
        categories[record.category] += record.carbon
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
        .reduce((total, record) => total + record.carbon, 0)
      
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
      ...recordData,
      carbon: calculateCarbon(recordData.category, recordData.type, recordData.amount)
    }
    
    records.value.push(newRecord)
    return newRecord
  }

  const deleteRecord = (recordId) => {
    const index = records.value.findIndex(record => record.id === recordId)
    if (index > -1) {
      records.value.splice(index, 1)
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
    getRecordsByDateRange
  }
})