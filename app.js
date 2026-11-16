const SERVER_URL = (location.hostname == "localhost" || location.hostname == "127.0.0.1")
  ? "http://localhost:3000"
  : "https://m01141362-learnhub.onrender.com";

const { createApp } = Vue;

const webstore = createApp({
  data() {
    return {
      sitename: "LearnHub",
      lessons: [],
      sortAttribute: "topic",
      sortOrder: "ascending"
    };
  },

  created() {
    this.getLessons();
  },

  computed: {
    sortedLessons() {
      let attribute = this.sortAttribute;
      let direction = this.sortOrder == "ascending" ? 1 : -1;
      function compare(a, b) {
        if (a[attribute] > b[attribute]) return 1 * direction;
        if (a[attribute] < b[attribute]) return -1 * direction;
        return 0;
      }
      return this.lessons.slice().sort(compare);
    }
  },

  methods: {
    imageAddress(lesson) {
      return SERVER_URL + "/images/" + lesson.image;
    },

    async getLessons() {
      let response = await fetch(SERVER_URL + "/lessons");
      this.lessons = await response.json();
    }
  }
});

webstore.mount("#app");
