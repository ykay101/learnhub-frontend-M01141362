import { mountCardForm, updateAmount } from "../payment.js";

export default {
  props: ["amount"],
  mounted() {
    mountCardForm(this.$refs.box, Math.round(this.amount * 100));
  },
  watch: {
    amount(value) {
      updateAmount(Math.round(value * 100));
    }
  },
  template: `
    <div data-test="card-form" class="mt-4">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-sm font-medium">Card details</span>
        <span class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Test mode</span>
      </div>
      <div ref="box"></div>
      <p class="mt-2 text-xs text-muted"><i class="fa fa-info-circle mr-1"></i>Use card 4242 4242 4242 4242, any future date and any CVC.</p>
    </div>
  `
};
