<template>
  <v-container fluid>
    <v-alert type="error" :value="error">
      {{ error }}
    </v-alert>
    <v-data-table :headers="headers" :items="users">
      <template slot="items" slot-scope="props">
        <td>{{ props.item.dispName }}</td>
        <td>{{ props.item.class }}</td>
        <td>{{ props.item.hours }}</td>
      </template>
    </v-data-table>
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
      error: ""
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
