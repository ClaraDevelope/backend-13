const bcrypt = require('bcryptjs');

const plainPassword = 'password';

bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
  if (err) {
    console.error('Error al hashear la contraseña:', err);
    return;
  }

  console.log('Contraseña hasheada:', hashedPassword);

  const passwordMatch = bcrypt.compareSync(plainPassword, hashedPassword);
  console.log('Password Match:', passwordMatch);
});