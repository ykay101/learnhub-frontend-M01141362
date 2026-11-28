import { imageURL } from "../api.js";
import { pounds } from "../money.js";

const colours = {
  Maths: "bg-blue-50 text-blue-700 ring-blue-200",
  English: "bg-rose-50 text-rose-700 ring-rose-200",
  Science: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Art: "bg-orange-50 text-orange-700 ring-orange-200",
  Music: "bg-violet-50 text-violet-700 ring-violet-200",
  Coding: "bg-slate-100 text-slate-700 ring-slate-300",
  Drama: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
  Chess: "bg-stone-100 text-stone-700 ring-stone-300",
  Football: "bg-lime-50 text-lime-700 ring-lime-200",
  Swimming: "bg-sky-50 text-sky-700 ring-sky-200",
  Robotics: "bg-teal-50 text-teal-700 ring-teal-200",
  Dance: "bg-amber-50 text-amber-700 ring-amber-200",
  Spanish: "bg-red-50 text-red-700 ring-red-200"
};

export default {
  props: ["lesson", "teacher", "enrolled"],
  emits: ["add", "find-similar"],
  computed: {
    chipClass() {
      return colours[this.lesson.topic] || "bg-indigo-50 text-indigo-700 ring-indigo-200";
    },
    image() {
      return imageURL(this.lesson.image);
    },
    price() {
      return pounds(this.lesson.price);
    }
  },
  template: `
    <article data-test="lesson-card" class="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo/10">
      <div class="relative">
        <img :src="image" :alt="lesson.topic" class="h-36 w-full object-cover transition duration-500 group-hover:scale-105">
        <span class="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink shadow-sm">
          <i class="fa fa-calendar-o mr-1 text-indigo"></i>{{ lesson.day }} {{ lesson.time }}
        </span>
        <span v-if="enrolled > 0" class="absolute top-3 right-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
          <i class="fa fa-fire mr-1"></i>{{ enrolled }} booked
        </span>
      </div>

      <div class="flex flex-1 flex-col p-4">
        <div class="flex items-start justify-between gap-2">
          <div>
            <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1" :class="chipClass">Ages {{ lesson.ageMin }}–{{ lesson.ageMax }}</span>
            <h3 data-test="topic" class="mt-2 font-display text-xl font-semibold">{{ lesson.topic }}</h3>
          </div>
          <p data-test="price" class="font-display text-2xl font-semibold text-indigo">{{ price }}</p>
        </div>

        <p class="mt-1 text-sm text-muted"><i class="fa fa-map-marker mr-1"></i>{{ lesson.location }}</p>
        <p v-if="teacher" class="mt-1 text-sm text-muted"><i class="fa fa-user-o mr-1"></i>{{ teacher }}</p>
        <p v-if="lesson.description" class="mt-3 line-clamp-2 text-sm text-ink/80">{{ lesson.description }}</p>

        <div class="mt-auto pt-4">
          <div class="mb-3 flex items-center justify-between text-sm">
            <span data-test="spaces" class="font-medium" :class="lesson.space == 0 ? 'text-red-600' : 'text-ink'">
              {{ lesson.space }} spaces left<template v-if="lesson.space == 0"> · Fully booked</template>
            </span>
            <span class="flex gap-1" aria-hidden="true">
              <span v-for="n in 5" :key="n" class="h-1.5 w-4 rounded-full" :class="n <= lesson.space ? 'bg-teal' : 'bg-line'"></span>
            </span>
          </div>
          <button
            data-test="add-btn"
            class="w-full rounded-xl bg-indigo py-2.5 font-semibold text-white transition hover:bg-night focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo/30 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
            v-on:click="$emit('add', lesson)"
            v-bind:disabled="lesson.space == 0"
          >
            <i class="fa fa-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    </article>
  `
};
