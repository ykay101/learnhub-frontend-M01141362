export default {
  props: ["mode", "busy", "error", "reason"],
  emits: ["close", "switch", "submit"],
  data() {
    return { name: "", email: "", password: "", showPassword: false };
  },
  mounted() {
    document.addEventListener("keydown", this.onKey);
  },
  unmounted() {
    document.removeEventListener("keydown", this.onKey);
  },
  methods: {
    onKey(event) {
      if (event.key == "Escape") this.$emit("close");
    },
    send() {
      this.$emit("submit", { name: this.name, email: this.email, password: this.password });
    }
  },
  template: `
    <div class="modal-backdrop fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#07061a]/70 p-4 backdrop-blur-md" @click.self="$emit('close')">
      <div data-test="auth-modal" class="modal-pop relative w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-indigo-950/40 ring-1 ring-white/10" role="dialog" aria-modal="true" :aria-label="mode == 'register' ? 'Create account' : 'Sign in'">
        <div class="relative overflow-hidden bg-[#0d0b2a] px-7 pt-7 pb-8 text-white">
          <div aria-hidden="true" class="aurora absolute inset-0 opacity-90"></div>
          <div aria-hidden="true" class="card-dots absolute inset-0 opacity-20"></div>
          <button class="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/15 transition hover:bg-white/20 hover:text-white" aria-label="Close" @click="$emit('close')">
            <i class="fa fa-times"></i>
          </button>
          <div class="relative">
            <span class="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-teal-400 font-display text-xl font-bold shadow-lg shadow-indigo-500/40 ring-1 ring-white/30">2</span>
            <h2 class="mt-4 font-display text-3xl font-semibold tracking-tight">{{ mode == 'register' ? 'Create your account' : 'Welcome back' }}</h2>
            <p class="mt-2 max-w-sm text-sm leading-relaxed text-white/70">{{ reason || 'Save your children, see your bookings and plan your week with AI.' }}</p>
          </div>
        </div>

        <div class="px-7 pt-6 pb-7">
          <div class="relative grid grid-cols-2 rounded-2xl bg-surface p-1.5 ring-1 ring-line" role="tablist">
            <span aria-hidden="true" class="tab-slider absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] rounded-xl bg-white shadow-md shadow-indigo-950/10 ring-1 ring-line" :class="mode == 'register' ? 'translate-x-full' : ''"></span>
            <button data-test="tab-login" role="tab" :aria-selected="mode == 'login'" class="relative z-10 rounded-xl py-2.5 text-sm font-semibold transition-colors" :class="mode == 'login' ? 'text-indigo-700' : 'text-muted hover:text-ink'" @click="$emit('switch', 'login')">Sign in</button>
            <button data-test="tab-register" role="tab" :aria-selected="mode == 'register'" class="relative z-10 rounded-xl py-2.5 text-sm font-semibold transition-colors" :class="mode == 'register' ? 'text-indigo-700' : 'text-muted hover:text-ink'" @click="$emit('switch', 'register')">Create account</button>
          </div>

          <form class="mt-6 space-y-4" @submit.prevent="send">
            <label v-if="mode == 'register'" class="block">
              <span class="text-sm font-medium text-ink/80">Your name</span>
              <span class="relative mt-1.5 block">
                <i class="fa fa-user-o pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"></i>
                <input data-test="auth-name" v-model="name" type="text" autocomplete="name" placeholder="Enter your full name" class="w-full rounded-2xl border border-line bg-surface py-3.5 pr-4 pl-11 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10">
              </span>
            </label>
            <label class="block">
              <span class="text-sm font-medium text-ink/80">Email</span>
              <span class="relative mt-1.5 block">
                <i class="fa fa-envelope-o pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"></i>
                <input data-test="auth-email" v-model="email" type="email" autocomplete="email" placeholder="you@example.com" class="w-full rounded-2xl border border-line bg-surface py-3.5 pr-4 pl-11 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10">
              </span>
            </label>
            <label class="block">
              <span class="text-sm font-medium text-ink/80">Password</span>
              <span class="relative mt-1.5 block">
                <i class="fa fa-lock pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"></i>
                <input data-test="auth-password" v-model="password" :type="showPassword ? 'text' : 'password'" :autocomplete="mode == 'register' ? 'new-password' : 'current-password'" placeholder="At least 8 characters" class="w-full rounded-2xl border border-line bg-surface py-3.5 pr-12 pl-11 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10">
                <button type="button" class="absolute top-1/2 right-2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-muted transition hover:bg-line/60 hover:text-ink" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
                  <i class="fa" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
              </span>
            </label>

            <p v-if="error" data-test="auth-error" class="flex items-start gap-2 rounded-2xl bg-red-50 p-3.5 text-sm text-red-700 ring-1 ring-red-100"><i class="fa fa-exclamation-circle mt-0.5"></i>{{ error }}</p>

            <button data-test="auth-submit" type="submit" :disabled="busy" class="add-btn relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_100%] py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all duration-500 hover:bg-right disabled:opacity-60">
              <i v-if="busy" class="fa fa-circle-o-notch fa-spin mr-1"></i>
              {{ mode == 'register' ? 'Create account' : 'Sign in' }}
              <i v-if="!busy" class="fa fa-arrow-right ml-1"></i>
            </button>
          </form>

          <p class="mt-5 text-center text-sm text-muted">
            <template v-if="mode == 'login'">New to 2Learn? <button class="font-semibold text-indigo-700 hover:underline" @click="$emit('switch', 'register')">Create an account</button></template>
            <template v-else>Already have an account? <button class="font-semibold text-indigo-700 hover:underline" @click="$emit('switch', 'login')">Sign in</button></template>
          </p>
        </div>
      </div>
    </div>
  `
};
