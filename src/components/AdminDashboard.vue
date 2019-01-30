<template>
  <v-container fluid>
    <v-alert type="error" :value="error">
      {{ error }}
    </v-alert>
    <v-card>
      <v-card-title class="headline">
        Users
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
        />
      </v-card-title>
      <v-data-table :headers="headers" :items="users" :search="search">
        <template slot="items" slot-scope="props">
          <td>{{ props.item.dispName }}</td>
          <td>{{ props.item.class }}</td>
          <td>{{ props.item.hours }}</td>
        </template>
        <v-alert slot="no-results" :value="true" color="error" icon="warning">
          Your search for "{{ search }}" found no results.
        </v-alert>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { db } from "../firebaseConfig";

var usersCol = db.collection("/users");

export default {
  data() {
    return {
      headers: [
        {
          text: "Student",
          value: "dispName"
        },
        {
          text: "Graduation Year",
          value: "class"
        },
        {
          text: "Hours Completed",
          value: "hours"
        }
      ],
      users: [],
      error: "",
      search: ""
    };
  },
  mounted() {
    usersCol.onSnapshot(
      col => {
        col.forEach(doc => {
          let retrieved = doc.data();
          retrieved.dispName = doc.id;
          this.users.push(retrieved);
        });
      },
      error => {
        this.error = error;
      }
    );
  }
};
</script>
