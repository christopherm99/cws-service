import Vue from "vue";
import Router from "vue-router";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Register from "./components/Register";
import Home from "./components/Home";
import Events from "./components/Events";

import { auth } from "./firebaseConfig";

Vue.use(Router);

function testOnlyAuth(to, from, next) {
  if (!auth.currentUser) {
    next("/login");
  } else {
    next();
  }
}
function testAuth(to, from, next) {
  if (!auth.currentUser) {
    next("/login");
  } else if (!auth.currentUser.emailVerified) {
    next("/register");
  } else {
    next();
  }
}

var router = new Router({
  routes: [
    {
      path: "/",
      component: Home
    },
    {
      path: "/dashboard",
      component: Dashboard,
      beforeEnter: testAuth
    },
    {
      path: "/login",
      component: Login
    },
    {
      path: "/register",
      component: Register,
      beforeEnter: testOnlyAuth
    },
    {
      path: "/events",
      component: Events,
      beforeEnter: testAuth
    }
  ]
});

export default router;
