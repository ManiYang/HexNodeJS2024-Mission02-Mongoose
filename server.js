const dotenv = require("dotenv");
const http = require("http");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

dotenv.config({ path: "./config.env" });

// DB

const connectionString = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD ??= ""
);

mongoose.connect(connectionString).then(() => {
    console.log("successfully connected to DB");
});

// HTTP server

const httpListenPort = process.env.PORT || 3005;

const responseHeaders = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
};

/**
 * Sends "successful" response.
 * @param {*} res 
 * @param {*} data If is not `null`, this is the value of key "data" in the response body. 
 *                 If is `null`, the response has no body.
 */
function respondAsSuccessful(res, data) {
    res.writeHead(200, responseHeaders);
    if (data !== null) {
        res.write(JSON.stringify({
            status: "sucessful",
            data: data
        }));
    }
    res.end();
}

/**
 * Sends "failed" response.
 * @param {*} res 
 * @param {Number} statusCode 
 * @param {String} message 
 */
function respondAsFailed(res, statusCode, message) {
    res.writeHead(statusCode, responseHeaders);
    res.write(JSON.stringify({
        status: "failed",
        message: message
    }));
    res.end();
}

function httpListener(req, res) {
    let body = "";
    req.on("data", (chunck) => { 
        body += chunck; 
    });

    //

}

http.createServer(httpListener).listen(httpListenPort);
