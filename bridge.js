const { Wallet, JsonRpcProvider, ethers } = require('ethers');
const readlineSync = require('readline-sync');
const { displayHeader, getEstimate, transactionData, delay, getAmount, getGasPrice } = require('./src/display');
const PRIVATE_KEYS = require('./config').PRIVATE_KEYS;
const T3RN_ABI = require('./contracts/contract.json');

(async () => {
  try {
    displayHeader();
    console.log('⏳ Please wait...'.yellow);
    console.log('');

    const options = readlineSync.question(
      'Choose the bridge you want to use 👇\n' +
      '1. Arbitrum Sepolia to Base Sepolia\n' +
      '2. Arbitrum Sepolia to Blast Sepolia\n' +
      '3. Arbitrum Sepolia to Optimism Sepolia\n' +
      '4. Optimism Sepolia to Arbitrum Sepolia\n' +
      '5. Optimism Sepolia to Base Sepolia\n' +
      '6. Optimism Sepolia to Blast Sepolia\n' +
      '7. Base Sepolia to Arbitrum Sepolia\n' +
      '8. Base Sepolia to Optimism Sepolia\n' +
      '9. Base Sepolia to Blast Sepolia\n' +
      '10. Blast Sepolia to Arbitrum Sepolia\n' +
      '11. Blast Sepolia to Optimism Sepolia\n' +
      '12. Blast Sepolia to Base Sepolia\n' +
      '13. Exit\n\nEnter a number (1-13): '
    );

    let RPC_URL, CONTRACT_ADDRESS, destinationNetwork;

    switch (options) {
      case '1': RPC_URL = T3RN_ABI[0].RPC_ARBT; CONTRACT_ADDRESS = T3RN_ABI[0].CA_ARBT; destinationNetwork = 'Base'; break;
      case '2': RPC_URL = T3RN_ABI[0].RPC_ARBT; CONTRACT_ADDRESS = T3RN_ABI[0].CA_ARBT; destinationNetwork = 'Blast'; break;
      case '3': RPC_URL = T3RN_ABI[0].RPC_ARBT; CONTRACT_ADDRESS = T3RN_ABI[0].CA_ARBT; destinationNetwork = 'Optimism'; break;
      case '4': RPC_URL = T3RN_ABI[0].RPC_OP; CONTRACT_ADDRESS = T3RN_ABI[0].CA_OP; destinationNetwork = 'Arbitrum'; break;
      case '5': RPC_URL = T3RN_ABI[0].RPC_OP; CONTRACT_ADDRESS = T3RN_ABI[0].CA_OP; destinationNetwork = 'Base'; break;
      case '6': RPC_URL = T3RN_ABI[0].RPC_OP; CONTRACT_ADDRESS = T3RN_ABI[0].CA_OP; destinationNetwork = 'Blast'; break;
      case '7': RPC_URL = T3RN_ABI[0].RPC_BASE; CONTRACT_ADDRESS = T3RN_ABI[0].CA_BASE; destinationNetwork = 'Arbitrum'; break;
      case '8': RPC_URL = T3RN_ABI[0].RPC_BASE; CONTRACT_ADDRESS = T3RN_ABI[0].CA_BASE; destinationNetwork = 'Optimism'; break;
      case '9': RPC_URL = T3RN_ABI[0].RPC_BASE; CONTRACT_ADDRESS = T3RN_ABI[0].CA_BASE; destinationNetwork = 'Blast'; break;
      case '10': RPC_URL = T3RN_ABI[0].RPC_BLAST; CONTRACT_ADDRESS = T3RN_ABI[0].CA_BLAST; destinationNetwork = 'Arbitrum'; break;
      case '11': RPC_URL = T3RN_ABI[0].RPC_BLAST; CONTRACT_ADDRESS = T3RN_ABI[0].CA_BLAST; destinationNetwork = 'Optimism'; break;
      case '12': RPC_URL = T3RN_ABI[0].RPC_BLAST; CONTRACT_ADDRESS = T3RN_ABI[0].CA_BLAST; destinationNetwork = 'Base'; break;
      case '13': console.log('👋 Exiting the bot. See you next time!'.cyan); process.exit(0);
      default: console.log('❌ Invalid option selected! Exiting...'.red); process.exit(1);
    }

    const provider = new JsonRpcProvider(RPC_URL);

    for (const PRIVATE_KEY of PRIVATE_KEYS) {
      const wallet = new Wallet(PRIVATE_KEY, provider);
      let totalSuccess = 0;
      while (totalSuccess < 1) {
        try {
          const balance = await provider.getBalance(wallet.address);
          const balanceInEth = ethers.formatUnits(balance, 'ether');

          console.log(`⚙️ [${moment().format('HH:mm:ss')}] Doing transactions for address ${wallet.address}...`.yellow);

          if (balanceInEth < 0.001) {
            console.log(`❌ Your balance is too low (💰 ${balanceInEth} ETH), please claim faucet first!`.red);
            process.exit(0);
          }

          const amount = await getAmount(options);
          if (!amount) {
            console.log('❌ Failed to fetch amount, exiting...'.red);
            process.exit(1);
          }

          const gasEstimate = await provider.estimateGas(transactionData(wallet.address, amount, options));
          const gasPrice = await getGasPrice();

          const tx = {
            ...transactionData(wallet.address, amount, options),
            gasLimit: gasEstimate,
            gasPrice: gasPrice
          };

          const txResponse = await wallet.sendTransaction(tx);
          console.log(`Transaction hash: ${txResponse.hash}`);
          await txResponse.wait(); 
          console.log('Transaction confirmed!');

          totalSuccess++;
          console.log(`Total successful transactions: ${totalSuccess}`);
        } catch (error) {
          console.error('Transaction error:', error);
          await delay(5000); 
        }
      }
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
})();
