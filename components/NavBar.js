export default {
  props: ["sitename", "cartCount", "canOpenCart", "view", "user"],
  emits: ["toggle-cart", "go", "signin", "signout"],
  computed: {
    links() {
      let list = [
        { view: "lessons", label: "Lessons", icon: "th-large" },
        { view: "planner", label: "Plan my week", icon: "magic", test: "nav-planner" }
      ];
      if (this.user) list.push({ view: "bookings", label: "My bookings", icon: "ticket" });
      return list;
    }
  },
  template: `
    <nav class="sticky top-0 z-30 border-b border-white/10 bg-[#07061a]/80 text-white shadow-lg shadow-black/10 backdrop-blur-xl backdrop-saturate-150">
      <div class="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#" data-test="nav-lessons" class="flex shrink-0 items-center gap-2.5" @click.prevent="$emit('go', 'lessons')">
          <span class="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-teal-400 font-display text-lg font-bold shadow-lg shadow-indigo-500/40 ring-1 ring-white/30">2</span>
          <span class="font-display text-xl font-semibold tracking-tight">{{ sitename }}</span>
        </a>

        <div class="hidden items-center gap-1 rounded-full bg-white/5 p-1 ring-1 ring-white/10 md:flex">
          <button v-for="link in links" :key="link.view" :data-test="link.test"
            class="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition"
            :class="view == link.view ? 'bg-white text-[#07061a] shadow-md' : 'text-white/75 hover:bg-white/10 hover:text-white'"
            @click="$emit('go', link.view)">
            <i class="fa" :class="['fa-' + link.icon, link.view == 'planner' && view != 'planner' ? 'text-violet-300' : '']"></i>{{ link.label }}
          </button>
        </div>

        <div class="flex shrink-0 items-center gap-2 sm:gap-3">
          <button class="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-violet-200 ring-1 ring-white/15 transition hover:bg-white/10 md:hidden" aria-label="Plan my week" @click="$emit('go', 'planner')"><i class="fa fa-magic"></i></button>
          <account-menu :user="user" @signin="$emit('signin')" @go="$emit('go', $event)" @signout="$emit('signout')"></account-menu>
          <button
            data-test="cart-btn"
            class="relative inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold whitespace-nowrap text-[#07061a] shadow-md transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/60 disabled:shadow-none"
            v-bind:disabled="!canOpenCart"
            v-on:click="$emit('toggle-cart')"
          >
            <template v-if="view == 'cart'">
              <i class="fa fa-arrow-left"></i><span class="hidden sm:inline">Back to lessons</span><span class="sm:hidden">Back</span>
            </template>
            <template v-else>
              <i class="fa fa-shopping-basket"></i><span class="hidden sm:inline">Cart</span>
              <span class="grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-1.5 text-xs text-white">{{ cartCount }}</span>
            </template>
          </button>
        </div>
      </div>
    </nav>
  `
};
