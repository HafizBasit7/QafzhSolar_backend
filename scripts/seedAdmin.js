const mongoose = require("mongoose");

const bcrypt = require('bcrypt')
const Admin = require("../models/admin");


// loads .env variables

const seedAdmin = async () => {
    try {
        await mongoose.connect("mongodb+srv://tahir:112233test@auctionplatform.veyca.mongodb.net/qafzh_solar_app", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });


        const plainText = "admin@123";
        const hashPassword = await bcrypt.hash(plainText, 10);

        const newAdmin = new Admin({
            name: "superadmin",
            email: "superadmin@gmail.com",
            password: hashPassword, // You should change this in production!
        });

        await newAdmin.save();
        console.log(" Admin user seeded successfully!");
        process.exit();
    } catch (error) {
        console.error(" Seeding error:", error.message);
        process.exit(1);
    }
};

seedAdmin();
