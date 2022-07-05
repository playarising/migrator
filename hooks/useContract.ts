import { Contract } from "ethers";
import { useMemo } from "react";
import { getContract } from "../functions/getContract";

import { RARITY_LIB } from "../constants";
import RARITY_LIB_ABI from "../constants/abi/rarity_library.json";

export function useContract(
  address: string | undefined,
  ABI: any,
  account: string,
  library
): Contract | null {
  return useMemo(() => {
    if (!address || !ABI || !library) return null;
    try {
      return getContract(address, ABI, library, account);
    } catch (error) {
      console.error("Failed to get contract", error);
      return null;
    }
  }, [address, ABI, library, account]);
}

export function useRarityLibContract(
  account: string,
  library
): Contract | null {
  return useContract(RARITY_LIB, RARITY_LIB_ABI, account, library);
}
