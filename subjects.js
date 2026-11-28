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

export function subjectStyle(topic) {
  return SUBJECTS[topic] || DEFAULT;
}
