import { pounds } from "../money.js";
import { subjectStyle } from "../subjects.js";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CHILD_COLOURS = [
  { block: "from-indigo-500 to-violet-600", dot: "bg-indigo-500" },
  { block: "from-teal-400 to-emerald-600", dot: "bg-teal-500" },
  { block: "from-orange-400 to-pink-500", dot: "bg-orange-500" },
  { block: "from-fuchsia-500 to-purple-600", dot: "bg-fuchsia-500" },
  { block: "from-sky-400 to-blue-600", dot: "bg-sky-500" },
  { block: "from-lime-500 to-green-600", dot: "bg-lime-500" }
];
const HOUR_HEIGHT = 56;

export default {
  props: ["plan"],
  computed: {
    days() {
      return DAYS;
    },
    children() {
      let names = [];
      for (let pick of this.plan.picks) {
        if (pick.child && !names.includes(pick.child)) names.push(pick.child);
      }
      return names;
    },
    firstHour() {
      let starts = this.plan.picks.map(pick => Math.floor(this.start(pick) / 60));
      let first = Math.min(...starts) - 1;
      return Math.max(8, Math.min(first, 15));
    },
    lastHour() {
      let ends = this.plan.picks.map(pick => Math.ceil((this.start(pick) + 60) / 60));
      let last = Math.max(...ends) + 1;
      return Math.max(last, this.firstHour + 4);
    },
    hours() {
      let list = [];
      for (let hour = this.firstHour; hour < this.lastHour; hour++) list.push(hour);
      return list;
    },
    height() {
      return this.hours.length * HOUR_HEIGHT;
    },
    budgetPercent() {
      if (!this.plan.budget) return 0;
      return Math.min(100, Math.round(this.plan.total / this.plan.budget * 100));
    }
  },
  methods: {
    pounds,
    colour(child) {
      let index = this.children.indexOf(child);
      return CHILD_COLOURS[(index < 0 ? 0 : index) % CHILD_COLOURS.length];
    },
    icon(pick) {
      return subjectStyle(pick.lesson.topic).icon;
    },
    start(pick) {
      let [hours, minutes] = pick.lesson.time.split(":").map(Number);
      return hours * 60 + minutes;
    },
    picksOn(day) {
      return this.plan.picks.filter(pick => pick.lesson.day == day);
    },
    position(pick, day) {
      let top = (this.start(pick) - this.firstHour * 60) / 60 * HOUR_HEIGHT;
      let sameTime = this.picksOn(day).filter(other => Math.abs(this.start(other) - this.start(pick)) < 60);
      let lane = sameTime.indexOf(pick);
      let width = 100 / sameTime.length;
      return {
        top: top + 2 + "px",
        height: HOUR_HEIGHT - 4 + "px",
        left: "calc(" + (lane * width) + "% + 3px)",
        width: "calc(" + width + "% - 6px)"
      };
    }
  },
  template: `
    <div data-test="week-calendar" class="rounded-3xl border border-line bg-white p-5 shadow-xl shadow-indigo-950/5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h3 class="font-display text-xl font-semibold">Your family's week</h3>
        <div class="flex flex-wrap items-center gap-2">
          <span v-for="child in children" :key="child" class="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-sm font-medium ring-1 ring-line">
            <span class="h-2.5 w-2.5 rounded-full" :class="colour(child).dot"></span>{{ child }}
          </span>
        </div>
      </div>

      <div class="mt-4 overflow-x-auto">
        <div class="grid min-w-[560px] grid-cols-[44px_repeat(6,1fr)] gap-1.5">
          <div></div>
          <div v-for="day in days" :key="day" class="pb-1 text-center text-xs font-semibold tracking-widest uppercase" :class="picksOn(day).length ? 'text-indigo-700' : 'text-muted/60'">{{ day }}</div>

          <div class="relative" :style="{ height: height + 'px' }">
            <span v-for="(hour, index) in hours" :key="hour" class="absolute right-2 -translate-y-1/2 text-[11px] text-muted" :style="{ top: index * 56 + 'px' }">{{ hour }}:00</span>
          </div>
          <div v-for="day in days" :key="day" class="relative overflow-hidden rounded-2xl ring-1 transition" :class="picksOn(day).length ? 'bg-indigo-50/40 ring-indigo-100' : 'bg-surface ring-line/70'" :style="{ height: height + 'px' }">
            <div v-for="(hour, index) in hours" :key="hour" class="absolute inset-x-0 border-t border-dashed border-line" :style="{ top: index * 56 + 'px' }"></div>
            <div v-for="(pick, index) in picksOn(day)" :key="index + pick.lesson._id + pick.child" data-test="calendar-block"
              class="calendar-block absolute overflow-hidden rounded-xl bg-gradient-to-br px-2 py-1.5 text-white shadow-lg shadow-indigo-950/20 ring-1 ring-white/20"
              :class="colour(pick.child).block" :style="position(pick, day)">
              <p class="flex items-center gap-1 text-xs font-bold"><i class="fa text-[10px] opacity-80" :class="'fa-' + icon(pick)"></i><span class="truncate">{{ pick.lesson.topic }}</span></p>
              <p class="truncate text-[11px] opacity-90">{{ pick.child }} · {{ pick.lesson.time }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="plan.budget" class="mt-5">
        <div class="mb-1.5 flex justify-between text-sm">
          <span class="font-medium">Budget</span>
          <span data-test="budget-text" :class="plan.overBudget ? 'font-semibold text-red-600' : 'text-muted'">{{ pounds(plan.total) }} of {{ pounds(plan.budget) }}</span>
        </div>
        <div class="h-2.5 overflow-hidden rounded-full bg-line">
          <div data-test="budget-bar" class="budget-fill h-full rounded-full" :class="plan.overBudget ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-400'" :style="{ width: budgetPercent + '%' }"></div>
        </div>
      </div>

      <ul v-if="plan.clashes.length" class="mt-4 space-y-2">
        <li v-for="(clash, index) in plan.clashes" :key="index" data-test="clash" class="flex gap-2 rounded-2xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800 ring-1 ring-amber-100"><i class="fa fa-exclamation-triangle mt-0.5"></i>{{ clash.message }}</li>
      </ul>
    </div>
  `
};
