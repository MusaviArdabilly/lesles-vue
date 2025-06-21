<template>
  <div class="flex items-center min-h-dvh">
    <div class="w-full space-y-4">

      <!-- UPCOMING CLASSES -->
      <div v-for="(cls, index) in upcomingClasses" :key="cls.id"
        :style="getScaleForClass(upcomingClasses.length - 1 - index)"
        class="rounded-lg shadow bg-white p-4">
        <div class="text-center space-y-2">
          <h1 class="text-sm text-gray-400">Kelas Berikutnya</h1>
          <h1 class="font-bold mb-0">{{ cls.name }}</h1>
          <p class="text-sm text-gray-500 mt-0">{{ cls.teacher?.name }}</p>
          <p class="text-xs text-gray-400">{{ formatClassSchedule(cls) }}</p>
        </div>
      </div>
      
      <!-- CURRENT CLASS -->
      <!-- <div v-if="currentClass" class="rounded-lg shadow bg-white p-4 transform origin-top transition-all duration-300">
        <div class="text-center space-y-2">
          <h1>Kelasmu Sekarang</h1>
          <h1 class="font-bold">{{ currentClass.name }}</h1>
          <p class="text-sm text-gray-500">{{ currentClass.teacher?.name }}</p>
        </div>
      </div> -->

      <!-- STUDENT ATTENDANCE -->
      <div v-if="currentClass && user.role === 'murid'"
        class="rounded-lg shadow bg-white p-4">
        <div class="text-center">
          <h1>Absen sekarang sebagai</h1>
          <h1 class="font-bold">{{ user.name }}</h1>
          <p class="text-sm text-gray-500">Di Kelas</p>
          <h1 class="font-bold">{{ currentClass.name }}</h1>
          <p class="text-sm text-gray-500">{{ currentClass.teacher?.name }}</p>
          <p v-if="currentClass.has_attended" class="text-sm text-green-600 my-6">
            ✅ Kamu sudah absen untuk kelas ini
          </p>
          <button v-else :disabled="!currentClass" @click="storeAttendance()"
            :class="[
              'text-sm font-medium rounded border px-4 py-2 my-6',
              currentClass ? 'border-gray-300 text-black' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            ]">Absen Sekarang</button>
          <p class="text-xs text-gray-500">
            Catatan: Absensi hanya bisa dilakukan pada jadwal yang ditetapkan dan dilakukan hanya satu kali sesuai jadwal
          </p>
        </div>
      </div>

      <!-- TEACHER ATTENDANCE -->
      <div v-if="currentClass && user.role === 'guru'"
        class="rounded-lg shadow bg-white p-4">
        <div class="text-center">
          <h1>Absen sekarang sebagai</h1>
          <h1 class="font-bold">{{ user.name }}</h1>
          <p class="text-sm text-gray-500">Di Kelas</p>
          <h1 class="font-bold">{{ currentClass.name }}</h1>
          <p v-if="currentClass.has_attended" class="text-sm text-green-600 my-6">
            ✅ Kamu sudah absen untuk kelas ini
          </p>
          <button v-else :disabled="!currentClass" @click="storeAttendance()"
            :class="[
              'text-sm font-medium rounded border px-4 py-2 my-6',
              currentClass ? 'border-gray-300 text-black' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            ]">Absen Masuk Sekarang</button>
          <p class="text-xs text-gray-500">
            Catatan: Absen masuk bisa dilakukan pada 15 menit sebelum jadwal kelas dimulai dan absen keluar bisa dilakukan pada maksimal 15 menit setelah jadwal yang ditetapkan
          </p>
        </div>
      </div>

      <!-- No Current Class -->
      <div v-if="!currentClass" 
        class="rounded-lg shadow bg-white p-4">
        <p class="text-sm text-gray-500 text-center">Belum ada kelas yang sedang berlangsung</p>
      </div>
      
    </div>
  </div>
</template>

<script>
import axios from '@/lib/axios.js';
import { useAuthStore } from '@/stores/auth';

export default {
  data() {
    return {
      schedule: [],
      currentClass: null,
      upcomingClasses: [],
    }
  },
  mounted() {
    this.fetchSchedule();
  },
  computed: {
    auth() {
      return useAuthStore();
    },
    user() {
      return this.auth.user;
    },
  },
  methods: {
    async fetchSchedule() {
      try {
        const response = await axios.get('/class/upcoming');
        this.schedule = response.data.data;
        this.filterClasses();
      } catch (error) {
        console.log(error);
      }
    },
    async storeAttendance() {
      try {
        const payload = {
          class_id: this.currentClass.id
        }
        await axios.post('/attendance', payload);
        await fetchSchedule();
      } catch (error) {
        console.log(error);
      }
    },
    filterClasses() {
      const now = new Date();

      // Convert class time to actual Date object for this week
      const parseClassDate = (cls) => {
        const dayMap = {
          senin: 1,
          selasa: 2,
          rabu: 3,
          kamis: 4,
          jumat: 5,
          sabtu: 6,
          minggu: 0
        };

        const classDay = dayMap[cls.schedule.day.toLowerCase()];
        const [startHour, startMinute] = cls.schedule.start_time.split(':').map(Number);
        const [endHour, endMinute] = cls.schedule.end_time.split(':').map(Number);

        // Get the date for this week's class
        const today = new Date();
        const dayDiff = (classDay - today.getDay() + 7) % 7;
        const classDate = new Date(today);
        classDate.setDate(today.getDate() + dayDiff);

        const startDateTime = new Date(classDate);
        startDateTime.setHours(startHour, startMinute, 0, 0);

        const endDateTime = new Date(classDate);
        endDateTime.setHours(endHour, endMinute, 0, 0);

        return { ...cls, startDateTime, endDateTime };
      };

      // Map all with parsed datetime
      const classesWithDate = this.schedule.map(parseClassDate);

      // Find current class
      this.currentClass = classesWithDate.find(cls => {
        return now >= cls.startDateTime && now <= cls.endDateTime;
      });

      // Get upcoming classes
      this.upcomingClasses = classesWithDate
        .filter(cls => now < cls.startDateTime)
        .sort((a, b) => a.startDateTime - b.startDateTime)
        .slice(0, 2)
        .reverse(); // optional: reverse to show soonest at bottom
    },
    formatClassSchedule(cls) {
      const dayNameMap = {
        minggu: 'Minggu',
        senin: 'Senin',
        selasa: 'Selasa',
        rabu: 'Rabu',
        kamis: 'Kamis',
        jumat: 'Jumat',
        sabtu: 'Sabtu',
      };
      const day = dayNameMap[cls.schedule.day.toLowerCase()] || cls.schedule.day;
      const start = cls.schedule.start_time;
      const end = cls.schedule.end_time;
      return `${day}, ${start} - ${end}`;
    },
    getScaleForClass(index) {
      const baseScale = 1;
      const scaleStep = 0.05;
      const baseOpacity = 1;
      const opacityStep = 0.2;

      const scale = baseScale - index * scaleStep;
      const opacity = baseOpacity - index * opacityStep;

      return {
        transform: `scale(${scale})`,
        opacity: Math.max(0.5, opacity), // prevent it from going too transparent
        transition: 'transform 0.3s ease, opacity 0.3s ease',
      };
    }
  }
}
</script>