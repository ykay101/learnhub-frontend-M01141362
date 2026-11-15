const { createApp } = Vue;

const webstore = createApp({
  data() {
    return {
      sitename: "LearnHub"
    };
  }
});

webstore.mount("#app");
