import { extendEnvironment } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {WalletV1, LocalECDSAKeySigner, HttpTransport,PublicClient, Faucet, externalDeploymentMessage} from "@nilfoundation/niljs"

function hexStringToUint8Array(hexString: string): Uint8Array {
	// Remove the '0x' prefix if it exists
	const cleanHexString = hexString.startsWith('0x') ? hexString.slice(2) : hexString;

	// Calculate the number of bytes
	const numBytes = cleanHexString.length / 2;

	// Create a Uint8Array with the correct length
	const byteArray = new Uint8Array(numBytes);

	// Convert each pair of hex characters to a byte
	for (let i = 0; i < numBytes; i++) {
		byteArray[i] = parseInt(cleanHexString.substr(i * 2, 2), 16);
	}

	return byteArray;
}
extendEnvironment(async (hre: HardhatRuntimeEnvironment) => {
	// Access the custom walletAddress
	const walletAddress = hre.config.walletAddress;

	const privateKey = hre.network.config.accounts[0];
	const url = hre.network.config.url;

	var client
	var OriginalSend
	var originalRequest
	var signer
	var wallet
	var pubKey
	var faucet
	if (privateKey != undefined){
		originalRequest = hre.network.provider.request.bind(hre.network.provider);
		OriginalSend = hre.network.provider.send.bind(hre.network.provider);
		client = new PublicClient({
			transport: new HttpTransport({
				endpoint: url,
			}),
			shardId: 1,
		});
		signer = new LocalECDSAKeySigner({
			privateKey: privateKey,
		});
		pubKey = await signer.getPublicKey();
		 wallet = new WalletV1({
			pubkey: pubKey,
			salt: 100n,
			shardId: 1,
			client,
			signer,
			address: walletAddress,
		});
		faucet = new Faucet(client);
	}

	hre.network.provider.send = async ( method: string, params?: any[] ) => {
		console.log(method)
		// Ensure params is always an array
		params = params || [];
		if (method == "eth_blockNumber"){
			return "0x0"
		}

		if (method == "eth_estimateGas"){
			return "0x0"
		}

		if (method == "eth_call"){

			// Ensure the transaction object exists and then set the gasLimit
			if (params[0]) {
				params[0].gasLimit = '0xf4240';
				params[0].from = params[0].to;
				params[0].value = 0;
			}

			console.log("Updated transaction parameters:", params);

			console.log(params)
			const result = await OriginalSend(method, params );


			console.log("RESULT: ", result)
		}

		if (method == "eth_sendTransaction"){
			console.log(params[0])
			const tx = await wallet.syncSendMessage({
				to: hexStringToUint8Array(params[0].to),
				gas: 1000000n,
				value: 0n,
				data: hexStringToUint8Array(params[0].data),
				deploy: false,
			});

			console.log(tx)

			return tx
		}
		if (method == "eth_getTransactionReceipt"){
			method = "eth_getInMessageReceipt"
			params = [1, ...params];
			const result =  await OriginalSend(method, params );
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
			result.logs = []
			result.index = 1
			result.hash = params[1]
			result.cumulativeGasUsed = result.gasUsed
			console.log(result)
			return result
		}



		if (method == "eth_getTransactionByHash"){
			method = "eth_getInMessageByHash"
			params = [1, ...params];

			const result =  await OriginalSend(method, params );
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

			result.nonce = result.seqno
			return result
		}


		console.log(params)
		const response = await OriginalSend(method, params );

		return response
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
			const value =await signer.getAddress(1)
			args.params[0]="0x"+Buffer.from(value).toString('hex');
			args.params[1]="latest";
		}

		if (args.method == "eth_call"){

			return "0x0";

		}

		if (args.method == "eth_blockNumber"){
			console.log("usaooo")
			args.method = "eth_getBlockByNumber"
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
			console.log("PARAMS: ", args.params[0])
			if (args.params[0].to == undefined){

			const chainId = await client.chainId();

			const deploymentMessage = externalDeploymentMessage(
				{
					salt: 100n,
					shard: 1,
					bytecode: hexStringToUint8Array(args.params[0].data)
				},
				chainId,
			);

			const addr = "0x"+Buffer.from(deploymentMessage.to).toString('hex')
			await faucet.withdrawTo(addr, 8000000n);
			while (true) {
				const balance = await client.getBalance(addr, "latest");
				if (balance > 0) {
					break;
				}
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
			await deploymentMessage.send(client);

			return "0x"+Buffer.from(deploymentMessage.hash()).toString('hex')
			}
		}

		return originalRequest(args);
	};
});
