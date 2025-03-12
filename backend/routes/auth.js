
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Función para sanitizar entradas
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  // Eliminar caracteres peligrosos
  return input.replace(/[<>"'`;=]/g, '');
};

// Ruta para registro de usuarios
router.post('/register', async (req, res) => {
  try {
    // Sanitizar entradas
    const name = sanitizeInput(req.body.name);
    const email = sanitizeInput(req.body.email);
    const password = sanitizeInput(req.body.password);

    // Verificar si el usuario ya existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Crear nuevo usuario
    user = new User({
      name,
      email,
      password
    });

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Guardar usuario
    await user.save();

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
        if (err) throw err;
        res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta para login de usuarios
router.post('/login', async (req, res) => {
  try {
    // Sanitizar entradas
    const email = sanitizeInput(req.body.email);
    const password = sanitizeInput(req.body.password);

    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

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
        if (err) throw err;
        res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('Registration failed: User already exists');
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password
    });

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Create payload for JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    // Generate JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5 days' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
      }
    );
  } catch (err) {
    console.error('Error during registration:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create payload for JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    // Generate JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5 days' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;