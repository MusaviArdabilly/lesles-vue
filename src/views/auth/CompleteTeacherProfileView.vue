<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-xl font-bold text-gray-500 mb-1">Lengkapi Profil Guru</h1>
      <p class="text-xs text-gray-600">
        Lengkapi data diri Anda untuk melanjutkan
      </p>
    </div>

    <!-- TEACHER FORM -->
    <form @submit.prevent="completeTeacherProfile" class="space-y-3">
      <!-- Location -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">Alamat</label>

        <!-- Province -->
        <select
          v-model="form.province_id"
          @change="loadCities"
          required
          :class="inputClass()"
        >
          <option value="">Pilih Provinsi</option>
          <option
            v-for="province in provinces"
            :key="province.id"
            :value="province.id"
          >
            {{ province.name }}
          </option>
        </select>

        <!-- City -->
        <select
          v-model="form.city_id"
          @change="loadDistricts"
          :disabled="!form.province_id"
          required
          :class="inputClass()"
        >
          <option value="">Pilih Kota/Kabupaten</option>
          <option v-for="city in cities" :key="city.id" :value="city.id">
            {{ city.name }}
          </option>
        </select>

        <!-- District -->
        <select
          v-model="form.district_id"
          @change="loadVillages"
          :disabled="!form.city_id"
          :class="inputClass()"
        >
          <option value="">Pilih Kecamatan</option>
          <option
            v-for="district in districts"
            :key="district.id"
            :value="district.id"
          >
            {{ district.name }}
          </option>
        </select>

        <!-- Village -->
        <select
          v-model="form.village_id"
          :disabled="!form.district_id"
          :class="inputClass()"
        >
          <option value="">Pilih Desa/Kelurahan</option>
          <option
            v-for="village in villages"
            :key="village.id"
            :value="village.id"
          >
            {{ village.name }}
          </option>
        </select>
      </div>

      <!-- Education Levels -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700"
          >Ketersediaan Jenjang</label
        >
        <div class="space-y-2">
          <label
            v-for="level in educationLevelsArray"
            :key="level.id"
            class="flex items-center"
          >
            <input
              type="checkbox"
              :value="level.id"
              v-model="form.education_level_ids"
              class="mr-2"
            />
            {{ level.name }}
          </label>
        </div>
        <div
          v-if="fieldErrors.education_level_ids"
          class="text-xs text-red-600"
        >
          {{ fieldErrors.education_level_ids[0] }}
        </div>
      </div>

      <!-- Subjects -->
      <div class="space-y-1" v-if="form.education_level_ids.length > 0">
        <label class="block text-sm font-medium text-gray-700"
          >Mata Pelajaran</label
        >
        <div class="space-y-2 max-h-40 overflow-y-auto">
          <label
            v-for="subject in filteredSubjects"
            :key="subject.id"
            class="flex items-center"
          >
            <input
              type="checkbox"
              :value="subject.id"
              v-model="form.subject_ids"
              class="mr-2"
            />
            {{ subject.education_level.code }} - {{ subject.name }}
          </label>
        </div>
        <div v-if="fieldErrors.subject_ids" class="text-xs text-red-600">
          {{ fieldErrors.subject_ids[0] }}
        </div>
        <!-- Debug info - remove in production -->
        <div class="text-xs text-gray-500 mt-2">
          <p>Available subjects: {{ filteredSubjects.length }}</p>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="isLoading"
        class="w-full font-medium rounded-lg bg-cyan-400 text-white text-sm transition-colors shadow-sm px-3 py-2 hover:bg-cyan-500 disabled:opacity-50"
      >
        {{ isLoading ? 'Memproses...' : 'Lengkapi Profil' }}
      </button>
    </form>

    <!-- Error Message -->
    <div
      v-if="generalError"
      class="bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 p-2"
    >
      {{ generalError }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/lib/axios';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();

// State
const form = reactive({
  phone: '',
  education_level_ids: [],
  subject_ids: [],
  province_id: '',
  city_id: '',
  district_id: '',
  village_id: '',
});

const educationLevels = ref({});
const subjects = ref([]);
const provinces = ref([]);
const cities = ref([]);
const districts = ref([]);
const villages = ref([]);
const fieldErrors = ref({});
const generalError = ref('');
const isLoading = ref(false);

// Computed
const educationLevelsArray = computed(() => {
  // Convert education levels object to array for easier iteration
  return Object.entries(educationLevels.value).map(([id, name]) => ({
    id: parseInt(id),
    name: name,
  }));
});

const filteredSubjects = computed(() => {
  if (!form.education_level_ids.length) return [];

  console.log('Education level IDs:', form.education_level_ids);
  console.log('All subjects:', subjects.value);

  const filtered = subjects.value.filter((subject) => {
    const isIncluded = form.education_level_ids.includes(
      Number(subject.education_level_id)
    );
    console.log(
      `Subject ${subject.name} (level ${Number(
        subject.education_level_id
      )}): ${isIncluded}`
    );
    return isIncluded;
  });

  console.log('Filtered subjects:', filtered);
  return filtered;
});

// Helper functions
const inputClass = (fieldErr = null) => [
  'w-full rounded-lg border text-sm px-3 py-2 transition-colors focus:ring-1',
  fieldErr
    ? 'border-red-300 focus:border-red-400 focus:ring-red-400'
    : 'border-gray-300 focus:border-cyan-400 focus:ring-cyan-400',
];

const clearErrors = () => {
  fieldErrors.value = {};
  generalError.value = '';
};

const showError = (message) => {
  generalError.value = message;
};

// API calls
const loadEducationLevels = async () => {
  try {
    const response = await axios.get('/education-levels');
    educationLevels.value = response.data.data;
    console.log('Education levels loaded:', educationLevels.value);
  } catch (error) {
    console.error('Error loading education levels:', error);
    showError('Gagal memuat tingkat pendidikan');
  }
};

const loadSubjects = async () => {
  try {
    const response = await axios.get('/subjects');
    subjects.value = response.data.data || [];
    console.log('Subjects loaded:', subjects.value);
  } catch (error) {
    console.error('Error loading subjects:', error);
    showError('Gagal memuat mata pelajaran');
  }
};

const loadProvinces = async () => {
  try {
    const response = await axios.get('/locations/provinces');
    provinces.value = Array.isArray(response.data.data)
      ? response.data.data
      : Array.isArray(response.data)
      ? response.data
      : [];
  } catch (error) {
    console.error('Error loading provinces:', error);
    showError('Gagal memuat provinsi');
  }
};

const loadCities = async () => {
  if (!form.province_id) return;

  try {
    const response = await axios.get(
      `/locations/cities?province_id=${form.province_id}`
    );
    cities.value = Array.isArray(response.data.data)
      ? response.data.data
      : Array.isArray(response.data)
      ? response.data
      : [];

    // Reset dependent fields
    form.city_id = '';
    form.district_id = '';
    form.village_id = '';
    districts.value = [];
    villages.value = [];
  } catch (error) {
    console.error('Error loading cities:', error);
    showError('Gagal memuat kota/kabupaten');
  }
};

const loadDistricts = async () => {
  if (!form.city_id) return;

  try {
    const response = await axios.get(
      `/locations/districts?city_id=${form.city_id}`
    );
    districts.value = Array.isArray(response.data.data)
      ? response.data.data
      : Array.isArray(response.data)
      ? response.data
      : [];

    // Reset dependent fields
    form.district_id = '';
    form.village_id = '';
    villages.value = [];
  } catch (error) {
    console.error('Error loading districts:', error);
    showError('Gagal memuat kecamatan');
  }
};

const loadVillages = async () => {
  if (!form.district_id) return;

  try {
    const response = await axios.get(
      `/locations/villages?district_id=${form.district_id}`
    );
    villages.value = Array.isArray(response.data.data)
      ? response.data.data
      : Array.isArray(response.data)
      ? response.data
      : [];

    // Reset dependent fields
    form.village_id = '';
  } catch (error) {
    console.error('Error loading villages:', error);
    showError('Gagal memuat desa/kelurahan');
  }
};

// Form submission
const completeTeacherProfile = async () => {
  if (!form.education_level_ids.length) {
    showError('Pilih minimal satu jenjang pendidikan');
    return;
  }

  if (!form.subject_ids.length) {
    showError('Pilih minimal satu mata pelajaran');
    return;
  }

  isLoading.value = true;
  clearErrors();

  try {
    const payload = {
      phone: form.phone,
      education_level_ids: form.education_level_ids,
      subject_ids: form.subject_ids,
      province_id: form.province_id,
      city_id: form.city_id,
      district_id: form.district_id,
      village_id: form.village_id,
    };

    await axios.post('/teacher/complete-profile', payload);

    // Refresh user data
    await auth.refreshUser();

    // Redirect to dashboard
    const redirectRoute = auth.getLoginRedirectRoute();
    router.push(redirectRoute);
  } catch (error) {
    console.error('Error completing teacher profile:', error);

    if (error.response?.data?.errors) {
      fieldErrors.value = error.response.data.errors;
    } else {
      showError(error.response?.data?.message || 'Gagal melengkapi profil');
    }
  } finally {
    isLoading.value = false;
  }
};

// Watchers
watch(() => form.province_id, loadCities);
watch(() => form.city_id, loadDistricts);
watch(() => form.district_id, loadVillages);

// Watch for education level changes and clear subject selection
watch(
  () => form.education_level_ids,
  (newLevels, oldLevels) => {
    // Clear subject selection when education levels change
    form.subject_ids = [];
    console.log('Education levels changed:', newLevels);
  },
  { deep: true }
);

// Lifecycle
onMounted(() => {
  loadEducationLevels();
  loadSubjects();
  loadProvinces();
});
</script>
