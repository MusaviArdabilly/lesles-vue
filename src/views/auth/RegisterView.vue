<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-xl font-bold text-gray-500 mb-1">Daftar sebagai Guru</h1>
      <p class="text-xs text-gray-600">
        Ini adala portal untuk pendaftaran guru. Murid hanya perlu login dengan
        google
      </p>
    </div>

    <!-- Info Box -->
    <div
      class="bg-blue-50 border border-blue-200 rounded-lg text-blue-600 text-xs p-2"
    >
      <p>
        <strong>Catatan:</strong> Setelah mendaftar, Anda akan menerima email
        verifikasi untuk mengaktifkan akun.
      </p>
    </div>

    <!-- Form Fields -->
    <div class="space-y-3">
      <div class="space-y-1">
        <label for="name" class="block text-sm font-medium text-gray-700"
          >Nama</label
        >
        <input
          type="text"
          id="name"
          v-model="form.name"
          :class="inputClass('name')"
          placeholder="Nama Lengkap"
        />
        <div v-if="fieldErrors.name" class="text-xs text-red-600 mt-1">
          {{ fieldErrors.name[0] }}
        </div>
      </div>

      <div class="space-y-1">
        <label for="phone" class="block text-sm font-medium text-gray-700"
          >No. HP (WA)</label
        >
        <div class="relative flex">
          <span
            class="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg"
          >
            +62
          </span>
          <input
            type="tel"
            id="phone"
            v-model="phoneInput"
            @input="handlePhoneInput"
            @blur="validatePhone"
            :class="phoneInputClass"
            placeholder="8123456789"
            maxlength="12"
            class="flex-1 rounded-l-none"
            @paste.prevent
          />
          <div
            v-if="phoneValidationStatus === 'valid'"
            class="absolute right-3 top-2.5"
          >
            <span class="text-green-500 text-sm">✓</span>
          </div>
        </div>
        <div v-if="fieldErrors.phone" class="text-xs text-red-600 mt-1">
          {{ fieldErrors.phone[0] }}
        </div>
      </div>

      <div class="space-y-1">
        <label for="email" class="block text-sm font-medium text-gray-700"
          >Email</label
        >
        <input
          type="email"
          id="email"
          v-model="form.email"
          :class="inputClass('email')"
          placeholder="your@email.com"
        />
        <div v-if="fieldErrors.email" class="text-xs text-red-600 mt-1">
          {{ fieldErrors.email[0] }}
        </div>
      </div>

      <div class="space-y-1">
        <label for="password" class="block text-sm font-medium text-gray-700"
          >Password</label
        >
        <input
          type="password"
          id="password"
          v-model="form.password"
          :class="inputClass('password')"
          placeholder="••••••••"
        />
        <div v-if="fieldErrors.password" class="text-xs text-red-600 mt-1">
          {{ fieldErrors.password[0] }}
        </div>
      </div>

      <div class="space-y-1">
        <label
          for="password_confirmation"
          class="block text-sm font-medium text-gray-700"
          >Konfirmasi Password</label
        >
        <input
          type="password"
          id="password_confirmation"
          v-model="form.password_confirmation"
          :class="inputClass('password_confirmation', true)"
          placeholder="••••••••"
        />
        <div
          v-if="fieldErrors.password_confirmation"
          class="text-xs text-red-600 mt-1"
        >
          {{ fieldErrors.password_confirmation[0] }}
        </div>
        <div
          v-else-if="form.password_confirmation && !passwordMatch"
          class="text-xs text-red-600 mt-1"
        >
          Password tidak cocok
        </div>
        <div
          v-else-if="passwordMatch && form.password_confirmation"
          class="text-xs text-green-600 mt-1"
        >
          ✓ Password cocok
        </div>
      </div>

      <!-- General error message -->
      <div
        v-if="generalError"
        class="bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 p-2"
      >
        {{ generalError }}
      </div>

      <button
        @click="register"
        :disabled="loading || !isFormValid"
        :class="[
          'w-full font-medium rounded-lg text-sm transition-colors shadow-sm px-3 py-2',
          loading || !isFormValid
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-cyan-400 text-white cursor-pointer hover:bg-cyan-500',
        ]"
      >
        {{ loading ? 'Mendaftar...' : 'Daftar' }}
      </button>
    </div>

    <!-- Login Link -->
    <div class="text-center pt-3 border-t border-gray-200">
      <p class="text-xs text-gray-600 mb-1">Sudah punya akun?</p>
      <RouterLink
        to="/login"
        class="text-cyan-600 text-xs font-medium cursor-pointer hover:text-cyan-700"
      >
        Masuk
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const showToast = inject('showToast');

const form = ref({
  name: '',
  phone: '', // This will store the normalized phone number for the API
  email: '',
  password: '',
  password_confirmation: '',
  role: 'guru',
});

const phoneInput = ref(''); // This will store the user input (without +62)
const phoneValidationStatus = ref(''); // 'valid', 'invalid', or ''
const fieldErrors = ref({});
const generalError = ref('');
const loading = ref(false);

