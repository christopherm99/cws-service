<template>
  <div id="app">
    <v-app>
      <v-toolbar dark color="primary">
        <v-toolbar-title>Community Service</v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn
            color="white"
            v-if="notDash"
            flat
            :to="'/dashboard'"
            class="hidden-sm-and-down"
          >
            Dashboard
          </v-btn>
          <v-btn color="white" v-if="signedIn && notHome" flat @click="logout">
            Logout
          </v-btn>
          <v-btn color="white" v-else flat :to="'/login'">Login</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-content id="router">
        <router-view />
      </v-content>
    </v-app>
  </div>
</template>
<script>
import { auth } from "./firebaseConfig";
import router from "./router";

export default {
  data: () => {
    return {
      signedIn: false,
      notDash: true,
      notHome: true
    };
  },
  methods: {
    logout() {
      auth.signOut();
      router.push("/login");
    }
  },
  watch: {
    $route(to) {
      this.notDash = to.path != "/dashboard";
      this.notHome = to.path != "/";
    }
  },
  mounted() {
    auth.onAuthStateChanged(user => {
      if (user) {
        this.signedIn = true;
      } else {
        this.signedIn = false;
      }
    });
  }
};
</script>

<style lang="stylus">
@import '~vuetify/src/stylus/main'
#app
  font-family: Roboto, Noto, sans-serif;
</style>
