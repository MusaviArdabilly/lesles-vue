<template>
  <div class="space-y-6">
    <div class="sticky top-0">
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-semibold">Kelas</h1>
      </div>
    </div>

    <div class="mt-4">
      <!-- Skeletons -->
      <div
        v-if="loading"
        class="rounded-lg bg-white border border-gray-300 p-4 space-y-3 animate-pulse"
      >
        <div
          class="flex justify-between items-center pb-4 border-b border-gray-300"
        >
          <div class="w-20 h-6 bg-gray-200 rounded"></div>
          <div class="w-20 h-6 bg-gray-200 rounded"></div>
        </div>
        <div class="space-y-2 mt-4">
          <div class="h-5 w-3/4 bg-gray-200 rounded"></div>
          <div class="flex items-center gap-2">
            <div class="size-5 bg-gray-200 rounded-full"></div>
            <div class="h-4 w-2/3 bg-gray-200 rounded"></div>
          </div>
          <div class="flex items-center gap-2">
            <div class="size-5 bg-gray-200 rounded-full"></div>
            <div class="h-4 w-2/3 bg-gray-200 rounded"></div>
          </div>
          <div class="flex items-center gap-2">
            <div class="size-5 bg-gray-200 rounded-full"></div>
            <div class="h-4 w-2/3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
      <div v-else-if="classes.length" class="grid grid-cols-1 gap-4">
        <RouterLink
          :to="`/operator/class/${item.id}`"
          v-for="item in classes"
          :key="item.id"
          custom
          v-slot="{ navigate }"
        >
          <div
            @click="navigate"
            class="cursor-pointer rounded-lg bg-white border border-gray-300 p-4"
          >
            <div
              class="flex justify-between items-center border-b border-gray-300 pb-4"
            >
              <span
                class="text-xs font-medium capitalize tracking-wide rounded-lg px-2 py-1"
                :class="
                  item.type === 'privat'
                    ? 'text-indigo-600 bg-indigo-100'
                    : 'text-teal-600 bg-teal-100'
                "
              >
                {{ item.type }}
              </span>
              <span
                :class="[
                  'text-xs font-medium capitalize tracking-wide rounded-lg px-2 py-1',
                  {
                    'text-black bg-yellow-300': item.status === 'menunggu',
                    'text-white bg-red-500': item.status === 'ditolak',
                    'text-white bg-green-500': item.status === 'aktif',
                  },
                ]"
                >{{ item.status }}</span
              >
            </div>
            <div class="space-y-2 mt-4">
              <h1 class="text-sm font-medium mb-4">
                {{ item.name }}
              </h1>
              <div
                v-if="item.status !== 'ditolak'"
                class="flex items-center gap-2"
                :class="item.teacher ? '' : 'text-yellow-500'"
              >
                <UserRoundPen class="flex-none size-5" />
                <label class="text-xs">{{
                  item.teacher
                    ? `${item.teacher.name} - ${item.teacher.phone}`
                    : 'Menunggu Persetujuan Operator'
                }}</label>
              </div>
              <div class="flex items-center gap-2">
                <Users class="flex-none size-5" />
                <label class="text-xs">{{
                  item.member_names?.join(', ')
                }}</label>
              </div>
              <div class="flex items-center gap-2">
                <CalendarDays class="flex-none size-5" />
                <label class="text-xs">
                  {{ formatSchedule(item.schedules) }}
                </label>
              </div>
            </div>
          </div>
        </RouterLink>
      </div>
      <div
        v-else-if="classes.length === 0 && auth.user.role === 'murid'"
        class="flex min-h-[calc(100dvh_-_84px)] h-full items-center"
      >
        <div class="w-full rounded-lg bg-white border border-gray-300 p-3">
          <p class="text-sm text-center font-medium">
            Belum ada data kelas, buat sekarang yuk
          </p>
        </div>
      </div>
      <div
        v-else-if="classes.length === 0 && auth.user.role === 'guru'"
        class="flex min-h-[calc(100dvh_-_84px)] h-full items-center"
      >
        <div class="w-full rounded-lg bg-white border border-gray-300 p-3">
          <p class="text-sm text-center font-medium">
            Belum ada kelas yang ditugaskan kepadamu.
          </p>
          <!-- Divider -->
          <div class="relative my-3">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="bg-white px-2 text-gray-500">atau</span>
            </div>
          </div>
          <p class="text-xs text-center text-gray-500 font-medium">
            Silakan hubungi operator region untuk meminta penugasan.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue';
import axios from '@/lib/axios';

import { CalendarDays, Users, UserRoundPen } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const showToast = inject('showToast');

const classes = ref([]);
const loading = ref(true);

const formatSchedule = (schedules) =>
  Array.isArray(schedules)
    ? schedules
        .map((s) => `${s.day} ${s.start_time} - ${s.end_time}`)
        .join(', ')
    : '-';

const loadClasses = async () => {
  try {
    const response = await axios.get('/class/all');
    classes.value = response.data.data;
  } catch (error) {
    showToast('Gagal memuat data kelas', 'error');
    console.error(error);
  } finally {
    loading.value = false;
  }
};
onMounted(loadClasses);
</script>
