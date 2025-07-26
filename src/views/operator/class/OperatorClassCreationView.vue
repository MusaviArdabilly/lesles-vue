<template>
  <div class="space-y-6">
    <div class="sticky top-0">
      <div class="flex justify-start items-center gap-4">
        <RouterLink
          to="/operator/class"
          class="cursor-pointer hover:-translate-x-0.25 transition-all"
        >
          <ArrowLeft class="size-6" />
        </RouterLink>
        <h1 class="text-xl font-semibold">Buat Kelas</h1>
      </div>
    </div>

    <div class="rounded-lg bg-white space-y-4 p-4">
      <div class="text-center">
        <h1 class="text-xl font-bold text-gray-500 mb-1">Buat Kelas Baru</h1>
        <p class="text-xs text-gray-600">Isi detail kelas baru disini.</p>
        <p class="text-xs text-gray-600 mb-3">
          Operator akan melakukan pertinjau dan menyetujui
        </p>
      </div>
      <div class="space-y-3">
        <!-- Tipe Kelas  -->
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700">Tipe</label>
          <select
            v-model="form.type"
            required
            class="w-full rounded-lg text-sm border border-gray-300 px-3 py-2 transition-colors focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
          >
            <option value="">Pilih Tipe</option>
            <option value="privat">Privat</option>
            <option value="grup">Grup</option>
          </select>
          <ValidationError :errors="validationError.type" />
        </div>

        <!-- Member Grup (hanya jika tipe grup) -->
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700"
            >Anggota Grup (Email Siswa)</label
          >

          <div class="flex gap-2">
            <input
              v-model="newMemberEmail"
              type="email"
              placeholder="Email teman kamu"
              class="flex-1 rounded-lg text-sm border border-gray-300 px-3 py-2 transition-colors focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
            />
            <button
              type="button"
              @click="addMember"
              class="text-sm font-medium px-3 py-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-600"
            >
              Tambah
            </button>
          </div>
          <p v-if="emailCheckStatus" class="text-xs text-red-500">
            {{ emailCheckStatus }}
          </p>

          <ul class="mt-2 space-y-1">
            <li
              v-for="(email, index) in form.members"
              :key="index"
              class="flex items-center justify-between bg-gray-100 px-3 py-1 rounded"
            >
              <span class="text-sm">{{ email }}</span>
              <button
                type="button"
                @click="removeMember(index)"
                class="text-xs text-red-500 hover:underline"
              >
                Hapus
              </button>
            </li>
          </ul>
          <ValidationError :errors="validationError.members" />
        </div>

        <!-- Mata Pelajaran  -->
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700"
            >Mata Pelajaran</label
          >
          <select
            v-model="form.subject_id"
            required
            class="w-full rounded-lg text-sm border border-gray-300 px-3 py-2 transition-colors focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
          >
            <option value="">Pilih Mata Pelajaran</option>
            <option
              v-for="subject in subjects"
              :key="subject.id"
              :value="subject.id"
            >
              {{ subject.education_level.code }} - {{ subject.name }}
            </option>
          </select>
          <ValidationError :errors="validationError.subject_id" />
        </div>

        <!-- Nama -->
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700"
            >Nama Kelas</label
          >
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full rounded-lg text-sm border border-gray-300 px-3 py-2 transition-colors focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
          />
          <ValidationError :errors="validationError.name" />
        </div>

        <!-- Alamat Kelas -->
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700"
            >Lokasi Kelas</label
          >

          <!-- Provinsi -->
          <select
            v-model="form.location_province_id"
            required
            class="w-full rounded-lg text-sm border border-gray-300 px-3 py-2 transition-colors focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
          >
            <option value="">Pilih Provinsi</option>
            <option v-for="prov in provinces" :key="prov.id" :value="prov.id">
              {{ prov.name }}
            </option>
          </select>

          <!-- Kota -->
          <select
            v-model="form.location_city_id"
            :disabled="!form.location_province_id"
            required
            class="w-full rounded-lg text-sm border border-gray-300 px-3 py-2 transition-colors focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
          >
            <option value="">Pilih Kota/Kabupaten</option>
            <option v-for="city in cities" :key="city.id" :value="city.id">
              {{ city.name }}
            </option>
          </select>

          <!-- Kecamatan -->
          <select
            v-model="form.location_district_id"
            :disabled="!form.location_city_id"
            required
            class="w-full rounded-lg text-sm border border-gray-300 px-3 py-2 transition-colors focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
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

          <!-- Desa -->
          <select
            v-model="form.location_village_id"
            :disabled="!form.location_district_id"
            required
            class="w-full rounded-lg text-sm border border-gray-300 px-3 py-2 transition-colors focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
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

          <!-- Alamat Detail -->
          <input
            v-model="form.location_address"
            type="text"
            placeholder="Alamat lengkap"
            class="w-full rounded-lg text-sm border border-gray-300 px-3 py-2 mt-2 transition-colors focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
          />
        </div>

        <!-- Jadwal Kelas -->
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700">Jadwal</label>

          <div
            v-for="(schedule, index) in form.schedule"
            :key="index"
            class="grid grid-cols-3 gap-2 items-end"
          >
            <div>
              <label class="block text-xs text-gray-600 mb-1">Hari</label>
              <select
                v-model="schedule.day"
                class="w-full rounded-lg text-sm border border-gray-300 px-3 py-2 transition-colors focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
                required
              >
                <option disabled value="">Pilih Hari</option>
                <option v-for="day in days" :key="day" :value="day">
                  {{ day }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs text-gray-600 mb-1">Mulai</label>
              <input
                v-model="schedule.start_time"
                @change="handleStartTimeChange(index)"
                type="time"
                class="w-full rounded-lg text-sm border border-gray-300 px-3 py-2 transition-colors focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
                required
              />
            </div>

            <div>
              <label class="block text-xs text-gray-600 mb-1">Selesai</label>
              <input
                v-model="schedule.end_time"
                type="time"
                :min="schedule.start_time"
                class="w-full rounded-lg text-sm border border-gray-300 px-3 py-2 transition-colors focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
                required
              />
            </div>

            <div class="col-span-3 flex justify-end">
              <button
                type="button"
                @click="removeSchedule(index)"
                class="text-red-500 text-xs hover:underline"
              >
                Hapus Jadwal
              </button>
            </div>
          </div>

          <button
            type="button"
            @click="addSchedule"
            class="text-sm text-cyan-600 hover:underline"
          >
            + Tambah Jadwal
          </button>
          <ValidationError :errors="validationError.schedule" />
        </div>

        <!-- General Errors -->
        <GeneralError :message="generalError" />{{ generalError }}

        <!-- Submit Button -->
        <div class="flex justify-between gap-2">
          <button
            @click="router.push('/class')"
            class="w-full text-sm text-cyan-400 font-medium rounded-lg border border-cyan-400 px-3 py-2 cursor-pointer"
          >
            Batal
          </button>

          <button
            @click="classSubmission()"
            :disabled="isLoading"
            class="w-full font-medium rounded-lg bg-cyan-400 text-white text-sm transition-colors shadow-sm px-3 py-2 cursor-pointer hover:bg-cyan-500 disabled:opacity-50"
          >
            {{ isLoading ? 'Memproses...' : 'Buat Kelas' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, watch, reactive, ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { masterDataService } from '@/services/masterDataService';
import { userService } from '@/services/userService';
import axios from '@/lib/axios';

import { ArrowLeft } from 'lucide-vue-next';
import GeneralError from '@/components/GeneralError.vue';
import ValidationError from '@/components/ValidationError.vue';

import { useRouter } from 'vue-router';
const router = useRouter();

const showToast = inject('showToast');

const auth = useAuthStore();

const subjects = ref([]);
const provinces = ref([]);
const cities = ref([]);
const districts = ref([]);
const villages = ref([]);
const isLoading = ref(false);
const validationError = ref({});
const generalError = ref('');

const form = reactive({
  type: '',
  subject_id: '',
  schedule: [],
  name: '',
  members: [],
  location_province_id: '',
  location_city_id: '',
  location_district_id: '',
  location_village_id: '',
  location_address: '',
  description: '',
  note: '',
  status: 'pending',
  education_level_id: null,
});

const newMemberEmail = ref('');
const emailCheckStatus = ref('');

const addMember = async () => {
  emailCheckStatus.value = '';
  const email = newMemberEmail.value.trim().toLowerCase();
  if (!email) return;

  if (form.members.includes(email)) {
    emailCheckStatus.value = 'Email sudah ditambahkan.';
    return;
  }

  try {
    const res = await userService.checkUserByEmail(email);
    if (!res.success) {
      emailCheckStatus.value = 'Email tidak ditemukan.';
      return;
    }

    if (res.data.user.role !== 'murid') {
      emailCheckStatus.value = 'Hanya murid yang bisa ditambahkan ke grup.';
      return;
    }

    form.members = [...form.members, email];
    newMemberEmail.value = '';
  } catch (err) {
    showToast('Gagal memeriksa email.', 'error');
    console.error(err);
  }
};

const removeMember = (index) => {
  form.members.splice(index, 1);
};

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const addSchedule = () => {
  form.schedule.push({
    day: '',
    start_time: '',
    end_time: '',
  });
};

const removeSchedule = (index) => {
  form.schedule.splice(index, 1);
};

const handleStartTimeChange = (index) => {
  const start = form.schedule[index].start_time;
  if (!start) return;

  const [hourStr, minuteStr] = start.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  hour = (hour + 1) % 24;
  const endHourStr = hour.toString().padStart(2, '0');
  const endTime = `${endHourStr}:${minuteStr}`;

  form.schedule[index].end_time = endTime;
};

const loadSubjects = async () => {
  try {
    const response = await masterDataService.getSubjects();
    subjects.value = response.data.data || [];
  } catch (error) {
    showToast('Gagal Memuat Mata Pelajaran', 'error');
    console.log(error);
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
  if (!form.location_province_id) return;

  try {
    const response = await axios.get(
      `/locations/cities?province_id=${form.location_province_id}`
    );
    cities.value = Array.isArray(response.data.data)
      ? response.data.data
      : Array.isArray(response.data)
      ? response.data
      : [];

    // Reset dependent fields
    form.location_city_id = '';
    form.location_district_id = '';
    form.location_village_id = '';
    districts.value = [];
    villages.value = [];
  } catch (error) {
    console.error('Error loading cities:', error);
    showError('Gagal memuat kota/kabupaten');
  }
};

const loadDistricts = async () => {
  if (!form.location_city_id) return;

  try {
    const response = await axios.get(
      `/locations/districts?city_id=${form.location_city_id}`
    );
    districts.value = Array.isArray(response.data.data)
      ? response.data.data
      : Array.isArray(response.data)
      ? response.data
      : [];

    // Reset dependent fields
    form.location_district_id = '';
    form.location_village_id = '';
    villages.value = [];
  } catch (error) {
    console.error('Error loading districts:', error);
    showError('Gagal memuat kecamatan');
  }
};

const loadVillages = async () => {
  if (!form.location_district_id) return;

  try {
    const response = await axios.get(
      `/locations/villages?district_id=${form.location_district_id}`
    );
    villages.value = Array.isArray(response.data.data)
      ? response.data.data
      : Array.isArray(response.data)
      ? response.data
      : [];

    // Reset dependent fields
    form.location_village_id = '';
  } catch (error) {
    console.error('Error loading villages:', error);
    showError('Gagal memuat desa/kelurahan');
  }
};

watch(() => form.location_province_id, loadCities);
watch(() => form.location_city_id, loadDistricts);
watch(() => form.location_district_id, loadVillages);

const classSubmission = async () => {
  isLoading.value = true;

  try {
    const payload = {
      name: form.name,
      type: form.type,
      education_level_id: form.education_level_id,
      subject_id: form.subject_id,
      location_province_id: form.location_province_id,
      location_city_id: form.location_city_id,
      location_district_id: form.location_district_id,
      location_village_id: form.location_village_id,
      location_address: form.location_address,
      schedule: form.schedule,
      members: form.members, // array of emails
      description: form.description,
      note: form.note,
      status: form.status || 'pending', // or omit, backend defaults to pending
    };

    await axios.post('/class', payload);
    showToast('Kelas Berhasil Dibuat', 'success');
    router.push('/operator/class');
  } catch (error) {
    showToast('Kelas Gagal Dibuat', 'error');
    if (error.status === 422) {
      validationError.value = error.response.data.errors;
    } else {
      generalError.value = error.message;
    }
    console.log(error);
  } finally {
    isLoading.value = false;
  }
};
watch(
  () => form.subject_id,
  (newSubjectId) => {
    const subject = subjects.value.find((s) => s.id === newSubjectId);
    form.name = `${subject.education_level.code} - ${subject.name}`;
    form.education_level_id = subject.education_level_id;
  }
);

onMounted(async () => {
  await Promise.all([loadSubjects(), loadProvinces()]);
});
</script>
