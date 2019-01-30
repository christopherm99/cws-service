import Vue from "vue";
import Router from "vue-router";

import Login from "./components/Login";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Register from "./components/Register";
import Home from "./components/Home";
import Events from "./components/Events";

import { auth, db } from "./firebaseConfig";

Vue.use(Router);

var userCol = db.collection("/users");

var userLoaded = false;

function getCurrentUser() {
  return new Promise((resolve, reject) => {
    if (userLoaded) {
      resolve(auth.currentUser);
    }
    const unsubscribe = auth.onAuthStateChanged(user => {
      userLoaded = true;
      unsubscribe();
      resolve(user);
    }, reject);
  });
}

function testOnlyAuth(to, from, next) {
  getCurrentUser().then(
    user => {
      if (user) {
        next();
      } else {
        next("/login");
      }
    },
    error => {
      if (error) {
        next(error);
      }
    }
  );
}
function testAuth(to, from, next) {
  getCurrentUser().then(
    user => {
      if (user) {
        if (user.emailVerified) {
          next();
        } else {
          next("/register");
        }
      } else {
        next("/login");
      }
    },
    error => {
      if (error) {
        next(error);
      }
    }
  );
}

function testDash(to, from, next) {
  getCurrentUser().then(
    user => {
      if (user) {
        let username = user.email.substring(0, user.email.lastIndexOf("@"));
        userCol
          .doc(username)
          .get()
          .then(
            doc => {
              if (doc.data().admin) {
                if (to.path == "/dashboard/admin") {
                  next();
                } else {
                  next("/dashboard/admin");
                }
              } else {
                if (to.path == "/dashboard/user") {
                  next();
                } else {
                  next("/dashboard/user");
                }
              }
            },
            error => {
              if (error) {
                next(error);
              }
            }
          );
      } else {
        next("/login");
      }
    },
    error => {
      if (error) {
        next(error);
      }
    }
  );
}

function dashRedirect(to, from, next) {
  getCurrentUser().then(
    user => {
      if (user) {
        userCol
          .doc(user.email.substring(0, user.email.lastIndexOf("@")))
          .get()
          .then(
            doc => {
              if (doc.data().admin) {
                next("/dashboard/admin");
              } else {
                next("/dashboard/user");
              }
            },
            error => {
              next(error);
            }
          );
      } else {
        next("/login");
      }
    },
    error => {
      next(error);
    }
  );
}

var router = new Router({
  routes: [
    {
      path: "/",
      component: Home
    },
    {
      path: "/dashboard",
      beforeEnter: dashRedirect
    },
    {
      path: "/dashboard/admin",
      component: AdminDashboard,
      beforeEnter: testDash
    },
    {
      path: "/dashboard/user",
      component: UserDashboard,
      beforeEnter: testDash
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
