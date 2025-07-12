<template>
  <div class="relative text-sm" ref="wrapper">
    <!-- Trigger -->
    <div
      @click="toggleDropdown"
      class="flex flex-wrap items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 cursor-pointer transition-colors focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
    >
      <template v-if="modelValue.length">
        <span
          v-for="(option, index) in modelValue"
          :key="index"
          class="flex items-center rounded-lg border border-gray-300 text-xs px-2 py-1"
        >
          {{ option[labelKey] }}
          <button
            @click.stop="removeOption(option)"
            class="border-l border-gray-300 pl-2 ml-2 cursor-pointer"
          >
            &times;
          </button>
        </span>
      </template>
      <span v-else class="text-gray-400 text-sm">Pilih</span>
    </div>

    <!-- Dropdown -->
    <div
      v-show="open"
      class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
    >
      <!-- Search Input -->
      <input
        type="text"
        v-model="search"
        placeholder="Cari..."
        class="w-full px-3 py-2 border-b border-gray-300 outline-none text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
        @click.stop
      />

      <!-- Options -->
      <ul>
        <li
          v-for="(option, index) in filteredOptions"
          :key="index"
          @click.stop="selectOption(option)"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
        >
          <input
            class="mr-2"
            type="checkbox"
            :checked="isSelected(option)"
            @change.prevent
          />
          {{ option[labelKey] }}
        </li>
        <li v-if="!filteredOptions.length" class="px-4 py-2 text-gray-400 text-xs">
          Tidak ada hasil.
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "SearchableMultiselect",
  props: {
    modelValue: {
      type: Array,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    labelKey: {
      type: String,
      default: "label",
    },
    valueKey: {
      type: String,
      default: "value",
    },
  },
  data() {
    return {
      open: false,
      search: "",
    };
  },
  computed: {
    filteredOptions() {
      const term = this.search.toLowerCase();
      return this.options.filter(
        (opt) =>
          opt[this.labelKey].toLowerCase().includes(term) &&
          !this.modelValue.some(
            (sel) => sel[this.valueKey] === opt[this.valueKey]
          )
      );
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    toggleDropdown() {
      this.open = !this.open;
      if (this.open) this.search = "";
    },
    selectOption(option) {
      const updated = [...this.modelValue, option];
      this.$emit("update:modelValue", updated);
      this.search = "";
    },
    removeOption(option) {
      const updated = this.modelValue.filter(
        (o) => o[this.valueKey] !== option[this.valueKey]
      );
      this.$emit("update:modelValue", updated);
    },
    isSelected(option) {
      return this.modelValue.some(
        (o) => o[this.valueKey] === option[this.valueKey]
      );
    },
    handleClickOutside(event) {
      if (!this.$refs.wrapper.contains(event.target)) {
        this.open = false;
        this.search = "";
      }
    },
  },
};
</script>
