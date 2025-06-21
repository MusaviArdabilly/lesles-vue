<template>
  <div class="flex items-center min-h-dvh">

    <div class="w-full rounded-lg shadow bg-white space-y-4 p-4">
      <div class="relative w-20 h-20 rounded-full bg-cyan-400 mx-auto">
        <p v-if="user.name" 
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-medium">
          {{ getInitials(user.name) }}
        </p>
      </div>

      <div>
        <h1 class="text-center">{{ user.name }}</h1>
        <p class="text-sm text-center text-gray-500 capitalize">
          {{ user.role }}
          <span class="uppercase">
            {{ user.role == 'murid' 
              ? user.student_level 
              : user.role == 'guru'
                ? user.teacher_levels.map(item => item.value).join(', ')
                : '' }}
          </span>
        </p>
      </div>

      <div class="space-y-4">
        <div class="flex flex-col space-y-2">
          <label for="name" class="text-sm">Nama</label>
          <input type="text" id="name" v-model="user.name"
            class="rounded border-gray-300 border px-4 py-2">
        </div>

        <div class="flex flex-col space-y-2">
          <label for="phone" class="text-sm">No. WA</label>
          <input type="number" id="phone" v-model="user.phone"
            class="rounded border-gray-300 border px-4 py-2">
        </div>

        <div class="flex flex-col space-y-2">
          <label for="email" class="text-sm">Email</label>
          <input type="email" id="email" v-model="user.email" disabled
            class="rounded border-gray-300 border text-gray-500 px-4 py-2">
        </div>

        <div v-if="user.role == 'murid'"
          class="flex flex-col space-y-2">
          <label for="level" class="text-sm">Tingkat</label>
          <select id="level" v-model="user.student_level"
            class="rounded border-gray-300 border px-4 py-2">
            <option value="sd">SD</option>
            <option value="smp">SMP</option>
            <option value="sma">SMA</option>
          </select>
        </div>

        <div v-if="user.role == 'guru'"
          class="flex flex-col space-y-2">
          <label for="level" class="text-sm">Mengajar</label>
          <SearchableMultiselect 
            v-model="user.teacher_levels"
            :options="levelOptions"/>
        </div>

        <div v-if="isUserChanged" class="flex justify-center">
          <button @click="updateUser()" 
            :disabled="isUpdating"
            :class="[
              'text-sm font-medium rounded border px-4 py-2 transition-colors',
              isUpdating 
                ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                : 'border-gray-300 hover:bg-gray-50 cursor-pointer'
            ]">
            <span v-if="isUpdating" class="flex items-center">
              <LoadingSpinner size="sm" text="Memproses..." />
            </span>
            <span v-else>Ubah</span>
          </button>
        </div>

        <hr class="border-gray-300">
      </div>

      <div class="flex justify-end">
        <button @click="logout()" 
          :disabled="isLoggingOut"
          :class="[
            'text-sm font-medium rounded border px-4 py-2 transition-colors',
            isLoggingOut 
              ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
              : 'border-gray-300 hover:bg-gray-50'
          ]">
          <span v-if="isLoggingOut" class="flex items-center">
            <LoadingSpinner size="sm" text="Logout..." />
          </span>
          <span v-else>Logout</span>
        </button>
      </div>
      
    </div>
    
  </div>
</template>

<script>
import axios from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'
import { getInitials } from '@/utils/string'
import SearchableMultiselect from '@/components/SearchableMultiselect.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

export default {
  inject: ['showToast'],
  components: { SearchableMultiselect, LoadingSpinner },
  data() {
    return {
      originalUser: {},
      user: {},
      levelOptions: [
        { label: 'sd', value: 'sd' },
        { label: 'smp', value: 'smp' },
        { label: 'sma', value: 'sma' }
      ],
      isUpdating: false,
      isLoggingOut: false
    }
  },
  computed: {
    isUserChanged() {
      return JSON.stringify(this.user) !== JSON.stringify(this.originalUser);
    },
    auth() {
      return useAuthStore();
    },
  },
  mounted() {
    this.initializeUser();
  },
  methods: {
    initializeUser() {
      const auth = useAuthStore();
      
      // Use cached user data if available
      if (auth.user) {
        this.setupUserData(auth.user);
      } else {
        // Fallback to API call if no cached data
        this.fetchUser();
      }
    },
    
    setupUserData(userData) {
      // Transform data for searchable multiselect
      this.transformTeacherLevel(userData);
      
      this.user = { ...userData };
      this.originalUser = JSON.parse(JSON.stringify(userData)); // deep copy
    },
    
    async fetchUser() {
      try {
        const auth = useAuthStore();
        const user = await auth.fetchUser();
        
        if (user) {
          this.setupUserData(user);
        }
      } catch (error) {
        console.log('error fetch: ', error);
        this.showToast('Gagal memuat data profil', 'error');
      }
    },
    
    async updateUser() {
      try {
        this.isUpdating = true;
        const auth = useAuthStore();
        
        const payload = {
          name: this.user.name,
          role: this.user.role,
          phone: this.user.phone.toString(),
          picture: this.user.picture,
          teacher_levels: this.user.teacher_levels.map(item => item.value),
          student_level: this.user.student_level
        }

        const response = await axios.put('/me', payload);
        
        // Update both local state and auth store
        this.setupUserData(response.data.data);
        auth.updateUserLocally(response.data.data);
        
        this.showToast('Profil berhasil diperbarui', 'success');
      } catch (error) {
        console.log('error update: ', error);
        this.showToast('Gagal memperbarui profil', 'error');
      } finally {
        this.isUpdating = false;
      }
    },
    
    async logout() {
      try {
        this.isLoggingOut = true;
        const auth = useAuthStore();
        await auth.logout();
        
        this.showToast('Berhasil logout', 'success');
        this.$router.push('/login');
      } catch (error) {
        console.log('error logout: ', error);
        this.showToast('Gagal logout', 'error');
      } finally {
        this.isLoggingOut = false;
      }
    },
    
    getInitials,
    transformTeacherLevel(source) {
      if(source.role === 'guru'){
        const transformedTeacherLevel = 
          source.teacher_levels.map(item => ({ label: item, value: item }));
        
        return source.teacher_levels = transformedTeacherLevel;
      }
    }
  }
}
</script>