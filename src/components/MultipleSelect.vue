<template>
  <div class="space-y-1">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    <div class="relative">
      <!-- Selected Tags -->
      <div v-if="selectedOptions.length" class="flex flex-wrap gap-1 mb-2">
        <div
          v-for="option in selectedOptions"
          :key="option.id"
          class="inline-flex items-center gap-1 bg-cyan-100 text-cyan-800 text-xs px-2 py-1 rounded-md"
        >
          <span>{{ option.name }}</span>
          <button
            type="button"
            @click="removeOption(option.id)"
            class="hover:bg-cyan-200 rounded-full p-0.5 transition-colors"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      </div>
      <!-- Dropdown Trigger -->
      <button
        type="button"
        @click="toggleDropdown"
        :class="['w-full rounded-lg border text-sm px-3 py-2 transition-colors focus:ring-1 text-left flex items-center justify-between', inputClass]"
      >
        <span :class="selectedOptions.length === 0 ? 'text-gray-500' : 'text-gray-900'">
          {{ selectedOptions.length === 0 ? placeholder : `${selectedOptions.length} item${selectedOptions.length > 1 ? 's' : ''} dipilih` }}
        </span>
        <svg class="w-4 h-4 text-gray-400 ml-2" :class="{ 'rotate-180': isOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <!-- Dropdown Options -->
      <div v-if="isOpen" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
        <div v-if="availableOptions.length === 0" class="px-3 py-2 text-sm text-gray-500">Semua opsi telah dipilih</div>
        <button
          v-for="option in availableOptions"
          :key="option.id"
          type="button"
          @click="selectOption(option.id)"
          class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
        >
          {{ option.name }}
        </button>
      </div>
    </div>
    <div v-if="error" class="text-xs text-red-600 mt-1">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  options: { type: Array, required: true },
  modelValue: { type: Array, required: true },
  placeholder: { type: String, default: 'Pilih opsi...' },
  label: String,
  error: String,
  required: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)

const selectedOptions = computed(() =>
  props.options.filter(option => props.modelValue.includes(option.id))
)
const availableOptions = computed(() =>
  props.options.filter(option => !props.modelValue.includes(option.id))
)

const inputClass = computed(() =>
  props.error
    ? 'border-red-300 focus:border-red-400 focus:ring-red-400'
    : 'border-gray-300 focus:border-cyan-400 focus:ring-cyan-400'
)

function selectOption(optionId) {
  if (!props.modelValue.includes(optionId)) {
    emit('update:modelValue', [...props.modelValue, optionId])
  }
  isOpen.value = false
}
function removeOption(optionId) {
  emit('update:modelValue', props.modelValue.filter(id => id !== optionId))
}
function toggleDropdown() {
  isOpen.value = !isOpen.value
}

// Close dropdown on outside click
function handleClickOutside(event) {
  if (!event.target.closest('.relative')) isOpen.value = false
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script> 