import AgentDemo from "./AgentDemo.js";

const CHIPS = [
  { label: "Coding", icon: "code", x: "4%", y: "18%", delay: "0s" },
  { label: "Art", icon: "paint-brush", x: "86%", y: "10%", delay: "1.2s" },
  { label: "Football", icon: "futbol-o", x: "90%", y: "70%", delay: "2.1s" },
  { label: "Music", icon: "music", x: "2%", y: "78%", delay: "0.6s" },
  { label: "Robotics", icon: "cogs", x: "52%", y: "6%", delay: "1.7s" }
];

export default {
  components: { AgentDemo },
  props: ["lessonCount", "venueCount", "signedIn"],
  emits: ["plan", "browse"],
  data() {
    return {
      tiltX: 0,
      tiltY: 0,
      shownCount: 0,
      frame: 0,
      visible: true,
      observer: null
    };
  },
  computed: {
    chips() {
      return CHIPS;
    }
  },
  watch: {
    lessonCount: { immediate: true, handler() { this.countUp(); } }
  },
  mounted() {
    this.reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.startParticles();
    this.observer = new IntersectionObserver(entries => {
      this.visible = entries[0].isIntersecting;
    });
    this.observer.observe(this.$el);
  },
  unmounted() {
    cancelAnimationFrame(this.frame);
    window.removeEventListener("resize", this.resize);
    if (this.observer) this.observer.disconnect();
  },
  methods: {
    countUp() {
      let target = this.lessonCount || 16;
      let start = performance.now();
      let step = now => {
        let progress = Math.min(1, (now - start) / 1200);
        this.shownCount = Math.round(target * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    onMove(event) {
      if (this.reduced) return;
      let box = this.$el.getBoundingClientRect();
      let x = (event.clientX - box.left) / box.width - 0.5;
      let y = (event.clientY - box.top) / box.height - 0.5;
      this.tiltX = x;
      this.tiltY = y;
      this.mouse = { x: event.clientX - box.left, y: event.clientY - box.top };
    },
    onLeave() {
      this.tiltX = 0;
      this.tiltY = 0;
      this.mouse = null;
    },
    resize() {
      let canvas = this.$refs.canvas;
      if (!canvas) return;
      let ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      this.ctx = canvas.getContext("2d");
      this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      let count = Math.min(90, Math.round(canvas.offsetWidth * canvas.offsetHeight / 14000));
      this.points = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6
      }));
    },
    startParticles() {
      this.resize();
      window.addEventListener("resize", this.resize);
      let draw = () => {
        this.frame = requestAnimationFrame(draw);
        if (!this.visible || !this.ctx) return;
        let canvas = this.$refs.canvas;
        let width = canvas.offsetWidth;
        let height = canvas.offsetHeight;
        let ctx = this.ctx;
        ctx.clearRect(0, 0, width, height);
        for (let p of this.points) {
          if (!this.reduced) {
            p.x = p.x + p.vx;
            p.y = p.y + p.vy;
          }
          if (p.x < 0 || p.x > width) p.vx = -p.vx;
          if (p.y < 0 || p.y > height) p.vy = -p.vy;
          if (this.mouse) {
            let dx = this.mouse.x - p.x;
            let dy = this.mouse.y - p.y;
            let distance = Math.hypot(dx, dy);
            if (distance < 160) {
              p.x = p.x - dx * 0.004;
              p.y = p.y - dy * 0.004;
            }
          }
        }
        for (let i = 0; i < this.points.length; i++) {
          let a = this.points[i];
          for (let j = i + 1; j < this.points.length; j++) {
            let b = this.points[j];
            let distance = Math.hypot(a.x - b.x, a.y - b.y);
            if (distance < 120) {
              ctx.strokeStyle = "rgba(165, 180, 252, " + (0.22 * (1 - distance / 120)) + ")";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
          ctx.fillStyle = "rgba(199, 210, 254, 0.75)";
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
          ctx.fill();
        }
      };
      draw();
    }
  },
  template: `
    <header class="hero relative isolate overflow-hidden bg-[#07061a] text-white" @mousemove="onMove" @mouseleave="onLeave">
      <div aria-hidden="true" class="aurora pointer-events-none absolute inset-0 -z-10"></div>
      <div aria-hidden="true" class="hero-grid pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2"></div>
      <canvas ref="canvas" aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10 h-full w-full"></canvas>
      <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-surface"></div>

      <div aria-hidden="true" class="pointer-events-none absolute inset-0 hidden lg:block">
        <span v-for="chip in chips" :key="chip.label" class="float-chip absolute inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 shadow-lg shadow-black/30 backdrop-blur-md"
          :style="{ left: chip.x, top: chip.y, animationDelay: chip.delay, transform: 'translate3d(' + (tiltX * -30) + 'px,' + (tiltY * -30) + 'px,0)' }">
          <i class="fa" :class="'fa-' + chip.icon"></i>{{ chip.label }}
        </span>
      </div>

      <div class="relative mx-auto grid max-w-[1400px] items-center gap-12 px-4 pt-16 sm:px-6 lg:px-8 pb-28 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:pb-36">
        <div class="hero-copy min-w-0">
          <p class="reveal inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm font-medium text-white/80 backdrop-blur" style="--d: 0ms">
            <span class="live-dot h-2 w-2 rounded-full bg-emerald-400"></span> AI-planned after-school lessons · North London
          </p>
          <h1 class="reveal mt-6 font-display text-[2.6rem] leading-[1.04] font-semibold tracking-tight sm:text-6xl lg:text-[4.1rem]" style="--d: 120ms">
            Plan your family's week
            <span class="shimmer-text block">in one sentence.</span>
          </h1>
          <p class="reveal mt-6 max-w-xl text-lg leading-relaxed text-white/70" style="--d: 240ms">
            Tell our agent about your children. It searches real lessons, checks ages, spaces, distances and clashes, then builds a timetable you can book in one click.
          </p>
          <div class="reveal mt-9 flex flex-wrap items-center gap-3" style="--d: 360ms">
            <button data-test="hero-plan" class="cta-glow group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-400 px-7 py-3.5 font-semibold text-white shadow-xl shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:shadow-indigo-500/50" @click="$emit('plan')">
              <i class="fa fa-magic transition group-hover:rotate-12"></i> Plan my week with AI
              <i class="fa fa-arrow-right transition group-hover:translate-x-1"></i>
            </button>
            <button class="rounded-full border border-white/20 bg-white/5 px-6 py-3.5 font-semibold text-white/90 backdrop-blur transition hover:border-white/40 hover:bg-white/10" @click="$emit('browse')">
              Browse lessons
            </button>
          </div>
          <dl class="reveal mt-12 grid max-w-md grid-cols-3 gap-6" style="--d: 480ms">
            <div><dt class="text-xs tracking-widest text-white/45 uppercase">Lessons</dt><dd class="mt-1 font-display text-4xl font-semibold">{{ shownCount }}</dd></div>
            <div><dt class="text-xs tracking-widest text-white/45 uppercase">Venues</dt><dd class="mt-1 font-display text-4xl font-semibold">{{ venueCount || 8 }}</dd></div>
            <div><dt class="text-xs tracking-widest text-white/45 uppercase">Ages</dt><dd class="mt-1 font-display text-4xl font-semibold">5–15</dd></div>
          </dl>
        </div>

        <div class="scene relative min-w-0">
          <div aria-hidden="true" class="orb absolute -top-10 -right-6 h-40 w-40 rounded-full bg-violet-500/40 blur-3xl"></div>
          <div aria-hidden="true" class="orb absolute -bottom-10 -left-8 h-44 w-44 rounded-full bg-teal-400/30 blur-3xl" style="animation-delay: -3s"></div>
          <div class="tilt-card relative" :style="{ transform: 'rotateY(' + (tiltX * 14 - 8) + 'deg) rotateX(' + (tiltY * -12 + 6) + 'deg)' }">
            <agent-demo></agent-demo>
            <div aria-hidden="true" class="depth-card absolute -right-5 -bottom-6 hidden rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm shadow-2xl shadow-black/40 backdrop-blur-xl sm:block">
              <p class="text-[11px] tracking-widest text-white/50 uppercase">Total</p>
              <p class="font-display text-2xl font-semibold">£190 <span class="text-sm font-normal text-emerald-300">under budget</span></p>
            </div>
          </div>
        </div>
      </div>

      <button class="scroll-cue absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs tracking-widest text-white/50 uppercase transition hover:text-white sm:flex" @click="$emit('browse')">
        Explore lessons <i class="fa fa-angle-down text-lg"></i>
      </button>
    </header>
  `
};
