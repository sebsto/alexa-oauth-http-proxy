/**
* A Lambda function to extract hostname from an URL
**/


exports.handler = function(event, context) {

    console.log("REQUEST RECEIVED:\n" + JSON.stringify(event));

    // For Delete and update requests, immediately send a SUCCESS response.
    if (event.RequestType == "Delete" || event.RequestType == "Update") {
        sendResponse(event, context, "SUCCESS");
        return;
    }

    var authenticationURL = event.ResourceProperties.AuthenticationURL;
    var accessTokenURL    = event.ResourceProperties.AccessTokenURL;
    var responseStatus    = "FAILED";
    var responseData      = {};
    var url = require('url');

    if (authenticationURL != undefined) {
      var pa   = url.parse(authenticationURL);
      responseData.authenticationHostname = pa.hostname;
      responseData.authenticationURL      = pa.hostname + pa.pathname;
    }
    if (accessTokenURL != undefined) {
      var pa   = url.parse(accessTokenURL);
      responseData.accessTokenHostname = pa.hostname;
      responseData.accessTokenURL      =  pa.hostname + pa.pathname;
    }
    if (responseData != undefined && responseData != "") { //TODO should also test for empty object
       responseStatus = "SUCCESS";
    }
    sendResponse(event, context, responseStatus, responseData);

};


// Send response to the pre-signed S3 URL
function sendResponse(event, context, responseStatus, responseData) {

    var responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: "See the details in CloudWatch Log Stream: " + context.logStreamName,
        PhysicalResourceId: context.logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData
    });

    console.log("RESPONSE BODY:\n", responseBody);

    var https = require("https");
    var url = require("url");

    var parsedUrl = url.parse(event.ResponseURL);
    var options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: "PUT",
        headers: {
            "content-type": "",
            "content-length": responseBody.length
        }
    };

    console.log("SENDING RESPONSE...\n");

    var request = https.request(options, function(response) {
        console.log("STATUS: " + response.statusCode);
        console.log("HEADERS: " + JSON.stringify(response.headers));
        // Tell AWS Lambda that the function execution is done
        context.done();
    });

    request.on("error", function(error) {
        console.log("sendResponse Error:" + error);
        // Tell AWS Lambda that the function execution is done
        context.done();
    });

    // write data to request body
    request.write(responseBody);
    request.end();
}
