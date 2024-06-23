import {executeOriginalFunction} from "../interceptors"
import {HandlerContext} from "../context";

export async function getTransactionByHash(method: string, params: any[], context: HandlerContext) {
	method = "eth_getInMessageByHash"
	params = [1, ...params];

	const result = await executeOriginalFunction(method,params,context);

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
