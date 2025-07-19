<template>
  <div class="flex min-h-[calc(100dvh_-_84px)] h-full items-center">
    <div class="w-full rounded-lg bg-white border border-gray-300 p-4">
      <div v-if="showForm">
        <h1 class="text-xl text-center font-semibold">Absensi</h1>
        <p class="text-xs text-center text-gray-500 mb-6">
          Isi detail absensi untuk sesi ini
        </p>
        <div class="space-y-3 mb-6">
          <div class="space-y-1">
            <div class="flex items-center justify-between gap-3">
              <span class="text-xs font-medium text-gray-700"
                >Absensi untuk jadwal sesi sebelumnya?</span
              >
              <label class="relative inline-flex cursor-pointer items-center">
                <input
                  id="switch-2"
                  type="checkbox"
                  class="peer sr-only"
                  v-model="isReschedule"
                  @change="handleToggleChange"
                />
                <label for="switch-2" class="hidden"></label>
                <div
                  class="peer h-4 w-11 rounded-full bg-slate-300 after:absolute after:-top-1 after:left-0 after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-cyan-400 peer-checked:after:translate-x-full peer-focus:ring-green-300"
                ></div>
              </label>
            </div>
          </div>

          <!-- Jadwal Kelas - Only shown when toggle is checked -->
          <div v-if="isReschedule" class="space-y-1">
            <label class="block text-sm font-medium text-gray-700"
              >Jadwal Sebenarnya</label
            >

            <div class="grid grid-cols-2 gap-2 items-end">
              <div>
                <label class="block text-xs text-gray-600 mb-1">Hari</label>
                <select
                  v-model="form.reschedule_from.day"
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
                  v-model="form.reschedule_from.start_time"
                  type="time"
                  class="w-full rounded-lg text-sm border border-gray-300 px-3 py-2 transition-colors focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
                  required
                />
              </div>
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700"
              >Pilih Kelas</label
            >
            <select
              v-model="form.class_id"
              required
              class="w-full rounded-lg text-sm border border-gray-300 px-3 py-2 transition-colors focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
            >
              <option value="" selected>Pilih Kelas</option>
              <option v-for="cls in classList" :key="cls.id" :value="cls.id">
                {{ cls.name }} - {{ cls.created_by.name }}
              </option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700"
              >Catatan</label
            >
            <textarea
              v-model="form.note"
              class="w-full rounded-lg text-sm border border-gray-300 px-3 py-2 transition-colors focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
            ></textarea>
          </div>
          <button
            @click="classSubmission()"
            :disabled="isLoading"
            class="w-full font-medium rounded-lg bg-cyan-400 text-white text-sm transition-colors shadow-sm px-3 py-2 cursor-pointer hover:bg-cyan-500 disabled:opacity-50"
          >
            {{ isLoading ? 'Memproses...' : 'Kirim Absensi' }}
          </button>
        </div>
        <p class="text-xs text-center text-gray-500">
          Jika berencana untuk mengganti sesi ini di lain hari, maka absensi
          dilakukan di hari tersebut
        </p>
      </div>
      <div v-else>
        <p class="text-center font-medium mb-2">Absensi belum di buka</p>
        <p class="text-xs text-center">
          Jika sekarang adalah sesimu untuk les, segera hubungi tentormu
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// TODO: upcoming class current class
import { inject, onMounted, onUnmounted, reactive, ref } from 'vue';
import axios from '@/lib/axios';
import { useAuthStore } from '@/stores/auth';

const showToast = inject('showToast');
const auth = useAuthStore();

let intervalId = null;
const showForm = ref(true);
const classList = ref([]);
const isReschedule = ref(false);
const isLoading = ref(false);

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const form = reactive({
  class_id: '',
  role: auth.user.role,
  note: '',
  reschedule_from: {
    day: '',
    start_time: '',
  },
});

const checkAttendanceStatus = async () => {
  try {
    const response = await axios.get('/attendance/check-open');
    showForm.value = response.data.status;

    if (response.data.success) {
      showForm.value = true;
      clearInterval(intervalId);
    }
  } catch (error) {
    console.error(error);
  }
};

const fetchClassListToday = async () => {
  try {
    const filter = isReschedule.value ? 'all' : 'today';
    const res = await axios.get(`/class?filter=${filter}`);
    classList.value = res.data.data || [];
  } catch (e) {
    console.error('Failed to fetch classes:', e);
  }
};

const handleToggleChange = async () => {
  // Clear current classList
  classList.value = [];

  // Reset form class_id when toggling
  form.class_id = '';

  // Fetch new classList based on toggle state
  await fetchClassListToday();
};

const formatRescheduleToIsoDatetime = (reschedule) => {
  if (!reschedule || !reschedule.date || !reschedule.start_time) return null;
  return `${reschedule.date}T${reschedule.start_time}`;
};

const classSubmission = async () => {
  try {
    const payload = {
      class_id: form.class_id,
      role: form.role,
      attended_at: new Date().toISOString(),
      note: form.note,
    };

    if (form.reschedule_from) {
      payload.reschedule_from = formatRescheduleToIsoDatetime(
        form.reschedule_from
      );
    }

    isLoading.value = true;
    await axios.post('/attendance', payload);
    showToast('Absensi berhasil dikirim');
  } catch (error) {
    showToast('Absensi Gagal');
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  if (auth.user.role === 'murid') {
    showForm.value = false;
    checkAttendanceStatus();
    intervalId = setInterval(() => {
      checkAttendanceStatus();
    }, 10000);
  }
  await fetchClassListToday();
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>
