<template>
  <v-container>
    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card>
        <v-card-title primary-title class="headline">
          Confirm Attendance
        </v-card-title>
        <v-card-text>
          Would you like to confirm your attendance to the following event?
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn color="accent" flat @click="dialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="accent"
            outline
            :loading="dialogLoading"
            @click="confirm"
          >
            Confirm
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
            <v-icon
              flat
              @click="
                RSVP = props.item.id;
                dialog = true;
              "
            >
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
      dialog: false,
      dialogLoading: false,
      RSVP: undefined
    };
  },
  mounted() {
    eventCol.where("when", ">", new Date()).onSnapshot(
      col => {
        this.loading = false;
        this.events = [];
        col.forEach(doc => {
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
            id: doc.id
          });
        });
      },
      error => {
        this.error = error;
      }
    );
  },
  methods: {
    confirm() {
      this.dialogLoading = true;
      eventCol
        .doc(this.RSVP)
        .collection("who")
        .doc(
          auth.currentUser.email
            .substring(0, auth.currentUser.email.lastIndexOf("@"))
            .toLowerCase()
        )
        .set({
          when: new Date()
        })
        .then(() => {
          this.dialog = false;
          this.dialogLoading = false;
          return;
        })
        .catch(error => {
          this.dialog = false;
          this.dialogLoading = false;
          this.error = error.message;
        });
    }
  }
};
</script>

<style></style>
