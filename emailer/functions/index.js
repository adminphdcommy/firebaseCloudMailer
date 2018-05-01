const functions = require('firebase-functions');
//const admin = require('firebase-admin');
//admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const nodemailer = require('nodemailer');
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

// Sends an email confirmation when a user changes his mailing list subscription.
exports.sendEmail = functions.https.onRequest((req, res) => {
  if (req.body.subject === undefined || req.body.recipient === undefined) {
    // This is an error case, as "message" is required.
    //res.status(400).send('subject/body/recipient is missing!');
    return false
  } else {
    const mailSubject = req.body.subject;
    const mailHtmlBody = req.body.htmlBody;
    const mailRecipient = req.body.recipient;



    const mailOptions = {
      from: '"Food Ninja." <foodninjaapp@gmail.com>',
      to: mailRecipient,
      subject: mailSubject,
      html: mailHtmlBody
    };

    //res.status(200).send('Success: ' + mailSubject + ' to ' + mailRecipient);

    return mailTransport.sendMail(mailOptions)
      .then(() => {
        console.log(`${mailSubject}subscription confirmation email sent to: `, mailRecipient)
        return res.status(200).send('Success: ' + mailSubject + ' to ' + mailRecipient)
      })
      .catch((error) => console.error('There was an error while sending the email:', error));
  }
});

exports.sendEmailByDbStatusChange = functions.database.ref('/users/{uid}').onWrite((change, context) => {
  const snapshot = change.after;
  const val = snapshot.val();
  //const snapshot = event.data;
  //const val = snapshot.val();

  //if (!snapshot.changed('subscribedToMailingList')) {
  //  return null;
  //}

  const mailSubject = 'Sending email with Cloud Function - bysendEmailByDbStatusChange';
  const mailHtmlBody = '<h1>Hello ' + val.email + ' </h1><p>If you receiving this means that you have successfully deployed a customized firebase function</p><p>Be Happy!<br><br>Food Ninja Team</p>';
  const mailRecipient = val.email;

  const mailOptions = {
    from: '"Food Ninja." <foodninjaapp@gmail.com>',
    to: mailRecipient,
    subject: mailSubject,
    html: mailHtmlBody
  };

  //const subscribed = val.subscribedToMailingList;

  // Building Email message.
  //mailOptions.subject = subscribed ? 'Thanks and Welcome!' : 'Sad to see you go :`(';
  //mailOptions.text = subscribed ? 'Thanks you for subscribing to our newsletter. You will receive our next weekly newsletter.' : 'I hereby confirm that I will stop sending you the newsletter.';

  return mailTransport.sendMail(mailOptions)
    .then(() =>
      console.log(`${mailSubject} email sent to: `, mailRecipient)
      //return res.status(200).send('Success: ' + mailSubject + ' to ' + mailRecipient)
    )
    .catch((error) => console.error('There was an error while sending the email:', error));
});

exports.sendEmailConfirmation = functions.database.ref('/users/{uid}').onWrite((change, context) => {
  console.log(change)
  console.log(change.after.val())
  console.log(change.before.val())
  // console.log(context)
  // console.log(context.auth)
  // console.log(context.authType)
  // console.log(context.eventId)
  // console.log(context.eventType)
  // console.log(context.params)
  // console.log(context.resource)
  // console.log(context.timestamp)
  
  const snapshot = change.after;
  const val = snapshot.val();
  console.log(val)
  console.log(snapshot)
  console.log(val.subscribedToMailingList)
  console.log(val['subscribedToMailingList'])
  console.log(val.hasOwnProperty('subscribedToMailingList'))
  if (!val.hasOwnProperty('subscribedToMailingList')) {
    console.log('fall in to return null')
    return null;
  }

  const mailOptions = {
    from: '"Food Ninja." <foodninjaapp@gmail.com>',
    to: val.email,
  };

  const subscribed = val.subscribedToMailingList;

  // Building Email message.
  mailOptions.subject = subscribed ? 'Thanks and Welcome! - by sendEmailConfirmation' : 'Sad to see you go :`( - by sendEmailConfirmation';
  mailOptions.text = subscribed ? 'Thanks you for subscribing to our newsletter. You will receive our next weekly newsletter.' : 'I hereby confirm that I will stop sending you the newsletter.';

  return mailTransport.sendMail(mailOptions)
    .then(() => console.log(`New ${subscribed ? '' : 'un'}subscription confirmation email sent to:`, val.email))
    .catch((error) => console.error('There was an error while sending the email:', error));
});

