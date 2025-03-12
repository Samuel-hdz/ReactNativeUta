export const requestVerificationCode = async (email, password) => {
  try {
    const response = await axios.post('/api/mfa/request-code', { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al solicitar el código de verificación');
  }
};