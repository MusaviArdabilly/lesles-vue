import "./assets/tailwindcss.css";
import "./assets/main.css";

import { createApp } from "vue";
import vue3GoogleLogin from "vue3-google-login";

import { createPinia } from "pinia";
import { useAuthStore } from "@/stores/auth";

import App from "./App.vue";
import router from "./router";
import Toast from "./components/Toast.vue";

const app = createApp(App);

app.use(createPinia());

app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
});

app.component("Toast", Toast);

app.use(router);

const auth = useAuthStore();
auth.initializeAuth();

if (auth.token) {
  auth.fetchUser().catch((error) => {
    errorHandler.log(error, "Bootstrap - Fetch User");
    auth.clearAuth();
  });
}

app.mount("#app");
