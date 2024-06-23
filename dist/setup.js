"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWalletAndClient = void 0;
const niljs_1 = require("@nilfoundation/niljs");
const hex_1 = require("./utils/hex");
function isStringArray(accounts) {
    return Array.isArray(accounts);
}
// Type guard to check if a network configuration is HTTP based
function isHttpNetworkConfig(config) {
    return 'url' in config;
}
// Function to setup the wallet and client
async function setupWalletAndClient(hre) {
    const networkName = "nil_cluster";
    const networkConfig = hre.config.networks[networkName];
    // Error handling if the network configuration is not HTTP or is missing
    if (!isHttpNetworkConfig(networkConfig)) {
        throw new Error(`${networkName} is not an HTTP network config or is misconfigured.`);
    }
    // URL is guaranteed to exist and be a string here
    const url = networkConfig.url;
    if (!isStringArray(networkConfig.accounts)) {
        throw new Error("Accounts configuration is not an array of strings.");
    }
    const privateKey = (0, hex_1.ensure0xPrefix)(networkConfig.accounts[0]);
    if (!privateKey) {
        throw new Error("No private key configured for the network.");
    }
    const walletAddress = hre.config.walletAddress ? (0, hex_1.ensure0xPrefix)(hre.config.walletAddress) : undefined;
    if (!walletAddress) {
        throw new Error("Wallet address is not configured.");
    }
    // Set up network components
    const client = new niljs_1.PublicClient({
        transport: new niljs_1.HttpTransport({ endpoint: url }),
        shardId: 1,
    });
    const signer = new niljs_1.LocalECDSAKeySigner({ privateKey });
    const pubKey = await signer.getPublicKey();
    const wallet = new niljs_1.WalletV1({
        pubkey: pubKey,
        salt: 100n,
        shardId: 1,
        client,
        signer,
        address: walletAddress,
    });
    const faucet = new niljs_1.Faucet(client);
    const originalRequest = hre.network.provider.request.bind(hre.network.provider);
    const originalSend = hre.network.provider.send.bind(hre.network.provider);
    return {
        hre,
        client,
        wallet,
        faucet,
        signer,
        originalSend,
        originalRequest,
        isRequest: false
    };
}
exports.setupWalletAndClient = setupWalletAndClient;
