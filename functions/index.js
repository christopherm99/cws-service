"use strict";

const functions = require("firebase-functions");
const admin = require("firebase-admin");

const nodemailer = require("nodemailer");
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
});
const APP_NAME = "Commonwealth School Community Service";

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

function sendEmail(email, subject, text) {
  const mailOptions = {
    from: `${APP_NAME} <noreply@firebase.com>`,
    to: email
  };
  mailOptions.subject = subject;
  mailOptions.text = text;
  return mailTransport.sendMail(mailOptions);
}

exports.notifyAuthorConfirmation = functions.firestore
  .document("events/{eventID}/who/{username}")
  .onCreate((snap, ctx) => {
    console.log(
      `User ${ctx.params.username} has confirmed their attendance at event ${
        ctx.params.eventID
      }.`
    );
    let eventdoc = snap.ref.parent.parent;
    return eventdoc.get().then(doc => {
      let eventdata = doc.data();
      let authormail = eventdata.author + "@commschool.org";
      console.log(`Notifying ${authormail} of confirmation.`);
      return sendEmail(
        authormail,
        `${ctx.params.username} has joined your event`,
        `Dear ${eventdata.author},
User ${ctx.params.username} has joined your event at ${
          eventdata.provider
        } on ${new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric"
        }).format(new Date(eventdata.when.seconds * 1000))}.
From,
  The Commonwealth Community Service Team`
      );
    });
  });

exports.notifyAuthorCancellation = functions.firestore
  .document("events/{eventID}/who/{username}")
  .onDelete((snap, ctx) => {
    console.log(
      `User ${ctx.params.username} has cancelled their attendance at event ${
        ctx.params.eventID
      }.`
    );
    let eventdoc = snap.ref.parent.parent;
    return eventdoc.get().then(doc => {
      let eventdata = doc.data();
      let authormail = eventdata.author + "@commschool.org";
      console.log(`Notifying ${authormail} of cancellation.`);
      return sendEmail(
        authormail,
        `${ctx.params.username} has left your event`,
        `Dear ${eventdata.author},
User ${ctx.params.username} has left your event at ${
          eventdata.provider
        } on ${new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric"
        }).format(new Date(eventdata.when.seconds * 1000))}.
From,
  The Commonwealth Community Service Team`
      );
    });
  });
