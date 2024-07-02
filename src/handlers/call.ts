import type { HandlerContext } from "../context";
import { executeOriginalFunction } from "../interceptors";

export async function call(
  method: string,
  params: any[],
  context: HandlerContext,
) {
  const preparedParams = prepareInput(params);

  // For contract deployment skip call, as we have async message from wallet
  if (preparedParams[0] && preparedParams[0].to === undefined) {
    return "0x0";
  }

  return await executeOriginalFunction(method, preparedParams, context);
}

function prepareInput(params: any[]): any[] {
  if (params[0].to !== undefined) {
    if (params[0]) {
      params[0].gasLimit = "1000000000";
      params[0].from = params[0].to;
      params[0].value = 0;
    }
  }
  return params;
}
