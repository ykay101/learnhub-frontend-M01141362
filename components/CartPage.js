import { imageURL } from "../api.js";

export default {
  props: ["items", "total", "order", "validName", "validPhone", "canCheckout", "submitting", "orderMessage", "orderError"],
  emits: ["add", "remove", "checkout", "back"],
  methods: {
    imageURL
  },
  template: `
    <div class="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div class="min-w-0">
        <h2 class="font-display text-3xl font-semibold">Your cart</h2>
        <p class="mt-1 text-muted">Check your lessons, then fill in your details to book.</p>

        <div v-if="orderMessage" data-test="order-message" class="mt-6 flex gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-500 text-xl text-white"><i class="fa fa-check"></i></span>
          <div>
            <p class="font-display text-xl font-semibold text-emerald-900">Order submitted</p>
            <p class="text-emerald-800">{{ orderMessage }}</p>
          </div>
        </div>

        <div v-if="items.length == 0 && !orderMessage" class="mt-6 rounded-2xl border border-dashed border-line bg-white p-10 text-center">
          <i class="fa fa-shopping-basket text-4xl text-muted"></i>
          <p class="mt-3 font-semibold">Your cart is empty</p>
          <button class="mt-4 rounded-full bg-indigo px-5 py-2 font-semibold text-white hover:bg-night" @click="$emit('back')">Browse lessons</button>
        </div>

        <transition-group tag="ul" name="card" class="mt-6 space-y-3">
          <li v-for="item in items" :key="item.lesson._id" data-test="cart-row" class="flex flex-col gap-3 rounded-2xl border border-line bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:gap-4">
            <div class="flex min-w-0 flex-1 items-center gap-4">
            <img :src="imageURL(item.lesson.image)" :alt="item.lesson.topic" class="h-16 w-20 shrink-0 rounded-xl object-cover">
            <div class="min-w-0 flex-1">
              <p class="font-display text-lg font-semibold">{{ item.lesson.topic }}</p>
              <p class="text-sm text-muted sm:truncate">
                <i class="fa fa-map-marker mr-1"></i>{{ item.lesson.location }}
                <span class="mx-1">·</span>{{ item.lesson.day }} {{ item.lesson.time }}
                <span class="mx-1">·</span>£{{ item.lesson.price }} each
              </p>
            </div>
            </div>
            <div class="flex items-center justify-between gap-4 sm:justify-end">
            <div class="flex items-center gap-1 rounded-full border border-line bg-surface p-1">
              <button data-test="minus" class="grid h-8 w-8 place-items-center rounded-full hover:bg-white" aria-label="Remove one" @click="$emit('remove', item.lesson)"><i class="fa fa-minus text-xs"></i></button>
              <span data-test="qty" class="w-6 text-center font-semibold">{{ item.quantity }}</span>
              <button data-test="plus" class="grid h-8 w-8 place-items-center rounded-full hover:bg-white disabled:opacity-30" aria-label="Add one" :disabled="item.lesson.space == 0" @click="$emit('add', item.lesson)"><i class="fa fa-plus text-xs"></i></button>
            </div>
            <p class="w-16 text-right font-display text-lg font-semibold">£{{ item.lesson.price * item.quantity }}</p>
            </div>
          </li>
        </transition-group>
      </div>

      <aside class="h-fit min-w-0 rounded-2xl border border-line bg-white p-5 shadow-sm lg:sticky lg:top-20">
        <h3 class="font-display text-xl font-semibold">Checkout</h3>
        <div class="mt-4 flex items-center justify-between border-b border-line pb-4">
          <span class="text-muted">Total</span>
          <span data-test="cart-total" class="font-display text-3xl font-semibold text-indigo">£{{ total }}</span>
        </div>

        <label class="mt-4 block">
          <span class="text-sm font-medium">Full name</span>
          <input data-test="name" v-model="order.name" type="text" autocomplete="name" placeholder="Enter your full name"
            class="mt-1 w-full rounded-xl border bg-surface px-4 py-3 outline-none transition focus:bg-white focus:ring-4"
            :class="order.name && !validName ? 'border-red-400 focus:ring-red-100' : 'border-line focus:border-indigo focus:ring-indigo/10'">
          <span v-if="order.name && !validName" data-test="name-error" class="mt-1 block text-sm text-red-600">Please use letters only.</span>
        </label>

        <label class="mt-3 block">
          <span class="text-sm font-medium">Phone number</span>
          <input data-test="phone" v-model="order.phone" type="tel" autocomplete="tel" placeholder="Enter your phone number"
            class="mt-1 w-full rounded-xl border bg-surface px-4 py-3 outline-none transition focus:bg-white focus:ring-4"
            :class="order.phone && !validPhone ? 'border-red-400 focus:ring-red-100' : 'border-line focus:border-indigo focus:ring-indigo/10'">
          <span v-if="order.phone && !validPhone" data-test="phone-error" class="mt-1 block text-sm text-red-600">Please use numbers only.</span>
        </label>

        <button data-test="checkout-btn"
          class="mt-5 w-full rounded-xl bg-brand py-3 font-semibold text-white shadow-lg shadow-indigo/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-none disabled:bg-line disabled:text-muted disabled:shadow-none"
          :disabled="!canCheckout"
          @click="$emit('checkout')">
          <template v-if="submitting"><i class="fa fa-circle-o-notch fa-spin mr-1"></i> Placing order…</template>
          <template v-else><i class="fa fa-lock mr-1"></i> Checkout</template>
        </button>

        <p v-if="orderError" class="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{{ orderError }}</p>
      </aside>
    </div>
  `
};
