import Vue from "vue";
import App from "./App.vue";

import "./FirebaseConfig";
import "./assets/stylus/main.styl";
import "./plugins/vuetify";
import router from "./Router";

Vue.config.productionTip = false;

new Vue({
  el: "#app",
  router,
  render: h => h(App)
}).$mount("#app");
