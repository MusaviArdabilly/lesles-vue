<template>
  <div class="min-h-dvh flex items-center justify-center px-4 py-6">
    <div class="w-full max-w-4xl space-y-6">

      <!-- CURRENT CLASSES -->
      <div>
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Kelas Sedang Berlangsung</h2>
        <div v-if="currentClasses.length" class="space-y-4">
          <div v-for="cls in currentClasses" :key="cls.id" class="bg-white p-4 rounded-lg shadow">
            <div class="text-center space-y-1">
              <h3 class="font-bold text-lg">{{ cls.name }}</h3>
              <p class="text-sm text-gray-500">Guru: {{ cls.teacher?.name }}</p>
              <p class="text-xs text-gray-400">{{ formatClassSchedule(cls) }}</p>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400 text-center">Tidak ada kelas yang sedang berlangsung</p>
      </div>

      <!-- UPCOMING CLASSES -->
      <div>
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Kelas Akan Datang</h2>
        <div v-if="upcomingClasses.length" class="space-y-4">
          <div v-for="cls in upcomingClasses" :key="cls.id" class="bg-white p-4 rounded-lg shadow">
            <div class="text-center space-y-1">
              <h3 class="font-bold text-lg">{{ cls.name }}</h3>
              <p class="text-sm text-gray-500">Guru: {{ cls.teacher?.name }}</p>
              <p class="text-xs text-gray-400">{{ formatClassSchedule(cls) }}</p>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400 text-center">Tidak ada kelas yang akan datang</p>
      </div>

    </div>
  </div>
</template>

<script>
import axios from '@/lib/axios.js';

export default {
  data() {
    return {
      allClasses: [],
      currentClasses: [],
      upcomingClasses: [],
    };
  },
  mounted() {
    this.fetchAllClasses();
  },
  methods: {
    async fetchAllClasses() {
      try {
        const response = await axios.get('/class/all');
        this.allClasses = response.data.data.map(this.parseClassDate);
        this.filterClasses();
      } catch (error) {
        console.log(error);
      }
    },
    parseClassDate(cls) {
      const dayMap = {
        senin: 1,
        selasa: 2,
        rabu: 3,
        kamis: 4,
        jumat: 5,
        sabtu: 6,
        minggu: 0,
      };

      const classDay = dayMap[cls.schedule.day.toLowerCase()];
      const [startHour, startMinute] = cls.schedule.start_time.split(':').map(Number);
      const [endHour, endMinute] = cls.schedule.end_time.split(':').map(Number);

      const today = new Date();
      const dayDiff = (classDay - today.getDay() + 7) % 7;
      const classDate = new Date(today);
      classDate.setDate(today.getDate() + dayDiff);

      const startDateTime = new Date(classDate);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = new Date(classDate);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      return { ...cls, startDateTime, endDateTime };
    },
    filterClasses() {
      const now = new Date();

      this.currentClasses = this.allClasses.filter(cls =>
        now >= cls.startDateTime && now <= cls.endDateTime
      );

      this.upcomingClasses = this.allClasses
        .filter(cls => now < cls.startDateTime)
        .sort((a, b) => a.startDateTime - b.startDateTime)
        .slice(0, 5); // show up to 5 upcoming
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
  },
};
</script>

<style scoped>
/* Optional: scoped enhancements */
</style>
