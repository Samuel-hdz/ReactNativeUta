
require('dotenv').config();
const { sendVerificationCode } = require('./utils/emailService');

// Prueba de envío a diferentes direcciones
async function testMultipleEmails() {
  const testEmails = [
    'hernandezjuarezsamuel1g@gmail.com',  // Email del usuario
    process.env.EMAIL_USER                // Email configurado en .env
  ];
  
  for (const email of testEmails) {
    console.log(`\n--- Probando envío a: ${email} ---`);
    try {
      const result = await sendVerificationCode(email, '123456');
      console.log('Resultado:', result);
    } catch (error) {
      console.error('Error en test:', error.message);
    }
  }
}

testMultipleEmails();
