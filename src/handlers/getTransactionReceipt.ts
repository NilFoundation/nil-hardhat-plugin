import {executeOriginalFunction} from "../interceptors"
import {HandlerContext} from "../context";

export async function getTransactionReceipt(method: string, params: any[], context: HandlerContext) {
	const [preparedMethod, preparedParams] = prepareInput(method, params);
	const result = await executeOriginalFunction(preparedMethod, preparedParams, context);
	return adaptResponse(result, preparedParams);
}

function prepareInput(method: string, params: any[]): [string, any[]] {
	return ["eth_getInMessageReceipt", [1, ...params]];
}

function adaptResponse(result: any, params: any[]): any {
	if (!result) {
		return null;
	}

	result.hash = String(result.blockHash);
	result.blockNumber = String(result.blockNumber);
	result.status = typeof result.success === "boolean" ? (result.success ? "0x1" : "0x0") : result.success;
	result.contractAddress = result.contractAddress ? String(result.contractAddress) : null;
	result.gasUsed = String(result.gasUsed);
	result.logs = [];
	result.index = 1;
	result.hash = params[1]
	result.cumulativeGasUsed = result.gasUsed;

	return result;
}