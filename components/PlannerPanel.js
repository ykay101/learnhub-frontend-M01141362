import { readStream, imageURL } from "../api.js";
import { pounds } from "../money.js";
import { subjectStyle } from "../subjects.js";

const EXAMPLES = [
  "My daughter Mia is 8 and loves drawing, my son Leo is 12 and wants to code. We live near Hendon, budget £300.",
  "Something active on Saturday mornings for a 9 year old, under £60.",
  "My 7 year old twins love music and drama, we're in Colindale."
];
const SILENCE_LIMIT = 10000;
const LISTEN_LIMIT = 90000;

export default {
  props: ["user", "similarLesson", "notice"],
  emits: ["add-lessons", "edit-family", "browse"],
  data() {
    return {
      prompt: "",
      running: false,
      steps: [],
      plan: null,
      error: "",
      startedAt: 0,
      elapsed: 0,
      clock: null,
      listening: false,
      heard: "",
      interim: "",
      voiceError: "",
      controller: null,
      recognition: null,
      silenceTimer: null,
      listenStarted: 0
    };
  },
  computed: {
    examples() {
      return EXAMPLES;
    },
    voiceSupported() {
      return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
    },
    savedChildren() {
      return this.user.children.map(child => child.name + " (" + child.age + ")").join(", ");
    },
    canPlan() {
      return !this.running && (this.prompt.trim().length > 0 || this.user.children.length > 0);
    },
    summary() {
      if (!this.plan) return [];
      let children = new Set(this.plan.picks.map(pick => pick.child).filter(Boolean)).size;
      let distances = this.plan.picks.map(pick => pick.miles).filter(miles => miles != null);
      let tiles = [
        { label: "Lessons", value: this.plan.picks.length, icon: "graduation-cap" },
        { label: "Weekly total", value: pounds(this.plan.total), icon: "gbp" }
      ];
      if (children) tiles.push({ label: children == 1 ? "Child" : "Children", value: children, icon: "child" });
      if (this.plan.budget) {
        let left = this.plan.budget - this.plan.total;
        tiles.push({ label: left >= 0 ? "Under budget" : "Over budget", value: pounds(Math.abs(left)), icon: left >= 0 ? "check-circle" : "exclamation-circle", warn: left < 0 });
      } else if (distances.length) {
        tiles.push({ label: "Furthest", value: Math.max(...distances) + " mi", icon: "map-marker" });
      }
      return tiles;
    }
  },
  mounted() {
    if (this.similarLesson) {
      this.run("/agent/similar", { lessonId: this.similarLesson._id });
    }
  },
  unmounted() {
    if (this.controller) this.controller.abort();
    this.stopListening();
    clearInterval(this.clock);
  },
  methods: {
    imageURL,
    pounds,
    style(pick) {
      return subjectStyle(pick.lesson.topic);
    },
    useExample(text) {
      this.prompt = text;
    },
    startPlan() {
      this.stopListening();
      let message = this.prompt.trim() || "Please plan lessons for my saved children.";
      this.run("/agent/plan", { message: message });
    },
    async run(path, body) {
      this.running = true;
      this.steps = [];
      this.plan = null;
      this.error = "";
      this.startedAt = Date.now();
      this.elapsed = 0;
      clearInterval(this.clock);
      this.clock = setInterval(() => { this.elapsed = Math.round((Date.now() - this.startedAt) / 100) / 10; }, 100);
      this.controller = new AbortController();
      try {
        await readStream(path, body, event => this.onEvent(event), this.controller.signal);
        if (!this.plan && !this.error) {
          this.error = "The planner stopped early. Please try again.";
        }
      } catch (error) {
        if (error.name != "AbortError") {
          this.error = error.message || "The planner isn't available right now.";
        }
      } finally {
        this.running = false;
        clearInterval(this.clock);
        this.steps.forEach(step => { step.done = true; });
      }
    },
    onEvent(event) {
      if (event.type == "step") {
        this.steps.forEach(step => { step.done = true; });
        this.steps.push({ icon: event.icon, label: event.label, detail: "", done: false });
      } else if (event.type == "step_done") {
        let last = this.steps[this.steps.length - 1];
        if (last) {
          last.done = true;
          last.detail = event.detail;
        }
      } else if (event.type == "plan") {
        this.plan = event.plan;
      } else if (event.type == "error") {
        this.error = event.message;
      }
    },
    addPlan() {
      this.$emit("add-lessons", this.plan.picks.map(pick => pick.lesson._id));
    },
    addOne(pick) {
      this.$emit("add-lessons", [pick.lesson._id]);
    },
    startAgain() {
      this.plan = null;
      this.steps = [];
      this.error = "";
    },
    toggleVoice() {
      if (this.listening) {
        this.stopListening();
      } else {
        this.startListening();
      }
    },
    startListening() {
      this.voiceError = "";
      this.heard = this.prompt.trim() ? this.prompt.trim() + " " : "";
      this.interim = "";
      this.listening = true;
      this.listenStarted = Date.now();
      this.openMic();
    },
    openMic() {
      let Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      let recognition = new Recognition();
      recognition.lang = "en-GB";
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.onresult = event => {
        let interim = "";
        let results = event.results;
        let first = event.resultIndex || 0;
        for (let i = first; i < results.length; i++) {
          let text = results[i][0].transcript;
          if (results[i].isFinal !== false) {
            this.heard = (this.heard + " " + text).replace(/\s+/g, " ").trimStart();
          } else {
            interim = interim + text;
          }
        }
        this.interim = interim;
        this.prompt = (this.heard + " " + interim).replace(/\s+/g, " ").trim();
        this.resetSilence();
      };
      recognition.onerror = event => {
        if (event.error == "no-speech" || event.error == "aborted") return;
        this.voiceError = event.error == "not-allowed" ? "Please allow the microphone to use voice." : "We couldn't hear that. Please try again or type instead.";
        this.listening = false;
      };
      recognition.onend = () => {
        if (this.listening && Date.now() - this.listenStarted < LISTEN_LIMIT) {
          try {
            recognition.start();
          } catch (error) {
            this.listening = false;
          }
        } else {
          this.listening = false;
          this.interim = "";
        }
      };
      this.recognition = recognition;
      this.resetSilence();
      recognition.start();
    },
    resetSilence() {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = setTimeout(() => this.stopListening(), SILENCE_LIMIT);
    },
    stopListening() {
      clearTimeout(this.silenceTimer);
      if (!this.listening) return;
      this.listening = false;
      this.interim = "";
      if (this.recognition) this.recognition.stop();
    }
  },
  template: `
    <div data-test="planner" class="mx-auto max-w-5xl">
      <div class="relative overflow-hidden rounded-[32px] bg-[#0d0b2a] p-6 text-white shadow-2xl shadow-indigo-950/30 sm:p-9">
        <div aria-hidden="true" class="aurora absolute inset-0 opacity-90"></div>
        <div aria-hidden="true" class="card-dots absolute inset-0 opacity-15"></div>
        <div class="relative">
          <p class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-widest uppercase backdrop-blur"><span class="live-dot h-1.5 w-1.5 rounded-full bg-emerald-400"></span> AI planner</p>
          <h2 class="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            <template v-if="similarLesson">Lessons like <span class="shimmer-text">{{ similarLesson.topic }}</span></template>
            <template v-else>Plan my <span class="shimmer-text">week</span></template>
          </h2>
          <p class="mt-3 max-w-2xl text-white/70">
            <template v-if="similarLesson">{{ similarLesson.topic }} in {{ similarLesson.location }} is fully booked. I'm finding the closest lessons that still have spaces.</template>
            <template v-else>Tell me about your children, where you live and your budget. I'll check real lessons, spaces, distances and clashes, then build your family's week.</template>
          </p>

          <div v-if="!similarLesson" class="mt-7 rounded-3xl bg-white/[0.08] p-2 ring-1 ring-white/15 backdrop-blur-xl transition focus-within:bg-white/[0.12] focus-within:ring-violet-300/50">
            <textarea data-test="plan-input" v-model="prompt" maxlength="500" rows="3" :disabled="running"
              class="w-full resize-none rounded-2xl bg-transparent px-4 py-3 text-[15px] leading-relaxed text-white outline-none placeholder:text-white/40"
              placeholder="My daughter is 8 and loves drawing, my son is 12 and wants to code. We live near Hendon, budget £300."></textarea>
            <div class="flex flex-wrap items-center justify-between gap-3 px-2 pb-1">
              <div class="flex items-center gap-3">
                <button v-if="voiceSupported" data-test="mic-btn" type="button" :disabled="running"
                  class="relative grid h-11 w-11 place-items-center rounded-full transition"
                  :class="listening ? 'bg-red-500 text-white mic-live' : 'bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20'"
                  :aria-label="listening ? 'Stop listening' : 'Speak instead of typing'" @click="toggleVoice">
                  <i class="fa" :class="listening ? 'fa-stop' : 'fa-microphone'"></i>
                </button>
                <div v-if="listening" class="flex items-center gap-3">
                  <span class="wave flex h-6 items-end gap-0.5" aria-hidden="true"><i v-for="n in 5" :key="n" :style="{ animationDelay: (n * 0.12) + 's' }"></i></span>
                  <span class="text-sm font-medium text-red-200">Listening… tap to finish</span>
                </div>
                <span v-else class="text-xs text-white/45">{{ voiceSupported ? 'Type or tap the mic to speak' : 'Type your request' }} · {{ prompt.length }}/500</span>
              </div>
              <button data-test="plan-btn" class="cta-glow relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-400 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50" :disabled="!canPlan" @click="startPlan">
                <i class="fa" :class="running ? 'fa-circle-o-notch fa-spin' : 'fa-magic'"></i>{{ running ? 'Planning…' : 'Plan my week' }}
              </button>
            </div>
          </div>
          <p v-if="voiceError" data-test="voice-error" class="mt-3 text-sm text-red-200"><i class="fa fa-exclamation-circle mr-1"></i>{{ voiceError }}</p>

          <div v-if="!similarLesson && !running && !plan" class="mt-5 flex flex-wrap gap-2">
            <button v-for="example in examples" :key="example" data-test="example-chip" class="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2 text-left text-sm text-white/75 transition hover:border-violet-300/40 hover:bg-white/10 hover:text-white" @click="useExample(example)">
              <i class="fa fa-lightbulb-o mr-1 text-amber-300"></i>{{ example }}
            </button>
          </div>
          <p v-if="!similarLesson" class="mt-5 text-sm text-white/60">
            <i class="fa fa-users mr-1"></i>
            <template v-if="user.children.length">Using your saved children: <span class="text-white">{{ savedChildren }}</span>.</template>
            <template v-else>Tip: save your children once and just ask "plan our week".</template>
            <button class="ml-1 font-semibold text-violet-200 underline-offset-2 hover:underline" @click="$emit('edit-family')">Edit family</button>
          </p>
        </div>
      </div>

      <div v-if="steps.length" class="mt-6 rounded-3xl border border-line bg-white p-6 shadow-xl shadow-indigo-950/5">
        <div class="flex items-center justify-between gap-3">
          <h3 class="flex items-center gap-2 font-display text-xl font-semibold">
            <span class="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm text-white"><i class="fa fa-bolt"></i></span>
            {{ running ? 'Agent at work' : 'How I built this' }}
            <span v-if="running" class="thinking ml-1 flex gap-1" aria-hidden="true"><i></i><i></i><i></i></span>
          </h3>
          <span class="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted ring-1 ring-line">{{ steps.length }} steps · {{ elapsed }}s</span>
        </div>
        <transition-group tag="ol" name="step" class="relative mt-5 space-y-3 pl-1">
          <li v-for="(step, index) in steps" :key="index" data-test="step" class="relative flex items-center gap-3">
            <span v-if="index < steps.length - 1" aria-hidden="true" class="absolute top-9 left-[15px] h-[calc(100%-12px)] w-0.5 bg-gradient-to-b from-emerald-300 to-line"></span>
            <span class="relative grid h-8 w-8 shrink-0 place-items-center rounded-full ring-4 ring-white transition" :class="step.done ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-600'">
              <i class="fa text-xs" :class="step.done ? 'fa-check' : 'fa-circle-o-notch fa-spin'"></i>
            </span>
            <span class="min-w-0 flex-1 truncate text-[15px]" :class="step.done ? 'text-ink' : 'font-medium text-indigo-700'"><i class="fa mr-1.5 text-muted" :class="'fa-' + step.icon"></i>{{ step.label }}</span>
            <span v-if="step.detail" data-test="step-detail" class="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">{{ step.detail }}</span>
          </li>
        </transition-group>
      </div>

      <p v-if="error" data-test="planner-error" class="mt-6 flex gap-2 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700"><i class="fa fa-exclamation-circle mt-0.5"></i>{{ error }}</p>

      <transition name="page">
        <div v-if="plan" data-test="plan-result" class="mt-6 space-y-5">
          <div v-if="plan.picks.length" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div v-for="tile in summary" :key="tile.label" class="rounded-3xl border border-line bg-white p-4 shadow-sm">
              <p class="text-xs font-semibold tracking-widest text-muted uppercase"><i class="fa mr-1" :class="['fa-' + tile.icon, tile.warn ? 'text-red-500' : 'text-indigo-400']"></i>{{ tile.label }}</p>
              <p class="mt-1 font-display text-3xl font-semibold" :class="tile.warn ? 'text-red-600' : ''">{{ tile.value }}</p>
            </div>
          </div>

          <div v-if="plan.note" class="flex gap-4 rounded-3xl bg-gradient-to-br from-indigo-50 via-violet-50 to-teal-50 p-5 ring-1 ring-indigo-100">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-teal-400 text-white shadow-lg shadow-indigo-500/30"><i class="fa fa-magic"></i></span>
            <p class="leading-relaxed text-indigo-950">{{ plan.note }}</p>
          </div>
          <p v-if="plan.picks.length == 0" class="rounded-3xl border border-dashed border-line bg-white p-8 text-center text-muted">I couldn't find lessons that fit. Try changing the budget, ages or area.</p>

          <week-calendar v-if="!similarLesson && plan.picks.length" :plan="plan"></week-calendar>

          <div class="grid gap-4 sm:grid-cols-2" :class="plan.picks.length > 2 ? 'lg:grid-cols-3' : ''">
            <article v-for="(pick, index) in plan.picks" :key="index + pick.lesson._id" data-test="plan-pick" v-tilt class="tilt-surface group relative overflow-hidden rounded-3xl border border-line bg-white shadow-sm hover:shadow-xl hover:shadow-indigo-500/10">
              <div class="relative h-24 overflow-hidden bg-gradient-to-br" :class="style(pick).gradient">
                <div aria-hidden="true" class="card-dots absolute inset-0 opacity-30"></div>
                <i aria-hidden="true" class="fa absolute -right-3 -bottom-5 text-[6.5rem] text-white/10" :class="'fa-' + style(pick).icon"></i>
                <div class="absolute inset-x-4 top-4 flex items-center justify-between">
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur-md">
                    <i class="fa" :class="pick.child ? 'fa-child' : 'fa-random'"></i>
                    <template v-if="pick.child">{{ pick.child }}<template v-if="pick.age"> · {{ pick.age }}</template></template><template v-else>Alternative</template>
                  </span>
                  <span class="rounded-full bg-white/95 px-3 py-1 font-display text-lg font-bold text-ink shadow-lg">{{ pounds(pick.lesson.price) }}</span>
                </div>
              </div>
              <div class="p-5">
                <div class="flex items-center gap-3">
                  <span class="-mt-11 grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-xl text-white shadow-lg ring-4 ring-white" :class="style(pick).gradient"><i class="fa" :class="'fa-' + style(pick).icon"></i></span>
                  <h4 class="font-display text-2xl font-semibold tracking-tight">{{ pick.lesson.topic }}</h4>
                </div>
                <div class="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                  <span class="rounded-full bg-surface px-2.5 py-1 ring-1 ring-line"><i class="fa fa-map-marker mr-1 text-indigo-400"></i>{{ pick.lesson.location }}</span>
                  <span class="rounded-full bg-surface px-2.5 py-1 ring-1 ring-line"><i class="fa fa-clock-o mr-1 text-indigo-400"></i>{{ pick.lesson.day }} {{ pick.lesson.time }}</span>
                  <span v-if="pick.miles != null" class="rounded-full bg-surface px-2.5 py-1 ring-1 ring-line"><i class="fa fa-car mr-1 text-indigo-400"></i>{{ pick.miles }} mi</span>
                  <span class="rounded-full bg-surface px-2.5 py-1 ring-1 ring-line"><i class="fa fa-users mr-1 text-indigo-400"></i>{{ pick.lesson.spaces }} left</span>
                </div>
                <p class="mt-3 text-sm leading-relaxed text-ink/75">{{ pick.reason }}</p>
                <button v-if="similarLesson" data-test="add-pick" class="add-btn relative mt-4 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_100%] py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-500 hover:bg-right" @click="addOne(pick)"><i class="fa fa-plus mr-1"></i>Add to Cart</button>
              </div>
            </article>
          </div>

          <div class="flex flex-wrap items-center gap-3 rounded-3xl border border-line bg-white p-4 shadow-sm">
            <button v-if="!similarLesson && plan.picks.length" data-test="add-plan" class="add-btn relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_100%] px-6 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all duration-500 hover:bg-right" @click="addPlan">
              <i class="fa fa-cart-plus mr-1"></i>Add whole plan to cart · {{ pounds(plan.total) }}
            </button>
            <button v-if="!similarLesson" data-test="start-again" class="rounded-2xl px-5 py-3.5 font-semibold text-ink ring-1 ring-line transition hover:bg-surface" @click="startAgain"><i class="fa fa-refresh mr-1"></i>Start again</button>
            <button v-else class="rounded-2xl px-5 py-3.5 font-semibold text-ink ring-1 ring-line transition hover:bg-surface" @click="$emit('browse')"><i class="fa fa-arrow-left mr-1"></i>Back to lessons</button>
            <span v-if="notice" data-test="plan-notice" class="text-sm font-semibold text-emerald-700"><i class="fa fa-check-circle mr-1"></i>{{ notice }}</span>
          </div>
        </div>
      </transition>
    </div>
  `
};
