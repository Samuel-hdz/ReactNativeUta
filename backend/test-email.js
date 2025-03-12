
require('dotenv').config();
const { sendVerificationCode } = require('./utils/emailService');

// Imprime información de depuración
console.log('USER:', process.env.EMAIL_USER);
console.log('PASSWORD:', process.env.EMAIL_PASSWORD ? 'Configurada' : 'No configurada');

// Prueba de envío
async function testEmail() {
  try {
    const result = await sendVerificationCode(process.env.EMAIL_USER, '123456');
    console.log('Resultado:', result);
  } catch (error) {
    console.error('Error en test:', error.message);
  }
}

testEmail();
