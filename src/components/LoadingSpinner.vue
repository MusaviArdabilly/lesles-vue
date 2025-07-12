<template>
  <div v-if="show" class="flex items-center justify-center">
    <Loader2 
      :class="[
        'animate-spin',
        size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8',
        color === 'white' ? 'text-white' : 'text-gray-600'
      ]" 
    />
    <span v-if="text" class="ml-2 text-sm">{{ text }}</span>
  </div>
</template>

<script>
import { Loader2 } from 'lucide-vue-next'

export default {
  components: { Loader2 },
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