const dotenv = require("dotenv");
const http = require("http");
const mongoose = require("mongoose");

const Post = require("model/posts");

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

async function httpListener(req, res) {
    let body = "";
    req.on("data", (chunck) => { 
        body += chunck; 
    });

    //
    if (req.url === "/posts" && req.method === "GET") {
        result = await Post.find();
        respondAsSuccessful(res, result); 
    }
    else if (req.url === "/posts" && req.method === "POST") {
        req.on("end", async () => {
            try {
                const post = JSON.parse(body);
                const newPost = await Post.create(post);
                respondAsSuccessful(res, newPost);
            } catch (error) {
                respondAsFailed(res, 400, error.message);
            }
        });
    }
    // else if (req.url === "/todos" && req.method === "DELETE") {
    //     todos.length = 0;
    //     respondAsSuccessful(res, todos);
    // }
    // else if (req.url.startsWith("/todos/") && req.method === "DELETE") {
    //     try {
    //         const id = req.url.split("/").pop();
    //         const index = findTodoIndexById(todos, id);
    //         todos.splice(index, 1);
    //         respondAsSuccessful(res, todos);
    //     } catch (error) {
    //         respondAsFailed(res, 400, error.message);
    //     }
    // }
    // else if (req.url.startsWith("/todos/") && req.method === "PATCH") {
    //     req.on("end", () => {
    //         try {
    //             const title = getTitleFromReqBody(body);

    //             const id = req.url.split("/").pop();
    //             const index = findTodoIndexById(todos, id);

    //             todos[index].title = title;

    //             respondAsSuccessful(res, todos);
    //         } catch (error) {
    //             respondAsFailed(res, 400, error.message);
    //         }
    //     });
    // }
    else if (req.method === "OPTIONS") {
        respondAsSuccessful(res, null);
    }
    else {
        respondAsFailed(res, 404, "無此路由");
    }
}

http.createServer(httpListener).listen(httpListenPort);
