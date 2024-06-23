import { extendEnvironment } from "hardhat/config";
import { unifiedInterceptor } from "./interceptors";
import { setupWalletAndClient } from "./setup";
import { HardhatUserConfig } from 'hardhat/types';

extendEnvironment(async (hre) => {
	const context = await setupWalletAndClient(hre);

	hre.network.provider.send = (method, params) => {
		context.isRequest = false;
		return unifiedInterceptor(method, params|| [], context);
	};

	hre.network.provider.request = (args) => {
		context.isRequest = true;
		const safeParams = Array.isArray(args.params) ? args.params : (args.params ? [args.params] : []);
		return unifiedInterceptor(args.method, safeParams, context);
	};
});

export interface NilHardhatUserConfig extends HardhatUserConfig {
	walletAddress?: string;
}