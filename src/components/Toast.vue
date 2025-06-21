<!-- components/Toast.vue -->
<template>
  <transition name="fade">
    <div
      v-if="visible"
      :class="[
        'fixed top-4 right-4 px-4 py-2 rounded shadow-lg transition-opacity duration-300 z-[1000]',
        toastTypeClass
      ]"
    >
      {{ message }}
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Toast',
  data() {
    return {
      visible: false,
      message: '',
      type: '', // success, error, info
    };
  },
  computed: {
    toastTypeClass() {
      switch (this.type) {
        case 'success':
          return 'bg-green-500 text-white';
        case 'error':
          return 'bg-red-500 text-white';
        case 'info':
          return 'bg-blue-500 text-white';
        default:
          return 'bg-gray-500 text-white'; // Default type
      }
    },
  },
  methods: {
    show(msg, type, duration = 3000) {
      console.log(msg, type, duration)
      this.message = msg;
      this.type = type;
      this.visible = true;

      setTimeout(() => {
        this.visible = false;
      }, duration);
    },
  },
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 1s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
