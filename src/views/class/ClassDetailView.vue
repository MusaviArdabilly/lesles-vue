<template>
  <div class="space-y-6">
    <div class="flex justify-start items-center gap-4">
      <RouterLink
        to="/class"
        class="cursor-pointer hover:-translate-x-0.25 transition-all"
      >
        <ArrowLeft class="size-6" />
      </RouterLink>
      <h1 class="text-xl font-semibold">Detail Kelas</h1>
    </div>

    <div class="flex min-h-[calc(100dvh_-_84px)] h-full items-center">
      <!-- Skeletons -->
      <div
        v-if="loading"
        class="w-full rounded-lg bg-white border border-gray-300 p-4 space-y-3 animate-pulse"
      >
        <div
          class="flex justify-between items-center pb-3 border-b border-gray-300"
        >
          <div class="w-20 h-6 bg-gray-200 rounded"></div>
          <div class="w-20 h-6 bg-gray-200 rounded"></div>
        </div>
        <div class="space-y-2 mt-3">
          <div class="h-5 w-3/4 bg-gray-200 rounded"></div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-gray-200 rounded-full"></div>
            <div class="h-4 w-2/3 bg-gray-200 rounded"></div>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-gray-200 rounded-full"></div>
            <div class="h-4 w-2/3 bg-gray-200 rounded"></div>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-gray-200 rounded-full"></div>
            <div class="h-4 w-2/3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
      <div v-if="classData">
        <div class="rounded-lg bg-white border border-gray-300 p-4 mb-4">
          <div
            class="flex justify-between items-center border-b border-gray-300 pb-4"
          >
            <span
              class="text-xs font-medium capitalize tracking-wide rounded-lg px-2 py-1"
              :class="
                classData.type === 'privat'
                  ? 'text-indigo-600 bg-indigo-100'
                  : 'text-teal-600 bg-teal-100'
              "
            >
              {{ classData.type }}
            </span>
            <span
              :class="[
                'text-xs font-medium capitalize tracking-wide rounded-lg px-2 py-1',
                {
                  'text-black bg-yellow-300': classData.status === 'menunggu',
                  'text-white bg-red-500': classData.status === 'ditolak',
                  'text-white bg-green-500': classData.status === 'aktif',
                },
              ]"
              >{{ classData.status }}</span
            >
          </div>
          <div class="space-y-2 border-b border-gray-300 mt-4 pb-4">
            <h1 class="text-sm font-medium mb-4">
              {{ classData.name }}
            </h1>
            <div
              v-if="classData.status !== 'ditolak'"
              class="flex items-center gap-2"
              :class="classData.teacher ? '' : 'text-yellow-500'"
            >
              <UserPen class="flex-none size-5" />
              <label class="text-xs">{{
                classData.teacher
                  ? `${classData.teacher.name} - ${classData.teacher.phone}`
                  : 'Menunggu Persetujuan Operator'
              }}</label>
            </div>
            <div class="flex items-center gap-2">
              <component
                :is="classData.member_names.length === 1 ? User : Users"
                class="flex-none size-5"
              />
              <label class="text-xs">{{
                classData.member_names?.join(', ')
              }}</label>
            </div>
            <div class="flex items-center gap-2">
              <Book class="flex-none size-5" />
              <label class="text-xs"
                >{{ classData.education_level.code }} -
                {{ classData.subject.name }}</label
              >
            </div>
            <div class="flex items-center gap-2">
              <CalendarDays class="flex-none size-5" />
              <label class="text-xs">
                {{ formatSchedule(classData.schedules) }}
              </label>
            </div>
          </div>
          <div class="space-y-2 mt-4">
            <div class="flex items-center gap-2">
              <Phone class="flex-none size-5 text-gray-500" />
              <label class="text-xs text-gray-500 capitalize">
                {{ classData.created_by.name }} -
                {{ classData.created_by.phone }}
              </label>
            </div>
            <div class="flex items-center gap-2">
              <MapPinned class="flex-none size-5 text-gray-500" />
              <label class="text-xs text-gray-500 capitalize">
                {{ formatLocation(classData.location) }}
              </label>
            </div>
          </div>
        </div>
        <div
          v-if="classData.attendances_grouped"
          class="rounded-lg bg-white border border-gray-300 p-4"
        >
          <!-- TODO: remove bottom line  -->
          <div
            v-for="([date, attendances], index) in Object.entries(
              classData.attendances_grouped
            )"
            :key="date"
            :class="[
              '',
              index !== Object.entries(classData.attendances_grouped).length - 1
                ? 'border-b border-gray-300 pb-3'
                : '',
            ]"
          >
            <h3 class="text-sm font-medium mb-3">
              {{ formatDate(date) }}
            </h3>

            <!-- List attendance di tanggal tersebut -->
            <ul>
              <li
                v-for="attendance in attendances"
                :key="attendance.id"
                class=""
              >
                <p class="tabular-nums text-xs text-gray-500 capitalize pb-1">
                  {{ formatTime(attendance.attended_at) }} - ({{
                    attendance.role
                  }})
                  {{ attendance.user.name }}
                </p>
              </li>
            </ul>
          </div>
        </div>
        <div
          v-if="classData.attendances_grouped === null"
          class="rounded-lg bg-white border border-gray-300 p-4"
        >
          <p class="text-sm text-center font-medium">Belum ada absensi</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from '@/lib/axios';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import {
  ArrowLeft,
  MapPinned,
  CalendarDays,
  Users,
  User,
  Phone,
  Book,
  UserPen,
} from 'lucide-vue-next';

const route = useRoute();
const classData = ref();
const loading = ref(true);

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatLocation(location) {
  if (!location) return '';

  const parts = [
    location.address,
    location.village?.name,
    location.district?.name,
    location.city?.name,
    location.province?.name,
  ].map((part) => (part ? toTitleCase(part) : ''));

  return parts.filter(Boolean).join(', ');
}

const formatSchedule = (schedules) =>
  Array.isArray(schedules)
    ? schedules
        .map((s) => `${s.day} ${s.start_time} - ${s.end_time}`)
        .join(', ')
    : '-';

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatTime(dateTimeString) {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const loadClassData = async () => {
  try {
    const classId = route.params.id;
    const response = await axios.get(`/class/${classId}`);

    classData.value = response.data.data;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadClassData);
</script>
