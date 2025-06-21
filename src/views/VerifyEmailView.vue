<template>
  <div class="p-4 max-w-md mx-auto text-center">
    <h1 class="text-xl font-semibold mb-4">Verify Your Email</h1>
    <p class="mb-4">
      We've sent a verification link to your email. Please check your inbox and click the link to continue.
    </p>

    <button
      @click="resendEmail"
      class="btn btn-secondary"
      :disabled="loading"
    >
      {{ loading ? 'Sending...' : 'Resend Verification Email' }}
    </button>

    <p v-if="message" class="mt-2 text-green-600">{{ message }}</p>
    <p v-if="error" class="mt-2 text-red-500">{{ error }}</p>
  </div>
</template>

<script>
import axios from '@/lib/axios'

export default {
  data() {
    return {
      message: '',
      error: '',
      loading: false,
      interval: null
    }
  },
  async mounted() {
    await this.checkIfVerified()
    this.startPolling()
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
    async resendEmail() {
      this.loading = true
      this.message = ''
      this.error = ''
      try {
        const res = await axios.post('/email/resend')
        this.message = res.data.message
      } catch (err) {
        this.error = err.response?.data?.message || 'Error resending email.'
      } finally {
        this.loading = false
      }
    },
    async checkIfVerified() {
      try {
        const res = await axios.get('/email/check-verified')
        if (res.data.email_verified_at) {
          this.$router.push('/me') 
        }
      } catch (e) {
        console.error('Failed to fetch user', e)
      }
    },
    startPolling() {
      this.interval = setInterval(this.checkIfVerified, 10000)
    }
  }
}
</script>

<style scoped>
.btn {
  padding: 0.5rem 1.5rem;
  background-color: #6b7280;
  color: white;
  border: none;
  border-radius: 0.375rem;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
