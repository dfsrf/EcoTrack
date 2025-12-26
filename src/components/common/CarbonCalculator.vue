<template>
  <div class="carbon-calculator">
    <el-form :model="formData" label-width="80px" @submit.prevent="handleSubmit">
      <!-- 分类选择 -->
      <el-form-item label="分类">
        <el-radio-group v-model="selectedCategory" @change="handleCategoryChange">
          <el-radio-button label="transport">
            <span class="mr-1">🚇</span> 交通出行
          </el-radio-button>
          <el-radio-button label="diet">
            <span class="mr-1">🍱</span> 饮食消费
          </el-radio-button>
          <el-radio-button label="energy">
            <span class="mr-1">💡</span> 能源消耗
          </el-radio-button>
          <el-radio-button label="shopping">
            <span class="mr-1">🛍️</span> 购物消费
          </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 具体类型选择 -->
      <el-form-item label="类型">
        <el-select 
          v-model="selectedType" 
          placeholder="请选择具体类型"
          style="width: 100%"
          @change="handleTypeChange"
        >
          <el-option
            v-for="(info, type) in categoryOptions"
            :key="type"
            :label="`${info.icon} ${type}`"
            :value="type"
          />
        </el-select>
      </el-form-item>

      <!-- 数值输入 -->
      <el-form-item :label="getUnitLabel()">
        <el-input-number
          v-model="inputValue"
          :min="0"
          :step="0.1"
          :precision="2"
          style="width: 100%"
          placeholder="请输入数值"
          @change="handleValueChange"
        />
        <div class="text-xs text-gray-500 mt-1">
          {{ getUnitHint() }}
        </div>
      </el-form-item>

      <!-- 计算结果显示 -->
      <div v-if="calculatedCarbon > 0" class="mb-4 p-3 bg-green-50 rounded-lg">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">预计碳排放：</span>
          <span class="text-lg font-bold text-green-600">{{ calculatedCarbon.toFixed(2) }} kg CO₂</span>
        </div>
        <div class="text-xs text-gray-500 mt-1">
          等级：<el-tag :type="getLevelType()" size="small">{{ getCarbonLevel() }}</el-tag>
        </div>
      </div>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button 
          type="primary" 
          style="width: 100%" 
          @click="handleSubmit"
          :disabled="!canSubmit"
        >
          记录碳足迹
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCarbonCalculator } from '@/composables/useCarbonCalculator'
import { useRecordsStore } from '@/stores/records'
import { ElMessage } from 'element-plus'

const emit = defineEmits('submit')

const recordsStore = useRecordsStore()
const { carbonFactors, calculateCarbon, getCarbonLevel } = useCarbonCalculator()

// 表单数据
const formData = ref({})
const selectedCategory = ref('transport')
const selectedType = ref('')
const inputValue = ref(0)
const calculatedCarbon = ref(0)

// 分类选项
const categoryOptions = computed(() => {
  return carbonFactors[selectedCategory.value] || {}
})

// 获取单位标签
const getUnitLabel = () => {
  const typeInfo = categoryOptions.value[selectedType.value]
  return typeInfo?.unit || '数量'
}

// 获取单位提示
const getUnitHint = () => {
  const typeInfo = categoryOptions.value[selectedType.value]
  return typeInfo?.hint || ''
}

// 获取碳排等级类型
const getLevelType = () => {
  const level = getCarbonLevel(calculatedCarbon.value)
  const levelMap = {
    '极低': 'success',
    '低': 'success', 
    '中等': 'warning',
    '高': 'danger',
    '极高': 'danger'
  }
  return levelMap[level] || 'info'
}

// 是否可以提交
const canSubmit = computed(() => {
  return selectedType.value && inputValue.value > 0
})

// 处理分类变化
const handleCategoryChange = () => {
  selectedType.value = ''
  inputValue.value = 0
  calculatedCarbon.value = 0
}

// 处理类型变化
const handleTypeChange = () => {
  inputValue.value = 0
  calculatedCarbon.value = 0
}

// 处理数值变化
const handleValueChange = () => {
  if (selectedType.value && inputValue.value > 0) {
    calculatedCarbon.value = calculateCarbon(
      selectedCategory.value,
      selectedType.value,
      inputValue.value
    )
  } else {
    calculatedCarbon.value = 0
  }
}

// 提交表单
const handleSubmit = () => {
  if (!canSubmit.value) return

  const record = {
    id: Date.now(),
    category: selectedCategory.value,
    type: selectedType.value,
    value: inputValue.value,
    carbon: calculatedCarbon.value,
    timestamp: new Date().toISOString(),
    level: getCarbonLevel(calculatedCarbon.value)
  }

  recordsStore.addRecord(record)
  
  // 重置表单
  selectedType.value = ''
  inputValue.value = 0
  calculatedCarbon.value = 0

  ElMessage.success('碳足迹记录成功！')
  emit('submit', record)
}

// 监听输入变化
watch([selectedType, inputValue], () => {
  handleValueChange()
})
</script>

<style scoped>
.carbon-calculator {
  max-width: 500px;
}

:deep(.el-radio-button__inner) {
  padding: 8px 16px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>