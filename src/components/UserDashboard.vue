<template>
  <v-container grid-list-xl fluid>
    <v-layout :column="$vuetify.breakpoint.smAndDown">
      <v-dialog v-model="dialog.enabled" max-width="500" persistent>
        <v-card>
          <v-card-title primary-title class="headline">
            {{ dialog.header }}
          </v-card-title>
          <v-alert :value="dialog.error" type="error">
            {{ dialog.error }}
          </v-alert>
          <v-card-text v-if="dialog.info == 'form'">
            <v-form>
              <template v-for="(item, index) in dialog.msg">
                <v-text-field
                  :key="index"
                  v-model="dialog.result"
                  :prepend-icon="item.icon"
                  :label="item.label"
                  :type="item.inType"
                  :hint="item.hint"
                  color="accent"
                />
              </template>
            </v-form>
          </v-card-text>
          <v-stepper
            v-else-if="dialog.info == 'steps'"
            v-model="dialog.step"
            class="elevation-0"
          >
            <template v-for="(step, stepIndex) in dialog.msg">
              <v-stepper-step
                :key="stepIndex + '-step'"
                :complete="dialog.step > stepIndex + 1"
                :step="stepIndex + 1"
                :editable="dialog.step > stepIndex + 1"
              >
                {{ step.header }}
              </v-stepper-step>
              <v-stepper-content
                :key="stepIndex + '-content'"
                :step="stepIndex + 1"
              >
                <v-form :ref="'formStep' + stepIndex">
                  <template v-for="(input, inputIndex) in step.inputs">
                    <v-text-field
                      v-if="!input.isTime"
                      :key="inputIndex"
                      v-model="dialog.result[input.result]"
                      :type="input.inType"
                      color="accent"
                      :label="input.label"
                      :hint="input.hint"
                      required
                      :rules="getErrors(input)"
                    />
                    <template v-else>
                      <v-menu
                        :key="inputIndex + '-date'"
                        v-model="input.dateMenu"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        lazy
                        transition="scale-transition"
                        offset-y
                        full-width
                        min-width="290px"
                      >
                        <v-text-field
                          slot="activator"
                          v-model="dialog.result[input.dateResult]"
                          :label="input.dateLabel"
                          readonly
                        ></v-text-field>
                        <v-date-picker
                          v-model="dialog.result[input.dateResult]"
                          @input="input.dateMenu = false"
                        >
                        </v-date-picker>
                      </v-menu>
                      <v-menu
                        :key="inputIndex + '-time'"
                        v-model="input.timeMenu"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        lazy
                        transition="scale-transition"
                        offset-y
                        full-width
                        max-width="290px"
                        min-width="290px"
                      >
                        <v-text-field
                          slot="activator"
                          v-model="dialog.result[input.timeResult]"
                          :label="input.timeLabel"
                          readonly
                        ></v-text-field>
                        <v-time-picker
                          v-model="dialog.result[input.timeResult]"
                          full-width
                          @input="input.timeMenu = false"
                        ></v-time-picker>
                      </v-menu>
                    </template>
                  </template>
                </v-form>
              </v-stepper-content>
            </template>
          </v-stepper>
          <v-list v-else two-row subheader>
            <template v-for="(item, index) in dialog.msg">
              <v-list-tile v-if="item.txt" :key="index">
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
              v-for="(item, index) in dialog.actions"
              :key="index"
              :color="item.color || 'accent'"
              :flat="item.flat"
              :outline="item.outline"
              :loading="item.loading"
              :disabled="item.loading"
              @click="item.func"
            >
              {{ item.btn() }}
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
            <v-toolbar-title>Your Events</v-toolbar-title>
          </v-toolbar>
          <v-list two-line subheader>
            <template v-for="(item, index) in pastEvents">
              <v-list-tile :key="index" avatar @click="moreInfo(item)">
                <v-list-tile-content>
                  <v-list-tile-title>{{ item.provider }}</v-list-tile-title>
                  <v-list-tile-sub-title>{{ item.desc }}</v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-avatar>{{ item.hours }} hours</v-list-tile-avatar>
              </v-list-tile>
            </template>
          </v-list>
          <v-card-actions>
            <v-spacer />
            <v-btn flat color="accent" to="/events/user">More Details</v-btn>
            <v-btn outline color="accent" @click="addUserEvent()">
              Add Event
            </v-btn>
          </v-card-actions>
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
                  <v-list-tile-sub-title>
                    {{ item.message }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-avatar>{{ item.hours }} hours</v-list-tile-avatar>
              </v-list-tile>
            </template>
          </v-list>
          <v-card-actions>
            <v-spacer />
            <v-btn flat color="accent" to="/events/global">More Details</v-btn>
            <v-btn outline color="accent" @click="addGlobalEvent()">
              Publish Event
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import { db, auth } from "../FirebaseConfig";
import { notEmpty, underLength, isDecimal, isEmail } from "../validation.js";

let userCol = db.collection("/users");
let eventCol = db.collection("/events");

function toDate(seconds) {
  let t = new Date(1970, 0, 1);
  t.setSeconds(seconds);
  return t;
}

export default {
  name: "UserDashboard",
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
        info: "",
        msg: [],
        actions: [],
        enabled: false,
        result: undefined,
        error: "",
        step: undefined
      }
    };
  },
  mounted() {
    setTimeout(() => {
      let email = auth.currentUser.email;
      this.username = email.substring(0, email.lastIndexOf("@")).toLowerCase();
      // User data polling:
      userCol.doc(this.username).onSnapshot(
        doc => {
          this.user = doc.data();
          this.progress = (this.user.hours / this.user.goal) * 100;
          this.displayName = this.user.displayName;
        },
        error => {
          this.error = error;
        }
      );
      // User events polling:
      userCol
        .doc(this.username)
        .collection("events")
        .orderBy("when", "desc")
        .limit(5)
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
      // Global events polling:
      eventCol
        .orderBy("when")
        .limit(5)
        .onSnapshot(
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
    }, 1e3);
  },
  methods: {
    resetGoal() {
      this.dialog.header = "Change Service Goal";

      this.dialog.msg.push({
        icon: "access_time",
        label: "Service Goal",
        inType: "number",
        hint: "Your community service goal in hours"
      });

      this.dialog.info = "form";
      this.dialog.actions.push(
        {
          func: this.cleanDialog,
          btn() {
            return "Cancel";
          },
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
              .then(() => {
                this.cleanDialog();
                return;
              })
              .catch(error => {
                this.dialog.error = error;
                this.actions[1].loading = false;
              });
          },
          btn() {
            return "Submit";
          },
          outline: true
        }
      );

      this.dialog.enabled = true;
    },
    resetGrade() {
      this.dialog.header = "Change Graduation Year";

      this.dialog.msg.push({
        icon: "school",
        label: "Year of Graduation",
        inType: "number",
        hint: "eg. 2021"
      });

      this.dialog.info = "form";
      this.dialog.actions.push(
        {
          func: this.cleanDialog,
          btn() {
            return "Cancel";
          },
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
              .then(() => {
                this.cleanDialog();
                return;
              })
              .catch(error => {
                this.dialog.error = error;
                this.dialog.actions[1].loading = false;
              });
          },
          btn() {
            return "Submit";
          },
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

      this.dialog.info = "form";
      this.dialog.actions.push(
        {
          func: this.cleanDialog,
          btn() {
            return "Cancel";
          },
          flat: true,
          outline: false
        },
        {
          func: () => {
            this.dialog.actions[1].loading = true;
            userCol
              .doc(this.username)
              .update({
                displayName: this.dialog.result
              })
              .then(() => {
                this.dialog.actions[1].loading = false;
                this.cleanDialog();
                this.displayName = this.dialog.result;
                return;
              })
              .catch(error => {
                this.dialog.actions[1].loading = false;
                this.error = error;
              });
          },
          btn() {
            return "Submit";
          },
          flat: false,
          outline: true,
          loading: false
        }
      );

      this.dialog.enabled = true;
    },
    resetPassword() {
      this.dialog.header = "Reset Password";

      this.dialog.actions.push(
        {
          func: this.cleanDialog,
          btn() {
            return "Cancel";
          },
          flat: true,
          outline: false
        },
        {
          func: () => {
            this.dialog.actions[1].loading = true;
            auth
              .sendPasswordResetEmail(auth.currentUser.email)
              .then(() => {
                this.dialog.actions[1].loading = false;
                this.cleanDialog();
                return;
              })
              .catch(error => {
                this.dialog.actions[1].loading = false;
                this.error = error;
              });
          },
          btn() {
            return "Send Email";
          },
          flat: false,
          outline: true
        }
      );

      this.dialog.enabled = true;
    },
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
      this.dialog.info = "list";

      this.dialog.actions.push({
        func: this.cleanDialog,
        btn() {
          return "Dismiss";
        },
        flat: false,
        outline: true
      });
      this.dialog.enabled = true;
    },
    addUserEvent() {
      this.dialog.header = "New Event";

      this.dialog.info = "steps";
      this.dialog.result = {};
      this.dialog.msg.push(
        {
          header: "Enter Event Information",
          inputs: [
            {
              isTime: false,
              label: "Community Service Organization",
              hint: "eg. World Computer Exchange",
              type: "text",
              result: "provider",
              required: true
            },
            {
              isTime: false,
              label: "Supervisor's Email",
              hint: "eg. example@example.com",
              type: "text",
              result: "supervisor",
              required: true,
              errors: [isEmail]
            },
            {
              isTime: false,
              label: "Short Description",
              hint:
                "eg. Refurbish old computers for youth in developing countries",
              type: "text",
              result: "desc",
              required: true,
              errors: [underLength(250)]
            }
          ]
        },
        {
          header: "Select Time of Event",
          inputs: [
            {
              isTime: true,
              dateLabel: "Date of event",
              timeLabel: "Time of event",
              dateMenu: false,
              timeMenu: false,
              dateResult: "date",
              timeResult: "time"
            },
            {
              isTime: false,
              label: "Event Duration in hours",
              hint: "eg. 5. Use a decimal approximation if neccessary.",
              type: "number",
              result: "hours",
              required: true,
              errors: [isDecimal]
            }
          ]
        }
      );

      this.dialog.actions.push(
        {
          func: this.cleanDialog,
          btn() {
            return "Cancel";
          },
          flat: true,
          outline: false
        },
        {
          func: () => {
            if (this.dialog.step == this.dialog.msg.length) {
              if (
                this.$refs.formStep1[0].validate() &&
                this.$refs.formStep0[0].validate()
              ) {
                this.dialog.actions[1].loading = true;
                userCol
                  .doc(this.username)
                  .collection("events")
                  .add({
                    desc: this.dialog.result.desc,
                    hours: this.dialog.result.hours,
                    provider: this.dialog.result.provider,
                    signed: false,
                    supervisor: this.dialog.result.supervisor,
                    when: new Date(
                      `${this.dialog.result.date} ${this.dialog.result.time}`
                    )
                  })
                  .then(() => {
                    this.cleanDialog();
                    return;
                  })
                  .catch(error => {
                    this.dialog.actions[1].loading = false;
                    this.dialog.error = error;
                  });
              }
            } else {
              if (this.$refs.formStep0[0].validate()) {
                this.dialog.step++;
              }
            }
          },
          btn: () => {
            return this.dialog.step == this.dialog.msg.length
              ? "Submit"
              : "Next";
          },
          flat: true,
          outline: false
        }
      );

      this.dialog.enabled = true;
    },
    addGlobalEvent() {
      this.dialog.header = "New Event";

      this.dialog.info = "steps";
      this.dialog.result = {};
      this.dialog.msg.push(
        {
          header: "Enter Event Information",
          inputs: [
            {
              isTime: false,
              label: "Community Service Organization",
              hint: "eg. World Computer Exchange",
              type: "text",
              result: "provider",
              required: true
            },
            {
              isTime: false,
              label: "Supervisor's Email",
              hint: "eg. example@example.com",
              type: "text",
              result: "supervisor",
              required: true,
              errors: [isEmail]
            },
            {
              isTime: false,
              label: "Short Description",
              hint:
                "eg. Refurbish old computers for youth in developing countries",
              type: "text",
              result: "desc",
              required: true,
              errors: [underLength(250)]
            },
            {
              isTime: false,
              label: "Short Message",
              hint: "A message to those invited to this event",
              type: "text",
              result: "mesg",
              required: true,
              errors: [underLength(250)]
            }
          ]
        },
        {
          header: "Select Time of Event",
          inputs: [
            {
              isTime: true,
              dateLabel: "Date of event",
              timeLabel: "Time of event",
              dateMenu: false,
              timeMenu: false,
              dateResult: "date",
              timeResult: "time"
            },
            {
              isTime: false,
              label: "Event Duration in hours",
              hint: "eg. 5. Use a decimal approximation if neccessary.",
              type: "number",
              result: "hours",
              required: true,
              errors: [isDecimal]
            }
          ]
        }
      );

      this.dialog.actions.push(
        {
          func: this.cleanDialog,
          btn() {
            return "Cancel";
          },
          flat: true,
          outline: false
        },
        {
          func: () => {
            if (this.dialog.step == this.dialog.msg.length) {
              if (
                this.$refs.formStep1[0].validate() &&
                this.$refs.formStep0[0].validate()
              ) {
                this.dialog.actions[1].loading = true;
                eventCol
                  .add({
                    desc: this.dialog.result.desc,
                    hours: this.dialog.result.hours,
                    provider: this.dialog.result.provider,
                    supervisor: this.dialog.result.supervisor,
                    when: new Date(
                      `${this.dialog.result.date} ${this.dialog.result.time}`
                    ),
                    message: this.dialog.result.mesg,
                    author: this.username
                  })
                  .then(() => {
                    this.cleanDialog();
                    return;
                  })
                  .catch(error => {
                    this.dialog.actions[1].loading = false;
                    this.dialog.error = error;
                  });
              }
            } else {
              if (this.$refs.formStep0[0].validate()) {
                this.dialog.step++;
              }
            }
          },
          // eslint-disable-next-line sonarjs/no-identical-functions
          btn: () => {
            return this.dialog.step == this.dialog.msg.length
              ? "Submit"
              : "Next";
          },
          flat: true,
          outline: false
        }
      );

      this.dialog.enabled = true;
    },
    cleanDialog() {
      this.dialog = {
        header: "",
        msg: [],
        info: "",
        actions: [],
        enabled: false,
        target: undefined,
        error: ""
      };
    },
    getErrors(input) {
      var rules = [];
      var loc = input.result;
      if (input.required) {
        rules.push(
          function() {
            return notEmpty(this.dialog.result[loc]);
          }.bind(this)
        );
      }
      if (input.errors) {
        input.errors.forEach(error => {
          rules.push(
            function() {
              if (this.dialog.result[loc]) {
                return error(this.dialog.result[loc]);
              } else {
                return true;
              }
            }.bind(this)
          );
        });
      }
      return rules;
    }
  }
};
</script>
