export default {
  props: ["searchText", "selectedTeacher", "sortAttribute", "sortOrder", "teachers", "filtering"],
  emits: ["update:searchText", "update:selectedTeacher", "update:sortAttribute", "update:sortOrder"],
  template: `
    <div class="grid gap-3 rounded-2xl border border-line bg-white p-3 shadow-sm sm:p-4 lg:grid-cols-[1fr_auto_auto_auto]">
      <label class="relative block">
        <span class="sr-only">Search lessons</span>
        <i class="fa fa-search pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"></i>
        <input
          data-test="search"
          type="search"
          class="w-full rounded-xl border border-line bg-surface py-3 pr-10 pl-11 outline-none transition focus:border-indigo focus:bg-white focus:ring-4 focus:ring-indigo/10"
          placeholder="Search subject, place, price or spaces"
          :value="searchText"
          @input="$emit('update:searchText', $event.target.value)"
        >
        <i v-if="filtering" data-test="search-spinner" class="fa fa-circle-o-notch fa-spin absolute top-1/2 right-4 -translate-y-1/2 text-indigo"></i>
      </label>

      <label class="flex items-center gap-2 rounded-xl border border-line bg-surface px-3">
        <i class="fa fa-user-o text-muted"></i>
        <span class="sr-only">Teacher</span>
        <select
          data-test="teacher"
          class="w-full bg-transparent py-3 outline-none"
          :value="selectedTeacher"
          @change="$emit('update:selectedTeacher', $event.target.value)"
        >
          <option value="">All teachers</option>
          <option v-for="teacher in teachers" :key="teacher._id" :value="teacher._id">
            {{ teacher.firstName }} {{ teacher.lastName }}
          </option>
        </select>
      </label>

      <label class="flex items-center gap-2 rounded-xl border border-line bg-surface px-3">
        <i class="fa fa-sort text-muted"></i>
        <span class="text-sm text-muted">Sort by</span>
        <select
          data-test="sort-attr"
          class="bg-transparent py-3 font-medium outline-none"
          :value="sortAttribute"
          @change="$emit('update:sortAttribute', $event.target.value)"
        >
          <option value="topic">Subject</option>
          <option value="location">Location</option>
          <option value="price">Price</option>
          <option value="space">Spaces</option>
        </select>
      </label>

      <div class="flex rounded-xl border border-line bg-surface p-1" role="group" aria-label="Sort order">
        <button
          data-test="order-asc"
          type="button"
          class="flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition"
          :class="sortOrder == 'ascending' ? 'bg-white text-indigo shadow-sm' : 'text-muted hover:text-ink'"
          @click="$emit('update:sortOrder', 'ascending')"
        ><i class="fa fa-sort-amount-asc mr-1"></i> Ascending</button>
        <button
          data-test="order-desc"
          type="button"
          class="flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition"
          :class="sortOrder == 'descending' ? 'bg-white text-indigo shadow-sm' : 'text-muted hover:text-ink'"
          @click="$emit('update:sortOrder', 'descending')"
        ><i class="fa fa-sort-amount-desc mr-1"></i> Descending</button>
      </div>
    </div>
  `
};
