<template>
  <v-container fluid>
    <v-alert type="error" :value="error">
      {{ error }}
    </v-alert>
    <v-dialog max-width="500" v-model="dialog.enabled">
      <v-card>
        <v-card-title primary-title class="headline">
          {{ dialog.header }}
        </v-card-title>
        <v-alert type="error" :value="dialog.error">
          {{ dialog.error }}
        </v-alert>
        <v-data-table
          :headers="dialog.msg.head"
          :items="dialog.msg.events"
          hide-actions
          rows-per-page-items="-1"
        >
          <template slot="items" slot-scope="props">
            <td>{{ props.item.provider }}</td>
            <td>{{ props.item.hours }} hours</td>
            <td>{{ props.item.when }}</td>
          </template>
        </v-data-table>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn color="accent" outline @click="closeDiag()">
            Dismiss
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card>
      <v-card-title>
        Users
        <v-spacer />
        <v-btn-toggle v-model="class_filter" multiple @change="updateFilter()">
          <v-btn flat>
            Seniors
          </v-btn>
          <v-btn flat>
            Juniors
          </v-btn>
          <v-btn flat>
            Sophomores
          </v-btn>
          <v-btn flat>
            Freshmen
          </v-btn>
        </v-btn-toggle>
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
        />
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="users"
        :search="search"
        hide-actions
      >
        <template slot="items" slot-scope="props">
          <tr @click="userDiag(props.item)">
            <td>{{ props.item.displayName }}</td>
            <td>{{ props.item.class }}</td>
            <td>{{ props.item.hours }}</td>
          </tr>
        </template>
        <v-alert slot="no-results" :value="true" color="error" icon="warning">
          Your search for "{{ search }}" found no results.
        </v-alert>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { db } from "../FirebaseConfig";

let usersCol = db.collection("/users");

function toDate(seconds) {
  let t = new Date(1970, 0, 1);
  t.setSeconds(seconds);
  return t;
}

function toISOExtended(date) {
  let dt = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} `;
  date.getHours() < 12 ? (dt += date.getHours()) : (dt += date.getHours() - 12);
  dt += ":";
  date.getMinutes() > 10
    ? (dt += date.getMinutes())
    : (dt += "0" + date.getMinutes());
  date.getHours() < 12 ? (dt += "AM") : (dt += "PM");
  return dt;
}

export default {
  data() {
    return {
      headers: [
        {
          text: "Student",
          value: "displayName"
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
      allUsers: [],
      users: [],
      dialog: {
        header: "",
        msg: {
          head: [
            {
              text: "Event",
              value: "provider"
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
          events: []
        },
        error: "",
        enabled: false
      },
      error: "",
      search: "",
      class_filter: []
    };
  },
  methods: {
    userDiag(user) {
      this.dialog.header = user.displayName + ": verified events";
      usersCol
        .doc(user.displayName)
        .collection("events")
        .get()
        .then(col => {
          col.forEach(doc => {
            let retrieved = doc.data();
            retrieved.when = toISOExtended(toDate(retrieved.when.seconds));
            this.dialog.msg.events.push(retrieved);
          });
          return;
        })
        .catch(error => (this.dialog.error = error.message));
      this.dialog.enabled = true;
    },
    closeDiag() {
      this.dialog = {
        header: "",
        msg: {
          headers: [
            {
              text: "Event",
              value: "provider"
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
          events: []
        },
        error: "",
        enabled: false
      };
    },
    updateFilter() {
      this.users = [];
      this.class_filter.length == 0
        ? (this.users = this.allUsers)
        : this.class_filter.forEach(grade => {
            this.users.push(
              ...this.allUsers.filter(user => {
                return user.class == grade + 2019;
              })
            );
          });
    }
  },
  mounted() {
    usersCol.onSnapshot(
      col => {
        col.forEach(doc => {
          this.users = [];
          let retrieved = doc.data();
          this.users.push(retrieved);
        });
        this.allUsers = this.users;
      },
      error => {
        this.error = error.message;
      }
    );
  }
};
</script>
