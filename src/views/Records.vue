<template>
  <div class="records">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-eco-dark mb-2">碳足迹记录</h1>
      <p class="text-gray-600">记录你的日常碳排放，追踪环保足迹</p>
    </div>

    <!-- 碳排放计算器 -->
    <div class="eco-card p-6 mb-6">
      <h2 class="text-xl font-semibold text-eco-dark mb-4">碳排放计算器</h2>
      <CarbonCalculator @record-added="handleRecordAdded" />
    </div>

    <!-- 统计信息 -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
      <div class="eco-card p-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-eco-dark">
            {{ recordsStore.records.length }}
          </div>
          <div class="text-sm text-gray-600">总记录数</div>
        </div>
      </div>
      
      <div class="eco-card p-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-eco-dark">
            {{ (recordsStore.todayCarbon || 0).toFixed(2) }} kg
          </div>
          <div class="text-sm text-gray-600">今日排放</div>
        </div>
      </div>
      
      <div class="eco-card p-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-eco-dark">
            {{ (recordsStore.weekCarbon || 0).toFixed(2) }} kg
          </div>
          <div class="text-sm text-gray-600">本周排放</div>
        </div>
      </div>
      
      <div class="eco-card p-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-eco-dark">
            {{ (recordsStore.monthCarbon || 0).toFixed(2) }} kg
          </div>
          <div class="text-sm text-gray-600">本月排放</div>
        </div>
      </div>
    </div>

    <!-- 记录列表 -->
    <div class="eco-card p-6">
      <h3 class="text-lg font-semibold text-eco-dark mb-4">记录详情</h3>
      
      <el-table :data="recordsStore.records" style="width: 100%">
        <el-table-column prop="date" label="日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)">
              {{ getCategoryName(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            {{ row.type }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="数值" width="100">
          <template #default="{ row }">
            {{ row.amount }}
          </template>
        </el-table-column>
        <el-table-column prop="carbon" label="碳排放" width="120">
          <template #default="{ row }">
            <span :class="getCarbonTextClass(row.carbon)">
              {{ row.carbon }} kg
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="danger" 
              link
              @click="deleteRecord(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { useRecordsStore } from '@/stores/records'
import { ElMessage } from 'element-plus'
import CarbonCalculator from '@/components/common/CarbonCalculator.vue'
import dayjs from 'dayjs'

const recordsStore = useRecordsStore()

const formatDate = (date) => {
  return dayjs(date).format('MM-DD')
}

const getCategoryName = (category) => {
  const names = {
    transport: '交通',
    diet: '饮食',
    energy: '能源',
    shopping: '购物'
  }
  return names[category] || category
}

const getCategoryTagType = (category) => {
  const types = {
    transport: 'primary',
    diet: 'success',
    energy: 'warning',
    shopping: 'info'
  }
  return types[category] || ''
}

const getCarbonTextClass = (carbon) => {
  if (carbon < 2) return 'text-green-600'
  if (carbon < 5) return 'text-yellow-600'
  if (carbon < 10) return 'text-orange-600'
  return 'text-red-600'
}

const deleteRecord = (recordId) => {
  const success = recordsStore.deleteRecord(recordId)
  if (success) {
    console.log('删除成功')
  }
}

const handleRecordAdded = (record) => {
  console.log('新记录已添加:', record)
  // 记录已在 CarbonCalculator 组件中添加到 store
  ElMessage.success('碳足迹记录成功！')
}
</script>