import { getJSON, sendJSON, imageURL } from "./api.js";
import NavBar from "./components/NavBar.js";
import LessonFilters from "./components/LessonFilters.js";
import LessonCard from "./components/LessonCard.js";
import CartPage from "./components/CartPage.js";
import CardForm from "./components/CardForm.js";
import { setupPayments, payForCart } from "./payment.js";

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
      filterError: "",
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
      orderWarning: "",
      submitting: false,
      paymentsReady: false,
      paidPaymentId: null,
      receipt: null
    };
  },

  created() {
    this.getLessons();
    this.getTeachers();
    this.checkPayments();
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

    async checkPayments() {
      this.paymentsReady = await setupPayments();
    },

    retryLoad() {
      this.loadError = false;
      this.loading = true;
      this.getLessons();
      if (this.teachers.length == 0) {
        this.getTeachers();
      }
      if (!this.paymentsReady) {
        this.checkPayments();
      }
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
      if (this.searchText.trim() == "") {
        this.searchLessons();
        return;
      }
      this.filtering = true;
      this.searchTimer = setTimeout(this.searchLessons, 300);
    },

    async searchLessons() {
      let query = this.searchText.trim();
      if (query == "") {
        if (this.selectedTeacher == "") {
          this.requestNumber++;
          this.visibleIDs = null;
          this.filterError = "";
        }
        this.filtering = false;
        return;
      }
      this.selectedTeacher = "";
      let thisRequest = ++this.requestNumber;
      this.filtering = true;
      this.filterError = "";
      try {
        let results = await getJSON("/search?q=" + encodeURIComponent(query));
        if (thisRequest != this.requestNumber) return;
        this.visibleIDs = results.map(lesson => lesson._id);
      } catch (error) {
        if (thisRequest != this.requestNumber) return;
        this.filterError = "Search didn't work this time. Please try again.";
      }
      this.filtering = false;
    },

    async filterByTeacher() {
      if (this.selectedTeacher == "") {
        if (this.searchText.trim() == "") {
          this.requestNumber++;
          this.visibleIDs = null;
          this.filtering = false;
          this.filterError = "";
        }
        return;
      }
      clearTimeout(this.searchTimer);
      this.searchText = "";
      let thisRequest = ++this.requestNumber;
      this.filtering = true;
      this.filterError = "";
      try {
        let results = await getJSON("/teachers/" + this.selectedTeacher + "/lessons");
        if (thisRequest != this.requestNumber) return;
        this.visibleIDs = results.map(lesson => lesson._id);
      } catch (error) {
        if (thisRequest != this.requestNumber) return;
        this.filterError = "We couldn't load that teacher's lessons. Please try again.";
      }
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
      this.scrollToView();
    },

    scrollToView() {
      setTimeout(() => {
        let lessons = document.getElementById("lessons");
        if (this.view == "lessons" && lessons) {
          lessons.scrollIntoView();
        } else {
          window.scrollTo(0, 0);
        }
      }, 260);
    },

    async checkout() {
      if (this.submitting) return;
      this.submitting = true;
      this.orderMessage = "";
      this.orderError = "";
      this.orderWarning = "";
      this.receipt = null;

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

      let paymentId = this.paidPaymentId;
      if (this.paymentsReady && !paymentId) {
        try {
          paymentId = await payForCart(lessonIDs, spaces);
          this.paidPaymentId = paymentId;
        } catch (error) {
          this.orderError = error.message;
          this.submitting = false;
          return;
        }
      }
      if (paymentId) {
        newOrder.paymentId = paymentId;
      }

      let orderSaved = false;
      try {
        let saved = await sendJSON("POST", "/orders", newOrder);
        orderSaved = true;

        for (let id of lessonIDs) {
          let lesson = this.lessons.find(l => l._id == id);
          await sendJSON("PUT", "/lessons/" + id, { space: lesson.space });
        }

        this.orderMessage = "Thank you " + this.order.name + ", your order has been submitted!";
        if (paymentId) {
          this.receipt = { amount: saved.amount, cardLast4: saved.cardLast4 };
          this.orderMessage = this.orderMessage + " Payment of £" + saved.amount / 100 + " received.";
        }
        this.clearCart();
      } catch (error) {
        if (orderSaved) {
          this.orderWarning = "Your order was saved, but we couldn't update the available spaces. There's no need to order again.";
          this.clearCart();
        } else if (paymentId) {
          this.orderError = "Your payment went through but we couldn't save the order. Please press Checkout again to retry (you won't be charged twice). Reference: " + paymentId;
        } else {
          this.orderError = "Sorry, your order could not be submitted. Please try again.";
        }
      } finally {
        this.submitting = false;
      }
    },

    clearCart() {
      this.paidPaymentId = null;
      this.cart = [];
      this.order.name = "";
      this.order.phone = "";
      this.getEnrolments();
    },

    toggleCart() {
      this.view = this.view == "cart" ? "lessons" : "cart";
      this.scrollToView();
      this.orderMessage = "";
      this.orderError = "";
      this.orderWarning = "";
      this.receipt = null;
    }
  }
});

app.component("nav-bar", NavBar);
app.component("lesson-filters", LessonFilters);
app.component("lesson-card", LessonCard);
app.component("cart-page", CartPage);
app.component("card-form", CardForm);
app.mount("#app");
