<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-xl font-bold text-gray-500 mb-1">
        Lengkapi Profil Siswa
      </h1>
      <p class="text-xs text-gray-600">
        Lengkapi data diri Anda untuk melanjutkan
      </p>
    </div>

    <!-- STUDENT FORM -->
    <form @submit.prevent="completeStudentProfile" class="space-y-3">
      <!-- Phone -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700"
          >No. Telepon</label
        >
        <input
          type="tel"
          v-model="form.phone"
          required
          :class="inputClass(fieldErrors.phone)"
          placeholder="081234567890"
        />
        <div v-if="fieldErrors.phone" class="text-xs text-red-600">
          {{ fieldErrors.phone[0] }}
        </div>
      </div>

      <!-- Address -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">Alamat</label>

        <!-- Province -->
        <select
          v-model="form.province_id"
          @change="loadCities"
          required
          :class="inputClass(fieldErrors.province_id)"
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
        <div v-if="fieldErrors.province_id" class="text-xs text-red-600">
          {{ fieldErrors.province_id[0] }}
        </div>

        <!-- City -->
        <select
          v-model="form.city_id"
          @change="loadDistricts"
          :disabled="!form.province_id"
          required
          :class="inputClass(fieldErrors.city_id)"
        >
          <option value="">Pilih Kota/Kabupaten</option>
          <option v-for="city in cities" :key="city.id" :value="city.id">
            {{ city.name }}
          </option>
        </select>
        <div v-if="fieldErrors.city_id" class="text-xs text-red-600">
          {{ fieldErrors.city_id[0] }}
        </div>

        <!-- District -->
        <select
          v-model="form.district_id"
          @change="loadVillages"
          :disabled="!form.city_id"
          required
          :class="inputClass(fieldErrors.district_id)"
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
        <div v-if="fieldErrors.district_id" class="text-xs text-red-600">
          {{ fieldErrors.district_id[0] }}
        </div>

        <!-- Village -->
        <select
          v-model="form.village_id"
          :disabled="!form.district_id"
          required
          :class="inputClass(fieldErrors.village_id)"
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
        <div v-if="fieldErrors.village_id" class="text-xs text-red-600">
          {{ fieldErrors.village_id[0] }}
        </div>
      </div>

      <!-- Education Level -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700"
          >Tingkat Pendidikan</label
        >
        <select
          v-model="form.education_level_id"
          @change="form.grade = ''"
          required
          :class="inputClass(fieldErrors.education_level_id)"
        >
          <option value="">Pilih Tingkat Pendidikan</option>
          <option v-for="(name, id) in educationLevels" :key="id" :value="id">
            {{ name }}
          </option>
        </select>
        <div v-if="fieldErrors.education_level_id" class="text-xs text-red-600">
          {{ fieldErrors.education_level_id[0] }}
        </div>
      </div>

      <!-- Grade -->
      <div class="space-y-1" v-if="availableGrades.length > 0">
        <label class="block text-sm font-medium text-gray-700">Kelas</label>
        <select
          v-model="form.grade"
          required
          :class="inputClass(fieldErrors.grade)"
        >
          <option value="">Pilih Kelas</option>
          <option v-for="grade in availableGrades" :key="grade" :value="grade">
            Kelas {{ grade }}
          </option>
        </select>
        <div v-if="fieldErrors.grade" class="text-xs text-red-600">
          {{ fieldErrors.grade[0] }}
        </div>
      </div>

      <!-- School Name -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700"
          >Nama Sekolah</label
        >
        <input
          type="text"
          v-model="form.school_name"
          required
          :class="inputClass(fieldErrors.school_name)"
          placeholder="Nama Sekolah"
        />
        <div v-if="fieldErrors.school_name" class="text-xs text-red-600">
          {{ fieldErrors.school_name[0] }}
        </div>
      </div>

      <!-- Parent Name -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700"
          >Nama Orang Tua</label
        >
        <input
          type="text"
          v-model="form.parent_name"
          :class="inputClass(fieldErrors.parent_name)"
          placeholder="Nama Orang Tua"
        />
        <div v-if="fieldErrors.parent_name" class="text-xs text-red-600">
          {{ fieldErrors.parent_name[0] }}
        </div>
      </div>

      <!-- Parent Phone -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700"
          >No. WA Orang Tua</label
        >
        <input
          type="tel"
          v-model="form.parent_phone"
          :class="inputClass(fieldErrors.parent_phone)"
          placeholder="081234567890"
        />
        <div v-if="fieldErrors.parent_phone" class="text-xs text-red-600">
          {{ fieldErrors.parent_phone[0] }}
        </div>
      </div>

      <!-- Password -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700"
          >Password Akun</label
        >
        <div class="relative">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="form.password"
            required
            :class="inputClass(fieldErrors.password) + ' pr-10'"
            placeholder="••••••••"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <Eye v-if="showPassword" class="w-4 h-4 text-gray-400" />
            <EyeOff v-else class="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div v-if="fieldErrors.password" class="text-xs text-red-600">
          {{ fieldErrors.password[0] }}
        </div>
      </div>

      <!-- Password Confirmation -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700"
          >Konfirmasi Password</label
        >
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="form.password_confirmation"
          required
          :class="inputClass(fieldErrors.password_confirmation)"
          placeholder="Konfirmasi password"
        />
        <div
          v-if="fieldErrors.password_confirmation"
          class="text-xs text-red-600"
        >
          {{ fieldErrors.password_confirmation[0] }}
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
import { Eye, EyeOff } from 'lucide-vue-next';