const passwordMatch = computed(() => {
  if (!form.value.password_confirmation) return true;
  return form.value.password === form.value.password_confirmation;
});

const isFormValid = computed(() => {
  return (
    form.value.name &&
    form.value.email &&
    form.value.password &&
    passwordMatch.value &&
    phoneValidationStatus.value === 'valid'
  );
});

// Phone number utilities
const normalizeToLocalFormat = (input) => {
  // Remove all non-digit characters
  const digits = input.replace(/\D/g, '');

  // If input starts with 62 (from +62 format), remove it
  if (digits.startsWith('62')) {
    return digits.substring(2);
  }

  // If input starts with 0, remove it (user might type 08xxx)
  if (digits.startsWith('0')) {
    return digits.substring(1);
  }

  return digits;
};

const formatPhoneDisplay = (phone) => {
  // Just return the digits without any dashes
  return phone.replace(/\D/g, '');
};

const isValidIndonesianMobile = (phone) => {
  const digits = phone.replace(/\D/g, '');

  // Should be 9-12 digits after +62
  if (digits.length < 9 || digits.length > 12) return false;

  return true; // Accept any number in the valid length range
};

const handlePhoneInput = (event) => {
  let value = event.target.value;

  // Handle pasted content - normalize first
  const normalized = normalizeToLocalFormat(value);

  // Update the input value to show normalized digits
  phoneInput.value = normalized;

  // Also update the actual input element to reflect the change
  event.target.value = normalized;

  // Clear previous validation
  phoneValidationStatus.value = '';

  if (normalized.length > 0) {
    if (isValidIndonesianMobile(normalized)) {
      // Store in 0xxxxxxxxxx format for the form
      form.value.phone = '0' + normalized;
      phoneValidationStatus.value = 'valid';
    } else {
      form.value.phone = '';
      phoneValidationStatus.value = 'invalid';
    }
  } else {
    form.value.phone = '';
  }
};

const validatePhone = () => {
  if (phoneInput.value && phoneValidationStatus.value === 'valid') {
    // Keep the display clean without formatting
    phoneInput.value = formatPhoneDisplay(phoneInput.value);
  }
};

const clearErrors = () => {
  fieldErrors.value = {};
  generalError.value = '';
};

const register = async () => {
  clearErrors();

  // Manual password confirmation check
  if (form.value.password !== form.value.password_confirmation) {
    fieldErrors.value.password_confirmation = ['Password tidak cocok'];
    generalError.value = 'Password dan konfirmasi password harus sama.';
    return;
  }

  // Validate phone number one more time
  if (!form.value.phone || phoneValidationStatus.value !== 'valid') {
    fieldErrors.value.phone = ['Nomor HP tidak valid'];
    generalError.value = 'Mohon periksa nomor HP Anda.';
    return;
  }

  loading.value = true;

  try {
    const res = await authService.register(form.value);

    const auth = useAuthStore();
    auth.setToken(res.data.token);
    await auth.fetchUser();

    showToast('Pendaftaran berhasil!', 'success');

    const redirectRoute = auth.getLoginRedirectRoute();
    router.push(redirectRoute);
  } catch (err) {
    console.error(err);

    const errorData = err?.response?.data;

    if (
      [400, 422].includes(err?.response?.status) &&
      typeof errorData === 'object'
    ) {
      fieldErrors.value = errorData;
      generalError.value = 'Please fix the form errors above.';
    } else {
      generalError.value =
        errorData?.message || 'An error occurred during registration.';
    }

    showToast(generalError.value, 'error');
  } finally {
    loading.value = false;
  }
};

const phoneInputClass = computed(() => {
  const base =
    'w-full rounded-lg border text-sm px-3 py-2 transition-colors focus:ring-1';

  if (fieldErrors.value.phone) {
    return `${base} border-red-300 focus:border-red-400 focus:ring-red-400`;
  }

  if (phoneValidationStatus.value === 'valid') {
    return `${base} border-green-300 focus:border-green-400 focus:ring-green-400`;
  } else if (phoneValidationStatus.value === 'invalid') {
    return `${base} border-red-300 focus:border-red-400 focus:ring-red-400`;
  }

  return `${base} border-gray-300 focus:border-cyan-400 focus:ring-cyan-400`;
});

const inputClass = (field, isConfirmation = false) => {
  const base =
    'w-full rounded-lg border text-sm px-3 py-2 transition-colors focus:ring-1';

  if (fieldErrors.value[field]) {
    return `${base} border-red-300 focus:border-red-400 focus:ring-red-400`;
  }

  if (isConfirmation && form.value.password_confirmation) {
    return passwordMatch.value
      ? `${base} border-green-300 focus:border-green-400 focus:ring-green-400`
      : `${base} border-red-300 focus:border-red-400 focus:ring-red-400`;
  }

  return `${base} border-gray-300 focus:border-cyan-400 focus:ring-cyan-400`;
};
</script>
