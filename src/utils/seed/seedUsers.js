const fs = require('fs');
const Papa = require('papaparse');
const USER = require('../../api/models/users');
const mongoose = require('mongoose'); 


const seedUsers = () => {
    return new Promise((resolve, reject) => {
        fs.readFile('users.csv', 'utf8', (err, data) => {
            if (err) {
                console.error('Error al leer el archivo CSV:', err);
                return reject(err);
            }

            const results = Papa.parse(data, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true
            });

            const usersData = results.data.map(userData => {
                return {
                    profile: {
                        name: userData['name'],
                        email: userData['email'],
                        password: userData['password'],
                        birthDate: new Date(),
                        img: userData['img'],
                    },
                    role: 'user',
                    menstrualCycle: new mongoose.Types.ObjectId(), 
                    calendary: new mongoose.Types.ObjectId(),   
                    contacts: [],
                    posts: [],
                    comments: []
                };
            });

            USER.insertMany(usersData)
                .then(savedUsers => {
                    console.log('Usuarios guardados en la base de datos');
                    resolve(savedUsers.map(user => user._id));
                })
                .catch(err => {
                    console.error('Error al guardar usuarios en la base de datos:', err);
                    reject(err);
                });
        });
    });
};

module.exports = seedUsers;