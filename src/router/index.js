import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import Layout from '@/views/Layout.vue'
import DashboardView from '@/views/DashboardView.vue'
import AttendanceView from '@/views/AttendanceView.vue'
import ScheduleView from '@/views/ScheduleView.vue'
import ClassView from '@/views/ClassView.vue'
import AccountView from '@/views/AccountView.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import AdminClassOverview from '@/views/AdminClassOverview.vue'
import VerifyEmailView from '@/views/VerifyEmailView.vue'

const useAuth = import.meta.env.VITE_USE_AUTH === 'true';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register/:role?',
      name: 'register',
      component: Register
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: VerifyEmailView
    },
    {
      path: '/',
      component: Layout,
      meta: { requiresAuth: useAuth },
      children: [
        {
          path: 'admin',
          meta: { roles: ['admin'] },
          children: [
            {
              path: 'dashboard',
              name: 'admin-dashboard',
              component: DashboardView,
            },
            {
              path: 'class',
              name: 'admin-class',
              component: AdminClassOverview,
            }
          ]
        },
        {
          path: 'attendance',
          name: 'attendance',
          component: AttendanceView,
          meta: { roles: ['admin', 'guru', 'murid'] }
        },
        {
          path: 'schedule',
          name: 'schedule',
          component: ScheduleView,
          meta: { roles: ['admin', 'guru', 'murid'] }
        },
        {
          path: 'class',
          name: 'class',
          component: ClassView,
          meta: { roles: ['admin', 'guru'] }
        },
        {
          path: 'me',
          name: 'account',
          component: AccountView,
          meta: { roles: ['admin', 'guru', 'murid'] }
        }
      ]
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  // 1. Check if route requires authentication
  if (to.meta.requiresAuth) {
    // 2. If no token, redirect to login
    if (!auth.token) {
      return next('/login');
    }

    // 3. If token exists but user not loaded, fetch user (with caching)
    if (!auth.user) {
      const user = await auth.fetchUser();
      if (!user) {
        // Token is invalid, clear auth and redirect to login
        auth.clearAuth();
        return next('/login');
      }
    }
  }

  // 4. Redirect logged-in users from /login to homepage
  if (to.path === '/login' && auth.isAuthenticated) {
    return next('/attendance');
  }

  // 5. Check RBAC if roles meta defined on route
  if (to.meta.roles) {
    if (!auth.user) {
      return next('/login');
    }
    if (!to.meta.roles.includes(auth.user.role)) {
      return next('/me');
    }
  }

  next();
});

export default router