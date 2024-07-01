import type { HandlerContext } from "../context";
import { executeOriginalFunction } from "../interceptors";
import { shardNumber } from "../utils/conversion";

export async function getBlockByNumber(
  method: string,
  params: any[],
  context: HandlerContext,
) {
  const preparedParams = prepareInput(params, context);
  const response = await executeOriginalFunction(
    method,
    preparedParams,
    context,
  );
  return adaptResponse(response);
}

function prepareInput(params: any[], context: HandlerContext): any[] {
  return [shardNumber(context.wallet.getAddressHex()), ...params];
}

function adaptResponse(response: any): any {
  if ("number" in response && typeof response.number === "number") {
    response.number = `0x${response.number.toString(16)}`;
  }
  return response;
}
