// utils/crypto-polyfill.ts
import { getRandomValues as expoCryptoGetRandomValues } from "expo-crypto";

class Crypto {
    getRandomValues(array: Uint8Array): Uint8Array {
        return expoCryptoGetRandomValues(array);
    }
}

const crypto = new Crypto();
export default crypto;
