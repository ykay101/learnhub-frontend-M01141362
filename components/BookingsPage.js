import { imageURL } from "../api.js";
import { money, pounds } from "../money.js";

export default {
  props: ["bookings", "loading", "error"],
  emits: ["browse"],
  methods: {
    imageURL,
    money,
    pounds,
    when(date) {
      return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    }
  },
  template: `
    <div data-test="bookings-page" class="mx-auto max-w-4xl">
      <h2 class="font-display text-3xl font-semibold">My bookings</h2>
      <p class="mt-1 text-muted">Every lesson you've booked while signed in.</p>

      <div v-if="loading" class="mt-6 space-y-3">
        <div v-for="n in 2" :key="n" class="h-28 animate-pulse rounded-2xl bg-line/60"></div>
      </div>
      <p v-else-if="error" class="mt-6 rounded-2xl bg-red-50 p-4 text-red-700">{{ error }}</p>
      <div v-else-if="bookings.length == 0" class="mt-6 rounded-2xl border border-dashed border-line bg-white p-10 text-center">
        <i class="fa fa-ticket text-4xl text-muted"></i>
        <p class="mt-3 font-semibold">No bookings yet</p>
        <button class="mt-4 rounded-full bg-indigo px-5 py-2 font-semibold text-white hover:bg-night" @click="$emit('browse')">Browse lessons</button>
      </div>

      <div v-else class="mt-6 space-y-4">
        <article v-for="booking in bookings" :key="booking._id" class="rounded-2xl border border-line bg-white p-4 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
            <span class="text-sm text-muted"><i class="fa fa-calendar mr-1"></i>Booked {{ when(booking.createdAt) }}</span>
            <span class="flex items-center gap-2">
              <span v-if="booking.amount" class="font-display text-lg font-semibold">{{ money(booking.amount) }}</span>
              <span v-if="booking.status == 'paid'" class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800"><i class="fa fa-check mr-1"></i>Paid<template v-if="booking.cardLast4"> · •••• {{ booking.cardLast4 }}</template></span>
              <span v-else class="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-700">Pay at first lesson</span>
            </span>
          </div>
          <ul class="mt-3 space-y-2">
            <li v-for="(lesson, index) in booking.lessons" :key="index" class="flex items-center gap-3">
              <img v-if="lesson.image" :src="imageURL(lesson.image)" :alt="lesson.topic" class="h-10 w-14 rounded-lg object-cover">
              <div class="min-w-0 flex-1">
                <p class="font-semibold">{{ lesson.topic }}</p>
                <p class="text-sm text-muted"><template v-if="lesson.location">{{ lesson.location }} · {{ lesson.day }} {{ lesson.time }}</template></p>
              </div>
              <span class="text-sm text-muted">× {{ booking.spaces[index] }}</span>
            </li>
          </ul>
        </article>
      </div>
    </div>
  `
};
