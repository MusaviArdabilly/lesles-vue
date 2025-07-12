<template>
  <Toast ref="toast" />

  <!-- Dynamic Layout System -->
  <component
    :is="currentLayoutComponent"
    v-if="currentLayoutComponent && route.meta.layout"
  >
    <RouterView />
  </component>

  <!-- Default Router View for routes without layout -->
  <RouterView v-else />
</template>

<script setup>
import { ref, computed, provide } from "vue";
import { useRoute, useRouter, RouterView } from "vue-router";

import Toast from "./components/Toast.vue";

import AuthLayout from "./layouts/AuthLayout.vue";

// Refs & Router
const toast = ref(null);
const route = useRoute();
const router = useRouter();

// Layout Map
const layoutMap = {
  auth: AuthLayout,
};

// Compute Current Layout Component
const currentLayoutComponent = computed(() => {
  const layoutKey = route.meta.layout;
  return layoutKey ? layoutMap[layoutKey] || null : null;
});

// Toast function (provided globally)
const showToast = (message, type, duration) => {
  toast.value?.show(message, type, duration);
};
provide("showToast", showToast);

// Retry function
const handleRetry = () => {
  router.go(0);
};
</script>
