const express = require("express");
const app = express();
require("dotenv").config();

var AWS = require("aws-sdk");
const awsConfig = new AWS.Config({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

AWS.config = awsConfig;

app.get("/", (req, res) => {
  console.log("Message = " + req.query.message);
  console.log("Number = " + req.query.number);
  console.log("Subject = " + req.query.subject);
  var params = {
    Message: req.query.message,
    PhoneNumber: "+" + req.query.number,
    MessageAttributes: {
      "AWS.SNS.SMS.SenderID": {
        DataType: "String",
        StringValue: req.query.subject,
      },
      'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: 'Transactional' },
    },
    // attributes: {
    //   /* required */
    //   DefaultSMSType: "Transactional" /* highest reliability */,
    //   //'DefaultSMSType': 'Promotional' /* lowest cost */
    // },
  };

  var publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
    .publish(params)
    .promise();

  publishTextPromise
    .then(function (data) {
      res.end(JSON.stringify({ MessageID: data.MessageId }));
    })
    .catch(function (err) {
      res.end(JSON.stringify({ Error: err }));
    });
});

app.listen(process.env.PORT, () => console.log("SMS Service Listening on PORT " + process.env.PORT));
