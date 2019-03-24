const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.incrementHours = functions.firestore
  .document("users/{username}/events/{eventID}")
  .onCreate((snap, ctx) => {
    console.log(
      `User ${ctx.params.username} created an event: ${ctx.params.eventID}`
    );
    let userdoc = snap.ref.parent.parent;
    return userdoc
      .get()
      .then(doc => {
        let hours = doc.data().hours;
        if (!hours) {
          hours = 0;
        }
        console.log(
          `User ${ctx.params.username} currently has ${hours} hours logged.`
        );
        console.log(`This event will add ${snap.data.hours} more hours`);
        return userdoc.update({
          hours: hours + snap.data.hours
        });
      })
      .catch(error => {
        console.error(`Cannot retrieve user's current hours: ${error}`);
        throw error;
      });
  });
