import { Response, Request } from "express";
import { derivePublicKeyFromPrivateKey, deriveAddressFromPublicKey } from "../utils";

const HSMController = {
    derivePublicKeyFromPrivateKey: async (req: Request, res: Response) => {
        try {
            const { privateKey } = req.body
            if (!privateKey) {
                res.status(400).json({
                    success: false,
                    error: 'Private key is missing from headers. Please include privateKey header.'
                });
                return;
            }
            const result = await derivePublicKeyFromPrivateKey(privateKey);
            res.json({
                success: true,
                publicKey: result.publicKey
            });
        } catch (error) {
            console.error(`Error: ${error}`);
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Key derivation failed'
            });
        }
    },

    deriveAddressFromPublicKey: async (req: Request, res: Response) => {
        try {
            const { publicKey } = req.body;
            if (!publicKey) {
                res.status(400).json({
                    success: false,
                    error: 'Private key is missing from headers. Please include publicKey header.'
                });
                return;
            }
            const result = deriveAddressFromPublicKey(publicKey);
            res.json({
                success: true,
                xchainAddress: result.xchainAddress
            });
        } catch (error) {
            console.error(`Error: ${error}`);
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Address derivation failed'
            });
        }
    }
};

export default HSMController;