import type { HandlerContext } from "../context";
import { executeOriginalFunction } from "../interceptors";
import { shardNumber } from "../utils/conversion";

export async function getTransactionCount(
  method: string,
  params: any[],
  context: HandlerContext,
) {
  const preparedParams = await prepareInput(params, context);

  return await executeOriginalFunction(method, preparedParams, context);
}

async function prepareInput(
  params: any[],
  context: HandlerContext,
): Promise<any[]> {
  const address = await context.signer.getAddress(
    context.hre.config.shardId ?? shardNumber(context.wallet.getAddressHex()),
  ); // Simulate async call if necessary
  return [`0x${Buffer.from(address).toString("hex")}`, "latest"];
}
