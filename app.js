import { getJSON, sendJSON, imageURL } from "./api.js";
import NavBar from "./components/NavBar.js";
import LessonFilters from "./components/LessonFilters.js";
import LessonCard from "./components/LessonCard.js";

const { createApp } = Vue;

const app = createApp({
  data() {
    return {
      sitename: "2Learn",
      view: "lessons",
      lessons: [],
      loading: true,
      loadError: false,
      visibleIDs: null,
      enrolments: {},
      teachers: [],
      selectedTeacher: "",
      searchText: "",
      searchTimer: null,
      filtering: false,
      requestNumber: 0,
      sortAttribute: "topic",
      sortOrder: "ascending",
      cart: [],
      order: {
        name: "",
        phone: ""
      },
      orderMessage: "",
      orderError: "",
      submitting: false
    };
  },

  created() {
    this.getLessons();
    this.getTeachers();
  },

  watch: {
    searchText: "onSearchInput",
    selectedTeacher: "filterByTeacher"
  },

  computed: {
    sortedLessons() {
      let list = this.lessons;
      if (this.visibleIDs != null) {
        list = list.filter(lesson => this.visibleIDs.includes(lesson._id));
      }
      let attribute = this.sortAttribute;
      let direction = this.sortOrder == "ascending" ? 1 : -1;
      function compare(a, b) {
        if (a[attribute] > b[attribute]) return 1 * direction;
        if (a[attribute] < b[attribute]) return -1 * direction;
        return 0;
      }
      return list.slice().sort(compare);
    },
    canOpenCart() {
      return this.cart.length > 0 || this.view == "cart";
    }
  },

  methods: {
    async getLessons() {
      try {
        this.lessons = await getJSON("/lessons");
        this.getEnrolments();
      } catch (error) {
        this.loadError = true;
      } finally {
        this.loading = false;
      }
    },

    retryLoad() {
      this.loadError = false;
      this.loading = true;
      this.getLessons();
    },

    async getEnrolments() {
      try {
        let results = await Promise.all(this.lessons.map(lesson => getJSON("/enrolment/" + lesson._id)));
        let map = {};
        results.forEach((result, index) => {
          map[this.lessons[index]._id] = result.enrolment;
        });
        this.enrolments = map;
      } catch (error) {
        this.enrolments = {};
      }
    },

    async getTeachers() {
      try {
        this.teachers = await getJSON("/teachers");
      } catch (error) {
        this.teachers = [];
      }
    },

    teacherName(lesson) {
      let teacher = this.teachers.find(t => t.lessonIDs.includes(lesson._id));
      return teacher ? teacher.firstName + " " + teacher.lastName : "";
    },

    onSearchInput() {
      clearTimeout(this.searchTimer);
      if (this.searchText == "") {
        this.searchLessons();
        return;
      }
      this.filtering = true;
      this.searchTimer = setTimeout(this.searchLessons, 300);
    },

    async searchLessons() {
      if (this.searchText == "") {
        if (this.selectedTeacher == "") {
          this.requestNumber++;
          this.visibleIDs = null;
          this.filtering = false;
        }
        return;
      }
      this.selectedTeacher = "";
      let thisRequest = ++this.requestNumber;
      this.filtering = true;
      let results = await getJSON("/search?q=" + encodeURIComponent(this.searchText));
      if (thisRequest != this.requestNumber) return;
      this.visibleIDs = results.map(lesson => lesson._id);
      this.filtering = false;
    },

    async filterByTeacher() {
      if (this.selectedTeacher == "") {
        if (this.searchText == "") {
          this.requestNumber++;
          this.visibleIDs = null;
          this.filtering = false;
        }
        return;
      }
      clearTimeout(this.searchTimer);
      this.searchText = "";
      let thisRequest = ++this.requestNumber;
      this.filtering = true;
      let results = await getJSON("/teachers/" + this.selectedTeacher + "/lessons");
      if (thisRequest != this.requestNumber) return;
      this.visibleIDs = results.map(lesson => lesson._id);
      this.filtering = false;
    },

    addToCart(lesson) {
      if (lesson.space > 0) {
        this.cart.push(lesson);
        lesson.space = lesson.space - 1;
      }
    },

    toggleCart() {
      this.view = this.view == "cart" ? "lessons" : "cart";
      this.orderMessage = "";
      this.orderError = "";
    }
  }
});

app.component("nav-bar", NavBar);
app.component("lesson-filters", LessonFilters);
app.component("lesson-card", LessonCard);
app.mount("#app");
