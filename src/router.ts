import express from "express";
import WalletController from "./controller/wallet.controller";
import HSMController from "./controller/hsm.controller";


const router = express.Router();

// @route   GET /wallet/getBalance/:walletAddress
// @desc    Get wallet balance
// @access  Public
router.get("/wallet/getBalance/:walletAddress", WalletController.getBalance);


// @route   GET /wallet/getTxnHistory/:walletAddress
// @desc    Get wallet latestTxInfo
// @access  Public
router.post("/wallet/getTxnHistory", WalletController.getTxnHistory);

// @route   GET /wallet/trackingStart/:walletAddress
// @desc    Get wallet start tracking
// @access  Public
router.get("/wallet/tracking/:walletAddress/:status", WalletController.startWalletTracking);

// @route   POST /wallet/derivePublicKey/ (privateKey is in header)
// @desc    Get public key from private key
// @access  Public
router.post("/hsm/derivePublicKey", HSMController.derivePublicKeyFromPrivateKey);

// @route   POST /wallet/deriveAddress/ (publicKey is in header)
// @desc    Get address from public key
// @access  Public
router.post("/hsm/deriveAddress", HSMController.deriveAddressFromPublicKey);

export default router;
