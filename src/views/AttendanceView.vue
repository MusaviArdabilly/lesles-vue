<template>
  <h1>Attendance</h1>
  <pre>{{ auth.user }}</pre>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();

onMounted(async () => {
  if (!auth.user && !auth.isLoading) {
    try {
      await auth.fetchUser();
    } catch (e) {
      console.error('Failed to fetch user:', e);
    }
  }
});
</script>
