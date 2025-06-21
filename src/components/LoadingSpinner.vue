<template>
  <div v-if="show" class="flex items-center justify-center">
    <svg 
      :class="[
        'animate-spin',
        size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8',
        color === 'white' ? 'text-white' : 'text-gray-600'
      ]" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        class="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        stroke-width="4"
      ></circle>
      <path 
        class="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <span v-if="text" class="ml-2 text-sm">{{ text }}</span>
  </div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: true
    },
    text: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    color: {
      type: String,
      default: 'gray',
      validator: (value) => ['gray', 'white'].includes(value)
    }
  }
}
</script> 