export default {
  props: ["mode", "busy", "error", "reason"],
  emits: ["close", "switch", "submit"],
  data() {
    return { name: "", email: "", password: "" };
  },
  methods: {
    send() {
      this.$emit("submit", { name: this.name, email: this.email, password: this.password });
    }
  },
  template: `
    <div class="fixed inset-0 z-50 grid place-items-center bg-night/60 p-4 backdrop-blur-sm" @click.self="$emit('close')">
      <div data-test="auth-modal" class="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl" role="dialog" aria-modal="true">
        <div class="bg-brand px-6 py-5 text-white">
          <div class="flex items-center justify-between">
            <h2 class="font-display text-2xl font-semibold">{{ mode == 'register' ? 'Create your account' : 'Welcome back' }}</h2>
            <button class="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" aria-label="Close" @click="$emit('close')"><i class="fa fa-times"></i></button>
          </div>
          <p class="mt-1 text-sm text-white/80">{{ reason || 'Save your children, see your bookings and plan your week with AI.' }}</p>
        </div>

        <div class="grid grid-cols-2 gap-1 border-b border-line bg-surface p-1 text-sm font-semibold">
          <button data-test="tab-login" class="rounded-xl py-2 transition" :class="mode == 'login' ? 'bg-white text-indigo shadow-sm' : 'text-muted'" @click="$emit('switch', 'login')">Sign in</button>
          <button data-test="tab-register" class="rounded-xl py-2 transition" :class="mode == 'register' ? 'bg-white text-indigo shadow-sm' : 'text-muted'" @click="$emit('switch', 'register')">Create account</button>
        </div>

        <form class="space-y-3 p-6" @submit.prevent="send">
          <label v-if="mode == 'register'" class="block">
            <span class="text-sm font-medium">Your name</span>
            <input data-test="auth-name" v-model="name" type="text" autocomplete="name" placeholder="Enter your full name" class="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-indigo focus:bg-white focus:ring-4 focus:ring-indigo/10">
          </label>
          <label class="block">
            <span class="text-sm font-medium">Email</span>
            <input data-test="auth-email" v-model="email" type="email" autocomplete="email" placeholder="you@example.com" class="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-indigo focus:bg-white focus:ring-4 focus:ring-indigo/10">
          </label>
          <label class="block">
            <span class="text-sm font-medium">Password</span>
            <input data-test="auth-password" v-model="password" type="password" :autocomplete="mode == 'register' ? 'new-password' : 'current-password'" placeholder="At least 8 characters" class="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-indigo focus:bg-white focus:ring-4 focus:ring-indigo/10">
          </label>
          <p v-if="error" data-test="auth-error" class="rounded-xl bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>
          <button data-test="auth-submit" type="submit" :disabled="busy" class="w-full rounded-xl bg-brand py-3 font-semibold text-white shadow-lg shadow-indigo/20 transition hover:brightness-110 disabled:opacity-60">
            <i v-if="busy" class="fa fa-circle-o-notch fa-spin mr-1"></i>
            {{ mode == 'register' ? 'Create account' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  `
};
