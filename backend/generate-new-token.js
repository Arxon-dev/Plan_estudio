const jwt = require('jsonwebtoken');

// Generar un nuevo token para el usuario 15
const payload = {
  id: 15,
  email: 'carlos.opomelilla@gmail.com'
};

const secret = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoiY2FybG9zLm9wb21lbGlsbGFAZ21haWwuY29tIiwiaWF0IjoxNzYzMzUwOTIxLCJleHAiOjE3NjM5NTU3MjF9.RGHxloiQjDc1M8CTCz7hN7zUTSodhvjhDW7eVYM_7O8'; // Secreto del .env
const options = {
  expiresIn: '7d' // Token válido por 7 días
};

const token = jwt.sign(payload, secret, options);
console.log('Nuevo token JWT:');
console.log(token);