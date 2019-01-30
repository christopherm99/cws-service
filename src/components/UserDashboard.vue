<template>
  <v-container grid-list-xl fluid>
    <v-layout :column="$vuetify.breakpoint.smAndDown">
      <v-dialog max-width="500" v-model="dialog.enabled">
        <v-card>
          <v-card-title primary-title class="headline">
            {{ dialog.header }}
          </v-card-title>
          <v-card-text v-if="dialog.isForm">
            <v-form>
              <v-alert :value="dialog.error" type="error">
                {{ dialog.error }}
              </v-alert>
              <template v-for="(item, index) in dialog.msg">
                <v-text-field
                  :key="index"
                  :prepend-icon="item.icon"
                  :label="item.label"
                  :type="item.inType"
                  :hint="item.hint"
                  color="accent"
                  v-model="dialog.result"
                />
              </template>
            </v-form>
          </v-card-text>
          <v-list v-else two-row subheader>
            <template v-for="(item, index) in dialog.msg">
              <v-list-tile :key="index" v-if="item.txt">
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{ item.header }}
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ item.txt }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="accent"
              v-for="(item, index) in dialog.actions"
              :flat="item.flat"
              :outline="item.outline"
              @click="item.func"
              :key="index"
              :loading="item.loading"
              :disabled="item.loading"
            >
              {{ item.btn }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-flex xs4>
        <v-card>
          <v-toolbar card dark color="secondary">
            <v-toolbar-title>Welcome, {{ displayName }}</v-toolbar-title>
          </v-toolbar>
          <v-alert :value="error" type="error">
            {{ error }}
          </v-alert>
          <v-list two-line subheader>
            <v-subheader>Progress</v-subheader>
            <v-list-tile @click="resetGoal">
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ user.hours }} out of {{ user.goal }} hours
                </v-list-tile-title>
                <v-progress-linear v-model="progress" color="accent" />
              </v-list-tile-content>
            </v-list-tile>
            <v-subheader>Settings</v-subheader>
            <v-list-tile @click="resetGrade">
              <v-list-tile-content>
                <v-list-tile-title>Year of Graduation</v-list-tile-title>
                <v-list-tile-sub-title>{{ user.class }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider />
            <v-list-tile @click="resetName">
              <v-list-tile-content>
                <v-list-tile-title>Display Name</v-list-tile-title>
                <v-list-tile-sub-title>{{ displayName }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider />
            <v-list-tile @click="resetPassword">
              <v-list-tile-content>
                <v-list-tile-title>Reset Password</v-list-tile-title>
                <v-list-tile-sub-title>
                  Open a dialog to reset your password
                </v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-flex>
      <v-flex xs4>
        <v-card>
          <v-toolbar card dark color="secondary">
            <v-toolbar-title>Past Events</v-toolbar-title>
          </v-toolbar>
          <v-list two-line subheader>
            <template v-for="(item, index) in pastEvents">
              <v-list-tile :key="index" @click="moreInfo(item)">
                <v-list-tile-content>
                  <v-list-tile-title>{{ item.provider }}</v-list-tile-title>
                  <v-list-tile-sub-title>{{ item.desc }}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-card>
      </v-flex>
      <v-flex xs4>
        <v-card>
          <v-toolbar card dark color="secondary">
            <v-toolbar-title>Upcoming Events</v-toolbar-title>
          </v-toolbar>
          <v-list two-line subheader>
            <template v-for="(item, index) in invitations">
              <v-list-tile :key="index" @click="moreInfo(item)">
                <v-list-tile-content>
                  <v-list-tile-title>{{ item.provider }}</v-list-tile-title>
                  <v-list-tile-sub-title>{{ item.desc }}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
          <v-card-actions>
            <v-spacer />
            <v-btn flat color="accent" :to="'/events'">More Details</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
// import router from "../router";
import { db, auth } from "../firebaseConfig";

var userCol = db.collection("/users");
var eventCol = db.collection("/events");

function toDate(seconds) {
  var t = new Date(1970, 0, 1);
  t.setSeconds(seconds);
  return t;
}

export default {
  data() {
    return {
      username: "",
      error: "",
      user: {},
      progress: 0,
      displayName: "",
      pastEvents: [],
      invitations: [],
      dialog: {
        header: "",
        msg: [],
        isForm: false,
        actions: [],
        enabled: false,
        result: undefined,
        error: ""
      }
    };
  },
  name: "UserDashboard",
  methods: {
    resetGoal() {
      this.dialog.header = "Change Service Goal";

      this.dialog.msg.push({
        icon: "access_time",
        label: "Service Goal",
        inType: "number",
        hint: "Your community service goal in hours"
      });

      this.dialog.isForm = false;
      this.dialog.actions.push(
        {
          func: this.cleanDialog,
          btn: "Cancel",
          flat: true,
          outline: false
        },
        {
          func: () => {
            // Must use arrow functions to preserve 'this` keyword.
            this.dialog.actions[1].loading = true;
            userCol
              .doc(this.username)
              .update({
                goal: this.dialog.result
              })
              .then(
                () => {
                  this.cleanDialog();
                },
                error => {
                  this.dialog.error = error;
                  this.actions[1].loading = false;
                }
              );
          }
        }
      );
    },
    resetGrade() {
      this.dialog.header = "Change Graduation Year";

      this.dialog.msg.push({
        icon: "school",
        label: "Year of Graduation",
        inType: "number",
        hint: "eg. 2021"
      });

      this.dialog.isForm = true;
      this.dialog.actions.push(
        {
          func: this.cleanDialog,
          btn: "Cancel",
          flat: true,
          outline: false
        },
        {
          func: () => {
            this.dialog.actions[1].loading = true;
            userCol
              .doc(this.username)
              .update({
                class: this.dialog.result
              })
              .then(
                () => {
                  this.cleanDialog();
                },
                error => {
                  this.dialog.error = error;
                  this.dialog.actions[1].loading = false;
                }
              );
          },
          btn: "Submit",
          flat: false,
          outline: true,
          loading: false
        }
      );

      this.dialog.enabled = true;
    },
    resetName() {
      this.dialog.header = "Reset Display Name";

      this.dialog.msg.push({
        icon: "person",
        label: "Display Name",
        inType: "text",
        hint: "eg. John Doe"
      });

      this.dialog.isForm = true;
      this.dialog.actions.push(
        {
          func: this.cleanDialog,
          btn: "Cancel",
          flat: true,
          outline: false
        },
        {
          func: () => {
            this.dialog.actions[1].loading = true;
            auth.currentUser
              .updateProfile({
                displayName: this.dialog.result
              })
              .then(
                () => {
                  this.dialog.actions[1].loading = false;
                  this.cleanDialog();
                  this.displayName = auth.currentUser.displayName;
                },
                error => {
                  this.dialog.actions[1].loading = false;
                  this.error = error;
                }
              );
          },
          btn: "Submit",
          flat: false,
          outline: true,
          loading: false
        }
      );

      this.dialog.enabled = true;
    },
    resetPassword() {},
    moreInfo(item) {
      this.dialog.header = item.provider;

      let beg = toDate(item.when.seconds);
      let time;
      beg.getHours() < 12
        ? (time = beg.getHours())
        : (time = beg.getHours() - 12);
      time += ":";
      beg.getMinutes() > 10
        ? (time += beg.getMinutes())
        : (time += "0" + beg.getMinutes());
      beg.getHours() < 12 ? (time += "AM") : (time += "PM");
      let verif;
      item.signed ? (verif = "Yes") : (verif = "No");

      this.dialog.msg.push(
        {
          header: "Date",
          txt: beg.toDateString()
        },
        {
          header: "Time",
          txt: time
        },
        {
          header: "Duration",
          txt: item.hours + " hours"
        },
        {
          header: "Description",
          txt: item.desc
        },
        {
          header: "Verified?",
          txt: verif
        }
      );
      this.dialog.isForm = false;

      this.dialog.actions.push({
        func: this.cleanDialog,
        btn: "Dismiss",
        flat: false,
        outline: true
      });
      this.dialog.enabled = true;
    },
    cleanDialog() {
      this.dialog = {
        header: "",
        msg: [],
        isForm: false,
        actions: [],
        enabled: false,
        target: undefined,
        error: ""
      };
    }
  },
  mounted() {
    setTimeout(() => {
      let email = auth.currentUser.email;
      this.username = email.substring(0, email.lastIndexOf("@"));
      this.displayName = auth.currentUser.displayName;
      userCol.doc(this.username.toLowerCase()).onSnapshot(
        doc => {
          this.user = doc.data();
          this.progress = (this.user.hours / this.user.goal) * 100;
        },
        error => {
          this.error = error;
        }
      );
      userCol
        .doc(this.username.toLowerCase())
        .collection("events")
        .onSnapshot(
          col => {
            this.pastEvents = [];
            col.forEach(doc => {
              this.pastEvents.push(doc.data());
            });
          },
          error => {
            this.error = error;
          }
        );
      eventCol.onSnapshot(
        col => {
          this.invitations = [];
          col.forEach(doc => {
            this.invitations.push(doc.data());
          });
        },
        error => {
          this.error = error;
        }
      );
    }, 1000);
  }
};
</script>
