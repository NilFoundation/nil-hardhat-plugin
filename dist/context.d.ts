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
    isRequest: boolean;
}
//# sourceMappingURL=context.d.ts.map