<template>
  <v-container>
    <v-card>
      <v-dialog max-width="500" persistent v-model="dialog">
        <v-card>
          <v-card-title primary-title class="headline">
            Email Verification
          </v-card-title>
          <v-card-text>
            {{ msg }}
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn color="accent" flat @click="cancel">
              Cancel
            </v-btn>
            <v-btn
              color="accent"
              :loading="sending"
              :disabled="sending"
              @click="sendEmail"
            >
              Send Email
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-toolbar card dark color="secondary">
        <v-toolbar-title>Finish Registration</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form>
          <v-alert :value="error" type="error">
            {{ error }}
          </v-alert>
          <v-text-field
            prepend-icon="school"
            label="Year of Graduation"
            type="number"
            mask="####"
            v-model="grade"
            color="accent"
          />
          <v-text-field
            prepend-icon="access_time"
            label="Service Goal"
            hint="Your community service goal in hours"
            type="number"
            mask="##"
            v-model="goal"
            color="accent"
          />
          <v-text-field
            prepend-icon="person"
            label="Display Name"
            hint="eg. John Doe"
            v-model="displayName"
            color="accent"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" flat outline @click="register">Submit</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
<script>
import router from "../router";
import { db, auth } from "../firebaseConfig";

export default {
  data() {
    return {
      grade: undefined,
      goal: undefined,
      displayName: "",
      error: "",
      dialog: false,
      sending: false,
      msg: ""
    };
  },
  methods: {
    register() {
      if (!auth.currentUser.emailVerified) {
        this.msg =
          "You must first verify your email before you can finish logging in.";
        this.dialog = true;
      } else if (!this.grade || !this.goal || !this.displayName) {
        this.error = "All fields are required";
      } else {
        let email = auth.currentUser.email;
        db.collection("users")
          .doc(email.substring(0, email.lastIndexOf("@")))
          .update({
            class: this.grade,
            goal: this.goal
          });
        auth.currentUser.updateProfile({
          displayName: this.displayName
        });
      }
    },
    sendEmail() {
      this.sending = true;
      auth.currentUser.sendEmailVerification().then(() => {
        this.sending = false;
        this.dialog = false;
      });
    },
    cancel() {
      router.push("/login");
    }
  },
  mounted() {
    if (!auth.currentUser.emailVerified) {
      this.msg = "You must first verify your email before you can log in.";
      this.dialog = true;
    }
  }
};
</script>
