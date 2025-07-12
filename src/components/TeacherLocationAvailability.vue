<template>
  <div class="border rounded-lg p-3 mb-2 bg-gray-50">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 mb-2">
      <select v-model="localValue.province_id" required class="w-full rounded-lg border text-sm px-3 py-2 bg-white border-gray-300 focus:border-cyan-400 focus:shadow-none focus:outline-none">
        <option value="">Pilih Provinsi</option>
        <option v-for="province in provinces" :key="province.id" :value="province.id">{{ province.name }}</option>
      </select>
      <select v-model="localValue.city_id" :disabled="!localValue.province_id" required class="w-full rounded-lg border text-sm px-3 py-2 bg-white border-gray-300 focus:border-cyan-400 focus:shadow-none focus:outline-none">
        <option value="">Pilih Kota/Kabupaten</option>
        <option v-for="city in cities" :key="city.id" :value="city.id">{{ city.name }}</option>
      </select>
      <select v-model="localValue.district_id" :disabled="!localValue.city_id" class="w-full rounded-lg border text-sm px-3 py-2 bg-white border-gray-300 focus:border-cyan-400 focus:shadow-none focus:outline-none">
        <option value="">Pilih Kecamatan (opsional)</option>
        <option v-for="district in districts" :key="district.id" :value="district.id">{{ district.name }}</option>
      </select>
      <select v-model="localValue.village_id" :disabled="!localValue.district_id" class="w-full rounded-lg border text-sm px-3 py-2 bg-white border-gray-300 focus:border-cyan-400 focus:shadow-none focus:outline-none">
        <option value="">Pilih Desa/Kelurahan (opsional)</option>
        <option v-for="village in villages" :key="village.id" :value="village.id">{{ village.name }}</option>
      </select>
    </div>
    <input type="text" v-model="localValue.address" required placeholder="Ket. (cth: Jombang dan sekitarnya )"
      class="w-full rounded-lg border text-sm px-3 py-2 bg-white border-gray-300 focus:border-cyan-400 focus:shadow-none focus:outline-none mb-1">
    <button v-if="showRemove" type="button" @click="$emit('remove')" class="text-xs text-red-500 mt-1">Hapus Lokasi</button>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { masterDataService } from '@/services/masterDataService'

const props = defineProps({
  modelValue: { type: Object, required: true },
  provinces: { type: Array, required: true },
  showRemove: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'remove'])

const defaultLocation = {
  province_id: '',
  city_id: '',
  district_id: '',
  village_id: '',
  address: ''
}

const localValue = ref({ ...defaultLocation, ...props.modelValue })
const cities = ref([])
const districts = ref([])
const villages = ref([])
const updatingFromParent = ref(false)

// Watch for prop changes (for v-model)
watch(() => props.modelValue, (val) => {
  updatingFromParent.value = true
  // Only update fields that have changed
  Object.keys(defaultLocation).forEach(key => {
    if (localValue.value[key] !== val[key]) {
      localValue.value[key] = val[key] ?? ''
    }
  })
  updatingFromParent.value = false
}, { deep: true })

// Emit changes up
watch(localValue, (val) => {
  if (!updatingFromParent.value) {
    emit('update:modelValue', { ...val })
  }
}, { deep: true })

// Cascading logic
watch(() => localValue.value.province_id, async (province_id) => {
  if (!province_id) {
    cities.value = []
    localValue.value.city_id = ''
    districts.value = []
    localValue.value.district_id = ''
    villages.value = []
    localValue.value.village_id = ''
    return
  }
  const res = await masterDataService.getCities(province_id)
  cities.value = res.data
  localValue.value.city_id = ''
  districts.value = []
  localValue.value.district_id = ''
  villages.value = []
  localValue.value.village_id = ''
})

watch(() => localValue.value.city_id, async (city_id) => {
  if (!city_id) {
    districts.value = []
    localValue.value.district_id = ''
    villages.value = []
    localValue.value.village_id = ''
    return
  }
  const res = await masterDataService.getDistricts(city_id)
  districts.value = res.data
  localValue.value.district_id = ''
  villages.value = []
  localValue.value.village_id = ''
})

watch(() => localValue.value.district_id, async (district_id) => {
  if (!district_id) {
    villages.value = []
    localValue.value.village_id = ''
    return
  }
  const res = await masterDataService.getVillages(district_id)
  villages.value = res.data
  localValue.value.village_id = ''
})

// Initialize if editing
onMounted(async () => {
  if (localValue.value.province_id) {
    const res = await masterDataService.getCities(localValue.value.province_id)
    cities.value = res.data
  }
  if (localValue.value.city_id) {
    const res = await masterDataService.getDistricts(localValue.value.city_id)
    districts.value = res.data
  }
  if (localValue.value.district_id) {
    const res = await masterDataService.getVillages(localValue.value.district_id)
    villages.value = res.data
  }
})
</script> 