const router = useRouter();
const auth = useAuthStore();

// State
const form = reactive({
  phone: '',
  province_id: '',
  city_id: '',
  district_id: '',
  village_id: '',
  education_level_id: '',
  school_name: '',
  grade: '',
  parent_name: '',
  parent_phone: '',
  password: '',
  password_confirmation: '',
});

const educationLevels = ref({});
const provinces = ref([]);
const cities = ref([]);
const districts = ref([]);
const villages = ref([]);
const fieldErrors = ref({});
const generalError = ref('');
const isLoading = ref(false);
const showPassword = ref(false);

// Computed
const selectedEducationLevel = computed(() => {
  if (!form.education_level_id) return '';
  return educationLevels.value[form.education_level_id] || '';
});

const availableGrades = computed(() => {
  const level = selectedEducationLevel.value.toUpperCase();
  if (level.includes('SD')) return [1, 2, 3, 4, 5, 6];
  if (level.includes('SMP')) return [7, 8, 9];
  if (level.includes('SMA')) return [10, 11, 12];
  return [];
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
  } catch (error) {
    console.error('Error loading education levels:', error);
    showError('Gagal memuat tingkat pendidikan');
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
const completeStudentProfile = async () => {
  if (form.password !== form.password_confirmation) {
    showError('Password dan konfirmasi password tidak cocok');
    return;
  }

  isLoading.value = true;
  clearErrors();

  try {
    const payload = {
      phone: form.phone,
      province_id: form.province_id,
      city_id: form.city_id,
      district_id: form.district_id,
      village_id: form.village_id,
      education_level_id: form.education_level_id,
      school_name: form.school_name,
      grade: form.grade,
      parent_name: form.parent_name,
      parent_phone: form.parent_phone,
      password: form.password,
      password_confirmation: form.password_confirmation,
    };

    await axios.post('/student/complete-profile', payload);

    // Refresh user data
    await auth.refreshUser();

    const redirectRoute = auth.getLoginRedirectRoute();
    router.push(redirectRoute);
  } catch (error) {
    console.error('Error completing student profile:', error);

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

// Lifecycle
onMounted(() => {
  loadEducationLevels();
  loadProvinces();
});
</script>
