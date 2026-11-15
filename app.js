const SERVER_URL = (location.hostname == "localhost" || location.hostname == "127.0.0.1")
  ? "http://localhost:3000"
  : "https://m01141362-learnhub.onrender.com";

const { createApp } = Vue;

const webstore = createApp({
  data() {
    return {
      sitename: "LearnHub",
      lessons: []
    };
  },

  created() {
    this.getLessons();
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
