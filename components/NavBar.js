export default {
  props: ["sitename", "cartCount", "canOpenCart", "view"],
  emits: ["toggle-cart"],
  template: `
    <nav class="sticky top-0 z-30 border-b border-white/10 bg-night/85 text-white backdrop-blur-md">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#" class="flex items-center gap-2">
          <span class="grid h-9 w-9 place-items-center rounded-xl bg-brand font-display text-lg font-bold ring-1 ring-white/20">2</span>
          <span class="font-display text-xl font-semibold tracking-tight">{{ sitename }}</span>
        </a>
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
    </nav>
  `
};
