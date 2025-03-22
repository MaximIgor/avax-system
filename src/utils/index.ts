import { MnemonicWallet, BN } from '@avalabs/avalanche-wallet-sdk';
import { ethers } from "ethers";
import dotenv from 'dotenv';
dotenv.config()

const provider = new ethers.providers.JsonRpcProvider(
    "https://docs-demo.avalanche-mainnet.quiknode.pro/ext/bc/X"
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

