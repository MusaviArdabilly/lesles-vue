<template>
  <div class="flex justify-center">
    <GoogleLogin 
      :callback="handleGoogleLogin"
      :disabled="isLoading"
      :class="{ 'opacity-50 pointer-events-none': isLoading }"
    />
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  }
})

const router = useRouter();
const auth = useAuthStore();
const showToast = inject('showToast');

const handleGoogleLogin = async (response) => {
  console.log("Handle the response", response)

  const idToken = response.credential
  if (!idToken) {
    // console.error('No credential token received from Google');
    showToast('Login google gagal', 'error');
    return
  }

  try {
    await auth.loginWithGoogle(idToken);
    router.push('/attendance');
    showToast?.(`Hai, ${auth.user.name}`, 'success');
  } catch (error) {
    showToast('Login google gagal', 'error');
  }
}
</script>
