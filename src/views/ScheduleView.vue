<template>
  <div class="w-full space-y-4">
    <div class="rounded-lg shadow bg-white p-4">
      <div class="text-center">
        <h1>{{ greeting }}</h1>
        <h1 class="font-bold">{{ user.name }}</h1>
        <p class="text-xs text-gray-500">
          <span class="capitalize me-1">{{ user.role }}</span>
          <span class="uppercase">{{ Array.isArray(user.level) ? user.level.join(', ') : user.level }}</span>
        </p>
      </div>
    </div>
    
    
    <div v-if="user.role === 'guru' || user.role === 'murid'" class="rounded-lg shadow bg-white px-4 py-2">
      <h1 class="font-bold">Jadwal</h1>
      <p v-if="schedules.length === 0" class="text-sm text-gray-500 text-center">
        {{ user.role === 'guru' ? 'Kamu belum terdaftar di kelas manapun' : 'Kamu belum memiliki kelas' }}
      </p>

      <div v-for="(classItem, index) in schedules" :key="index"
        :class="['border-gray-300', index !== schedules.length - 1 ? 'border-b' : '', 'py-2']">
        
        <div class="flex justify-between items-start">
          <h1 class="font-medium">{{ classItem.name }}</h1>
          <p class="font-medium uppercase">{{ classItem.level }}</p>
        </div>

        <div class="flex justify-between items-start">
          <template v-if="user.role === 'guru'">
            <p class="text-xs text-gray-500 capitalize">
              {{ classItem.schedule.day }}, {{ classItem.schedule.start_time }}-{{ classItem.schedule.end_time }}
            </p>
            <div class="flex flex-col items-end">
              <p v-for="(student, sIndex) in classItem.students.sort((a,b) => a.name.length - b.name.length)" 
                :key="sIndex"
                class="text-xs text-gray-500">
                {{ student.name }}
              </p>
            </div>
          </template>

          <template v-else>
            <p class="text-xs text-gray-500">{{ classItem.teacher.name }}</p>
            <p class="text-xs text-gray-500 capitalize">
              {{ classItem.schedule.day }}, {{ classItem.schedule.start_time }}-{{ classItem.schedule.end_time }}
            </p>
          </template>
        </div>
      </div>
    </div>
    
    <h1 class="font-bold">Absensi</h1>

    <div class="rounded-lg shadow bg-white px-4 py-2">
      <p v-if="attendances.length === 0" class="text-sm text-gray-500 text-center py-2">Belum ada data absensi</p>
      <div v-else>
        <div v-for="(attendance, index) in attendances" :key="attendance.id"
          :class="['border-gray-300', index !== attendances.length - 1 ? 'border-b' : '', 'py-2']">
          <div class="flex justify-between">
            <p class="font-medium">{{ attendance.class.name }}</p>
            <p class="font-medium uppercase">{{ attendance.class.level }}</p>
          </div>
          <p class="text-xs text-gray-500">{{ formatToIndonesianTime(attendance.created_at) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/lib/axios';
import { useAuthStore } from '@/stores/auth';
import { formatToIndonesianTime } from '@/utils/string';

export default {
  data() {
    return {
      greeting: '',
      schedules: [],
      attendances: []
    }
  },
  mounted() {
    this.greeting = this.getGreeting();
    this.fetchSchedule();
    this.fetchAttendance();
  },
  computed: {
    auth() {
      return useAuthStore();
    },
    user() {
      return this.auth.user;
    }
  },
  methods: {
    async fetchSchedule() {
      try {
        let endPoint = ''
        if (['guru', 'murid'].includes(this.user.role)) {
          endPoint = '/schedule'
        } else {
          endPoint = '/schedule/all'
        }
        const response = await axios.get(endPoint);
        this.schedules = response.data.schedule;
      } catch (error) {
        console.log(error);
      }
    },
    async fetchAttendance() {
      try {
        let endPoint = ''
        if (['guru', 'murid'].includes(this.user.role)) {
          endPoint = '/attendance'
        } else {
          endPoint = '/attendance/all'
        }
        const response = await axios.get(endPoint);
        this.attendances = response.data.data;
      } catch (error) {
        console.log(error)
      }
    },
    getGreeting() {
      const now = new Date();
      // Get current time in Indonesia timezone (WIB UTC+7)
      // Since JS Date is local to user's device, we calculate UTC+7 manually
      const utcHour = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();

      // Calculate WIB hour (UTC + 7)
      let wibHour = utcHour + 7;
      if (wibHour >= 24) wibHour -= 24;

      // Determine greeting by WIB hour
      if (wibHour >= 4 && wibHour < 11) {
        return 'Selamat Pagi';   // Morning
      } else if (wibHour >= 11 && wibHour < 15) {
        return 'Selamat Siang';  // Afternoon
      } else if (wibHour >= 15 && wibHour < 18) {
        return 'Selamat Sore';   // Late afternoon
      } else {
        return 'Selamat Malam';  // Night
      }
    },
    formatToIndonesianTime
  }
}
</script>