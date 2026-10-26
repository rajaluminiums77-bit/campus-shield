const CryptoJS = require('crypto-js');
require('dotenv').config();

const KEY = process.env.ENCRYPTION_KEY || 'default_key_change_me';

// Encrypt data (AES-256)
const encrypt = (text) => {
  if (!text) return text;
  try {
    return CryptoJS.AES.encrypt(String(text), KEY).toString();
  } catch (err) {
    console.error('Encrypt error:', err.message);
    return text;
  }
};

// Decrypt data
const decrypt = (ciphertext) => {
  if (!ciphertext) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, KEY);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    return result || ciphertext;
  } catch (err) {
    return ciphertext;
  }
};

module.exports = { encrypt, decrypt };