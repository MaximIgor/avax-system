import { Response, Request } from "express";
import { walletTracking } from "../services/wallet.services";
import { getBalance, getTxnHistory } from "../utils";

const WalletController = {
    getBalance: async (req: Request, res: Response) => {
        try {
            const { walletAddress } = req.params;
            const result = await getBalance(walletAddress);
            if (result) {
                res.json({ message: "Wallet balance Successful", result });
            } else {
                res.status(404).json({ message: "Wallet not found" });
            }
        } catch (error) {
            console.log(`Error - getBalance ----- ${error}`)
        }
    },

    getTxnHistory: async (req: Request, res: Response) => {
        try {
            const { walletAddress, cursor, pageSize } = req.body;
            const result = await getTxnHistory(walletAddress, cursor, pageSize);
            res.json({ message: "Latest Tx Info Successful", result });
        } catch (error) {
            console.log(`Error - getLatestTxInfo ----- ${error}`)
        }
    },
    // getLatestTxInfo: async (req: Request, res: Response) => {
    //     try {
    //         const { walletAddress } = req.params;
    //         const result = await WalletDBAccess.findWalletInfo(walletAddress);
    //         if (result) {
    //             const latestTxInfo = await getLatestTxInfo(walletAddress, result.transactionLength - 1);
    //             res.json({ message: "Latest Tx Info Successful", result: latestTxInfo });
    //         } else {
    //             res.status(404).json({ message: "Wallet not found" });
    //         }
    //     } catch (error) {
    //         console.log(`Error - getLatestTxInfo ----- ${error}`)
    //     }
    // },

    startWalletTracking: async (req: Request, res: Response) => {
        try {
            const { walletAddress, status } = req.params;
            if (status === `start` || status === `stop`) {
                walletTracking(walletAddress, status);
                res.json({ message: `Wallet Tracking ${status}ed.` });
            } else {
                res.json({ message: `Invaild Command.` });
            }
        } catch (error) {
            console.log(`Error - getLatestTxInfo ----- ${error}`)
        }
    }
};

export default WalletController;