<template>
  <div class="quick-record-form">
    <el-form :model="formData" label-width="80px">
      <!-- 类型选择 -->
      <el-form-item label="类型">
        <el-select 
          v-model="formData.type" 
          placeholder="请选择类型"
          style="width: 100%"
          @change="handleTypeChange"
        >
          <el-option
            v-for="(info, type) in categoryOptions"
            :key="type"
            :label="`${info.icon} ${info.type}`"
            :value="type"
          />
        </el-select>
      </el-form-item>

      <!-- 数值输入 -->
      <el-form-item :label="getUnitLabel()">
        <el-input-number
          v-model="formData.amount"
          :min="0"
          :step="0.1"
          :precision="2"
          style="width: 100%"
          placeholder="请输入数值"
        />
        <div class="text-xs text-gray-500 mt-1">
          {{ getUnitHint() }}
        </div>
      </el-form-item>

      <!-- 预计碳排放 -->
      <div v-if="estimatedCarbon > 0" class="mb-3 p-2 bg-blue-50 rounded text-sm">
        预计碳排放：<span class="font-bold text-blue-600">{{ estimatedCarbon.toFixed(2) }} kg CO₂</span>
      </div>

      <!-- 提交按钮 -->
      <el-button 
        type="primary" 
        size="small" 
        style="width: 100%" 
        @click="handleSubmit"
        :disabled="!formData.type || !formData.amount"
      >
        快速记录
      </el-button>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useCarbonCalculator } from '@/composables/useCarbonCalculator'
import { useRecordsStore } from '@/stores/records'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['success', 'cancel'])
const props = defineProps({
  initialCategory: {
    type: String,
    default: ''
  }
})

const recordsStore = useRecordsStore()
const { carbonFactors, calculateCarbon } = useCarbonCalculator()

const formData = ref({
  type: '',
  amount: 0
})

// 监听对话框显示状态，重置表单
const resetForm = () => {
  formData.value = {
    type: '',
    amount: 0
  }
}

// 获取所有类型的选项（排除分类）
const categoryOptions = computed(() => {
  const options = {}
  Object.keys(carbonFactors).forEach(category => {
    Object.keys(carbonFactors[category]).forEach(type => {
      const info = carbonFactors[category][type]
      options[`${category}-${type}`] = {
        ...info,
        category: category,
        type: type,
        unit: info.unit || '数量',
        hint: `请输入${info.unit?.split('/')[0] || '数量'}`
      }
    })
  })
  return options
})

// 获取单位标签
const getUnitLabel = () => {
  const selected = categoryOptions.value[formData.value.type]
  return selected?.unit || '数量'
}

// 获取单位提示
const getUnitHint = () => {
  const selected = categoryOptions.value[formData.value.type]
  return selected?.hint || ''
}

// 预计碳排放
const estimatedCarbon = computed(() => {
  if (!formData.value.type || !formData.value.amount) return 0
  
  const selected = categoryOptions.value[formData.value.type]
  if (!selected) return 0
  
  return calculateCarbon(selected.category, selected.type, formData.value.amount)
})

// 处理类型变化
const handleTypeChange = () => {
  formData.value.amount = 0
}

// 初始化时根据category设置默认选项
const initializeFromCategory = () => {
  if (props.initialCategory && carbonFactors[props.initialCategory]) {
    // 获取该分类下的第一个选项作为默认值
    const firstType = Object.keys(carbonFactors[props.initialCategory])[0]
    if (firstType) {
      const optionKey = `${props.initialCategory}-${firstType}`
      formData.value.type = optionKey
    }
  }
}

// 监听category变化
watch(() => props.initialCategory, (newCategory, oldCategory) => {
  if (newCategory) {
    if (newCategory !== oldCategory) {
      // 重置表单并设置默认选项
      resetForm()
    }
    // 延迟设置默认选项，确保重置完成且组件已渲染
    setTimeout(() => {
      initializeFromCategory()
    }, 50)
  }
}, { immediate: true })

// 提交表单
const handleSubmit = () => {
  if (!formData.value.type || !formData.value.amount) return

  const selected = categoryOptions.value[formData.value.type]
  if (!selected) return

  const record = {
    id: Date.now(),
    category: selected.category,
    type: selected.type,
    value: formData.value.amount,
    carbon: estimatedCarbon.value,
    timestamp: new Date().toISOString()
  }

  recordsStore.addRecord(record)
  
  // 重置表单
  formData.value = {
    type: '',
    amount: 0
  }

  emit('success', record)
  ElMessage.success('快速记录成功！')
  emit('submit', record)
}
</script>

<style scoped>
.quick-record-form {
  max-width: 400px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>