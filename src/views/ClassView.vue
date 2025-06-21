<template>
  <!-- <h1 class="text-2xl font-bold mb-6">Kelas</h1> -->

  <div class="space-y-4">
    <div v-if="showFormCreateClass" class="rounded-lg bg-white space-y-4 p-4">
      
      <div class="flex flex-col space-y-4">
        <label for="level" class="text-sm">Tingkat</label>
        <select id="level" v-model="form.level"
          class="text-sm rounded border-gray-300 border px-4 py-2">
          <option v-for="level in allowedLevels" :key="level" :value="level">
            {{ level.toUpperCase() }}
          </option>
        </select>
      </div>
      
      <div class="flex flex-col space-y-4">
        <label for="subject" class="text-sm">Mata Pelajaran</label>
        <!-- TODO:get from database teacher specs -->
        <select id="subject" v-model="form.subject"
          class="text-sm rounded border-gray-300 border px-4 py-2"> 
          <option v-for="subject in filteredSubjects" :key="subject" :value="subject">
            {{ subject }}
          </option>
        </select>
      </div>
  
      <div class="flex flex-col space-y-4">
        <label for="teacher" class="text-sm">Guru</label>
        <select id="teacher" v-model="form.teacherId"
          :disabled="user.role ==='guru'"
          class="text-sm rounded border-gray-300 border px-4 py-2"> 
          <option v-for="(item, index) in options.teachers" 
            :value="item.id">{{ item.name }}</option>
        </select>
      </div>
  
      <div class="flex flex-col space-y-4">
        <label for="student" class="text-sm">Siswa</label>
        <SearchableMultiselect id="student"
          v-model="form.studentId"
          :options="options.students" />
      </div>
  
      <div class="flex flex-col space-y-4">
        <label class="text-sm">Jadwal</label>
        <div class="flex flex-col md:flex-row w-full gap-4">
          <select id="teacher" v-model="form.schedule.day"
            class="text-sm rounded border-gray-300 border px-4 py-2"> 
            <option value="senin">Senin</option>
            <option value="selasa">Selasa</option>
            <option value="rabu">Rabu</option>
            <option value="kamis">Kamis</option>
            <option value="jumat">Jumat</option>
            <option value="sabtu">Sabtu</option>
            <option value="minggu">Minggu</option>
          </select>
          <div class="flex flex-1 gap-2">
            <input type="time" v-model="form.schedule.start_time" 
              class="text-sm w-full rounded border-gray-300 border px-4 py-2">
            <input type="time" v-model="form.schedule.end_time" 
              class="text-sm w-full rounded border-gray-300 border px-4 py-2">
          </div>
        </div>
      </div>
  
      <div class="flex flex-col space-y-4">
        <label for="name" class="text-sm">Nama Kelas</label>
        <input type="text" id="name" v-model="form.name"
          class="text-sm rounded border-gray-300 border px-4 py-2">
      </div>

      <ul>
        <li v-for="(message, index) in error">{{ message }}</li>
      </ul>

      <div class="flex justify-center gap-4 mt-8">
        <button @click="showFormCreateClass = !showFormCreateClass" 
          class="text-sm px-4 py-2">Batal</button>
        <button @click="addClass()"
          class="text-sm font-medium rounded border-gray-300 border px-4 py-2">Simpan</button>
      </div>
    </div>
    
    <div class="rounded-lg bg-white space-y-4 p-4">
      <h1 class="text-xl font-bold">Daftar Kelas</h1>
  
      <div class="flex justify-between">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4" />
          <input type="text" class="text-sm w-48 rounded border-gray-300 border ps-10 pe-4 py-2">
        </div>
        <button v-if="['admin', 'guru'].includes(user.role)" @click="showFormCreateClass = !showFormCreateClass"
          class="text-sm font-medium rounded border-gray-300 border px-4 py-2 ms-auto cursor-pointer">Buat Kelas</button>
      </div>

      <hr class="border-gray-300 border">

      <div v-for="(item, index) in classData" :key="index"
        :class="['border-gray-300 py-2', index !== classData.length-1 ? 'border-b' : '']">
        <div class="flex justify-between items-start">
          <h1 class="font-medium">{{ item.name }}</h1>
          <p class="font-medium uppercase">{{ item.level }}</p>
        </div>
        <div class="flex justify-between items-start">
          <p class="text-sm">{{ item.teacher.name }}</p>
          <div class="flex flex-col items-end">
            <p v-for="(studentItem, index) in item.students.slice().sort((a, b) => a.name.length - b.name.length)" 
              :key="index"
              :class="[
                'text-sm text-gray-500 text-end',
                index !== item.students.length - 1 ? 'border-b border-gray-300 pb-1' : '']">{{ studentItem.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>


</template>

<script>
import { 
  Search
} from 'lucide-vue-next';
import SearchableMultiselect from '@/components/SearchableMultiselect.vue';

import axios from '@/lib/axios'
import { useAuthStore } from '@/stores/auth';

