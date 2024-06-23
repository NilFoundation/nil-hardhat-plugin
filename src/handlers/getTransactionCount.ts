import {executeOriginalFunction} from "../interceptors"
import {HandlerContext} from "../context";
import {LocalECDSAKeySigner} from "@nilfoundation/niljs";
export async function getTransactionCount(method: string, params: any[], context: HandlerContext) {
	params = await prepareInput(params, context.signer);

	return await executeOriginalFunction(method, params, context);
}

async function prepareInput(params: any[], signer: LocalECDSAKeySigner):  Promise<any[]>  {
	const address = await signer.getAddress(1);  // Simulate async call if necessary
	return ["0x" + Buffer.from(address).toString('hex'), "latest"];
}