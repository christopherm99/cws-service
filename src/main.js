import Vue from "vue";
import App from "./App.vue";
import Vuetify from "vuetify";

import colors from "vuetify/es5/util/colors";

import "./firebaseConfig";
import "./assets/stylus/main.styl";
import "./plugins/vuetify";
import router from "./router";

Vue.config.productionTip = false;

Vue.use(Vuetify, {
  theme: {
    primary: colors.red.darken4,
    secondary: colors.red,
    accent: colors.blue.darken2
  }
});

new Vue({
  el: "#app",
  router,
  render: h => h(App)
}).$mount("#app");
