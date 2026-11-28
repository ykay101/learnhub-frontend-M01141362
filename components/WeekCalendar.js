import { pounds } from "../money.js";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CHILD_COLOURS = [
  "bg-indigo-500 text-white",
  "bg-teal-500 text-white",
  "bg-orange-500 text-white",
  "bg-fuchsia-500 text-white",
  "bg-sky-500 text-white",
  "bg-lime-600 text-white"
];
const FIRST_HOUR = 9;
const LAST_HOUR = 19;

export default {
  props: ["plan"],
  computed: {
    days() {
      return DAYS;
    },
    hours() {
      let list = [];
      for (let hour = FIRST_HOUR; hour < LAST_HOUR; hour++) list.push(hour);
      return list;
    },
    children() {
      let names = [];
      for (let pick of this.plan.picks) {
        if (pick.child && !names.includes(pick.child)) names.push(pick.child);
      }
      return names;
    },
    budgetPercent() {
      if (!this.plan.budget) return 0;
      return Math.min(100, Math.round(this.plan.total / this.plan.budget * 100));
    }
  },
  methods: {
    pounds,
    colour(child) {
      return CHILD_COLOURS[this.children.indexOf(child) % CHILD_COLOURS.length];
    },
    picksOn(day) {
      return this.plan.picks.filter(pick => pick.lesson.day == day);
    },
    start(pick) {
      let [hours, minutes] = pick.lesson.time.split(":").map(Number);
      return hours * 60 + minutes;
    },
    position(pick, day) {
      let top = (this.start(pick) - FIRST_HOUR * 60) / ((LAST_HOUR - FIRST_HOUR) * 60) * 100;
      let height = 60 / ((LAST_HOUR - FIRST_HOUR) * 60) * 100;
      let sameTime = this.picksOn(day).filter(other => Math.abs(this.start(other) - this.start(pick)) < 60);
      let lane = sameTime.indexOf(pick);
      let width = 100 / sameTime.length;
      return {
        top: top + "%",
        height: height + "%",
        left: "calc(" + (lane * width) + "% + 2px)",
        width: "calc(" + width + "% - 4px)"
      };
    }
  },
  template: `
    <div data-test="week-calendar" class="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div class="mb-4 flex flex-wrap items-center gap-3">
        <span v-for="child in children" :key="child" class="inline-flex items-center gap-2 text-sm font-medium">
          <span class="h-3 w-3 rounded-full" :class="colour(child).split(' ')[0]"></span>{{ child }}
        </span>
      </div>

      <div class="overflow-x-auto">
        <div class="grid min-w-[560px] grid-cols-[40px_repeat(6,1fr)] gap-1">
          <div></div>
          <div v-for="day in days" :key="day" class="pb-1 text-center text-xs font-semibold tracking-wide text-muted uppercase">{{ day }}</div>

          <div class="relative h-80">
            <span v-for="(hour, index) in hours" :key="hour" class="absolute -translate-y-1/2 text-[10px] text-muted" :style="{ top: (index / hours.length * 100) + '%' }">{{ hour }}:00</span>
          </div>
          <div v-for="day in days" :key="day" class="relative h-80 rounded-xl bg-surface ring-1 ring-line">
            <div v-for="(hour, index) in hours" :key="hour" class="absolute inset-x-0 border-t border-line/70" :style="{ top: (index / hours.length * 100) + '%' }"></div>
            <div v-for="(pick, index) in picksOn(day)" :key="index + pick.lesson._id + pick.child" data-test="calendar-block"
              class="calendar-block absolute overflow-hidden rounded-lg px-1.5 py-1 text-[11px] leading-tight shadow-md"
              :class="colour(pick.child)" :style="position(pick, day)">
              <p class="font-semibold">{{ pick.lesson.topic }}</p>
              <p class="opacity-90">{{ pick.child }} · {{ pick.lesson.time }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="plan.budget" class="mt-4">
        <div class="mb-1 flex justify-between text-sm">
          <span class="font-medium">Budget</span>
          <span data-test="budget-text" :class="plan.overBudget ? 'font-semibold text-red-600' : 'text-muted'">{{ pounds(plan.total) }} of {{ pounds(plan.budget) }}</span>
        </div>
        <div class="h-2.5 overflow-hidden rounded-full bg-line">
          <div data-test="budget-bar" class="budget-fill h-full rounded-full" :class="plan.overBudget ? 'bg-red-500' : 'bg-gradient-to-r from-indigo to-teal'" :style="{ width: budgetPercent + '%' }"></div>
        </div>
      </div>

      <ul v-if="plan.clashes.length" class="mt-4 space-y-2">
        <li v-for="(clash, index) in plan.clashes" :key="index" data-test="clash" class="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800"><i class="fa fa-exclamation-triangle mr-1"></i>{{ clash.message }}</li>
      </ul>
    </div>
  `
};
