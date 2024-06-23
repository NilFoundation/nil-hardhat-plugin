import type { LocalECDSAKeySigner } from "@nilfoundation/niljs";
import type { HandlerContext } from "../context";
import { executeOriginalFunction } from "../interceptors";
export async function getTransactionCount(
  method: string,
  params: any[],
  context: HandlerContext,
) {
  const preparedParams = await prepareInput(params, context.signer);

  return await executeOriginalFunction(method, preparedParams, context);
}

async function prepareInput(
  params: any[],
  signer: LocalECDSAKeySigner,
): Promise<any[]> {
  const address = await signer.getAddress(1); // Simulate async call if necessary
  return [`0x${Buffer.from(address).toString("hex")}`, "latest"];
}
