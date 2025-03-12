const express = require('express');
const router = express.Router();
const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const { sendVerificationCode } = require('../utils/emailService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generar código de 6 dígitos
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Solicitar código de verificación al iniciar sesión
// Función para sanitizar entradas
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  // Eliminar caracteres peligrosos
  return input.replace(/[<>"'`;=]/g, '');
};

router.post('/request-code', async (req, res) => {
  try {
    // Sanitizar entradas
    const email = sanitizeInput(req.body.email);
    const password = sanitizeInput(req.body.password);
    
    console.log('Solicitud de código para:', email);

    // Buscar el usuario
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Error: Usuario no encontrado:', email);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar la contraseña antes de enviar el código
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Error: Contraseña incorrecta para usuario:', email);
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    // Generar un código de verificación
    const code = generateCode();

    // Guardar código en la base de datos (reemplazando cualquier código existente)
    await VerificationCode.findOneAndDelete({ email });
    await VerificationCode.create({ email, code });

    // Enviar código por correo electrónico
    try {
      await sendVerificationCode(email, code);

      return res.status(200).json({ 
        message: 'Código de verificación enviado. Por favor, revisa tu correo electrónico.' 
      });
    } catch (error) {
      console.error('Error al enviar correo:', error);
      return res.status(500).json({ 
        message: 'Error al enviar el código de verificación', 
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Error en solicitud de código:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Verificar código y completar inicio de sesión
router.post('/verify-code', async (req, res) => {
  try {
    // Sanitizar entradas
    const email = sanitizeInput(req.body.email);
    const code = sanitizeInput(req.body.code);
    const password = sanitizeInput(req.body.password);
    
    console.log('Verificando código para:', email);
    console.log('Código recibido:', code);

    // Buscar el usuario
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Error: Usuario no encontrado:', email);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    console.log('Usuario encontrado:', user.email);

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Error: Contraseña incorrecta para usuario:', email);
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }
    console.log('Contraseña verificada correctamente');

    // Buscar el código de verificación
    const verification = await VerificationCode.findOne({ email, code });
    console.log('Verificación encontrada:', verification ? 'Sí' : 'No');
    if (!verification) {
      console.log('Error: Código inválido. Código recibido:', code);
      // Intentar encontrar cualquier código para este email para comparar
      const anyCode = await VerificationCode.findOne({ email });
      if (anyCode) {
        console.log('Código existente en DB para este email:', anyCode.code);
      } else {
        console.log('No hay ningún código registrado para este email');
      }
      return res.status(400).json({ message: 'Código de verificación inválido o expirado' });
    }

    // Eliminar el código utilizado
    await VerificationCode.findOneAndDelete({ email });

    // Generar token JWT
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          console.error('Error al generar token:', err);
          return res.status(500).json({ message: 'Error al generar token de autenticación' });
        }
        console.log('Token generado correctamente, enviando respuesta al cliente');
        return res.status(200).json({
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        });
      }
    );
  } catch (error) {
    console.error('Error en verificación de código:', error);
    return res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;