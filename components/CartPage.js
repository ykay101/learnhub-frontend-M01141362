import { imageURL } from "../api.js";
import { money, pounds } from "../money.js";

export default {
  props: ["items", "total", "order", "validName", "validPhone", "canCheckout", "submitting", "orderMessage", "orderError", "orderWarning", "paymentsReady", "receipt", "lastOrder", "signedIn"],
  emits: ["add", "remove", "checkout", "back", "update:name", "update:phone", "bookings", "plan"],
  methods: {
    imageURL,
    money,
    pounds
  },
  computed: {
    confirmed() {
      return Boolean(this.orderMessage) && this.items.length == 0;
    }
  },
  template: `
    <div v-if="confirmed" class="mx-auto max-w-2xl">
      <div data-test="order-message" class="modal-pop relative overflow-hidden rounded-[32px] bg-white text-center shadow-2xl shadow-indigo-950/10 ring-1 ring-line">
        <div class="relative overflow-hidden bg-[#0d0b2a] px-6 pt-10 pb-12 text-white">
          <div aria-hidden="true" class="aurora absolute inset-0 opacity-90"></div>
          <div aria-hidden="true" class="card-dots absolute inset-0 opacity-15"></div>
          <div aria-hidden="true" class="confetti absolute inset-0"><i v-for="n in 14" :key="n" :style="{ left: (n * 7) + '%', animationDelay: (n % 5) * 0.15 + 's' }"></i></div>
          <div class="relative">
            <span class="success-ring mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-4xl shadow-xl shadow-emerald-500/40 ring-8 ring-white/10"><i class="fa fa-check"></i></span>
            <h2 class="mt-6 font-display text-4xl font-semibold tracking-tight">You're booked in!</h2>
            <p class="mx-auto mt-3 max-w-md text-white/75">{{ orderMessage }}</p>
          </div>
        </div>

        <div class="px-6 py-7 text-left sm:px-8">
          <div v-if="receipt" class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-100">
            <span class="font-semibold"><i class="fa fa-credit-card mr-1.5"></i>Paid {{ money(receipt.amount) }}</span>
            <span class="flex items-center gap-2">
              <span v-if="receipt.cardLast4">•••• {{ receipt.cardLast4 }}</span>
              <span class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Test mode</span>
            </span>
          </div>

          <h3 v-if="lastOrder" class="mt-6 text-xs font-semibold tracking-widest text-muted uppercase">What you booked</h3>
          <ul v-if="lastOrder" class="mt-3 divide-y divide-line rounded-2xl ring-1 ring-line">
            <li v-for="item in lastOrder.items" :key="item.id" class="flex items-center gap-4 p-3">
              <img :src="imageURL(item.image)" :alt="item.topic" class="h-12 w-16 shrink-0 rounded-xl object-cover">
              <div class="min-w-0 flex-1">
                <p class="font-display text-lg font-semibold">{{ item.topic }}</p>
                <p class="text-sm text-muted">{{ item.location }} · every {{ item.day }} at {{ item.time }}</p>
              </div>
              <span class="text-sm text-muted">× {{ item.quantity }}</span>
              <span class="w-16 text-right font-semibold">{{ pounds(item.price * item.quantity) }}</span>
            </li>
            <li class="flex items-center justify-between p-3 font-semibold">
              <span>Total</span><span class="font-display text-xl text-indigo-700">{{ pounds(lastOrder.total) }}</span>
            </li>
          </ul>

          <div class="mt-7 grid gap-3 sm:grid-cols-3">
            <button v-if="signedIn" class="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110" @click="$emit('bookings')"><i class="fa fa-ticket mr-1"></i>My bookings</button>
            <button class="rounded-2xl py-3 font-semibold text-indigo-700 ring-1 ring-indigo-200 transition hover:bg-indigo-50" @click="$emit('plan')"><i class="fa fa-magic mr-1"></i>Plan another week</button>
            <button class="rounded-2xl py-3 font-semibold text-ink ring-1 ring-line transition hover:bg-surface" :class="signedIn ? '' : 'sm:col-span-2'" @click="$emit('back')"><i class="fa fa-arrow-left mr-1"></i>Back to lessons</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div class="min-w-0">
        <h2 class="font-display text-3xl font-semibold">Your cart</h2>
        <p class="mt-1 text-muted">Check your lessons, then fill in your details to book.</p>

        <div v-if="orderMessage" data-test="order-message" class="mt-6 flex gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-500 text-xl text-white"><i class="fa fa-check"></i></span>
          <div>
            <p class="font-display text-xl font-semibold text-emerald-900">Order submitted</p>
            <p class="text-emerald-800">{{ orderMessage }}</p>
            <p v-if="receipt" class="mt-3 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-white px-3 py-2 text-sm text-emerald-900 ring-1 ring-emerald-200">
              <span><i class="fa fa-credit-card mr-1"></i>Paid {{ money(receipt.amount) }}</span>
              <span v-if="receipt.cardLast4">•••• {{ receipt.cardLast4 }}</span>
              <span class="rounded-full bg-amber-100 px-2 text-xs font-semibold text-amber-800">Test mode</span>
            </p>
          </div>
        </div>

        <div v-if="orderWarning" data-test="order-warning" class="mt-6 flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-500 text-xl text-white"><i class="fa fa-exclamation"></i></span>
          <div>
            <p class="font-display text-xl font-semibold text-amber-900">Order saved</p>
            <p class="text-amber-800">{{ orderWarning }}</p>
          </div>
        </div>

        <div v-if="items.length == 0 && !orderMessage && !orderWarning" class="mt-6 rounded-2xl border border-dashed border-line bg-white p-10 text-center">
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
                <span class="mx-1">·</span>{{ pounds(item.lesson.price) }} each
              </p>
            </div>
            </div>
            <div class="flex items-center justify-between gap-4 sm:justify-end">
            <div class="flex items-center gap-1 rounded-full border border-line bg-surface p-1">
              <button data-test="minus" class="grid h-8 w-8 place-items-center rounded-full hover:bg-white" aria-label="Remove one" @click="$emit('remove', item.lesson)"><i class="fa fa-minus text-xs"></i></button>
              <span data-test="qty" class="w-6 text-center font-semibold">{{ item.quantity }}</span>
              <button data-test="plus" class="grid h-8 w-8 place-items-center rounded-full hover:bg-white disabled:opacity-30" aria-label="Add one" :disabled="item.lesson.space == 0" @click="$emit('add', item.lesson)"><i class="fa fa-plus text-xs"></i></button>
            </div>
            <p class="w-16 text-right font-display text-lg font-semibold">{{ pounds(item.lesson.price * item.quantity) }}</p>
            </div>
          </li>
        </transition-group>
      </div>

      <aside class="h-fit min-w-0 rounded-2xl border border-line bg-white p-5 shadow-sm lg:sticky lg:top-20">
        <h3 class="font-display text-xl font-semibold">Checkout</h3>
        <div class="mt-4 flex items-center justify-between border-b border-line pb-4">
          <span class="text-muted">Total</span>
          <span data-test="cart-total" class="font-display text-3xl font-semibold text-indigo">{{ pounds(total) }}</span>
        </div>

        <label class="mt-4 block">
          <span class="text-sm font-medium">Full name</span>
          <input data-test="name" :value="order.name" @input="$emit('update:name', $event.target.value)" type="text" autocomplete="name" placeholder="Enter your full name"
            class="mt-1 w-full rounded-xl border bg-surface px-4 py-3 outline-none transition focus:bg-white focus:ring-4"
            :class="order.name && !validName ? 'border-red-400 focus:ring-red-100' : 'border-line focus:border-indigo focus:ring-indigo/10'">
          <span v-if="order.name && !validName" data-test="name-error" class="mt-1 block text-sm text-red-600">Please use letters only.</span>
        </label>

        <label class="mt-3 block">
          <span class="text-sm font-medium">Phone number</span>
          <input data-test="phone" :value="order.phone" @input="$emit('update:phone', $event.target.value)" type="tel" autocomplete="tel" placeholder="Enter your phone number"
            class="mt-1 w-full rounded-xl border bg-surface px-4 py-3 outline-none transition focus:bg-white focus:ring-4"
            :class="order.phone && !validPhone ? 'border-red-400 focus:ring-red-100' : 'border-line focus:border-indigo focus:ring-indigo/10'">
          <span v-if="order.phone && !validPhone" data-test="phone-error" class="mt-1 block text-sm text-red-600">Please use numbers only.</span>
        </label>

        <card-form v-if="paymentsReady && items.length > 0" :amount="total"></card-form>

        <button data-test="checkout-btn"
          class="mt-5 w-full rounded-xl bg-brand py-3 font-semibold text-white shadow-lg shadow-indigo/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-none disabled:bg-line disabled:text-muted disabled:shadow-none"
          :disabled="!canCheckout"
          @click="$emit('checkout')">
          <template v-if="submitting"><i class="fa fa-circle-o-notch fa-spin mr-1"></i> {{ paymentsReady ? 'Processing payment…' : 'Placing order…' }}</template>
          <template v-else><i class="fa fa-lock mr-1"></i> Checkout<span v-if="paymentsReady && total > 0"> · {{ pounds(total) }}</span></template>
        </button>

        <p v-if="orderError" data-test="order-error" class="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{{ orderError }}</p>
      </aside>
    </div>
  `
};
