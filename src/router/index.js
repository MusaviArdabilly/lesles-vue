import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import RegisterView from '@/views/auth/RegisterView.vue';
import LoginView from '@/views/auth/LoginView.vue';
import VerifyEmailView from '@/views/auth/VerifyEmailView.vue';
import AttendanceView from '@/views/AttendanceView.vue';
import CompleteStudentProfileView from '@/views/auth/CompleteStudentProfileView.vue';
import CompleteTeacherProfileView from '@/views/auth/CompleteTeacherProfileView.vue';
import ClassView from '@/views/class/ClassView.vue';
import ProfileView from '@/views/AccountView.vue';
import ClassListView from '@/views/class/ClassListView.vue';
import ClassCreationView from '@/views/class/ClassCreationView.vue';
import ClassDetailView from '@/views/class/ClassDetailView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/',
      meta: { layout: 'auth' },
      children: [
        {
          path: 'login',
          name: 'login',
          component: LoginView,
        },
        {
          path: 'register',
          name: 'register',
          component: RegisterView,
        },
        {
          path: '',
          meta: { requiresAuth: true },
          children: [
            {
              path: 'verify-email',
              name: 'verify-email',
              component: VerifyEmailView,
            },
            {
              path: 'complete-student-profile',
              name: 'complete-student-profile',
              component: CompleteStudentProfileView,
            },
            {
              path: 'complete-teacher-profile',
              name: 'complete-teacher-profile',
              component: CompleteTeacherProfileView,
            },
          ],
        },
      ],
    },
    {
      path: '/',
      meta: { requiresAuth: true, layout: 'user' },
      children: [
        {
          path: 'attendance',
          name: 'attendance',
          component: AttendanceView,
        },
        {
          path: 'class',
          name: 'class',
          component: ClassView,
          children: [
            {
              path: '',
              name: 'classList',
              component: ClassListView,
            },
            {
              path: 'create',
              name: 'classCreate',
              component: ClassCreationView,
            },
            {
              path: ':id',
              name: 'classDetail',
              component: ClassDetailView,
            },
          ],
        },
        {
          path: 'account',
          name: 'account',
          component: ProfileView,
        },
      ],
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  // If route requires auth and user is not authenticated
  if (to.meta.requiresAuth && !auth.token) {
    if (to.path !== '/login') {
      return next('/login');
    }
    return next();
  }

  // If user is authenticated but hasn't been fetched yet
  if (auth.token && !auth.user && !auth.isLoading) {
    try {
      await auth.fetchUser();
    } catch (error) {
      errorHandler.log(error, 'Router Guard - Fetch User');
      auth.logout();
      if (to.path !== '/login') {
        return next('/login');
      }
      return next();
    }
  }

  // Check role-based access
  if (to.meta.roles && auth.user) {
    const userRole = auth.user.role;
    if (!to.meta.roles.includes(userRole)) {
      const redirectRoute = auth.getLoginRedirectRoute();
      if (to.path !== redirectRoute) {
        return next(redirectRoute);
      }
      return next();
    }
  }

  // If user is logged in and trying to access login/register pages or root
  if (
    auth.user &&
    (to.name === 'login' || to.name === 'register' || to.path === '/')
  ) {
    const redirectRoute = auth.getLoginRedirectRoute();
    if (to.path !== redirectRoute) {
      return next(redirectRoute);
    }
    return next();
  }

  next();
});

export default router;
