import type { HandlerContext } from "../context";

export async function chainId(
  method: string,
  params: any[],
  context: HandlerContext,
) {
  return "0x0";
}
