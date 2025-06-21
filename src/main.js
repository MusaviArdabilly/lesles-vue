import './assets/tailwindcss.css'
import './assets/main.css'

import { createApp } from 'vue'
import vue3GoogleLogin from 'vue3-google-login'

import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

import App from './App.vue'
import router from './router'
import Toast from './components/Toast.vue';

async function bootstrap() {
  const app = createApp(App)

  app.use(createPinia())

  app.use(vue3GoogleLogin , {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
  })

  // Initialize auth store
  const auth = useAuthStore()
  auth.initializeAuth()
  
  // Only fetch user if we have a token
  if (auth.token) {
    await auth.fetchUser()
  }

  app.component('Toast', Toast)
  
  app.use(router)

  app.mount('#app')
}

bootstrap();