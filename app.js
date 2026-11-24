const SERVER_URL = (location.hostname == "localhost" || location.hostname == "127.0.0.1")
  ? "http://localhost:5000"
  : "https://m01141362-learnhub.onrender.com";

const { createApp } = Vue;

const webstore = createApp({
  data() {
    return {
      sitename: "LearnHub",
      showLessons: true,
      lessons: [],
      loading: true,
      loadError: false,
      visibleIDs: null,
      teachers: [],
      selectedTeacher: "",
      searchText: "",
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
    searchText: "searchLessons",
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
      return this.cart.length > 0 || !this.showLessons;
    },
    validName() {
      return /^[A-Za-z ]+$/.test(this.order.name);
    },
    validPhone() {
      return /^[0-9]+$/.test(this.order.phone);
    },
    canCheckout() {
      return this.validName && this.validPhone && this.cart.length > 0 && !this.submitting;
    }
  },

  methods: {
    imageAddress(lesson) {
      return SERVER_URL + "/images/" + lesson.image;
    },

    async getLessons() {
      try {
        let response = await fetch(SERVER_URL + "/lessons");
        this.lessons = await response.json();
      } catch (error) {
        this.loadError = true;
      } finally {
        this.loading = false;
      }
    },

    async getTeachers() {
      let response = await fetch(SERVER_URL + "/teachers");
      this.teachers = await response.json();
    },

    teacherName(lesson) {
      let teacher = this.teachers.find(t => t.lessonIDs.includes(lesson._id));
      return teacher ? teacher.firstName + " " + teacher.lastName : "";
    },

    async searchLessons() {
      if (this.searchText == "") {
        if (this.selectedTeacher == "") this.visibleIDs = null;
        return;
      }
      this.selectedTeacher = "";
      let url = SERVER_URL + "/search?q=" + encodeURIComponent(this.searchText);
      let response = await fetch(url);
      let results = await response.json();
      this.visibleIDs = results.map(lesson => lesson._id);
    },

    async filterByTeacher() {
      if (this.selectedTeacher == "") {
        if (this.searchText == "") this.visibleIDs = null;
        return;
      }
      this.searchText = "";
      let url = SERVER_URL + "/teachers/" + this.selectedTeacher + "/lessons";
      let response = await fetch(url);
      let results = await response.json();
      this.visibleIDs = results.map(lesson => lesson._id);
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

    toggleCart() {
      this.showLessons = !this.showLessons;
      this.orderMessage = "";
      this.orderError = "";
    },

    async checkout() {
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

      this.submitting = true;
      this.orderMessage = "";
      this.orderError = "";
      try {
        let response = await fetch(SERVER_URL + "/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newOrder)
        });
        if (!response.ok) throw new Error("Order not saved");

        for (let id of lessonIDs) {
          let lesson = this.lessons.find(l => l._id == id);
          await fetch(SERVER_URL + "/lessons/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ space: lesson.space })
          });
        }

        this.orderMessage = "Thank you " + this.order.name + ", your order has been submitted!";
        this.cart = [];
        this.order.name = "";
        this.order.phone = "";
      } catch (error) {
        this.orderError = "Sorry, your order could not be submitted. Please try again.";
      } finally {
        this.submitting = false;
      }
    }
  }
});

webstore.mount("#app");
