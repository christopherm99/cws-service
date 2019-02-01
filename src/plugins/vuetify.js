import Vue from "vue";
import Vuetify from "vuetify/lib";
import "vuetify/src/stylus/app.styl";
import colors from "vuetify/es5/util/colors";

Vue.use(Vuetify, {
  theme: {
    primary: colors.red.darken4,
    secondary: colors.red,
    accent: colors.blue.darken2
  },
  iconfont: "md"
});
