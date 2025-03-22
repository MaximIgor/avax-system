import { ethers } from "ethers";
import WalletTransaction from "../models/wallet.model";
import dotenv from 'dotenv';
dotenv.config()

const provider = new ethers.providers.JsonRpcProvider(
    "https://docs-demo.avalanche-mainnet.quiknode.pro/ext/bc/X"
);

var state: boolean;

export const WalletDBAccess = {
    saveWalletTrackingInfo: async (walletAddress: string, transactionLength: number, walletBalance: number, latestTxInfo: Array<Object>, latestTx: string) => {
        try {
            const wallet = new WalletTransaction({
                walletAddress,
                transactionLength,
                walletBalance,
                latestTxInfo,
                latestTx
            });
            await wallet.save();
            console.log(`Wallet Tracking History Saved.`);
        } catch (error) {
            console.log(`ERROR ---- ${error}`)
        }
    },
    updateWalletTrackingInfo: async (walletAddress: string, transactionLength: number, walletBalance: number, latestTxInfo: Array<Object>, latestTx: string) => {
        try {
            await WalletTransaction.updateOne({ walletAddress }, { $set: { transactionLength, walletBalance, latestTxInfo, latestTx } });
        } catch (error) {
            console.log(`ERROR ---- ${error}`)
        }
    },
    findWalletInfo: async (walletAddress: string) => {
        try {
            const result = await WalletTransaction.find({ walletAddress });
            return result.length > 0 ? result[0] : false;
        } catch (error) {
            console.log(`ERROR ---- ${error}`);
            return false;
        }
    }
}

export const walletTracking = async (walletAddress: string, status: string) => {
    try {
        if (status === 'start') {
            if (!state) {
                state = true;
                walletTracking(walletAddress, 'running');
            }
            return;
        }
        if (status === 'stop') {
            state = false;
            return;
        }
        if (!state) {
            return;
        }


        const existWallet = await WalletDBAccess.findWalletInfo(`${walletAddress}`);
        let nowCursor;
        if (existWallet !== false) {
            nowCursor = existWallet.transactionLength;
        } else {
            nowCursor = 0;
        }

        console.log(`Current Tx Cursor: ${nowCursor}`);

        const getBalanceParam = {
            "address": `${walletAddress}`,
            "assetID": "AVAX",
        };
        const geMyWalletBalance = await provider.send("avm.getBalance", [getBalanceParam]);
        if (existWallet !== false && geMyWalletBalance.balance / (10 ** 9) > (existWallet.walletBalance ?? 0)) {
            console.log(`DEPOSIT !!!`);
        }
        const walletTXHashs = {
            "address": `${walletAddress}`,
            "cursor": nowCursor,
            "assetID": "AVAX",
            "pageSize": 1024,    //  max 1024
        };

        const getTXHashsResult = await provider.send("avm.getAddressTxs", [walletTXHashs]);

        if (getTXHashsResult.txIDs === null) {
            // setTimeout(() => {
            walletTracking(walletAddress, status);
            // }, 60 * 1000)
            return
        };

        const params = {
            "txID": getTXHashsResult.txIDs[getTXHashsResult.txIDs.length - 1],
            "encoding": "json",
        };

        const getTXInfo = await provider.send("avm.getTx", [params]);

        const latestTxInfo = await getTXInfo.tx.unsignedTx.outputs.map((ele: any) => { return { address: ele.output.addresses[0], amount: ele.output.amount, time: Date.now().toString() } })
        const totalAmount = latestTxInfo.reduce((sum: number, ele: any) => sum + ele.amount, 0);

        if (existWallet === false) {
            await WalletDBAccess.saveWalletTrackingInfo(`${walletAddress}`, Number(getTXHashsResult.cursor) + 1, geMyWalletBalance.balance / (10 ** 9), latestTxInfo, getTXHashsResult.txIDs[getTXHashsResult.txIDs.length - 1]);
        } else {
            await WalletDBAccess.updateWalletTrackingInfo(`${walletAddress}`, Number(getTXHashsResult.cursor) + 1, geMyWalletBalance.balance / (10 ** 9), latestTxInfo, getTXHashsResult.txIDs[getTXHashsResult.txIDs.length - 1])
        }

        // console.log(`Transaction Info: ${JSON.stringify(latestTxInfo)}`);
        // console.log(`Total Amount: ${totalAmount / (10 ** 9)} avax`);

        // setTimeout(() => {
        walletTracking(walletAddress, status);
        // }, 60 * 1000)

    } catch (error) {
        console.log(`WALLET_TRCKING_ERROR === ${error}`)
        setTimeout(() => {
            walletTracking(walletAddress, status);
        }, 5 * 1000)
    }
}
