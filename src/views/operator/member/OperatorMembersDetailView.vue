<template>
  <div
    class="flex min-h-[calc(100dvh_-_84px)] flex-col h-full justify-center items-center gap-4"
  >
    <div class="w-full rounded-lg bg-white p-4 space-y-4">
      <!-- Hero -->
      <div class="text-center rounded-lg bg-cyan-400 p-4">
        <div class="relative w-16 h-16 rounded-full bg-white mx-auto mb-3">
          <p
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-semibold"
          >
            {{ initials }}
          </p>
        </div>
        <h1 class="text-lg font-semibold">{{ name }}</h1>
        <p class="text-xs capitalize">{{ roleLabel }}</p>
      </div>

      <div v-if="userData && userData.role === 'guru'" class="space-y-2">
        <div class="flex items-start justify-between">
          <label class="w-28 flex-none text-sm">Nama</label>
          <h1 class="text-sm text-gray-500">{{ userData.name }}</h1>
        </div>
        <div class="flex items-start justify-between">
          <label class="w-28 flex-none text-sm">Email</label>
          <h1 class="text-sm text-gray-500">{{ userData.email }}</h1>
        </div>
        <div class="flex items-start justify-between">
          <label class="w-28 flex-none text-sm">No. WA</label>
          <h1 class="text-sm text-gray-500">{{ userData.phone }}</h1>
        </div>
        <div class="flex items-start justify-between">
          <label class="w-28 flex-none text-sm">Tgl. gabung</label>
          <h1 class="text-sm text-gray-500">
            {{ formatDate(userData.created_at) }}
          </h1>
        </div>
        <div class="flex flex-col border-b border-gray-300 pb-2">
          <label class="w-28 flex-none text-sm">Alamat</label>
          <h1 class="text-sm text-gray-500">
            {{ formatLocation(userData.teacher_profile.location) }}
          </h1>
        </div>
        <div class="flex flex-col">
          <label class="w-28 flex-none text-sm">Kualifikasi</label>
          <h1
            v-for="(subject, index) in userData.subjects.map(
              (item) => `${item.education_level.code} - ${item.name}`
            )"
            class="text-sm text-gray-500"
          >
            {{ subject }}
          </h1>
        </div>
      </div>

      <div v-if="userData && userData.role === 'murid'" class="space-y-2">
        <div class="flex items-start justify-between">
          <label class="w-28 flex-none text-sm">Nama</label>
          <h1 class="text-sm text-gray-500">{{ userData.name }}</h1>
        </div>
        <div class="flex items-start justify-between">
          <label class="w-28 flex-none text-sm">Email</label>
          <h1 class="text-sm text-gray-500">{{ userData.email }}</h1>
        </div>
        <div class="flex items-start justify-between">
          <label class="w-28 flex-none text-sm">No. WA</label>
          <h1 class="text-sm text-gray-500">{{ userData.phone }}</h1>
        </div>
        <div class="flex items-start justify-between">
          <label class="w-28 flex-none text-sm">Sekolah</label>
          <h1 class="text-sm text-gray-500">
            {{ userData.student_profile.school_name }}
          </h1>
        </div>
        <div class="flex items-start justify-between">
          <label class="w-28 flex-none text-sm">Jenjang</label>
          <h1 class="text-sm text-gray-500">
            {{ userData.student_profile.education_level.code }} Kelas
            {{ userData.student_profile.grade }}
          </h1>
        </div>
        <div class="flex items-start justify-between">
          <label class="w-28 flex-none text-sm">Tgl. gabung</label>
          <h1 class="text-sm text-gray-500">
            {{ formatDate(userData.created_at) }}
          </h1>
        </div>
        <div class="flex flex-col">
          <label class="w-28 flex-none text-sm">Alamat</label>
          <h1 class="text-sm text-gray-500">
            {{ formatLocation(userData.student_profile.location) }}
          </h1>
        </div>
      </div>
    </div>

    <div class="w-full rounded-lg bg-white p-4 space-y-2">
      <h1 class="font-medium">Absensi</h1>
      <ul v-if="attendanceUserData.length > 1" class="space-y-2">
        <li v-for="(attendance, index) in attendanceUserData" :key="index">
          <div class="flex items-start justify-between">
            <span class="text-sm">
              {{ formatDate(attendance.attended_at) }}
            </span>
            <span class="text-sm">
              {{ attendance.class.name }}
            </span>
          </div>
          <p class="text-sm text-gray-500">
            <span class="text-black">Note: </span> {{ attendance.note }}
          </p>
        </li>
      </ul>
      <p v-else class="text-center text-sm">Belum ada absensi</p>
    </div>
  </div>
</template>

<script setup>
import axios from '@/lib/axios';
import { onMounted, computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const selectedRole = route.params.role;
const selectedId = route.params.id;
const userData = ref();
const attendanceUserData = ref();

const initials = computed(() =>
  (userData.value?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
);

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

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

async function loadDetailMemberData() {
  const mapRole = {
    guru: 'teacher',
    murid: 'student',
  };

  const url = `${mapRole[selectedRole]}s/${selectedId}`;
  const response = await axios.get(url);

  userData.value = response.data.data;
}

async function loadAttendanceMember() {
  const response = await axios.get(`/attendance/all?user_id=${selectedId}`);

  attendanceUserData.value = response.data.data;
}

onMounted(loadDetailMemberData(), loadAttendanceMember());
</script>