export default {
  components: { 
    Search, 
    SearchableMultiselect 
  },
  data() {
    return {
      showFormCreateClass: false,
      classData: [],
      options: {
        teachers: [],
        students: [],
        subject: {
          sd: [
            'Bahasa Indonesia',
            'Matematika',
            'Ilmu Pengetahuan Alam (IPA)',
            'Ilmu Pengetahuan Sosial (IPS)',
            'Pendidikan Pancasila dan Kewarganegaraan (PPKn)',
            'Pendidikan Agama',
            'Seni Budaya dan Prakarya (SBdP)',
            'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
            'Bahasa Daerah'
          ],
          smp: [
            'Bahasa Indonesia',
            'Bahasa Inggris',
            'Matematika',
            'Ilmu Pengetahuan Alam (IPA)',
            'Ilmu Pengetahuan Sosial (IPS)',
            'Pendidikan Agama',
            'Pendidikan Pancasila dan Kewarganegaraan (PPKn)',
            'Seni Budaya',
            'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
            'Prakarya dan/atau Informatika',
            'Bahasa Daerah'
          ],
          sma: [
            // Umum
            'Bahasa Indonesia',
            'Bahasa Inggris',
            'Matematika',
            'Pendidikan Agama',
            'PPKn',
            'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
            'Informatika',
            'Seni Budaya',
            // IPA
            'Matematika Peminatan',
            'Fisika',
            'Kimia',
            'Biologi',
            // IPS
            'Geografi',
            'Sejarah',
            'Sosiologi',
            'Ekonomi',
            // Bahasa
            'Bahasa dan Sastra Indonesia',
            'Bahasa dan Sastra Inggris',
            'Bahasa Asing',
            'Antropologi'
          ]
        }
      },
      form: {
        level: '',
        subject: '',
        teacherId: 0,
        studentId: [],
        schedule: {
          day: '',
          start_time: '',
          end_time: ''
        },
        name: ''
      },
      error: null
    };
  },
  watch: {
    'form.subject': 'generateClassName',
    'form.level': function (newLevel) {
      this.generateClassName();
      this.fetchFilteredTeachersAndStudents(newLevel);
    },
    'form.teacherId': 'generateClassName',
    user(newVal) {
      if (newVal && !this.form.teacherId) {
        this.form.teacherId = newVal.id;
      }
    }
  },
  computed: {
    auth() {
      return useAuthStore();
    },
    user() {
      return this.auth.user;
    },
    filteredSubjects() {
      return this.options.subject[this.form.level] || [];
    },
    allowedLevels() {
      if (this.user.role === 'guru') {
        return this.user.teacher_levels;
      }
      return ['sd', 'smp', 'sma'];
    }
  },
  mounted() {
    this.fetchClass();
    if (this.user.role === 'guru') {
      const levels = this.user.teacher_levels;
      if (levels.length === 1) {
        this.form.level = levels[0];
      } else if (!this.form.level && levels.length > 0) {
        this.form.level = levels[0]; // default to the first allowed one
      }
      this.form.teacherId = this.user.id;
    }
  },
  methods: {
    async fetchClass() {
      try {
        let endPoint = ''
        if (['guru'].includes(this.user.role)) {
          endPoint = '/class'
        } else {
          endPoint = '/class/all'
        }
        const response = await axios.get(endPoint);
        this.classData = response.data.data;
      } catch (error) {
        console.log(error);
        this.response
      }
    },
    // async fetchCurrentUser() {
    //   try {
    //     const response = await axios.get('/me');;
    //     this.form.teacherId = response.data.data.id;
    //     this.user.role = response.data.data.role;
    //   } catch (error) {
    //     console.log(error);
    //     this.response
    //   }
    // },
    async fetchFilteredTeachersAndStudents(level) {
      try {
        if (this.user.role === 'guru') {
          // Only use logged-in teacher
          this.options.teachers = [
            {
              id: this.user.id,
              name: this.user.name
            }
          ];
          this.form.teacherId = this.user.id;
        } else {
          // Admin sees all
          const [teachersRes, studentsRes] = await Promise.all([
            axios.get(`/teachers?level=${level}`),
            axios.get(`/students?level=${level}`)
          ]);

          this.options.teachers = teachersRes.data.teachers;
        }

        const studentsRes = await axios.get(`/students?level=${level}`);
        this.options.students = studentsRes.data.students.map(item => ({
          label: item.name,
          value: item.id
        }));
      } catch (error) {
        console.error(error);
        this.error = 'Failed to load filtered teachers or students';
      }
    },
    async addClass() {
      try {
        // clean studentId to only value (string) instead of obj
        const payload = {
          ...this.form,
          studentId: this.form.studentId.map(student => student.value)
        };
        await axios.post('/class', payload);
        this.showFormCreateClass = false;
        this.fetchClass();
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.errors) {
          this.error = Object.values(error.response.data.errors).flat() || 'Unknown error occurred';
        } else {
          this.error = 'Network or server error';
        }
      }
    },
    getTeacherInitials(name) {
      return name
        .split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .join('');
    },
    generateClassName() {
      const subject = this.form.subject;
      // const level = this.form.level;
      const teacher = this.options.teachers.find(t => t.id === this.form.teacherId);

      if (subject && level && teacher) {
        const initials = this.getTeacherInitials(teacher.name).toUpperCase();
        const capitalizedSubject = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
        // this.form.name = `${capitalizedSubject} ${initials} ${level.toUpperCase()}`;
        this.form.name = `${capitalizedSubject} ${initials}`;
      }
    }
  }
};
</script>