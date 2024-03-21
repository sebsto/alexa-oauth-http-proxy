"use strict";

var roleArn = 'arn:aws:iam::486652066693:role/lambda_alexa_cloudmonitor';
var region  = 'us-east-1';

/* DO NOT MAKE CHANGE BELOW THIS */

var lambda = require('./index.js');
var AWS    = require('aws-sdk');
var event = require('./test/event.json');


function context() {

   var context = require('./test/context.json');

   context.done = function(error, result) {
       console.log('context.done');
       console.log(error);
       console.log(result);
       process.exit();
   }
   context.succeed = function(result) {
       console.log('context.succeed');
       console.log(result);
       process.exit();
   }
   context.fail = function(error) {
       console.log('context.fail');
       console.log(error);
       process.exit();
   }

   return context;
}

AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: 'alexa'});
AWS.config.region = region;

var sts = new AWS.STS();

sts.assumeRole({
    RoleArn: roleArn,
    RoleSessionName: 'emulambda'
}, function(err, data) {
    if (err) { // an error occurred
        console.error('Can not assume role');
        console.error(err, err.stack);
    } else { // successful response
        console.log('Role ' + roleArn + ' succesfully assumed.');
        //console.log(data);
        AWS.config.update({
            accessKeyId: data.Credentials.AccessKeyId,
            secretAccessKey: data.Credentials.SecretAccessKey,
            sessionToken: data.Credentials.SessionToken
        });

        console.log('**************************************************************');
        console.log('** Lambda Test Harness : Now Launching your lambda function **');
        console.log('**************************************************************');
        lambda.handler(event, context());
    }
});
