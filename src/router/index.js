import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 认证页面
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { title: '登录', guest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
      meta: { title: '注册', guest: true }
    },
    
    // 主应用页面
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { title: '仪表盘', requiresAuth: true }
    },
    {
      path: '/records',
      name: 'records',
      component: () => import('@/views/Records.vue'),
      meta: { title: '碳足迹记录', requiresAuth: true }
    },
    {
      path: '/challenges',
      name: 'challenges',
      component: () => import('@/views/Challenges.vue'),
      meta: { title: '挑战中心', requiresAuth: true }
    },
    {
      path: '/community',
      name: 'community',
      component: () => import('@/views/Community.vue'),
      meta: { title: '社区动态', requiresAuth: true }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - EcoTrack`
  }
  
  // 检查认证状态，确保用户信息是最新的
  const hasValidToken = localStorage.getItem('userToken')
  const hasUserInfo = localStorage.getItem('userInfo')
  const isAuthenticated = hasValidToken && hasUserInfo
  
  // 需要认证但未登录，重定向到登录页
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 确保用户状态被重置
    userStore.isAuthenticated = false
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  
  // 已登录用户访问 guest 页面，重定向到首页
  if (to.meta.guest && isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }
  
  next()
})

export default router