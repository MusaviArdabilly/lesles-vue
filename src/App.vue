<template>
  <Toast ref="toast" />
  <RouterView />
</template>

<script>
import { RouterLink, RouterView } from 'vue-router'
import Toast from './components/Toast.vue';

export default {
  name: 'App',
  components: { Toast },
  methods: {
    showToast(message, type, duration) {
      this.$refs.toast.show(message, type, duration);
    },
  },
  provide() {
    return {
      showToast: this.showToast,
    };
  },
};
</script>