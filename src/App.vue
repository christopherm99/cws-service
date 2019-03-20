<template>
  <div id="app">
    <v-app>
      <v-toolbar dark color="primary">
        <v-toolbar-title>Community Service</v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn
            v-if="notDash"
            color="white"
            flat
            :to="'/dashboard'"
            class="hidden-sm-and-down"
          >
            Dashboard
          </v-btn>
          <v-btn v-if="signedIn && notHome" color="white" flat @click="logout">
            Logout
          </v-btn>
          <v-btn v-else color="white" flat :to="'/login'">Login</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-content id="router">
        <router-view />
      </v-content>
    </v-app>
  </div>
</template>
<script>
import { auth } from "./FirebaseConfig";
import router from "./Router";

export default {
  data: () => {
    return {
      signedIn: false,
      notDash: true,
      notHome: true
    };
  },
  watch: {
    $route(to) {
      this.notDash = to.path != "/dashboard";
      this.notHome = to.path != "/";
    }
  },
  mounted() {
    auth.onAuthStateChanged(user => {
      user ? (this.signedIn = true) : (this.signedIn = false);
    });
  },
  methods: {
    logout() {
      auth.signOut();
      router.push("/login");
    }
  }
};
</script>

<style lang="stylus">
@import '~vuetify/src/stylus/main'
#app
  font-family: Roboto, Noto, sans-serif;
</style>
