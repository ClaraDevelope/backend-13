const jwt = require('jsonwebtoken')

const keyGenerator = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: '1y' })
}

const keyVerifyer = (token) => {
  return jwt.verify(token, process.env.SECRET_KEY)
}
module.exports = { keyGenerator, keyVerifyer }
