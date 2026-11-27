import { getJSON, sendJSON, imageURL } from "./api.js";
import NavBar from "./components/NavBar.js";
import LessonFilters from "./components/LessonFilters.js";
import LessonCard from "./components/LessonCard.js";
import CartPage from "./components/CartPage.js";

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
    cartItems() {
      let items = [];
      for (let lesson of this.cart) {
        let item = items.find(i => i.lesson._id == lesson._id);
        if (item) {
          item.quantity = item.quantity + 1;
        } else {
          items.push({ lesson: lesson, quantity: 1 });
        }
      }
      return items;
    },
    cartTotal() {
      let total = 0;
      for (let lesson of this.cart) {
        total = total + lesson.price;
      }
      return total;
    },
    canOpenCart() {
      return this.cart.length > 0 || this.view == "cart";
    },
    validName() {
      return /^[A-Za-z ]+$/.test(this.order.name) && /[A-Za-z]/.test(this.order.name);
    },
    validPhone() {
      return /^[0-9]+$/.test(this.order.phone);
    },
    canCheckout() {
      return this.validName && this.validPhone && this.cart.length > 0 && !this.submitting;
    }
  },

  methods: {
    imageURL,

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

    removeFromCart(lesson) {
      let index = this.cart.indexOf(lesson);
      if (index != -1) {
        this.cart.splice(index, 1);
        lesson.space = lesson.space + 1;
      }
    },

    showLessonsPage() {
      this.view = "lessons";
    },

    async checkout() {
      if (this.submitting) return;
      this.submitting = true;
      this.orderMessage = "";
      this.orderError = "";

      let lessonIDs = [];
      let spaces = [];
      for (let lesson of this.cart) {
        let index = lessonIDs.indexOf(lesson._id);
        if (index == -1) {
          lessonIDs.push(lesson._id);
          spaces.push(1);
        } else {
          spaces[index] = spaces[index] + 1;
        }
      }

      let newOrder = {
        name: this.order.name,
        phone: this.order.phone,
        lessonIDs: lessonIDs,
        spaces: spaces
      };

      try {
        await sendJSON("POST", "/orders", newOrder);

        for (let id of lessonIDs) {
          let lesson = this.lessons.find(l => l._id == id);
          await sendJSON("PUT", "/lessons/" + id, { space: lesson.space });
        }

        this.orderMessage = "Thank you " + this.order.name + ", your order has been submitted!";
        this.cart = [];
        this.order.name = "";
        this.order.phone = "";
        this.getEnrolments();
      } catch (error) {
        this.orderError = "Sorry, your order could not be submitted. Please try again.";
      } finally {
        this.submitting = false;
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
app.component("cart-page", CartPage);
app.mount("#app");
