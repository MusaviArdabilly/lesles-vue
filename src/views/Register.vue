<template>
  <div class="flex justify-center items-center min-h-dvh p-4">
    <div class="w-full max-w-md rounded-lg border border-gray-300 shadow bg-white p-8">
      <div class="space-y-4">
        <h1 class="text-2xl font-bold text-gray-500 text-center">Lesles</h1>

        <div class="space-y-2">
          <label for="name" class="block text-sm">Nama</label>
          <input type="text" id="name" v-model="form.name"
            class="w-full rounded border border-gray-300 px-4 py-2"
            placeholder="Nama Lengkap">
        </div>

        <div class="space-y-2">
          <label for="phone" class="block text-sm">No. HP (WA)</label>
          <input type="text" id="phone" v-model="form.phone" inputmode="numeric"
            class="w-full rounded border border-gray-300 px-4 py-2"
            placeholder="Nomor Whatsapp">
        </div>

        <div class="space-y-2">
          <label for="email" class="block text-sm">Email</label>
          <input type="email" id="email" v-model="form.email"
            class="w-full rounded border border-gray-300 px-4 py-2"
            placeholder="your@email.com">
        </div>

        <div class="space-y-2">
          <label for="password" class="block text-sm">Password</label>
          <input type="password" id="password" v-model="form.password"
            class="w-full rounded border border-gray-300 px-4 py-2"
            placeholder="••••••••">
        </div>

        <div class="text-red-500 text-sm">{{ error }}</div>

        <button
          @click="register"
          class="w-full font-medium rounded bg-cyan-400 px-4 py-2 hover:bg-cyan-500 text-white"
        >
          Daftar
        </button>

        <div class="text-center text-sm text-gray-500">
          Sudah punya akun?
          <RouterLink to="/login" class="text-indigo-600 font-medium">Masuk</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'

export default {
  inject: ['showToast'],
  data() {
    return {
      form: {
        name: '',
        phone: '',
        email: '',
        password: '',
        role: 'murid'
      },
      error: ''
    }
  },
  methods: {
    async register() {
      try {
        // optionally set role from route
        if (this.$route.params.role === 'teacher') {
          this.form.role = 'guru';
        }

        const res = await axios.post('/register', this.form);

        const auth = useAuthStore();
        auth.setToken(res.data.token);
        await auth.fetchUser();

        // Check verification status
        if (!auth.user.email_verified_at) {
          this.$router.push('/verify-email');
        } else {
          this.$router.push('/me');
        }
      } catch (err) {
        this.error =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Terjadi kesalahan saat mendaftar';

        this.showToast(this.error, 'error');
        console.error('Register error:', err);
      }
    }
  }
}
</script>
