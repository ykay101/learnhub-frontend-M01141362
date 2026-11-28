export default {
  props: ["sitename", "cartCount", "canOpenCart", "view", "user"],
  emits: ["toggle-cart", "go", "signin", "signout"],
  template: `
    <nav class="sticky top-0 z-30 border-b border-white/10 bg-night/85 text-white backdrop-blur-md">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#" data-test="nav-lessons" class="flex items-center gap-2" @click.prevent="$emit('go', 'lessons')">
          <span class="grid h-9 w-9 place-items-center rounded-xl bg-brand font-display text-lg font-bold ring-1 ring-white/20">2</span>
          <span class="font-display text-xl font-semibold tracking-tight">{{ sitename }}</span>
        </a>
        <div class="flex items-center gap-2 sm:gap-3">
        <button data-test="nav-planner" class="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 sm:inline-flex" @click="$emit('go', 'planner')">
          <i class="fa fa-magic"></i> Plan my week
        </button>
        <account-menu :user="user" @signin="$emit('signin')" @go="$emit('go', $event)" @signout="$emit('signout')"></account-menu>
        <button
          data-test="cart-btn"
          class="relative inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-night transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/70"
          v-bind:disabled="!canOpenCart"
          v-on:click="$emit('toggle-cart')"
        >
          <template v-if="view == 'cart'">
            <i class="fa fa-arrow-left"></i> Back to lessons
          </template>
          <template v-else>
            <i class="fa fa-shopping-basket"></i> Cart
            <span class="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-xs text-white">{{ cartCount }}</span>
          </template>
        </button>
        </div>
      </div>
    </nav>
  `
};
