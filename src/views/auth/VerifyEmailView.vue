<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-xl font-bold text-gray-500 mb-1">Verifikasi Email</h1>
    </div>

    <!-- Content -->
    <div class="text-center space-y-3">
      <p class="text-sm text-gray-600">
        Kami telah mengirim link verifikasi ke email Anda. Silakan cek inbox dan
        klik link untuk melanjutkan.
      </p>

      <div
        class="bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-xs p-3"
      >
        <p><strong>Tips:</strong></p>
        <ul class="text-left mt-1 space-y-1">
          <li>• Cek folder spam/junk mail</li>
          <li>• Pastikan email yang didaftarkan benar</li>
          <li>• Jika email tidak masuk, klik tombol "Kirim Ulang"</li>
        </ul>
      </div>

      <button
        @click="resendEmail"
        :disabled="loading"
        :class="[
          'w-full font-medium rounded-lg px-3 py-2 text-sm transition-colors',
          loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-cyan-400 hover:bg-cyan-500 text-white cursor-pointer shadow-sm',
        ]"
      >
        {{ loading ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi' }}
      </button>

      <div
        v-if="message"
        class="p-2 bg-green-50 border border-green-200 rounded-lg text-green-600 text-xs"
      >
        {{ message }}
      </div>

      <div
        v-if="error"
        class="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs"
      >
        {{ error }}
        <p class="mt-1">Jika masalah berlanjut, silakan hubungi admin.</p>
      </div>
    </div>

    <!-- Manual Check Button -->
    <div class="text-center pt-3 border-t border-gray-200">
      <p class="text-xs text-gray-600 mb-1">Sudah verifikasi?</p>
      <button
        @click="manualCheckVerification"
        :disabled="checking"
        :class="[
          'text-cyan-600 font-medium hover:text-cyan-700 cursor-pointer text-xs',
          checking ? 'opacity-50 cursor-not-allowed' : '',
        ]"
      >
        {{ checking ? 'Memeriksa...' : 'Sudah' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/auth';

const message = ref('');
const error = ref('');
const loading = ref(false);
const checking = ref(false);
const checkCount = ref(0);
const maxChecks = 10;
let interval = null;

const router = useRouter();
const auth = useAuthStore();

function stopPolling() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

function startPolling() {
  if (!interval) {
    interval = setInterval(checkIfVerified, 5000);
  }
}

async function checkIfVerified() {
  try {
    const res = await authService.checkEmailVerified();
    console.log('Email verification check response:', res);

    const isVerified =
      res.data?.email_verified ||
      res.data?.verified ||
      res.email_verified ||
      res.verified;

    console.log('Is email verified?', isVerified);

    if (isVerified) {
      console.log('Email verified! Stopping polling and redirecting...');
      stopPolling();

      // Refresh user data to get latest verification status
      await auth.refreshUser();

      // Redirect user
      const redirectRoute = auth.getLoginRedirectRoute();
      console.log('Redirecting to:', redirectRoute);
      router.push(redirectRoute);

      // Clear pending email flag
      localStorage.removeItem('pendingVerificationEmail');
    } else {
      checkCount.value++;
      console.log(
        `Email not verified yet. Check count: ${checkCount.value}/${maxChecks}`
      );

      if (checkCount.value >= maxChecks) {
        stopPolling();
        message.value =
          'Pemeriksaan otomatis dihentikan. Silakan klik "Sudah" untuk memeriksa manual.';
      }
    }
  } catch (e) {
    console.error('Failed to check verification:', e);
    checkCount.value++;
  }
}

async function checkVerificationAndRedirect() {
  checking.value = true;
  message.value = '';
  error.value = '';
  try {
    const res = await authService.checkEmailVerified();
    console.log('Manual verification check response:', res);

    const isVerified =
      res.data?.email_verified ||
      res.data?.verified ||
      res.email_verified ||
      res.verified;

    console.log('Is email verified?', isVerified);

    if (isVerified) {
      console.log('Email verified! Redirecting...');
      stopPolling();

      await auth.refreshUser();

      const redirectRoute = auth.getLoginRedirectRoute();
      console.log('Redirecting to:', redirectRoute);
      router.push(redirectRoute);

      localStorage.removeItem('pendingVerificationEmail');
    } else {
      message.value =
        'Email belum diverifikasi. Silakan lakukan verifikasi terlebih dahulu.';
      if (!interval) {
        startPolling();
      }
    }
  } catch (e) {
    console.error('Failed to check verification:', e);
    error.value =
      'Terjadi masalah saat memeriksa verifikasi. Silakan coba lagi nanti atau hubungi admin.';
  } finally {
    checking.value = false;
  }
}

async function resendEmail() {
  loading.value = true;
  message.value = '';
  error.value = '';
  try {
    const res = await authService.resendEmailVerification();
    message.value =
      res.message ||
      'Email verifikasi telah dikirim ulang. Silakan cek inbox Anda.';
  } catch (err) {
    console.error('Resend email error:', err);
    if (err.response?.status === 500) {
      error.value =
        'Terjadi masalah dengan layanan email. Silakan coba lagi nanti atau hubungi admin.';
    } else {
      error.value =
        err.response?.data?.message ||
        'Error mengirim ulang email. Silakan coba lagi.';
    }
  } finally {
    loading.value = false;
  }
}

async function manualCheckVerification() {
  await checkVerificationAndRedirect();
}

onMounted(async () => {
  await checkVerificationAndRedirect();
});

onBeforeUnmount(() => {
  stopPolling();
});
</script>

<style scoped>
.btn {
  padding: 0.5rem 1.5rem;
  background-color: #6b7280;
  color: white;
  border: none;
  border-radius: 0.375rem;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
