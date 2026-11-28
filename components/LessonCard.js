import { imageURL } from "../api.js";
import { pounds } from "../money.js";
import { subjectStyle } from "../subjects.js";

export default {
  props: ["lesson", "teacher", "enrolled", "inCart"],
  emits: ["add", "find-similar"],
  computed: {
    style() {
      return subjectStyle(this.lesson.topic);
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
