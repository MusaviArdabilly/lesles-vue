<template>
  <div class="flex min-h-[calc(100dvh_-_84px)] h-full items-center">
    <!-- Skeleton  -->
    <div
      v-if="!auth.user?.name || isInitializing"
      class="w-full rounded-lg bg-white p-4 space-y-4 animate-pulse"
    >
      <div class="h-20 bg-gray-200 rounded-lg"></div>
      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      <div class="h-4 bg-gray-200 rounded w-2/3"></div>
      <div class="h-4 bg-gray-200 rounded w-1/3"></div>
      <div class="h-10 bg-gray-200 rounded w-full mt-4"></div>
      <div class="h-10 bg-gray-200 rounded w-1/2 mx-auto"></div>
    </div>

    <div v-else class="w-full rounded-lg bg-white space-y-4 p-4">
      <!-- Hero -->
      <div class="text-center rounded-lg bg-cyan-400 p-4">
        <div class="relative w-16 h-16 rounded-full bg-white mx-auto mb-3">
          <p
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-semibold"
          >
            {{ initials }}
          </p>
        </div>
        <h1 class="text-lg font-semibold">{{ name }}</h1>
        <p class="text-xs capitalize">{{ roleLabel }}</p>
      </div>

      <!-- Form Fields -->
      <div class="space-y-3">
        <div class="space-y-1">
          <label for="name" class="block text-sm font-medium text-gray-700"
            >Nama</label
          >
          <input
            v-model="name"
            type="text"
            id="name"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        <div class="space-y-1">
          <label for="phone" class="block text-sm font-medium text-gray-700"
            >No. WA</label
          >
          <input
            v-model="phone"
            type="text"
            id="phone"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        <div class="space-y-1">
          <label for="email" class="block text-sm font-medium text-gray-700"
            >Email</label
          >
          <input
            :value="email"
            type="email"
            id="email"
            disabled
            class="w-full rounded-lg border border-gray-300 text-gray-500 px-3 py-2 text-sm"
          />
        </div>

        <!-- TODO: Add for guru  -->
        <!-- Education Level + Grade -->
        <div v-if="auth.user.role === 'murid'" class="space-y-1">
          <label class="block text-sm font-medium text-gray-700"
            >Tingkat Pendidikan</label
          >
          <div class="flex gap-2">
            <select
              v-model="education_level_id"
              @change="onEducationLevelChange"
              class="w-1/2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            >
              <option value="" disabled>Pilih Tingkat</option>
              <option
                v-for="(name, id) in educationLevels"
                :key="id"
                :value="id"
              >
                {{ name }}
              </option>
            </select>
            <select
              v-model="grade"
              :disabled="!availableGrades.length"
              class="w-1/2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:bg-gray-100"
            >
              <option value="" disabled>Pilih Kelas</option>
              <option v-for="n in availableGrades" :key="n" :value="n">
                Kelas {{ n }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Logout Section -->
      <div class="flex justify-end gap-4 pt-3 border-t border-gray-200">
        <button
          @click="auth.logout()"
          class="text-sm font-medium rounded-lg border px-3 py-2 transition-colors hover:bg-red-100 text-red-500"
        >
          Logout
        </button>
        <button
          v-if="hasChanged"
          @click="updateUser"
          :disabled="isLoading"
          class="text-sm font-medium rounded-lg border px-3 py-2 transition-colors hover:bg-cyan-100 disabled:opacity-50"
        >
          <span>Simpan</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed, ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { authService } from '@/services/authService';
import axios from '@/lib/axios';

const auth = useAuthStore();
const showToast = inject('showToast');

const name = ref('');
const phone = ref('');
const email = ref('');
const education_level_id = ref('');
const grade = ref('');

const originalForm = ref({
  name: '',
  phone: '',
  education_level_id: '',
  grade: '',
});
const isLoading = ref(false);
const isInitializing = ref(true);

const educationLevels = ref({});

const selectedEducationLevel = computed(() => {
  if (!education_level_id.value) return '';
  return educationLevels.value[education_level_id.value] || '';
});

const availableGrades = computed(() => {
  const level = selectedEducationLevel.value.toUpperCase();
  if (level.includes('SD')) return [1, 2, 3, 4, 5, 6];
  if (level.includes('SMP')) return [7, 8, 9];
  if (level.includes('SMA')) return [10, 11, 12];
  return [];
});

const hasChanged = computed(() => {
  return (
    name.value !== originalForm.value.name ||
    phone.value !== originalForm.value.phone ||
    education_level_id.value !== originalForm.value.education_level_id ||
    grade.value !== originalForm.value.grade
  );
});

const roleLabel = computed(() => {
  const map = {
    guru: 'Guru',
    murid: 'Murid',
    operator: 'Operator',
    admin: 'Admin',
  };
  return map[auth.user?.role] || auth.user?.role;
});

const initials = computed(() =>
  (auth.user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
);

const onEducationLevelChange = () => {
  // Reset grade when education level changes
  grade.value = '';
};

const loadEducationLevels = async () => {
  try {
    const res = await axios.get('/education-levels');
    educationLevels.value = res?.data.data || {};
  } catch (error) {
    showToast?.('Gagal memuat tingkat pendidikan', 'error');
  }
};

const initializeFormData = () => {
  if (auth.user) {
    name.value = auth.user.name || '';
    phone.value = auth.user.phone || '';
    email.value = auth.user.email || '';

    // Get education_level_id and grade from student_profile
    education_level_id.value =
      auth.user.student_profile?.education_level_id || '';
    grade.value = auth.user.student_profile?.grade || '';

    originalForm.value = {
      name: name.value,
      phone: phone.value,
      education_level_id: education_level_id.value,
      grade: grade.value,
    };
  }
};

const updateUser = async () => {
  try {
    isLoading.value = true;
    const payload = {
      name: name.value,
      phone: phone.value,
      education_level_id: education_level_id.value,
      grade: grade.value,
    };
    await authService.updateProfile(payload);

    // Update the auth store with the new data
    // Since the API might return updated user data, we should refresh the user
    await auth.refreshUser();

    originalForm.value = { ...payload };
    showToast?.('Profil berhasil diperbarui', 'success');
  } catch (error) {
    const friendlyError = authService.handleError(
      error,
      'Gagal memperbarui profil'
    );
    showToast?.(friendlyError.message, 'error');
  } finally {
    isLoading.value = false;
  }
};

// Watch for changes in auth.user to reinitialize form data
watch(
  () => auth.user,
  (newUser) => {
    if (newUser) {
      initializeFormData();
    }
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  try {
    isInitializing.value = true;

    // Load education levels first
    await loadEducationLevels();

    // Initialize form data
    initializeFormData();
  } catch (error) {
    console.error('Error initializing profile:', error);
    showToast?.('Gagal memuat data profil', 'error');
  } finally {
    isInitializing.value = false;
  }
});
</script>
