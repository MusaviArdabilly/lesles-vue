<template>
  <div class="relative max-w-md w-full mx-auto bg-[#5bb5e9]">
    <img src="/images/illustration/background1.jpg" alt="Lesles" 
      class="absolute top-0 left-0 w-full h-auto object-cover z-0">
    <img src="/images/illustration/background2.png" alt="Lesles" 
      class="absolute bottom-0 left-1/2 -translate-x-1/2 left-0 w-4/5 h-auto object-cover z-0">

    <div class="relative flex justify-center items-center min-h-dvh p-4 z-10">
      <div class="w-full max-w-md rounded-lg shadow-lg bg-white p-8">
        <form class="space-y-4" @submit.prevent="login">
          
          <h1 class="text-2xl font-bold text-gray-500 text-center">Lesles</h1>
          <!-- <img src="/background.jpg" alt="" class="rounded"> -->
          
          <div class="space-y-2">
            <label for="email" class="block text-sm">Email</label>
            <input type="email" id="email" v-model="form.email"
              class="w-full rounded border-gray-300 border px-4 py-2"
              placeholder="emailkamu@email.com" autocomplete="email">
          </div>
          
          <div class="space-y-2">
            <label for="password" class="block text-sm">Password</label>
            <input type="password" id="password" v-model="form.password"
              class="w-full rounded border-gray-300 border px-4 py-2"
              placeholder="••••••••" autocomplete="current-password">
          </div>
  
          <div class="text-red-500">{{ error }}</div>
  
          <button type="submit" 
            class="w-full font-medium rounded bg-cyan-400 px-4 py-2 hover:bg-cyan-500">Masuk</button>
  
          <!-- <div class="text-center text-sm text-gray-500">
            Belum punya akun?
            <RouterLink to="/register" class="text-indigo-600 font-medium">Daftar</RouterLink>
          </div> -->
          <hr>
          <GoogleSignIn />
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import GoogleSignIn from '@/components/GoogleSignIn.vue'

export default {
  components: { GoogleSignIn },
  inject: ['showToast'],
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      error: ''
    }
  },
  methods: {
    async login() {
      const auth = useAuthStore();
      try {
        this.error = '';
        await auth.login(this.form);
        this.showToast(`Hai, ${auth.user.name}`, 'success');
        this.$router.push('/attendance');
      } catch (error) {
        this.error = error;
        this.showToast('Login gagal', 'error');
      }
    }
  }
}
</script>