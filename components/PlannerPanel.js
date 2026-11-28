import { readStream, imageURL } from "../api.js";
import { pounds } from "../money.js";

const EXAMPLES = [
  "My daughter is 8 and loves drawing, my son is 12 and wants to code. We live near Hendon, budget £300.",
  "Something active on Saturday mornings for a 9 year old, under £60.",
  "My 7 year old twins love music and drama, we're in Colindale."
];

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
      listening: false,
      voiceError: "",
      controller: null,
      recognition: null
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
    }
  },
  mounted() {
    if (this.similarLesson) {
      this.run("/agent/similar", { lessonId: this.similarLesson._id });
    }
  },
  unmounted() {
    if (this.controller) this.controller.abort();
    if (this.recognition) this.recognition.abort();
  },
  methods: {
    imageURL,
    pounds,
    useExample(text) {
      this.prompt = text;
    },
    startPlan() {
      let message = this.prompt.trim() || "Please plan lessons for my saved children.";
      this.run("/agent/plan", { message: message });
    },
    async run(path, body) {
      this.running = true;
      this.steps = [];
      this.plan = null;
      this.error = "";
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
        this.recognition.stop();
        return;
      }
      let Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      let recognition = new Recognition();
      recognition.lang = "en-GB";
      recognition.interimResults = true;
      recognition.continuous = false;
      let before = this.prompt ? this.prompt.trim() + " " : "";
      recognition.onresult = event => {
        let text = "";
        for (let result of event.results) text = text + result[0].transcript;
        this.prompt = before + text;
      };
      recognition.onerror = event => {
        this.voiceError = event.error == "not-allowed" ? "Please allow the microphone to use voice." : "We couldn't hear that. Please try again or type instead.";
      };
      recognition.onend = () => {
        this.listening = false;
      };
      this.voiceError = "";
      this.recognition = recognition;
      this.listening = true;
      recognition.start();
    }
  },
  template: `
    <div data-test="planner" class="mx-auto max-w-5xl">
      <div class="overflow-hidden rounded-3xl bg-brand p-6 text-white shadow-xl shadow-indigo/20 sm:p-8">
        <p class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide uppercase ring-1 ring-white/20"><i class="fa fa-magic"></i> AI planner</p>
        <h2 class="mt-3 font-display text-3xl font-semibold sm:text-4xl">
          <template v-if="similarLesson">Lessons like {{ similarLesson.topic }} in {{ similarLesson.location }}</template>
          <template v-else>Plan my week</template>
        </h2>
        <p class="mt-2 max-w-2xl text-white/80">
          <template v-if="similarLesson">That lesson is fully booked. I'm looking for the closest lessons that still have spaces.</template>
          <template v-else>Tell me about your children, where you live and your budget. I'll check real lessons, spaces, distances and clashes, then build your family's week.</template>
        </p>

        <div v-if="!similarLesson" class="mt-6 rounded-2xl bg-white p-3 text-ink shadow-lg">
          <textarea data-test="plan-input" v-model="prompt" maxlength="500" rows="3" :disabled="running"
            class="w-full resize-none rounded-xl bg-transparent px-2 py-1 outline-none placeholder:text-muted"
            placeholder="My daughter is 8 and loves drawing, my son is 12 and wants to code. We live near Hendon, budget £300."></textarea>
          <div class="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
            <div class="flex items-center gap-2 text-xs text-muted">
              <button v-if="voiceSupported" data-test="mic-btn" type="button" :disabled="running"
                class="grid h-10 w-10 place-items-center rounded-full transition"
                :class="listening ? 'bg-red-500 text-white mic-live' : 'bg-surface text-ink hover:bg-line'"
                :aria-label="listening ? 'Stop listening' : 'Speak instead of typing'" @click="toggleVoice">
                <i class="fa" :class="listening ? 'fa-stop' : 'fa-microphone'"></i>
              </button>
              <span v-if="listening" class="font-medium text-red-600">Listening…</span>
              <span v-else>{{ prompt.length }}/500</span>
            </div>
            <button data-test="plan-btn" class="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white shadow-lg shadow-indigo/20 transition hover:brightness-110 disabled:opacity-50" :disabled="!canPlan" @click="startPlan">
              <i class="fa mr-1" :class="running ? 'fa-circle-o-notch fa-spin' : 'fa-magic'"></i>{{ running ? 'Planning…' : 'Plan my week' }}
            </button>
          </div>
          <p v-if="voiceError" data-test="voice-error" class="mt-2 text-sm text-red-600">{{ voiceError }}</p>
        </div>

        <div v-if="!similarLesson && !running && !plan" class="mt-4 flex flex-wrap gap-2">
          <button v-for="example in examples" :key="example" data-test="example-chip" class="rounded-full bg-white/10 px-3 py-1.5 text-left text-sm ring-1 ring-white/20 transition hover:bg-white/20" @click="useExample(example)">{{ example }}</button>
        </div>
        <p v-if="!similarLesson" class="mt-4 text-sm text-white/80">
          <i class="fa fa-users mr-1"></i>
          <template v-if="user.children.length">Using your saved children: {{ savedChildren }}.</template>
          <template v-else>Tip: save your children once and just ask "plan our week".</template>
          <button class="ml-1 underline underline-offset-2 hover:text-white" @click="$emit('edit-family')">Edit family</button>
        </p>
      </div>

      <div v-if="steps.length" class="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm">
        <h3 class="mb-3 text-sm font-semibold tracking-wide text-muted uppercase">What I'm doing</h3>
        <transition-group tag="ol" name="step" class="space-y-2">
          <li v-for="(step, index) in steps" :key="index" data-test="step" class="flex items-center gap-3">
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full" :class="step.done ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo'">
              <i class="fa" :class="step.done ? 'fa-check' : 'fa-circle-o-notch fa-spin'"></i>
            </span>
            <span class="flex-1"><i class="fa mr-1 text-muted" :class="'fa-' + step.icon"></i>{{ step.label }}</span>
            <span v-if="step.detail" data-test="step-detail" class="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-muted">{{ step.detail }}</span>
          </li>
        </transition-group>
      </div>

      <p v-if="error" data-test="planner-error" class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"><i class="fa fa-exclamation-circle mr-1"></i>{{ error }}</p>

      <transition name="page">
        <div v-if="plan" data-test="plan-result" class="mt-6 space-y-5">
          <p v-if="plan.note" class="rounded-2xl bg-indigo-50 p-4 text-indigo-900"><i class="fa fa-lightbulb-o mr-1"></i>{{ plan.note }}</p>
          <p v-if="plan.picks.length == 0" class="rounded-2xl border border-dashed border-line bg-white p-6 text-center text-muted">I couldn't find lessons that fit. Try changing the budget, ages or area.</p>

          <week-calendar v-if="!similarLesson && plan.picks.length" :plan="plan"></week-calendar>

          <div class="grid gap-4 sm:grid-cols-2">
            <article v-for="(pick, index) in plan.picks" :key="index + pick.lesson._id" data-test="plan-pick" class="flex gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm">
              <img :src="imageURL(pick.lesson.image)" :alt="pick.lesson.topic" class="h-20 w-24 shrink-0 rounded-xl object-cover">
              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold tracking-wide text-muted uppercase"><template v-if="pick.child">{{ pick.child }}<template v-if="pick.age"> · {{ pick.age }}</template></template><template v-else>Alternative</template></p>
                <p class="font-display text-lg font-semibold">{{ pick.lesson.topic }} <span class="text-indigo">{{ pounds(pick.lesson.price) }}</span></p>
                <p class="text-sm text-muted">{{ pick.lesson.location }} · {{ pick.lesson.day }} {{ pick.lesson.time }}<template v-if="pick.miles != null"> · {{ pick.miles }} mi</template></p>
                <p class="mt-1 text-sm">{{ pick.reason }}</p>
                <button v-if="similarLesson" data-test="add-pick" class="mt-2 rounded-lg bg-indigo px-3 py-1.5 text-sm font-semibold text-white hover:bg-night" @click="addOne(pick)"><i class="fa fa-plus mr-1"></i>Add to Cart</button>
              </div>
            </article>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button v-if="!similarLesson && plan.picks.length" data-test="add-plan" class="rounded-xl bg-brand px-6 py-3 font-semibold text-white shadow-lg shadow-indigo/20 hover:brightness-110" @click="addPlan">
              <i class="fa fa-cart-plus mr-1"></i>Add whole plan to cart · {{ pounds(plan.total) }}
            </button>
            <button v-if="!similarLesson" data-test="start-again" class="rounded-xl px-4 py-3 font-semibold text-ink ring-1 ring-line hover:bg-white" @click="startAgain">Start again</button>
            <button v-else class="rounded-xl px-4 py-3 font-semibold text-ink ring-1 ring-line hover:bg-white" @click="$emit('browse')">Back to lessons</button>
            <span v-if="notice" data-test="plan-notice" class="text-sm font-medium text-emerald-700"><i class="fa fa-check mr-1"></i>{{ notice }}</span>
          </div>
        </div>
      </transition>
    </div>
  `
};
