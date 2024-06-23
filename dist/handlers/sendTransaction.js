"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTransaction = void 0;
const conversion_1 = require("../utils/conversion");
const niljs_1 = require("@nilfoundation/niljs");
async function sendTransaction(params, context) {
    if (params[0].to === undefined) {
        return prepareDeployment(params, context);
    }
    else {
        return handleDirectTransaction(params, context);
    }
}
exports.sendTransaction = sendTransaction;
async function prepareDeployment(params, context) {
    const chainId = await context.client.chainId();
    const deploymentMessage = (0, niljs_1.externalDeploymentMessage)({
        salt: 100n,
        shard: 1,
        bytecode: (0, conversion_1.hexStringToUint8Array)(params[0].data)
    }, chainId);
    await context.faucet.withdrawTo(`0x${Buffer.from(deploymentMessage.to).toString('hex')}`, 8000000n);
    while (true) {
        const balance = await context.client.getBalance(`0x${Buffer.from(deploymentMessage.to).toString('hex')}`, "latest");
        if (balance > 0) {
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    await deploymentMessage.send(context.client);
    return "0x" + Buffer.from(deploymentMessage.hash()).toString('hex');
}
async function handleDirectTransaction(params, context) {
    return await context.wallet.syncSendMessage({
        to: (0, conversion_1.hexStringToUint8Array)(params[0].to),
        gas: 1000000n,
        value: 0n,
        data: (0, conversion_1.hexStringToUint8Array)(params[0].data),
    });
}
