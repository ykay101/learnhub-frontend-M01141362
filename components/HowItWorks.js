const STEPS = [
  { icon: "commenting-o", title: "Tell it about your family", text: "Type or speak: ages, interests, where you live and your budget.", glow: "from-indigo-500 to-violet-500" },
  { icon: "bolt", title: "Watch the agent work", text: "It searches real lessons, checks spaces, distances and clashes, live.", glow: "from-violet-500 to-fuchsia-500" },
  { icon: "calendar-check-o", title: "Book the whole week", text: "One click adds every lesson to your cart. Pay securely by card.", glow: "from-teal-400 to-emerald-500" }
];
const SUBJECTS = ["Coding", "Art", "Football", "Music", "Robotics", "Swimming", "Drama", "Chess", "Science", "Spanish", "Dance", "Maths", "English"];

export default {
  emits: ["plan"],
  computed: {
    steps() {
      return STEPS;
    },
    subjects() {
      return SUBJECTS.concat(SUBJECTS);
    }
  },
  template: `
    <section class="relative -mt-16 pb-6">
      <div class="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div class="grid gap-4 md:grid-cols-3">
          <article v-for="(step, index) in steps" :key="step.title" v-tilt class="tilt-surface group relative overflow-hidden rounded-3xl border border-line bg-white/90 p-6 shadow-xl shadow-indigo-950/5 backdrop-blur">
            <div aria-hidden="true" class="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br opacity-10 blur-2xl transition group-hover:opacity-25" :class="step.glow"></div>
            <span class="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-xl text-white shadow-lg" :class="step.glow"><i class="fa" :class="'fa-' + step.icon"></i></span>
            <p class="relative mt-5 text-xs font-semibold tracking-widest text-muted uppercase">Step {{ index + 1 }}</p>
            <h3 class="relative mt-1 font-display text-xl font-semibold">{{ step.title }}</h3>
            <p class="relative mt-2 text-sm leading-relaxed text-ink/70">{{ step.text }}</p>
          </article>
        </div>
      </div>
      <div class="marquee-mask mt-10 overflow-hidden" aria-hidden="true">
        <div class="marquee flex w-max gap-3">
          <span v-for="(subject, index) in subjects" :key="index" class="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink/70 shadow-sm">{{ subject }}</span>
        </div>
      </div>
    </section>
  `
};
