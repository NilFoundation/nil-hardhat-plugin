import { waitTillCompleted } from "@nilfoundation/niljs";
import { bytesToHex } from "viem";
import type { HandlerContext } from "../context";
import { hexStringToUint8Array, shardNumber } from "../utils/conversion";

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
  const hash = await context.faucet.withdrawTo(
    `0x${Buffer.from(context.wallet.address).toString("hex")}`,
    context.gasLimit * 1000n,
  );
  await waitTillCompleted(
    context.client,
    shardNumber(context.wallet.getAddressHex()),
    `0x${Buffer.from(hash).toString("hex")}`,
  );

  const deployed = await context.wallet.deployContract({
    shardId:
      context.hre.config.shardId ?? shardNumber(context.wallet.getAddressHex()),
    bytecode: hexStringToUint8Array(params[0].data),
    args: [bytesToHex(context.wallet.pubkey)],
    salt: BigInt(Math.floor(Math.random() * 1024)),
    gas: context.gasLimit,
    value: context.gasLimit * 10n,
  });

  const receipt = await waitTillCompleted(
    context.client,
    shardNumber(context.wallet.getAddressHex()),
    deployed.hash,
  );

  return receipt[0].outMessages?.[0] ?? "";
}

async function handleDirectTransaction(
  params: any[],
  context: HandlerContext,
): Promise<any> {
  const hash = await context.wallet.sendMessage({
    to: hexStringToUint8Array(params[0].to),
    gas: 100000n,
    value: 82309960n,
    data: hexStringToUint8Array(params[0].data),
  });
  await waitTillCompleted(context.client, shardNumber(context.wallet.getAddressHex()), hash);

  return hash

}
