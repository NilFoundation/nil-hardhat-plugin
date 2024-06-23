import { PublicClient, WalletV1, Faucet, LocalECDSAKeySigner } from "@nilfoundation/niljs";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export interface HandlerContext {
	hre: HardhatRuntimeEnvironment;
	client: PublicClient;
	wallet: WalletV1;
	faucet: Faucet;
	signer: LocalECDSAKeySigner;
	originalSend: Function;
	originalRequest: Function;
	isRequest: boolean;  // Field indicating if the original call was a request or send
}
