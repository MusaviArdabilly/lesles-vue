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
import { inject } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();
const auth = useAuthStore();
const showToast = inject('showToast');

const handleGoogleLogin = async (response) => {
  const idToken = response.credential;
  if (!idToken) {
    showToast('Login google gagal', 'error');
    return;
  }

  try {
    await auth.loginWithGoogle(idToken);
    await auth.fetchUser(false);

    const redirectRoute = auth.getLoginRedirectRoute();
    router.push(redirectRoute);

    // Show welcome message
    const isNewUser = !auth.user?.email_verified_at;
    if (isNewUser) {
      showToast?.(
        `Selamat datang, ${auth.user?.name || 'User'}! Akun berhasil dibuat.`,
        'success'
      );
    } else {
      showToast?.(`Hai, ${auth.user?.name || 'User'}`, 'success');
    }
  } catch (error) {
    showToast('Login google gagal', 'error');
  }
};
</script>
