import {executeOriginalFunction} from "../interceptors"
import {HandlerContext} from "../context";

export async function getBlockByNumber(method: string, params: any[], context: HandlerContext) {
	const preparedParams = prepareInput(params);
	const response = await executeOriginalFunction(method, preparedParams, context);
	return adaptResponse(response);
}

function prepareInput(params: any[]): any[] {
	return [1, ...params];
}

function adaptResponse(response: any): any {
	if ('number' in response && typeof response.number === 'number') {
		response.number = '0x' + response.number.toString(16);
	}
	return response;
}