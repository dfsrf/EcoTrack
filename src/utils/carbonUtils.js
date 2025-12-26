import dayjs from 'dayjs'

// 碳排放等级分类
export const carbonLevels = {
  excellent: { max: 2, color: '#10b981', text: '优秀', icon: '🌱' },
  good: { max: 5, color: '#22c55e', text: '良好', icon: '🌿' },
  moderate: { max: 10, color: '#f59e0b', text: '中等', icon: '🍂' },
  high: { max: 15, color: '#ef4444', text: '较高', icon: '🔥' },
  severe: { max: Infinity, color: '#dc2626', text: '严重', icon: '🚨' }
}

// 获取碳排放等级
export function getCarbonLevel(carbon) {
  for (const [key, level] of Object.entries(carbonLevels)) {
    if (carbon <= level.max) {
      return { key, ...level }
    }
  }
  return carbonLevels.severe
}

// 格式化碳排放数值
export function formatCarbon(value) {
  if (value < 0.01) return '< 0.01'
  return value.toFixed(2)
}

// 计算减排量（与平均值的对比）
export function calculateReduction(currentCarbon, averageCarbon) {
  if (averageCarbon === 0) return { amount: 0, percentage: 0 }
  
  const reduction = averageCarbon - currentCarbon
  const percentage = (reduction / averageCarbon) * 100
  
  return {
    amount: parseFloat(reduction.toFixed(2)),
    percentage: parseFloat(percentage.toFixed(1))
  }
}