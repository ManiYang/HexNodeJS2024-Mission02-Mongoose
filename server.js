const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

const connectionString = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD ??= ""
);

mongoose.connect(connectionString).then(() => {
    console.log("successfully connected to DB");
});

