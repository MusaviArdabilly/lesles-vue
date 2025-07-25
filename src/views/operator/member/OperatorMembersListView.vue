<template>
  <div class="space-y-6">
    <div class="sticky top-0">
      <div class="flex justify-between items-center gap-8">
        <div>
          <h1 class="text-xl font-semibold">Member</h1>
          <p class="text-xs text-gray-500">Total: {{ members.length }}</p>
        </div>
        <select
          v-model="filterRole"
          required
          class="w-full rounded-lg text-sm border border-gray-300 px-3 py-2 transition-colors focus:ring-1 focus:border-cyan-400 focus:ring-cyan-400"
        >
          <option value="guru" selected>Guru</option>
          <option value="murid">Murid</option>
        </select>
      </div>
    </div>

    <div class="mt-4">
      <!-- Skeletons -->
      <div
        v-if="isLoading"
        class="rounded-lg bg-white border border-gray-300 p-4 space-y-3 animate-pulse"
      >
        <!-- Your skeleton UI here -->
        <!-- ... same as your original ... -->
      </div>

      <div v-else-if="members" class="grid grid-cols-1 gap-4">
        <RouterLink
          :to="`/operator/class/${member.id}`"
          v-for="member in members"
          :key="member.id"
          custom
          v-slot="{ navigate }"
        >
          <div
            @click="navigate"
            class="cursor-pointer rounded-lg bg-white border border-gray-300 p-4"
          >
            <div class="space-y-2">
              <div class="mb-4">
                <h1 class="text-sm font-medium">
                  {{ member.name }}
                </h1>
                <p
                  :class="[
                    'text-xs text-gray-500',
                    Number(member.profile_complete) === 1
                      ? 'text-gray-500'
                      : 'text-red-500',
                  ]"
                >
                  {{
                    Number(member.profile_complete) === 1
                      ? filterRole === 'guru'
                        ? formatLocation(member.teacher_profile?.location)
                        : member.student_profile?.school_name
                      : 'Belum Melengkapi Profil'
                  }}
                </p>
              </div>
              <div
                v-if="
                  Number(member.profile_complete) === 1 && filterRole === 'guru'
                "
                class="flex items-center gap-2"
              >
                <BookCheck class="flex-none size-5" />
                <label class="text-xs text-gray-500">{{
                  member.education_levels.map((level) => level.code).join(', ')
                }}</label>
              </div>
              <div class="flex items-center gap-2">
                <Phone class="flex-none size-5" />
                <label class="text-xs">
                  {{ member.phone }}
                </label>
              </div>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import axios from '@/lib/axios';
import { BookCheck, Phone } from 'lucide-vue-next';

const filterRole = ref('guru');
const members = ref([]);
const isLoading = ref(false);

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatLocation(location) {
  if (!location) return '';

  const parts = [
    location.village?.name,
    location.district?.name,
    location.city?.name,
    // location.province?.name,
  ].map((part) => (part ? toTitleCase(part) : ''));

  return parts.filter(Boolean).join(', ');
}

async function fetchMembers(role) {
  isLoading.value = true;
  try {
    const url = role === 'guru' ? '/teachers' : '/students';

    const response = await axios.get(url);
    if (response.data.success) {
      members.value = response.data.data;
    } else {
      members.value = [];
    }
    console.log(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    members.value = [];
  } finally {
    isLoading.value = false;
  }
}

// Fetch on initial load and whenever filterRole changes
watchEffect(() => {
  fetchMembers(filterRole.value);
});
</script>
