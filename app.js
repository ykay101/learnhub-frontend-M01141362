const SERVER_URL = (location.hostname == "localhost" || location.hostname == "127.0.0.1")
  ? "http://localhost:3000"
  : "https://m01141362-learnhub.onrender.com";

const { createApp } = Vue;

const webstore = createApp({
  data() {
    return {
      sitename: "LearnHub",
      showLessons: true,
      lessons: [],
      visibleIDs: null,
      searchText: "",
      sortAttribute: "topic",
      sortOrder: "ascending",
      cart: [],
      order: {
        name: "",
        phone: ""
      },
      orderMessage: ""
    };
  },

  created() {
    this.getLessons();
  },

  watch: {
    searchText: "searchLessons"
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
      return this.validName && this.validPhone && this.cart.length > 0;
    }
  },

  methods: {
    imageAddress(lesson) {
      return SERVER_URL + "/images/" + lesson.image;
    },

    addToCart(lesson) {
      if (lesson.space > 0) {
        this.cart.push(lesson);
        lesson.space = lesson.space - 1;
      }
    },

    removeFromCart(index) {
      let lesson = this.cart[index];
      lesson.space = lesson.space + 1;
      this.cart.splice(index, 1);
    },

    toggleCart() {
      this.showLessons = !this.showLessons;
      this.orderMessage = "";
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

      await fetch(SERVER_URL + "/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder)
      });

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
    },

    async getLessons() {
      let response = await fetch(SERVER_URL + "/lessons");
      this.lessons = await response.json();
    },

    async searchLessons() {
      if (this.searchText == "") {
        this.visibleIDs = null;
        return;
      }
      let url = SERVER_URL + "/search?q=" + encodeURIComponent(this.searchText);
      let response = await fetch(url);
      let results = await response.json();
      this.visibleIDs = results.map(lesson => lesson._id);
    }
  }
});

webstore.mount("#app");
