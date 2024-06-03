import { extendEnvironment } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "ethers";
import {WalletClient, LocalKeySigner} from "@nilfoundation/niljs"

extendEnvironment((hre: HardhatRuntimeEnvironment) => {
	const originalRequest = hre.network.provider.request.bind(hre.network.provider);

	hre.network.provider.request = async (args: { method: string, params?: any[] }) => {
		console.log(args.method);


		if (args.method === "eth_getBlockByNumber") {
			// Modify the parameters to add the first parameter 0
			args.params = [0, ...args.params];
		}

		if (args.method == "eth_getTransactionCount"){
			// Modify the parameters to add the first parameter 0
			args.params = [0, ...args.params];
			args.params[2]="latest";
		}

		if (args.method == "eth_call"){
			return "0x"
		}

		if (args.method == "eth_estimateGas"){
			return "0x0"
		}

		if(args.method == "eth_gasPrice"){
			return "0x0";
		}

		if (args.method === "eth_chainId") {
			return "0x0"; // Return chain ID as hex string
		}

		if (args.method == "eth_sendTransaction"){
			const client = new WalletClient({
				endpoint: "http://127.0.0.1:8529",
				signer: new LocalKeySigner({
					privateKey: "41285f03e8692676bf80a98e4052a008026427a7302ca97cb06edcd60689850b"
				}),
			});

			return await client.deployContract({
				deployData: {
					bytecode: args.params[0].data,
				},
			});
		}
		return originalRequest(args);
	};
});
