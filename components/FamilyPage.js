export default {
  props: ["user", "busy", "message", "error"],
  emits: ["save"],
  data() {
    return {
      phone: this.user.phone,
      homeArea: this.user.homeArea,
      nextId: this.user.children.length,
      children: this.user.children.map((child, index) => ({ ...child, uid: index }))
    };
  },
  methods: {
    addChild() {
      if (this.children.length < 6) {
        this.children.push({ name: "", age: "", interests: "", uid: this.nextId });
        this.nextId++;
      }
    },
    removeChild(index) {
      this.children.splice(index, 1);
    },
    save() {
      this.$emit("save", {
        phone: this.phone,
        homeArea: this.homeArea,
        children: this.children.map(child => ({ name: child.name, age: Number(child.age), interests: child.interests }))
      });
    }
  },
  template: `
    <div data-test="family-page" class="mx-auto max-w-4xl">
      <h2 class="font-display text-3xl font-semibold">My family</h2>
      <p class="mt-1 text-muted">The planner uses these details to suggest the right lessons for each child.</p>

      <div class="mt-6 grid gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm sm:grid-cols-2">
        <label class="block">
          <span class="text-sm font-medium">Phone number</span>
          <input data-test="family-phone" v-model="phone" type="tel" placeholder="Used to fill in checkout" class="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-indigo focus:bg-white focus:ring-4 focus:ring-indigo/10">
        </label>
        <label class="block">
          <span class="text-sm font-medium">Home area</span>
          <input data-test="family-area" v-model="homeArea" type="text" placeholder="For example Hendon" class="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-indigo focus:bg-white focus:ring-4 focus:ring-indigo/10">
        </label>
      </div>

      <div class="mt-6 flex items-center justify-between">
        <h3 class="font-display text-xl font-semibold">Children</h3>
        <button data-test="add-child" class="rounded-full bg-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-night disabled:opacity-40" :disabled="children.length >= 6" @click="addChild"><i class="fa fa-plus mr-1"></i>Add child</button>
      </div>

      <p v-if="children.length == 0" class="mt-4 rounded-2xl border border-dashed border-line bg-white p-6 text-center text-muted">No children saved yet.</p>

      <transition-group tag="div" name="card" class="mt-4 space-y-3">
        <div v-for="(child, index) in children" :key="child.uid" class="grid gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm sm:grid-cols-[1fr_90px_1.4fr_auto] sm:items-end">
          <label class="block"><span class="text-xs font-medium text-muted">Name</span>
            <input :data-test="'child-name-' + index" v-model="child.name" type="text" class="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5 outline-none focus:border-indigo focus:bg-white"></label>
          <label class="block"><span class="text-xs font-medium text-muted">Age</span>
            <input :data-test="'child-age-' + index" v-model="child.age" type="number" min="3" max="17" class="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5 outline-none focus:border-indigo focus:bg-white"></label>
          <label class="block"><span class="text-xs font-medium text-muted">Loves</span>
            <input :data-test="'child-interests-' + index" v-model="child.interests" type="text" placeholder="drawing, football..." class="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5 outline-none focus:border-indigo focus:bg-white"></label>
          <button class="h-10 rounded-xl px-3 text-sm text-red-600 hover:bg-red-50" :aria-label="'Remove ' + (child.name || 'child')" @click="removeChild(index)"><i class="fa fa-trash-o"></i></button>
        </div>
      </transition-group>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <button data-test="save-family" class="rounded-xl bg-brand px-6 py-3 font-semibold text-white shadow-lg shadow-indigo/20 hover:brightness-110 disabled:opacity-60" :disabled="busy" @click="save">
          <i v-if="busy" class="fa fa-circle-o-notch fa-spin mr-1"></i> Save
        </button>
        <span v-if="message" data-test="family-saved" class="text-sm font-medium text-emerald-700"><i class="fa fa-check mr-1"></i>{{ message }}</span>
        <span v-if="error" data-test="family-error" class="text-sm text-red-600">{{ error }}</span>
      </div>
    </div>
  `
};
