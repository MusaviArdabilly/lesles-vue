<template>
  <!-- <h1 class="text-2xl font-bold mb-6">Dashboard</h1> -->

  <div class="space-y-4">
    <div class="grid gap-4 grid-cols-1">

      <div class="rounded-lg shadow bg-white p-4">
        <div class="flex justify-between items-center mb-2">
          <h1 class="text-base font-medium">Total User</h1>
          <User />
        </div>
        <div class="flex flex-col">
          <h1 class="text-2xl font-bold">
            {{ dashboard.totalTeacher + dashboard.totalStudent }}
          </h1>
          <p class="text-xs text-gray-500">
            {{ dashboard.totalTeacher }} Guru, {{ dashboard.totalStudent }} Murid
          </p>
        </div>
      </div>

      <div class="rounded-lg shadow bg-white p-4">
        <div class="flex justify-between items-center mb-2">
          <h1 class="text-base font-medium">Kelas Aktif</h1>
          <BookOpen />
        </div>
        <div class="flex flex-col">
          <h1 class="text-2xl font-bold">
            {{ dashboard.totalClassByLevel?.sd + dashboard.totalClassByLevel?.smp + dashboard.totalClassByLevel?.sma }}
          </h1>
          <p class="text-xs text-gray-500">
            {{ dashboard.totalClassByLevel?.sd }} SD, {{ dashboard.totalClassByLevel?.smp }} SMP, {{ dashboard.totalClassByLevel?.sma }} SMA
          </p>
        </div>
      </div>

    </div>

    <div class="grid gap-4 grid-cols-1">

      <div class="rounded-lg shadow bg-white p-4">
        <h1 class="text-xl font-bold mb-4">Kelas Terbaru</h1>

        <div v-if="dashboard.class?.length > 0" v-for="(classItem, index) in dashboard.class" :key="index"
          :class="[
            'border-gray-300 py-2',
            index !== dashboard.class.length - 1 ? 'border-b' : '']">
          <div class="flex justify-between items-start">
            <h1 class="font-medium">{{ classItem.name }}</h1>
            <p class="font-medium uppercase">{{ classItem.level }}</p>
          </div>
          <div class="flex justify-between items-start">
            <p class="text-sm">{{ classItem.teacher.name }}</p>
            <div class="flex flex-col items-end">
              <p v-for="(studentItem, index) in classItem.students.sort((a, b) => a.name.length - b.name.length)"
                :key="index"
                class="text-sm text-gray-500">{{ studentItem.name }}</p>
            </div>
          </div>
        </div>
          
        <p v-if="dashboard.attendance === 0">Belum ada kelas</p>

        <!-- <div class="flex justify-center mt-4">
          <RouterLink to="/class" class="text-sm font-medium rounded border-gray-300 border px-4 py-2">
            Lihat Semua Kelas
          </RouterLink>
        </div> -->
      </div>

      <div class="rounded-lg shadow bg-white p-4">
        <h1 class="text-xl font-bold mb-4">Absensi Terbaru</h1>
        <div class="space-y-4">

          <div v-if="dashboard.attendance?.length > 0">
            <div v-for="(attendance, index) in dashboard.attendance" :key="index" 
              :class="[
                'border-gray-300 space-y-2 py-2',
                index !== dashboard.attendance.length - 1 ? 'border-b' : '' ]">
              <div class="flex justify-between items-center">
                <h1 class="font-medium">{{ attendance.user.name }}</h1>
                <p class="text-sm text-gray-500">{{ attendance.created_at.split(' ')[1] }}</p>
              </div>
              <p class="text-sm text-gray-500">{{ attendance.class.name }}</p>
            </div>
          </div>

          <p v-else class="text-sm text-gray-500 text-center">Belum ada absensi</p>

          <!-- <div class="flex justify-center">
            <RouterLink to="/class" class="text-sm font-medium rounded border-gray-300 border px-4 py-2">
              Lihat Semua Absensi
            </RouterLink>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
    User,
    BookOpen,
    LayoutDashboard,
    ClipboardCheck,
    Calendar,
} from 'lucide-vue-next';

import axios from '@/lib/axios'

export default {
  components: {
    User,
    BookOpen,
    LayoutDashboard,
    ClipboardCheck,
    Calendar,
  },
  data() {
    return {
      dashboard: {},
      totalTeacher: 120,
      totalStudent: 200,
      totalStudentElementary: 25,
      totalStudentJuniorHighSchool: 75,
      totalStudentSeniorHighSchool: 100,
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get('/dashboard');
        this.dashboard = response.data.data;
      } catch (error) {
        console.log(error);
      }
    }
  }
}
</script>