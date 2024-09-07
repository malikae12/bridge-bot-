const axios = require('axios');
const { ethers } = require('ethers');

// Fungsi untuk menampilkan header
function displayHeader() {
  console.log('===============================');
  console.log('          Bridge Bot           ');
  console.log('===============================');
}

// Fungsi untuk mendapatkan estimasi dari API
async function getEstimate(params) {
  try {
    const response = await axios.post('https://pricer.t1rn.io/estimate', params);
    return response.data; // Mengembalikan data yang diterima dari API
  } catch (error) {
    console.error('Error fetching estimate:', error);
    return null; // Mengembalikan null jika terjadi error
  }
}

// Fungsi helper untuk membuat data transaksi
function transactionData(walletAddress, amount, option) {
  return {
    to: walletAddress,
    value: ethers.parseUnits(amount.toString(), 'ether'), // Mengubah amount menjadi ether
    data: `0xBridgeOption${option}`
  };
}

// Fungsi helper untuk delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fungsi untuk mendapatkan jumlah dari API berdasarkan option
async function getAmount(option) {
  try {
    const response = await axios.get('https://api.example.com/getAmount', { params: { option } });
    return response.data.amount;
  } catch (error) {
    console.error('Error fetching amount:', error);
    return null;
  }
}

// Fungsi untuk mendapatkan harga gas terkini
async function getGasPrice() {
  try {
    const response = await axios.get('https://api.gasnow.org/api/v3/gas/price?utm_source=your_app_name');
    return ethers.parseUnits(response.data.data.standard.toString(), 'gwei');
  } catch (error) {
    console.error('Error fetching gas price:', error);
    return ethers.parseUnits('20', 'gwei'); // Nilai default jika gagal mendapatkan harga gas
  }
}

module.exports = { displayHeader, getEstimate, transactionData, delay, getAmount, getGasPrice };
