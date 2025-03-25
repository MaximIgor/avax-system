import { MnemonicWallet, BN } from '@avalabs/avalanche-wallet-sdk';
import { ethers } from "ethers";
import { createHash } from "crypto";
import { bech32 } from "bech32";
import dotenv from 'dotenv';
const secp256k1 = require('tiny-secp256k1');

dotenv.config()

const provider = new ethers.providers.JsonRpcProvider(
    process.env.RPC_URL
);

export const transferAvax = async (fromSeedPhrse: string, to: string, amount: number) => {
    try {
        const fromWallet = MnemonicWallet.fromMnemonic(`${fromSeedPhrse}`);

        await fromWallet.updateUtxosX();
        // Ensure UTXOs are updated
        const utxos = fromWallet.getUtxosX();
        if (utxos.getAllUTXOs().length === 0) {
            throw new Error("No UTXOs available");
        }

        const realAmount = new BN(amount); //1 AVAX in nAVAX (1 AVAX = 10^9 nAVAX)
        const txID = await fromWallet.sendAvaxX(to, realAmount);
        console.log(`txID : https://avascan.info/blockchain/x/tx/${txID}`);

    } catch (error) {
        console.log(`ERROR - transferAvax ---${error}`)
    }
}

export const getTxnHistory = async (walletAddress: string, cursor: number, pageSize: number) => {
    try {
        const walletTXHashs = {
            "address": `${walletAddress}`,
            "cursor": cursor,
            "assetID": "AVAX",
            "pageSize": pageSize,    //  max 1024
        };
        const getTXHashsResult = await provider.send("avm.getAddressTxs", [walletTXHashs]);

        const params = {
            "txID": getTXHashsResult.txIDs[getTXHashsResult.txIDs.length - 1],
            "encoding": "json",
        };

        const getTXInfo = await provider.send("avm.getTx", [params]);

        const latestTxInfo = await getTXInfo.tx.unsignedTx.outputs.map((ele: any) => { return { address: ele.output.addresses[0], amount: ele.output.amount, time: Date.now().toString() } })
        const outAmount = latestTxInfo.reduce((sum: number, ele: any) => sum + ele.amount, 0);

        // console.log(`Transaction Info: ${JSON.stringify(latestTxInfo)}`);
        // console.log(`Total Amount: ${totalAmount / (10 ** 9)} avax`);
        return { latestTxInfo, outAmount: outAmount / (10 ** 9) }

    } catch (error) {
        console.log(`ERROR --getLatestTxInfo-- ${error}`)
    }
}
// export const getLatestTxInfo = async (walletAddress: string, cursor: number) => {
//     try {
//         console.log(`cursor =====================  ${cursor}`)
//         const walletTXHashs = {
//             "address": `${walletAddress}`,
//             "cursor": cursor,
//             "assetID": "AVAX",
//             "pageSize": 1024,    //  max 1024
//         };
//         const getTXHashsResult = await provider.send("avm.getAddressTxs", [walletTXHashs]);

//         const params = {
//             "txID": getTXHashsResult.txIDs[getTXHashsResult.txIDs.length - 1],
//             "encoding": "json",
//         };

//         const getTXInfo = await provider.send("avm.getTx", [params]);

//         const latestTxInfo = await getTXInfo.tx.unsignedTx.outputs.map((ele: any) => { return { address: ele.output.addresses[0], amount: ele.output.amount, time: Date.now().toString() } })
//         const outAmount = latestTxInfo.reduce((sum: number, ele: any) => sum + ele.amount, 0);

//         // console.log(`Transaction Info: ${JSON.stringify(latestTxInfo)}`);
//         // console.log(`Total Amount: ${totalAmount / (10 ** 9)} avax`);
//         return { latestTxInfo, outAmount: outAmount / (10 ** 9) }

//     } catch (error) {
//         console.log(`ERROR --getLatestTxInfo-- ${error}`)
//     }
// }



export const getBalance = async (walletAddress: string) => {
    try {
        const getBalanceParam = {
            "address": `${walletAddress}`,
            "assetID": "FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z",  // AVAX
        };
        const geMyWalletBalance = await provider.send("avm.getBalance", [getBalanceParam]);
        return geMyWalletBalance.balance / (10 ** 9);
    } catch (error) {
        console.log(`ERROR --getBalance-- ${error}`)
    }
}

export const derivePublicKeyFromPrivateKey = async (privateKeyHex: string) => {
    try {
        // Remove '0x' prefix if present
        privateKeyHex = privateKeyHex.replace('0x', '');
        
        if (!/^[0-9a-fA-F]{64}$/.test(privateKeyHex)) {
            throw new Error('Invalid private key format');
        }

        const privateKey = Buffer.from(privateKeyHex, 'hex');
        if (privateKey.length !== 32) {
            throw new Error('Invalid private key length after Buffer conversion');
        }

        const publicKey = Buffer.from(secp256k1.pointFromScalar(privateKey, false));

        return {
            publicKey: publicKey.toString('hex')
        };
    } catch (error) {
        throw new Error(`Address derivation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export const deriveAddressFromPublicKey = (publicKeyHex: string) => {
    try {
        if (!/^04[0-9a-fA-F]{128}$/.test(publicKeyHex) &&  // Uncompressed (65 bytes)
            !/^[0-9a-fA-F]{66}$/.test(publicKeyHex)) {     // Compressed (33 bytes)
            throw new Error('Invalid public key format');
        }

        let compressedKey = publicKeyHex;
        
        // Convert uncompressed to compressed if needed
        if (publicKeyHex.startsWith('04')) {
            const x = publicKeyHex.substring(2, 66);  // First 32 bytes (64 hex chars)
            const yHex = publicKeyHex.substring(66, 130);
            const yLastByte = Buffer.from(yHex.slice(-2), 'hex')[0]; // Get last byte as number
            const prefix = (yLastByte % 2 === 0) ? '02' : '03';
            compressedKey = prefix + x;
        }

        const publicKey = Buffer.from(compressedKey, 'hex');
        const sha256 = createHash('sha256').update(publicKey).digest();
        const ripemd160 = createHash('ripemd160').update(sha256).digest();

        const avaxWords = bech32.toWords(ripemd160);
        const xchainAddress = bech32.encode('avax', avaxWords).replace('avax1', 'X-avax1');

        return { xchainAddress };
    } catch (error) {
        throw new Error(`Address derivation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

