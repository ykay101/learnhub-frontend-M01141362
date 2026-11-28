export default {
  props: ["user"],
  emits: ["signin", "go", "signout"],
  data() {
    return { open: false };
  },
  computed: {
    initials() {
      return this.user.name.split(" ").filter(part => part).map(part => part[0].toUpperCase()).slice(0, 2).join("");
    }
  },
  methods: {
    pick(view) {
      this.open = false;
      this.$emit("go", view);
    },
    signOut() {
      this.open = false;
      this.$emit("signout");
    }
  },
  template: `
    <div class="relative">
      <button v-if="!user" data-test="signin-btn" class="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap text-white ring-1 ring-white/25 transition hover:bg-white/10" @click="$emit('signin')">
        <i class="fa fa-user-circle-o"></i><span>Sign in</span>
      </button>
      <template v-else>
        <button data-test="account-btn" class="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-sm font-bold text-white shadow-md ring-2 ring-white/30 transition hover:brightness-110" :aria-label="'Account for ' + user.name" @click="open = !open">{{ initials }}</button>
        <div v-if="open" class="modal-pop absolute right-0 z-40 mt-3 w-60 overflow-hidden rounded-2xl border border-line bg-white text-ink shadow-2xl shadow-indigo-950/20">
          <p class="border-b border-line px-4 py-3 text-sm"><span class="block font-semibold">{{ user.name }}</span><span class="text-muted">{{ user.email }}</span></p>
          <button data-test="menu-planner" class="block w-full px-4 py-2.5 text-left text-sm hover:bg-surface" @click="pick('planner')"><i class="fa fa-magic mr-2 text-indigo"></i>Plan my week</button>
          <button data-test="menu-family" class="block w-full px-4 py-2.5 text-left text-sm hover:bg-surface" @click="pick('family')"><i class="fa fa-users mr-2 text-indigo"></i>My family</button>
          <button data-test="menu-bookings" class="block w-full px-4 py-2.5 text-left text-sm hover:bg-surface" @click="pick('bookings')"><i class="fa fa-ticket mr-2 text-indigo"></i>My bookings</button>
          <button data-test="menu-signout" class="block w-full border-t border-line px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50" @click="signOut"><i class="fa fa-sign-out mr-2"></i>Sign out</button>
        </div>
      </template>
    </div>
  `
};
