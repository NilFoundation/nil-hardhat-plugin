"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionCount = void 0;
const interceptors_1 = require("../interceptors");
async function getTransactionCount(method, params, context) {
    params = await prepareInput(params, context.signer);
    return await (0, interceptors_1.executeOriginalFunction)(method, params, context);
}
exports.getTransactionCount = getTransactionCount;
async function prepareInput(params, signer) {
    const address = await signer.getAddress(1); // Simulate async call if necessary
    return ["0x" + Buffer.from(address).toString('hex'), "latest"];
}
