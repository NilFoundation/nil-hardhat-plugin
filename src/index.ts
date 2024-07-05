import { extendEnvironment } from "hardhat/config";
import type { HardhatUserConfig } from "hardhat/types";
import { unifiedInterceptor } from "./interceptors";
import { setupWalletAndClient } from "./setup";

extendEnvironment(async (hre) => {
  const context = await setupWalletAndClient(hre);

  hre.network.provider.send = (method, params) => {
    context.isRequest = false;
    return unifiedInterceptor(method, params || [], context);
  };

  hre.network.provider.request = (args) => {
    context.isRequest = true;
    const safeParams = Array.isArray(args.params)
      ? args.params
      : args.params
        ? [args.params]
        : [];
    return unifiedInterceptor(args.method, safeParams, context);
  };
});

export interface NilHardhatUserConfig extends HardhatUserConfig {
  walletAddress?: string;
  gasLimit?: number;
  shardId?: number;
  directTxGasLimit?: number;
  directTxValue?: number;
  debug?: boolean;
}
