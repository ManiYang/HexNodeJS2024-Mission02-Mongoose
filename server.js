const dotenv = require("dotenv");
const http = require("http");
const mongoose = require("mongoose");

const Post = require("./model/posts");
const { respondSuccessful, respondFailed } = require("./respond");

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

function handleRequestBody(bodyStr) {
    bodyObj = JSON.parse(bodyStr);

    if (typeof bodyObj.name === "string") {
        bodyObj.name = bodyObj.name.trim();
    }
    if (typeof bodyObj.content === "string") {
        bodyObj.content = bodyObj.content.trim();
    }

    return bodyObj;
}

async function httpListener(req, res) {
    let body = "";
    req.on("data", (chunck) => { 
        body += chunck; 
    });

    //
    if (req.url === "/posts" && req.method === "GET") {
        result = await Post.find();
        respondSuccessful(res, result); 
    }
    else if (req.url === "/posts" && req.method === "POST") {
        req.on("end", async () => {
            try {
                const post = handleRequestBody(body);
                const newPost = await Post.create(post);
                respondSuccessful(res, newPost);
            } catch (error) {
                respondFailed(res, 400, error.message);
            }
        });
    }
    else if (req.url === "/posts" && req.method === "DELETE") {
        const result = await Post.deleteMany({});
        respondSuccessful(res, result);
    }
    else if (req.url.startsWith("/posts/") && req.method === "DELETE") {
        try {
            const id = req.url.split("/").pop();
            const deletedPost = await Post.findByIdAndDelete(id);
            if (deletedPost === null) {
                throw new Error("找不到指定 ID 的貼文");
            }

            respondSuccessful(res, deletedPost);
        } catch (error) {
            respondFailed(res, 400, error.message);
        }
    }
    else if (req.url.startsWith("/posts/") && req.method === "PATCH") {
        req.on("end", async () => {
            try {
                const id = req.url.split("/").pop();
                const updatedPost = await Post.findByIdAndUpdate(
                    id, 
                    handleRequestBody(body),
                    { new: true, runValidators: true }
                );
                if (updatedPost === null) {
                    throw new Error("找不到指定 ID 的貼文");
                }

                respondSuccessful(res, updatedPost);
            } catch (error) {
                respondFailed(res, 400, error.message);
            }
        });
    }
    else if (req.method === "OPTIONS") {
        respondSuccessful(res, null);
    }
    else {
        respondFailed(res, 404, "無此路由");
    }
}

http.createServer(httpListener).listen(httpListenPort);
