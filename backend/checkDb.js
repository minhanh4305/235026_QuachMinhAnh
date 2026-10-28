require("dotenv").config();
const mongoose = require("mongoose");

async function checkDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME
        });

        console.log("Ket noi MongoDB thanh cong!");
        console.log("Database:", mongoose.connection.name);

        const books = await mongoose.connection.db
            .collection("books")
            .find({})
            .toArray();

        console.log("So luong sach:", books.length);

        books.forEach((book) => {
            console.log(book.bookId, "-", book.title);
        });

    } catch (error) {
        console.error("Ket noi that bai:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

checkDatabase();