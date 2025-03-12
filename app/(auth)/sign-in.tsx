
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { requestVerificationCode, verifyCode } from '../api/mfaService';
import { loginUser } from '../api/authApi';

// Esquema de validación para las credenciales
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Correo electrónico inválido')
    .required('Correo electrónico requerido')
    .trim()
    .matches(/^[^<>%$'"`;=]+$/, 'Caracteres no permitidos'),
  password: Yup.string()
    .required('Contraseña requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .trim()
    .matches(/^[^<>%$'"`;=]+$/, 'Caracteres no permitidos'),
});

// Esquema de validación para el código de verificación
const VerificationSchema = Yup.object().shape({
  code: Yup.string()
    .required('Código de verificación requerido')
    .matches(/^\d{6}$/, 'El código debe tener 6 dígitos')
    .trim(),
});

const SignIn = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('credentials'); // 'credentials' or 'verification'
  const [storedEmail, setStoredEmail] = useState('');
  const [storedPassword, setStoredPassword] = useState('');

  const handleRequestCode = async (values) => {
    setIsLoading(true);
    try {
      await requestVerificationCode(values.email, values.password);
      setStoredEmail(values.email);
      setStoredPassword(values.password);
      setStep('verification');
      Alert.alert('Código enviado', 'Se ha enviado un código de verificación a tu correo electrónico.');
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo enviar el código de verificación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (values) => {
    setIsLoading(true);
    try {
      await verifyCode(storedEmail, values.code, storedPassword);
      // Una vez verificado el código, iniciamos sesión con las credenciales
      await loginUser(storedEmail, storedPassword, dispatch);
      router.replace('/(admin)'); // Redirect to admin screen after successful verification
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo verificar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep('credentials');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <Text style={styles.subtitle}>
          {step === 'credentials' ? 'Ingresa tus credenciales para continuar' : 'Ingresa el código de verificación enviado a tu correo'}
        </Text>
      </View>

      {step === 'credentials' ? (
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleRequestCode}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Correo Electrónico</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  placeholder="correo@ejemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  placeholder="Tu contraseña"
                  secureTextEntry
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <TouchableOpacity 
                style={styles.button} 
                onPress={() => handleSubmit()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Continuar</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
                <Link href="/sign-up" asChild>
                  <TouchableOpacity>
                    <Text style={styles.linkText}>Regístrate</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          )}
        </Formik>
      ) : (
        <Formik
          initialValues={{ code: '' }}
          validationSchema={VerificationSchema}
          onSubmit={handleVerifyCode}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Código de Verificación</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange('code')}
                  onBlur={handleBlur('code')}
                  value={values.code}
                  placeholder="Ingresa el código de 6 dígitos"
                  keyboardType="number-pad"
                  maxLength={6}
                />
                {touched.code && errors.code && (
                  <Text style={styles.errorText}>{errors.code}</Text>
                )}
              </View>

              <TouchableOpacity 
                style={styles.button} 
                onPress={() => handleSubmit()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verificar y Entrar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={handleBackToCredentials}
              >
                <Text style={styles.secondaryButtonText}>Volver</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.resendButton} 
                onPress={() => {
                  handleRequestCode({ email: storedEmail, password: storedPassword });
                }}
                disabled={isLoading}
              >
                <Text style={styles.resendButtonText}>Reenviar código</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#4A55A2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  resendButtonText: {
    color: '#4A55A2',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
  },
  linkText: {
    fontSize: 16,
    color: '#4A55A2',
    fontWeight: 'bold',
  },
});

export default SignIn;
