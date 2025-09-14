import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Polygon Amoy testnet configuration
const POLYGON_AMOY_RPC = 'https://rpc-amoy.polygon.technology/';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(POLYGON_AMOY_RPC);
    this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
  }
  async storeCredentialHash(credentialHash, slug) {
    try {
      const transaction = {
        to: this.wallet.address,
        value: ethers.parseEther('0'),
        data: ethers.toUtf8Bytes(`PROOFLY:${credentialHash}:${slug}`),
        gasLimit: 100000
      };

      console.log('Sending transaction to blockchain...');
      const tx = await this.wallet.sendTransaction(transaction);
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.hash);
      
      return receipt.hash;
    } catch (error) {
      console.error('Error storing hash on blockchain:', error);
      throw error;
    }
  }

  async validateCredentialHash(credentialHash) {
    try {
      console.log('Searching blockchain for hash:', credentialHash);

      const latestBlock = await this.provider.getBlockNumber();
      const searchBlocks = 10000;
      const fromBlock = Math.max(0, latestBlock - searchBlocks);
      
      console.log(`Searching blocks ${fromBlock} to ${latestBlock}`);
      
      for (let blockNumber = latestBlock; blockNumber >= fromBlock; blockNumber--) {
        try {
          const block = await this.provider.getBlock(blockNumber, true);
          if (!block || !block.transactions) continue;
          
          for (const tx of block.transactions) {
            if (tx.data && tx.data !== '0x') {
              try {
                const decodedData = ethers.toUtf8String(tx.data);
                if (decodedData.includes(`PROOFLY:${credentialHash}:`)) {
                  console.log('Hash found on blockchain in transaction:', tx.hash);
                  return true;
                }
              } catch (decodeError) {
                // Skip if data can't be decoded as UTF8
                continue;
              }
            }
          }
        } catch (blockError) {
          console.log('Error reading block:', blockNumber, blockError.message);
          continue;
        }
      }
      
      console.log('Hash not found on blockchain');
      return false;
    } catch (error) {
      console.error('Error validating hash on blockchain:', error);
      throw error;
    }
  }

  async getBalance() {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  getWalletAddress() {
    return this.wallet.address;
  }
}

export default new BlockchainService(); 