

const mongoose = require('mongoose');
const initData = require("./data.js");
const Listing = require("../models/listing.js");


main()
    .then(() => console.log("Server is connected"))
    .catch(err => console.log(err));

async function main() {
    try {
        await mongoose.connect('mongodb+srv://saroj:JbNpWO0LawV7zHa6@easyrent.3khhyld.mongodb.net/?retryWrites=true&w=majority&appName=easyRent');
    } catch (err) {
        console.error("Database connection failed:", err.message);
    }
}

const initDB = async () => {
        await Listing.deleteMany({});
        initData.data.map((obj) => ({ ...obj,owner: "67979103630e0fca400bbd1c" }));
        await Listing.insertMany(initData.data);
        console.log("data was initialized");
    
};

initDB();
