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
      <v-data-table :headers="headers" :items="events">
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
      error: ""
    };
  },
  mounted() {
    eventCol.where("when", ">", new Date()).onSnapshot(
      col => {
        this.events = [];
        col.forEach(doc => {
          this.events.push(doc.data());
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
