import { ref, computed } from 'vue'
import { useRecordsStore } from '@/stores/records'

// 碳排放因子数据库
const carbonFactors = {
  transport: {
    '地铁': { factor: 0.14, unit: 'kgCO₂/km', icon: '🚇' },
    '公交': { factor: 0.22, unit: 'kgCO₂/km', icon: '🚌' },
    '共享单车': { factor: 0, unit: 'kgCO₂/km', icon: '🚲' },
    '步行': { factor: 0, unit: 'kgCO₂/km', icon: '🚶' },
    '私家车': { factor: 0.21, unit: 'kgCO₂/km', icon: '🚗' },
    '出租车': { factor: 0.28, unit: 'kgCO₂/km', icon: '🚕' },
    '飞机': { factor: 0.115, unit: 'kgCO₂/km', icon: '✈️' },
    '高铁': { factor: 0.045, unit: 'kgCO₂/km', icon: '🚄' }
  },
  diet: {
    '牛肉': { factor: 27.0, unit: 'kgCO₂/kg', icon: '🥩' },
    '猪肉': { factor: 12.1, unit: 'kgCO₂/kg', icon: '🍖' },
    '鸡肉': { factor: 6.9, unit: 'kgCO₂/kg', icon: '🍗' },
    '鱼类': { factor: 5.4, unit: 'kgCO₂/kg', icon: '🐟' },
    '素食': { factor: 2.0, unit: 'kgCO₂/kg', icon: '🥬' },
    '素食午餐': { factor: 1.2, unit: 'kgCO₂/份', icon: '🥗' },
    '普通午餐': { factor: 3.5, unit: 'kgCO₂/份', icon: '🍱' },
    '咖啡': { factor: 0.4, unit: 'kgCO₂/杯', icon: '☕' },
    '奶茶': { factor: 0.8, unit: 'kgCO₂/杯', icon: '🧋' }
  },
  energy: {
    '家庭用电': { factor: 0.92, unit: 'kgCO₂/kWh', icon: '💡' },
    '燃气': { factor: 2.18, unit: 'kgCO₂/m³', icon: '🔥' },
    '自来水': { factor: 0.34, unit: 'kgCO₂/m³', icon: '💧' },
    '空调用电': { factor: 0.92, unit: 'kgCO₂/kWh', icon: '❄️' },
    '暖气': { factor: 2.18, unit: 'kgCO₂/m³', icon: '🔥' }
  },
  shopping: {
    '衣物': { factor: 15.0, unit: 'kgCO₂/件', icon: '👔' },
    '电子产品': { factor: 50.0, unit: 'kgCO₂/件', icon: '📱' },
    '书籍': { factor: 2.5, unit: 'kgCO₂/本', icon: '📚' },
    '日常用品': { factor: 3.0, unit: 'kgCO₂/件', icon: '🧴' },
    '外卖包装': { factor: 0.5, unit: 'kgCO₂/次', icon: '🥡' }
  }
}

// 环保建议数据库
const ecoTips = {
  high: [
    '考虑使用公共交通代替私家车出行',
    '减少红肉消费，增加素食比例',
    '及时关闭不用的电器，避免待机能耗',
    '选择本地产品，减少运输碳排放'
  ],
  medium: [
    '合理安排出行，合并多个目的地',
    '选择应季蔬菜水果，减少温室种植',
    '使用节能电器，提高能效等级',
    '减少不必要的购物，理性消费'
  ],
  low: [
    '保持良好的环保习惯，继续努力！',
    '可以分享你的环保经验给朋友',
    '参与更多环保挑战，获得成就',
    '关注环保新闻，学习更多知识'
  ]
}

export function useCarbonCalculator() {
  const recordsStore = useRecordsStore()
  
  // 当前选择的分类
  const selectedCategory = ref('transport')
  
  // 当前选择的类型
  const selectedType = ref('')
  
  // 输入数值
  const inputValue = ref('')
  
  // 计算结果
  const calculatedCarbon = ref(0)
  
  // 获取当前分类的所有选项
  const currentCategoryOptions = computed(() => {
    return carbonFactors[selectedCategory.value] || {}
  })
  
  // 获取当前选择的因子信息
  const selectedFactorInfo = computed(() => {
    if (!selectedType.value || !currentCategoryOptions.value[selectedType.value]) {
      return null
    }
    return currentCategoryOptions.value[selectedType.value]
  })
  
  // 计算碳排放
  const calculateCarbon = () => {
    if (!selectedFactorInfo.value || !inputValue.value) {
      calculatedCarbon.value = 0
      return 0
    }
    
    const amount = parseFloat(inputValue.value)
    if (isNaN(amount) || amount <= 0) {
      calculatedCarbon.value = 0
      return 0
    }
    
    const carbon = amount * selectedFactorInfo.value.factor
    calculatedCarbon.value = Math.round(carbon * 100) / 100
    return calculatedCarbon.value
  }
  
  // 添加记录
  const addRecord = (note = '') => {
    const carbon = calculateCarbon()
    if (carbon <= 0) {
      return { success: false, message: '请输入有效的数值' }
    }
    
    const record = recordsStore.addRecord({
      category: selectedCategory.value,
      type: selectedType.value,
      amount: parseFloat(inputValue.value),
      note
    })
    
    // 重置表单
    resetForm()
    
    return { success: true, data: record }
  }
  
  // 重置表单
  const resetForm = () => {
    selectedType.value = ''
    inputValue.value = ''
    calculatedCarbon.value = 0
  }
  
  // 获取环保建议
  const getEcoTips = (dailyCarbon) => {
    if (dailyCarbon > 10) {
      return ecoTips.high[Math.floor(Math.random() * ecoTips.high.length)]
    } else if (dailyCarbon > 5) {
      return ecoTips.medium[Math.floor(Math.random() * ecoTips.medium.length)]
    } else {
      return ecoTips.low[Math.floor(Math.random() * ecoTips.low.length)]
    }
  }
  
  // 获取碳排放等级
  const getCarbonLevel = (carbon) => {
    if (carbon < 2) return { level: 'low', text: '低碳', color: '#10b981' }
    if (carbon < 5) return { level: 'medium', text: '中等', color: '#f59e0b' }
    if (carbon < 10) return { level: 'high', text: '较高', color: '#ef4444' }
    return { level: 'very_high', text: '很高', color: '#dc2626' }
  }
  
  // 根据分类、类型、数值计算碳排放（不依赖当前表单状态）
  const calculateCarbonByCategory = (category, type, amount) => {
    const factor = carbonFactors[category]?.[type]?.factor
    if (factor === undefined || amount <= 0) return 0
    return Math.round((amount * factor) * 100) / 100
  }
  
  return {
    // 数据
    carbonFactors,
    selectedCategory,
    selectedType,
    inputValue,
    calculatedCarbon,
    
    // 计算属性
    currentCategoryOptions,
    selectedFactorInfo,
    
    // 方法
    calculateCarbon,
    addRecord,
    resetForm,
    getEcoTips,
    getCarbonLevel,
    calculateCarbonByCategory
  }
}