<template>
  <v-container>
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
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { db } from "../FirebaseConfig";

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
        }
      ],
      events: [],
      error: "",
      loading: true
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
            }).format(when)}`
          });
        });
      },
      error => {
        this.error = error;
      }
    );
  }
};
</script>

<style></style>
