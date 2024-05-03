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
function respondSuccessful(res, data) {
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
function respondFailed(res, statusCode, message) {
    res.writeHead(statusCode, responseHeaders);
    res.write(JSON.stringify({
        status: "failed",
        message: message
    }));
    res.end();
}

module.exports.respondSuccessful = respondSuccessful;
module.exports.respondFailed = respondFailed;
