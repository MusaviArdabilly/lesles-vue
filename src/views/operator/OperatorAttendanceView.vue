<template>
  <div class="bg-white space-y-4 p-4 -mx-4 -mt-4 mb-2">
    <div class="flex items-center justify-between">
      <h1 class="font-bold text-xl">Absensi</h1>
      <EllipsisVertical class="size-4 text-white" />
    </div>

    <!-- Search Input -->
    <div class="relative w-full max-w-sm">
      <input
        v-model="search"
        type="text"
        class="w-full rounded-lg text-sm border border-gray-300 px-10 py-2 transition-colors focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
        placeholder="Cari Berdasarkan nama kelas ..."
      />
      <Search
        class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none"
      />
      <X
        v-if="search"
        @click="search = ''"
        class="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 cursor-pointer hover:text-gray-600"
      />
    </div>

    <!-- Filters -->
    <div class="flex gap-4 flex-wrap text-sm items-center">
      <!-- Role Dropdown -->
      <div>
        <label class="block text-gray-600 mb-1">Role</label>
        <select
          v-model="selectedRole"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
        >
          <option value="all">Semua</option>
          <option value="guru">Guru</option>
          <option value="murid">Murid</option>
        </select>
      </div>

      <!-- Location Dropdown -->
      <div>
        <label class="block text-gray-600 mb-1">Lokasi</label>
        <select
          v-model="selectedLocation"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
        >
          <option :value="null">Semua Lokasi</option>
          <option v-for="loc in locationOptions" :key="loc" :value="loc">
            {{ loc }}
          </option>
        </select>
      </div>
    </div>
  </div>

  <!-- Attendance Cards -->
  <div
    v-for="attendance in filteredAttendance"
    :key="attendance.id"
    class="rounded-lg bg-white border border-gray-300 p-4 mb-2"
  >
    <div class="flex items-start justify-start gap-4">
      <div class="flex-none flex flex-col items-center gap-2">
        <div
          class="relative size-12 rounded-full border border-cyan-400 bg-white"
        >
          <p
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg text-cyan-400 font-semibold"
          >
            {{ getInitial(attendance.user.name) }}
          </p>
        </div>
        <span class="text-sm font-medium capitalize">{{
          attendance.user.role
        }}</span>
      </div>
      <div class="flex flex-col w-full">
        <h1 class="font-medium">
          {{ attendance.user.name }}
        </h1>
        <h1 class="font-medium text-sm">{{ attendance.class.name }}</h1>
        <p class="text-sm">{{ formatDateTime(attendance.attended_at) }}</p>
        <p class="text-sm text-gray-500">
          {{ attendance.note ? attendance.note : '-' }}
        </p>
        <p v-if="attendance.reschedule_from" class="text-sm text-red-500 mt-2">
          <span class="font-medium">Jadwal asli: </span>
          {{ formatDateTime(attendance.reschedule_from) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from '@/lib/axios';
import { ref, computed, onMounted } from 'vue';
import { formatDateTime } from '@/utils/date';
import { EllipsisVertical, Search, X } from 'lucide-vue-next';

const attendanceData = ref([]);
const search = ref('');
const selectedRole = ref('all');
const selectedLocation = ref(null);

const getInitial = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const loadAttendanceData = async () => {
  const response = await axios.get('attendance/all');
  attendanceData.value = response.data.data;
};

const locationOptions = computed(() => {
  const cityNames = attendanceData.value
    .map((a) => a.class?.location?.city?.name)
    .filter((name) => !!name);
  const unique = [...new Set(cityNames)];
  return unique;
});

const filteredAttendance = computed(() => {
  return attendanceData.value.filter((a) => {
    const matchRole =
      selectedRole.value === 'all' || a.user.role === selectedRole.value;

    const location = a.class?.location;
    const cityName = location?.city?.name;
    const isOnline = !location?.province;
    const currentLocation = isOnline ? 'Online' : cityName;

    const matchLocation =
      !selectedLocation.value || currentLocation === selectedLocation.value;

    const matchSearch = a.class.name
      .toLowerCase()
      .includes(search.value.toLowerCase());

    return matchRole && matchLocation && matchSearch;
  });
});

onMounted(() => {
  loadAttendanceData();
});
</script>
