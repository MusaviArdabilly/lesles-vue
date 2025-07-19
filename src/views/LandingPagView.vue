<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const auth = useAuthStore();
const router = useRouter();

onMounted(() => {
  if (auth.token && auth.user) {
    router.replace(auth.getLoginRedirectRoute());
  } else {
    router.replace('/login');
  }
});
</script>

<template>
  <div class="flex min-h-dvh justify-center items-center">
    <div>Loading...</div>
  </div>
  <!-- Optional -->
</template>
