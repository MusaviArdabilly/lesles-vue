<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-xl font-bold text-gray-500 mb-1">Masuk ke Lesles</h1>
      <p class="text-sm text-gray-600">Platform Les Privat</p>
    </div>

    <!-- Google Login (Primary for Students) -->
    <div class="space-y-3">
      <p class="text-xs text-gray-500 text-center">
        Murid? Langsung login pakai google aja
      </p>
      <GoogleSignIn :is-loading="isLoading" />

      <!-- Divider -->
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-xs">
          <span class="bg-white px-2 text-gray-500">atau</span>
        </div>
      </div>

      <!-- Email/Password Login -->
      <form @submit.prevent="login" class="space-y-3">
        <div class="space-y-1">
          <label for="email" class="block text-sm font-medium text-gray-700"
            >Email</label
          >
          <input
            type="email"
            id="email"
            v-model="form.email"
            required
            class="w-full rounded-lg border border-gray-300 text-sm px-3 py-2 transition-colors focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            placeholder="your@email.com"
          />
        </div>

        <div class="space-y-1">
          <label for="password" class="block text-sm font-medium text-gray-700"
            >Password</label
          >
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="form.password"
              required
              autocomplete="current-password"
              class="w-full rounded-lg border border-gray-300 text-sm px-3 py-2 pr-10 transition-colors focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              placeholder="••••••••"
            />
            <button
              type="button"
              @click="togglePassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              <Eye v-if="showPassword" class="w-4 h-4 text-gray-400" />
              <EyeOff v-else class="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div class="flex items-center">
          <input
            type="checkbox"
            id="remember"
            v-model="form.remember"
            class="rounded border-gray-300 text-cyan-400 focus:ring-cyan-400 cursor-pointer"
          />
          <label
            for="remember"
            class="ml-2 text-sm text-gray-600 cursor-pointer"
            >Ingat saya</label
          >
        </div>

        <div
          v-if="error.value"
          class="bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 p-2"
        >
          {{ error.value }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full font-medium rounded-lg bg-cyan-400 text-white text-sm transition-colors shadow-sm px-3 py-2 cursor-pointer hover:bg-cyan-500"
        >
          <span v-if="isLoading" class="flex items-center justify-center">
            <LoadingSpinner size="sm" text="Memproses..." />
          </span>
          <span v-else>Masuk</span>
        </button>
      </form>
    </div>

    <div class="text-center pt-3 border-t border-gray-200">
      <RouterLink
        to="/register"
        class="text-cyan-600 text-xs font-medium cursor-pointer hover:text-cyan-700"
      >
        Daftar sebagai Guru
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Eye, EyeOff } from 'lucide-vue-next';
import GoogleSignIn from '@/components/GoogleSignIn.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

// State
const form = ref({
  email: '',
  password: '',
  remember: false,
});
const error = ref('');
const isLoading = ref(false);
const showPassword = ref(false);

// Toast injection
const showToast = inject('showToast');

// Router & Store
const router = useRouter();
const auth = useAuthStore();

// Toggle password visibility
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// Login function
const login = async () => {
  try {
    isLoading.value = true;
    error.value = '';

    await auth.login({
      email: form.value.email,
      password: form.value.password,
      rememberMe: form.value.remember,
    });
    await auth.fetchUser(false);

    const redirectRoute = auth.getLoginRedirectRoute();
    router.push(redirectRoute);
  } catch (err) {
    console.error(err);
    error.value =
      err?.response?.data?.message || 'Terjadi kesalahan saat login';
    showUserError(err, showToast);
  } finally {
    isLoading.value = false;
  }
};
</script>
