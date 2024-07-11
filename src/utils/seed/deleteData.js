const mongoose = require('mongoose');
const { connectDB } = require('../../config/db');

async function deleteData() {
    try {
        await connectDB(); 
        const User = require('../../api/models/users'); 
        await User.deleteMany({});
        console.log('Datos eliminados correctamente');
    } catch (error) {
        console.error('Error al eliminar datos:', error);
    } finally {
        mongoose.disconnect(); 
    }
}

deleteData();

