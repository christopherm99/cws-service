import Vue from "vue";
import Router from "vue-router";

const Home = () => import("./components/Home");
const Login = () => import("./components/Login");
const Register = () => import("./components/Register");

const UserDashboard = () => import("./components/UserDashboard");
const AdminDashboard = () => import("./components/AdminDashboard");
const UserEvents = () => import("./components/UserEvents");
const GlobalEvents = () => import("./components/GlobalEvents");

import { auth, db } from "./FirebaseConfig";

Vue.use(Router);

let userCol = db.collection("/users");
let userLoaded = false;
let adminPath = "/dashboard/admin";
let userPath = "/dashboard/user";

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
  getCurrentUser()
    .then(user => {
      user ? next() : next("/login");
      return;
    })
    .catch(error => next(error));
}
function testAuth(to, from, next) {
  getCurrentUser()
    .then(user => {
      user ? (user.emailVerified ? next() : next("/register")) : next("/login");
      return;
    })
    .catch(error => next(error));
}

function testDash(to, from, next) {
  getCurrentUser()
    .then(user => {
      user
        ? userCol
            .doc(user.email.substring(0, user.email.lastIndexOf("@")))
            .get()
            .then(doc => {
              doc.data().admin
                ? to.path == adminPath
                  ? next()
                  : next(adminPath)
                : to.path == userPath
                ? next()
                : next(userPath);
              return;
            })
            .catch(error => next(error))
        : next("/login");
      return;
    })
    .catch(error => next(error));
}

function dashRedirect(to, from, next) {
  getCurrentUser()
    .then(user => {
      user
        ? userCol
            .doc(user.email.substring(0, user.email.lastIndexOf("@")))
            .get()
            .then(doc => {
              doc.data().admin ? next(adminPath) : next(userPath);
              return;
            })
            .catch(error => next(error))
        : next("/login");
      return;
    })
    .catch(error => next(error));
}

const router = new Router({
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
      path: adminPath,
      component: AdminDashboard,
      beforeEnter: testDash
    },
    {
      path: userPath,
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
      path: "/events/user",
      component: UserEvents,
      beforeEnter: testAuth
    },
    {
      path: "/events/global",
      component: GlobalEvents,
      beforeEnter: testAuth
    }
  ]
});

router.onError(() => {
  router.push("/");
});

export default router;
