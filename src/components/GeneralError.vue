<template>
  <div
    v-if="message"
    class="bg-red-200 text-red-800 p-3 rounded mb-4 text-center font-semibold"
  >
    {{ message }}
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: '',
  },
});
</script>
