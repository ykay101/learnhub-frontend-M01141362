const PROMPT = "Mia is 8 and loves drawing, Leo is 12 and wants to code. We're near Hendon, budget £300.";
const STEPS = [
  { icon: "search", label: "Searching art lessons for an 8-year-old", detail: "2 found" },
  { icon: "search", label: "Searching coding lessons for a 12-year-old", detail: "3 found" },
  { icon: "map-marker", label: "Measuring distances from Hendon", detail: "1.6–1.9 mi" },
  { icon: "bar-chart", label: "Checking how full each lesson is", detail: "spaces left" },
  { icon: "calendar", label: "Checking the week for clashes", detail: "no clashes" }
];
const BLOCKS = [
  { day: 1, top: 58, label: "Art", who: "Mia · 16:00", colour: "from-indigo-500 to-violet-500" },
  { day: 3, top: 68, label: "Coding", who: "Leo · 17:00", colour: "from-teal-400 to-emerald-500" }
];

export default {
  data() {
    return {
      typed: "",
      shown: 0,
      done: 0,
      blocks: 0,
      budget: 0,
      timers: []
    };
  },
  computed: {
    steps() {
      return STEPS.slice(0, this.shown);
    },
    visibleBlocks() {
      return BLOCKS.slice(0, this.blocks);
    },
    typing() {
      return this.typed.length < PROMPT.length;
    }
  },
  mounted() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.typed = PROMPT;
      this.shown = STEPS.length;
      this.done = STEPS.length;
      this.blocks = BLOCKS.length;
      this.budget = 63;
      return;
    }
    this.play();
  },
  unmounted() {
    this.timers.forEach(clearTimeout);
  },
  methods: {
    later(ms, fn) {
      this.timers.push(setTimeout(fn, ms));
    },
    play() {
      this.typed = "";
      this.shown = 0;
      this.done = 0;
      this.blocks = 0;
      this.budget = 0;
      let time = 400;
      for (let i = 1; i <= PROMPT.length; i++) {
        this.later(time, () => { this.typed = PROMPT.slice(0, i); });
        time = time + 28;
      }
      time = time + 500;
      STEPS.forEach((step, index) => {
        this.later(time, () => { this.shown = index + 1; });
        this.later(time + 650, () => { this.done = index + 1; });
        time = time + 800;
      });
      BLOCKS.forEach((block, index) => {
        this.later(time + index * 350, () => { this.blocks = index + 1; });
      });
      this.later(time + 500, () => { this.budget = 63; });
      this.later(time + 5200, () => this.play());
    }
  },
  template: `
    <div class="agent-console relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] p-4 text-left text-white shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-5">
      <div class="console-sheen pointer-events-none absolute inset-0"></div>
      <div class="relative flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full bg-red-400/80"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-amber-300/80"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-400/80"></span>
        </div>
        <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-emerald-300 uppercase ring-1 ring-emerald-300/30">
          <span class="live-dot h-1.5 w-1.5 rounded-full bg-emerald-300"></span> Agent live
        </span>
      </div>

      <div class="relative mt-4 rounded-2xl bg-black/25 p-3 ring-1 ring-white/10">
        <p class="text-[11px] font-semibold tracking-widest text-white/50 uppercase">Parent</p>
        <p class="mt-1 min-h-[3rem] text-sm leading-relaxed text-white/90">{{ typed }}<span v-if="typing" class="type-caret">▍</span></p>
      </div>

      <ol class="relative mt-3 space-y-1.5">
        <li v-for="(step, index) in steps" :key="index" class="step-in flex items-center gap-2.5 text-[13px]">
          <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full" :class="index < done ? 'bg-emerald-400/20 text-emerald-300' : 'bg-indigo-400/20 text-indigo-200'">
            <i class="fa text-[11px]" :class="index < done ? 'fa-check' : 'fa-circle-o-notch fa-spin'"></i>
          </span>
          <span class="flex-1 truncate text-white/85"><i class="fa mr-1 text-white/40" :class="'fa-' + step.icon"></i>{{ step.label }}</span>
          <span v-if="index < done" class="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70">{{ step.detail }}</span>
        </li>
      </ol>

      <div class="relative mt-3 rounded-2xl bg-black/25 p-3 ring-1 ring-white/10">
        <div class="grid grid-cols-6 gap-1 text-center text-[10px] font-semibold tracking-wider text-white/45 uppercase">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>
        <div class="relative mt-1.5 grid h-24 grid-cols-6 gap-1">
          <div v-for="n in 6" :key="n" class="rounded-lg bg-white/[0.04] ring-1 ring-white/5"></div>
          <div v-for="block in visibleBlocks" :key="block.label" class="block-pop absolute rounded-lg bg-gradient-to-br px-1.5 py-1 text-[10px] leading-tight shadow-lg shadow-black/30"
            :class="block.colour" :style="{ left: 'calc(' + (block.day * 100 / 6) + '% + 2px)', width: 'calc(' + (100 / 6) + '% - 4px)', top: block.top + '%', height: '30%' }">
            <p class="font-bold">{{ block.label }}</p>
            <p class="opacity-80">{{ block.who }}</p>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between text-[11px] text-white/60">
          <span>Budget</span><span>{{ budget ? '£190 of £300' : '—' }}</span>
        </div>
        <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div class="h-full rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-teal-300 transition-all duration-1000" :style="{ width: budget + '%' }"></div>
        </div>
      </div>
    </div>
  `
};
