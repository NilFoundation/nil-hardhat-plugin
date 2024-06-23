import { HandlerContext } from './context';
import { HardhatRuntimeEnvironment, NetworkConfig, HttpNetworkConfig,HttpNetworkAccountsConfig } from "hardhat/types";
import { LocalECDSAKeySigner, HttpTransport, PublicClient, Faucet, WalletV1 } from "@nilfoundation/niljs";
import {ensure0xPrefix} from "./utils/hex"

function isStringArray(accounts: HttpNetworkAccountsConfig): accounts is string[] {
	return Array.isArray(accounts);
}


// Type guard to check if a network configuration is HTTP based
function isHttpNetworkConfig(config: NetworkConfig): config is HttpNetworkConfig {
	return 'url' in config;
}

// Function to setup the wallet and client
export async function setupWalletAndClient(hre: HardhatRuntimeEnvironment): Promise<HandlerContext> {
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

	const privateKey = ensure0xPrefix(networkConfig.accounts[0]);
	if (!privateKey) {
		throw new Error("No private key configured for the network.");
	}

	const walletAddress = hre.config.walletAddress ? ensure0xPrefix(hre.config.walletAddress) : undefined;
	if (!walletAddress) {
		throw new Error("Wallet address is not configured.");
	}

	// Set up network components
	const client = new PublicClient({
		transport: new HttpTransport({ endpoint: url }),
		shardId: 1,
	});

	const signer = new LocalECDSAKeySigner({ privateKey });
	const pubKey = await signer.getPublicKey();
	const wallet = new WalletV1({
		pubkey: pubKey,
		salt: 100n,
		shardId: 1,
		client,
		signer,
		address: walletAddress,
	});
	const faucet = new Faucet(client);

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