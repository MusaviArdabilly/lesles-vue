<template>
  <ul
    v-if="errors?.length"
    class="list-disc text-sm text-red-500 mt-1 capitalize ps-6"
  >
    <li v-for="(err, i) in errors" :key="i">{{ err }}</li>
  </ul>
</template>

<script setup>
defineProps({
  errors: {
    type: Array,
    default: () => [],
  },
});
</script>
