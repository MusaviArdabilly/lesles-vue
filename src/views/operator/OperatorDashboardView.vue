<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <div class="rounded-lg border border-gray-300 bg-white p-4">
      <h1>Siswa</h1>
      <span class="text-xl font-bold">{{
        dashboardData?.total_students ?? '-'
      }}</span>
      <p class="text-xs text-gray-500">
        <span :class="getGrowthClass(dashboardData?.students_growth)">
          {{ dashboardData?.students_growth ?? '-' }}
        </span>
      </p>
    </div>

    <div class="rounded-lg border border-gray-300 bg-white p-4">
      <h1>Guru</h1>
      <span class="text-xl font-bold">{{
        dashboardData?.total_teachers ?? '-'
      }}</span>
      <p class="text-xs text-gray-500">
        <span :class="getGrowthClass(dashboardData?.teachers_growth)">
          {{ dashboardData?.teachers_growth ?? '-' }}
        </span>
      </p>
    </div>

    <div class="rounded-lg border border-gray-300 bg-white p-4">
      <h1>Kelas</h1>
      <span class="text-xl font-bold">{{
        dashboardData?.total_classes ?? '-'
      }}</span>
      <p class="text-xs text-gray-500">
        <span :class="getGrowthClass(dashboardData?.classes_growth)">
          {{ dashboardData?.classes_growth ?? '-' }}
        </span>
      </p>
    </div>

    <div class="rounded-lg border border-gray-300 bg-white p-4">
      <h1>Operator</h1>
      <span class="text-xl font-bold">{{
        dashboardData?.total_operators ?? '-'
      }}</span>
      <p class="text-xs text-gray-500">Penanggung jawab di area</p>
    </div>
  </div>

  <div class="w-full border border-gray-300 bg-white rounded-lg p-4">
    <h1 class="font-medium mb-4">Status Kelas</h1>
    <div class="grid grid-cols-4">
      <div class="text-center">
        <h1 class="text-xl font-bold">
          {{ dashboardData?.class_status?.menunggu ?? 0 }}
        </h1>
        <p class="text-xs text-gray-500">Menunggu</p>
      </div>
      <div class="text-center">
        <h1 class="text-xl font-bold">
          {{ dashboardData?.class_status?.ditolak ?? 0 }}
        </h1>
        <p class="text-xs text-gray-500">Ditolak</p>
      </div>
      <div class="text-center">
        <h1 class="text-xl font-bold">
          {{ dashboardData?.class_status?.aktif ?? 0 }}
        </h1>
        <p class="text-xs text-gray-500">Aktif</p>
      </div>
      <div class="text-center">
        <h1 class="text-xl font-bold">0</h1>
        <p class="text-xs text-gray-500">Selesai</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '@/lib/axios';

const dashboardData = ref(null);
const isLoading = ref(true);

const loadDashboard = async () => {
  try {
    const res = await axios.get('/dashboard'); // sesuaikan baseURL kalau pakai prefix
    dashboardData.value = res.data.data;
  } catch (err) {
    console.error('Failed to fetch dashboard', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadDashboard();
});

const getGrowthClass = (growth) => {
  // contoh: "+20% dari bulan kemarin"
  if (!growth) return '';
  return growth.startsWith('-') ? 'text-red-500' : 'text-green-500';
};
</script>
