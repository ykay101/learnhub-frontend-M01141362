import { getJSON, sendJSON, imageURL } from "./api.js";
import NavBar from "./components/NavBar.js";

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

  computed: {
    canOpenCart() {
      return this.cart.length > 0 || this.view == "cart";
    }
  },

  methods: {
    toggleCart() {
      this.view = this.view == "cart" ? "lessons" : "cart";
      this.orderMessage = "";
      this.orderError = "";
    }
  }
});

app.component("nav-bar", NavBar);
app.mount("#app");
