import { extendEnvironment } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {WalletClient, LocalKeySigner, HttpTransport} from "@nilfoundation/niljs"

extendEnvironment((hre: HardhatRuntimeEnvironment) => {

	const privateKey = hre.network.config.accounts[0];
	const url = hre.network.config.url;
	console.log(hre.network.config.accounts)
	var walletClient
	var originalRequest
	var signer
	if (privateKey != undefined){
		originalRequest = hre.network.provider.request.bind(hre.network.provider);
		signer = new LocalKeySigner({
			privateKey: privateKey,
		});
		walletClient = new WalletClient({
			shardId: 1,
			signer: new LocalKeySigner({
				privateKey: privateKey,
			}),
			transport: new HttpTransport({
				endpoint: url,
			}),
		});
	}

	hre.network.provider.request = async (args: { method: string, params?: any[] }) => {
		if (args.method === "eth_getBlockByNumber") {
			// Modify the parameters to add the first parameter 0
			args.params = [1, ...args.params];

			const response = await originalRequest(args);
			// Convert the number field to a hexadecimal string if present
			if ('number' in response && typeof response.number === 'number') {
				response.number = '0x' + response.number.toString(16);
			}

			return response;
		}


		if (args.method == "eth_getTransactionCount"){
			// Modify the parameters to add the first parameter 0
			args.params[0]=signer.getAddress(1)
			args.params[1]="latest";
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

		if (args.method == "eth_getTransactionReceipt"){
			args.method = "eth_getInMessageReceipt"
			args.params = [1, ...args.params];
			const result =  await originalRequest(args);
			if (!result) {
				return null;
			}

			// Ensure blockHash is a string
			if (typeof result.blockHash !== "string") {
				result.blockHash = String(result.blockHash);
			}

			// Ensure blockNumber is a string
			if (typeof result.blockNumber !== "string") {
				result.blockNumber = String(result.blockNumber);
			}

			// Ensure status is a hexadecimal string
			if (typeof result.success === "boolean") {
				result.status = result.success ? "0x1" : "0x0";
			} else if (result.success === "true") {
				result.status = "0x1";
			} else if (result.success === "false") {
				result.status = "0x0";
			}


			// Ensure contractAddress is null or a string
			if (result.contractAddress !== null && typeof result.contractAddress !== "string") {
				result.contractAddress = String(result.contractAddress);
			}

			// Ensure gasUsed is a string
			if (typeof result.gasUsed !== "string") {
				result.gasUsed = String(result.gasUsed);
			}

			return result
		}

		if (args.method == "eth_getTransactionByHash"){
			args.method = "eth_getInMessageByHash"
			args.params = [1, ...args.params];
			const result =  await originalRequest(args);
			if (!result) {
				return result;
			}

			// Ensure hash is a string
			if (typeof result.hash !== "string") {
				result.hash = String(result.hash);
			}

			// Ensure blockNumber is a string or null
			if (typeof result.blockNumber !== "string" && result.blockNumber !== null) {
				result.blockNumber = String(result.blockNumber);
			}

			// Ensure blockHash is a string or null
			if (typeof result.blockHash !== "string" && result.blockHash !== null) {
				result.blockHash = String(result.blockHash);
			}

			// Ensure gasPrice is a string or ensure maxFeePerGas and maxPriorityFeePerGas are strings
			if ("maxFeePerGas" in result) {
				if (typeof result.maxFeePerGas !== "string") {
					result.maxFeePerGas = String(result.maxFeePerGas);
				}
				if (typeof result.maxPriorityFeePerGas !== "string") {
					result.maxPriorityFeePerGas = String(result.maxPriorityFeePerGas);
				}
			} else {
				if (typeof result.gasPrice !== "string") {
					result.gasPrice = String(result.gasPrice);
				}
			}
			return result
		}

		if (args.method == "eth_sendTransaction"){
			console.log(args.params[0].data)
			const result = await walletClient.deployContract({
				deployData: {
					bytecode: args.params[0].data,
					shardId: 1,
				},
			});
			console.log(Buffer.from(result).toString('hex'))
			return "0x"+Buffer.from(result).toString('hex')
		}
		return originalRequest(args);
	};
});
