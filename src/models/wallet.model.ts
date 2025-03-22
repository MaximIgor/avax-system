import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const WalletSchema = new Schema({
    walletAddress: { type: String, required: true, unique: true },
    transactionLength: { type: Number, required: true },
    walletBalance: { type: Number },
    latestTxInfo: { type: Array },
    latestTx: { type: String },
});

const WalletTransaction = mongoose.model("Wallet", WalletSchema);

export default WalletTransaction;