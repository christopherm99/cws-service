<template>
  <v-container>
    <v-dialog v-model="dialog.enabled" max-width="500" persistent>
      <v-card>
        <v-card-title primary-title class="headline">
          {{ dialog.title }}
        </v-card-title>
        <v-card-text>
          {{ dialog.prompt }}
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="accent"
            flat
            :disabled="dialog.loading"
            @click="cleanDialog"
          >
            Go Back
          </v-btn>
          <v-btn
            color="accent"
            outline
            :loading="dialog.loading"
            @click="dialog.fun"
          >
            {{ dialog.btn }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card>
      <v-toolbar card dark color="secondary">
        <v-toolbar-title>
          Upcoming Events
        </v-toolbar-title>
      </v-toolbar>
      <v-alert :value="error" type="error">
        {{ error }}
      </v-alert>
      <v-data-table :headers="headers" :items="events" :loading="loading">
        <template slot="items" slot-scope="props">
          <td>{{ props.item.provider }}</td>
          <td>{{ props.item.author }}</td>
          <td>{{ props.item.hours }}</td>
          <td>{{ props.item.when }}</td>
          <td class="justify-center layout px-0">
            <v-icon v-if="props.item.rsvp" flat @click="respond(props.item)">
              cancel
            </v-icon>
            <v-icon v-else flat @click="respond(props.item)">
              reply
            </v-icon>
          </td>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { db, auth } from "../FirebaseConfig";

let eventCol = db.collection("/events");

export default {
  data() {
    return {
      username: "",
      headers: [
        {
          text: "Organization",
          value: "provider"
        },
        {
          text: "Author",
          value: "author"
        },
        {
          text: "Duration",
          value: "hours"
        },
        {
          text: "When",
          value: "when"
        },
        {
          text: "Respond",
          sortable: false
        }
      ],
      events: [],
      error: "",
      loading: true,
      dialog: {
        enabled: false,
        loading: false,
        title: "",
        prompt: "",
        btn: "",
        fun: undefined,
        meta: undefined
      }
    };
  },
  mounted() {
    this.username = auth.currentUser.email
      .substring(0, auth.currentUser.email.lastIndexOf("@"))
      .toLowerCase();
    eventCol.where("when", ">", new Date()).onSnapshot(
      colSnap => {
        this.events = [];
        colSnap.docs.forEach(doc => {
          doc.ref
            .collection("who")
            .doc(this.username)
            .get()
            .then(rsvp => {
              this.loading = false;
              let data = doc.data();
              let when = new Date(data.when.seconds * 1000);
              this.events.push({
                provider: data.provider,
                hours: `${data.hours} hours`,
                author: data.author,
                when: `${new Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric"
                }).format(when)}`,
                id: doc.id,
                rsvp: rsvp.exists
              });
              return;
            })
            .catch(error => {
              this.error = error;
            });
        });
      },
      error => {
        this.error = error;
      }
    );
  },
  methods: {
    respond(event) {
      event.rsvp
        ? (this.dialog = {
            enabled: true,
            loading: false,
            title: "Cancel Attendance",
            prompt:
              "Would you like to cancel your attendance to the following event?",
            btn: "Cancel",
            fun: this.cancel,
            meta: event.id
          })
        : (this.dialog = {
            enabled: true,
            loading: false,
            title: "Confirm Attendance",
            prompt:
              "Would you like to confirm your attendance to the following event?",
            btn: "Confirm",
            fun: this.confirm,
            meta: event.id
          });
    },
    cleanDialog() {
      this.dialog = {
        enabled: false,
        loading: false,
        title: "",
        prompt: "",
        btn: "",
        fun: () => {},
        meta: undefined
      };
    },
    cancel() {
      this.dialog.loading = true;
      eventCol
        .doc(this.dialog.meta)
        .collection("who")
        .doc(this.username)
        .delete()
        .then(this.cleanDialog)
        .catch(error => {
          this.cleanDialog();
          this.error = error.message;
        });
    },
    confirm() {
      this.dialog.loading = true;
      eventCol
        .doc(this.dialog.meta)
        .collection("who")
        .doc(this.username)
        .set({
          when: new Date()
        })
        .then(this.cleanDialog)
        .catch(error => {
          this.cleanDialog();
          this.error = error.message;
        });
    }
  }
};
</script>

<style></style>
