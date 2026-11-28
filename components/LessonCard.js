import { imageURL } from "../api.js";
import { pounds } from "../money.js";

const SUBJECTS = {
  Maths: { icon: "calculator", gradient: "from-blue-500 via-indigo-500 to-indigo-700", chip: "bg-blue-50 text-blue-700 ring-blue-200" },
  English: { icon: "book", gradient: "from-rose-400 via-rose-500 to-pink-600", chip: "bg-rose-50 text-rose-700 ring-rose-200" },
  Science: { icon: "flask", gradient: "from-emerald-400 via-emerald-500 to-teal-600", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  Art: { icon: "paint-brush", gradient: "from-amber-400 via-orange-500 to-pink-500", chip: "bg-orange-50 text-orange-700 ring-orange-200" },
  Music: { icon: "music", gradient: "from-violet-500 via-purple-500 to-fuchsia-600", chip: "bg-violet-50 text-violet-700 ring-violet-200" },
  Coding: { icon: "code", gradient: "from-slate-700 via-indigo-800 to-indigo-950", chip: "bg-indigo-50 text-indigo-700 ring-indigo-200" },
  Drama: { icon: "film", gradient: "from-fuchsia-500 via-purple-600 to-indigo-700", chip: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200" },
  Chess: { icon: "puzzle-piece", gradient: "from-stone-500 via-stone-700 to-stone-900", chip: "bg-stone-100 text-stone-700 ring-stone-300" },
  Football: { icon: "futbol-o", gradient: "from-lime-400 via-green-500 to-emerald-700", chip: "bg-lime-50 text-lime-700 ring-lime-200" },
  Swimming: { icon: "tint", gradient: "from-sky-400 via-blue-500 to-blue-700", chip: "bg-sky-50 text-sky-700 ring-sky-200" },
  Robotics: { icon: "cogs", gradient: "from-teal-400 via-cyan-500 to-sky-700", chip: "bg-teal-50 text-teal-700 ring-teal-200" },
  Dance: { icon: "star", gradient: "from-yellow-400 via-amber-500 to-rose-500", chip: "bg-amber-50 text-amber-700 ring-amber-200" },
  Spanish: { icon: "language", gradient: "from-red-500 via-orange-500 to-amber-400", chip: "bg-red-50 text-red-700 ring-red-200" }
};
const DEFAULT = { icon: "graduation-cap", gradient: "from-indigo-500 via-violet-500 to-teal-500", chip: "bg-indigo-50 text-indigo-700 ring-indigo-200" };

export default {
  props: ["lesson", "teacher", "enrolled", "inCart"],
  emits: ["add", "find-similar"],
  computed: {
    style() {
      return SUBJECTS[this.lesson.topic] || DEFAULT;
    },
    image() {
      return imageURL(this.lesson.image);
    },
    price() {
      return pounds(this.lesson.price);
    },
    initials() {
      return this.teacher.split(" ").map(part => part[0]).join("");
    },
    meterColour() {
      if (this.lesson.space == 0) return "bg-red-400";
      if (this.lesson.space <= 2) return "bg-amber-400";
      return "bg-emerald-400";
    }
  },
  template: `
    <article data-test="lesson-card" v-tilt class="tilt-surface group relative flex flex-col overflow-hidden rounded-3xl border border-line/80 bg-white shadow-sm shadow-indigo-950/5 hover:shadow-2xl hover:shadow-indigo-500/15">
      <div class="relative h-40 overflow-hidden bg-gradient-to-br" :class="style.gradient">
        <div aria-hidden="true" class="card-orb absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/20 blur-2xl"></div>
        <div aria-hidden="true" class="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-black/10 blur-2xl"></div>
        <div aria-hidden="true" class="card-dots absolute inset-0 opacity-30"></div>
        <i aria-hidden="true" class="fa absolute -right-4 -bottom-6 text-[8.5rem] text-white/10 transition duration-700 group-hover:-rotate-12 group-hover:scale-110" :class="'fa-' + style.icon"></i>

        <div class="absolute inset-x-3 top-3 flex items-start justify-between">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur-md">
            <i class="fa fa-clock-o"></i>{{ lesson.day }} · {{ lesson.time }}
          </span>
          <span data-test="price" class="rounded-full bg-white/95 px-3 py-1 font-display text-lg font-bold text-ink shadow-lg shadow-black/10">{{ price }}</span>
        </div>

        <div class="absolute bottom-4 left-4 flex items-end gap-3">
          <span class="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 text-2xl text-white shadow-xl shadow-black/20 ring-1 ring-white/40 backdrop-blur-md transition duration-500 group-hover:-translate-y-1 group-hover:scale-105">
            <i class="fa" :class="'fa-' + style.icon"></i>
          </span>
          <span v-if="enrolled > 0" class="mb-1 inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-semibold text-white ring-1 ring-white/25 backdrop-blur-md">
            <i class="fa fa-fire text-amber-300"></i>{{ enrolled }} booked
          </span>
        </div>
        <img :src="image" :alt="lesson.topic + ' lesson image'" class="absolute right-3 bottom-3 h-10 w-14 rounded-lg object-cover shadow-lg ring-2 ring-white/70">

        <div v-if="lesson.space == 0" class="absolute inset-0 grid place-items-center bg-black/35 backdrop-blur-[2px]">
          <span class="rotate-[-6deg] rounded-xl border-2 border-white/90 px-4 py-1.5 font-display text-xl font-bold tracking-wide text-white uppercase">Fully booked</span>
        </div>
      </div>

      <div class="flex flex-1 flex-col p-5">
        <div class="flex items-center justify-between gap-2">
          <h3 data-test="topic" class="font-display text-2xl font-semibold tracking-tight">{{ lesson.topic }}</h3>
          <span class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1" :class="style.chip">Ages {{ lesson.ageMin }}–{{ lesson.ageMax }}</span>
        </div>

        <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span><i class="fa fa-map-marker mr-1 text-indigo-400"></i>{{ lesson.location }}</span>
          <span v-if="teacher" class="inline-flex items-center gap-1.5">
            <span class="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br text-[9px] font-bold text-white" :class="style.gradient">{{ initials }}</span>{{ teacher }}
          </span>
        </div>

        <p v-if="lesson.description" class="mt-3 line-clamp-2 text-sm leading-relaxed text-ink/70">{{ lesson.description }}</p>

        <div class="mt-auto pt-5">
          <div class="mb-1.5 flex items-center justify-between text-sm">
            <span data-test="spaces" class="font-semibold" :class="lesson.space == 0 ? 'text-red-600' : 'text-ink'">{{ lesson.space }} {{ lesson.space == 1 ? 'space' : 'spaces' }} left<template v-if="lesson.space == 0"> · Fully booked</template></span>
            <span class="text-xs text-muted">of 5</span>
          </div>
          <div class="flex gap-1" aria-hidden="true">
            <span v-for="n in 5" :key="n" class="h-1.5 flex-1 rounded-full transition-colors duration-500" :class="n <= lesson.space ? meterColour : 'bg-line'"></span>
          </div>

          <button
            data-test="add-btn"
            class="add-btn relative mt-4 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_100%] py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-500 hover:bg-right hover:shadow-indigo-500/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 active:scale-[0.98] disabled:bg-none disabled:bg-line disabled:text-muted disabled:shadow-none"
            v-on:click="$emit('add', lesson)"
            v-bind:disabled="lesson.space == 0"
          >
            <i class="fa fa-plus mr-1"></i> Add to Cart
          </button>
          <button v-if="lesson.space == 0 && !inCart" data-test="similar-btn" class="mt-2 w-full rounded-2xl py-2.5 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200 transition hover:bg-indigo-50 hover:ring-indigo-300" v-on:click="$emit('find-similar', lesson)">
            <i class="fa fa-magic mr-1"></i> Find me something similar
          </button>
        </div>
      </div>
    </article>
  `
};
