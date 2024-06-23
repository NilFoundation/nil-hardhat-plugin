import { externalDeploymentMessage } from "@nilfoundation/niljs";
import type { HandlerContext } from "../context";
import { hexStringToUint8Array } from "../utils/conversion";

export async function sendTransaction(params: any[], context: HandlerContext) {
  if (params[0].to === undefined) {
    return prepareDeployment(params, context);
  }
  return handleDirectTransaction(params, context);
}
async function prepareDeployment(
  params: any[],
  context: HandlerContext,
): Promise<string> {
  const chainId = await context.client.chainId();
  const deploymentMessage = externalDeploymentMessage(
    {
      salt: 100n,
      shard: 1,
      bytecode: hexStringToUint8Array(params[0].data),
    },
    chainId,
  );

  await context.faucet.withdrawTo(
    `0x${Buffer.from(deploymentMessage.to).toString("hex")}`,
    8000000n,
  );
  while (true) {
    const balance = await context.client.getBalance(
      `0x${Buffer.from(deploymentMessage.to).toString("hex")}`,
      "latest",
    );
    if (balance > 0) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  await deploymentMessage.send(context.client);
  return `0x${Buffer.from(deploymentMessage.hash()).toString("hex")}`;
}

async function handleDirectTransaction(
  params: any[],
  context: HandlerContext,
): Promise<any> {
  return await context.wallet.syncSendMessage({
    to: hexStringToUint8Array(params[0].to),
    gas: 1000000n,
    value: 0n,
    data: hexStringToUint8Array(params[0].data),
  });
}
