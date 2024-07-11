const mongoose = require('mongoose');
const {connectDB} = require('../../config/db');
const seedUsers = require('./seedUsers');

const seedDatabase = async () => {
    await connectDB();
    await seedUsers();
    mongoose.connection.close();
};

seedDatabase();
