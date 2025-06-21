<template>
  <div class="relative w-full min-h-dvh max-w-md mx-auto">

    <div class="min-h-dvh bg-gray-100 p-4">
      <RouterView class="pb-16"/>
    </div>

    <!-- 👇 Show nav only when user is loaded and not null -->
    <div v-if="!loading && user" 
      class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full h-16 rounded-t-2xl bg-cyan-400 max-w-md mx-auto">
      <ul class="flex w-full h-full justify-around items-center">
        <li v-for="(item, index) in filteredNavigations" :key="index">
          <RouterLink :to="item.path">
            <component
              :is="item.icon"
              :class="$route.path === item.path ? 'scale-125' : 'text-gray-500'"
              class="size-6"
            />
          </RouterLink>
        </li>
      </ul>
    </div>

    <div v-else>
      Loading user...
    </div>

  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { 
  LayoutDashboard,
  ClipboardCheck,
  Calendar,
  BookOpen, 
  User,
  AlignCenter
} from 'lucide-vue-next'

export default {
  components: {
    LayoutDashboard,
    ClipboardCheck,
    AlignCenter,
    Calendar,
    BookOpen,
    User
  },
  async mounted() {
    const auth = useAuthStore()
    if (!auth.user && !auth.loading) {
      await auth.fetchUser()
    }
  },
  computed: {
    auth() {
      return useAuthStore()
    },
    user() {
      return this.auth.user
    },
    loading() {
      return this.auth.loading
    },
    filteredNavigations() {
      return this.navigations.filter(item =>
        item.roles.includes(this.user?.role)
      )
    }
  },
  data() {
    return {
      navigations: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['admin'] },
        { name: 'Berlangsung', path: '/admin/class', icon: AlignCenter, roles: ['admin'] },
        { name: 'Absensi', path: '/attendance', icon: ClipboardCheck, roles: ['guru', 'murid'] },
        { name: 'Jadwal', path: '/schedule', icon: Calendar, roles: ['admin', 'guru', 'murid'] },
        { name: 'Kelas', path: '/class', icon: BookOpen, roles: ['admin', 'guru'] },
        { name: 'Akun', path: '/me', icon: User, roles: ['admin', 'guru', 'murid'] },
      ]
    }
  }
}
</script>
