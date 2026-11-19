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

    checkout() {
      this.orderMessage = "Thank you " + this.order.name + ", your order has been submitted!";
      this.cart = [];
      this.order.name = "";
      this.order.phone = "";
    },

    async getLessons() {
      let response = await fetch(SERVER_URL + "/lessons");
      this.lessons = await response.json();
    }
  }
});

webstore.mount("#app");
