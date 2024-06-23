"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensure0xPrefix = void 0;
function ensure0xPrefix(value) {
    return value.startsWith('0x') ? value : `0x${value}`;
}
exports.ensure0xPrefix = ensure0xPrefix;
