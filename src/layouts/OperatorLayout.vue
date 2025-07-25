<template>
  <div
    class="max-w-md w-full min-h-dvh h-full flex flex-col bg-slate-100 mx-auto"
  >
    <div class="overflow-auto px-4 pt-4 pb-16">
      <slot />
    </div>
    <nav class="fixed right-0 bottom-0 left-0 bg-white">
      <div
        class="flex max-w-md w-full h-16 items-center border-t border-gray-300 mx-auto"
      >
        <RouterLink
          to="/operator"
          class="flex flex-1 flex-col items-center"
          :class="{
            'text-cyan-400': route.path === '/operator',
            'text-gray-700': !route.path === '/operator',
          }"
        >
          <ChartColumnIncreasing class="size-6 mb-1" />
          <span class="text-[10px]">Dashboard</span>
        </RouterLink>
        <RouterLink
          to="/operator/attendance"
          class="flex flex-1 flex-col items-center"
          :class="{
            'text-cyan-400': route.path === '/operator/attendance',
            'text-gray-700': !route.path === '/operator/attendance',
          }"
        >
          <ClipboardCheck class="size-6 mb-1" />
          <span class="text-[10px]">Absensi</span>
        </RouterLink>
        <RouterLink
          to="/operator/class"
          class="flex flex-1 flex-col items-center"
          :class="{
            'text-cyan-400': route.path.startsWith('/operator/class'),
            'text-gray-700': !route.path.startsWith('/operator/class'),
          }"
        >
          <ClipboardList class="size-6 mb-1" />
          <span class="text-[10px]">Kelas</span>
        </RouterLink>
        <RouterLink
          to="/operator/member"
          class="flex flex-1 flex-col items-center"
          :class="{
            'text-cyan-400': route.path === '/operator/member',
            'text-gray-700': !route.path === '/operator/member',
          }"
        >
          <Users class="size-6 mb-1" />
          <span class="text-[10px]">Member</span>
        </RouterLink>
        <RouterLink
          to="/operator/account"
          class="flex flex-1 flex-col items-center"
          :class="{
            'text-cyan-400': route.path === '/operator/account',
            'text-gray-700': !route.path === '/operator/account',
          }"
        >
          <User class="size-6 mb-1" />
          <span class="text-[10px]">Akun</span>
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import {
  ChartColumnIncreasing,
  ClipboardCheck,
  ClipboardList,
  User,
  Users,
} from 'lucide-vue-next';

const route = useRoute();
</script>
