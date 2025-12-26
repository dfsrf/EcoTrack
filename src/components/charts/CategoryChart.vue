<template>
  <div class="category-chart">
    <v-chart 
      :option="chartOption" 
      :style="{ height: '100%', width: '100%' }"
      autoresize
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legend'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'

// 注册必要的组件
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  height: {
    type: String,
    default: '300px'
  }
})

// 图表配置
const chartOption = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'middle',
        textStyle: {
          color: '#999'
        }
      }
    }
  }

  return {
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const total = props.data.reduce((sum, item) => sum + item.value, 0)
        const percentage = ((params.value / total) * 100).toFixed(1)
        return `${params.name}: ${params.value} kg (${percentage}%)`
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151'
      }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemGap: 12,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        color: '#374151',
        fontSize: 12
      },
      formatter: function(name) {
        const item = props.data.find(d => d.name === name)
        return item ? `${name} (${item.value}kg)` : name
      }
    },
    series: [
      {
        name: '碳排放分类',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            formatter: function(params) {
              const total = props.data.reduce((sum, item) => sum + item.value, 0)
              const percentage = ((params.value / total) * 100).toFixed(1)
              return `${params.name}\n${percentage}%`
            },
            color: '#374151'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: props.data.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: item.color
          }
        }))
      }
    ]
  }
})
</script>

<style scoped>
.category-chart {
  height: v-bind(height);
  width: 100%;
}
</style>