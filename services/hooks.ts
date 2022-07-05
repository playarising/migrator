import { getSummonersIDs } from "./fetchers";
import useSWR, { SWRConfiguration } from "swr";

export function useGraphSummonerIDs(
  account: string,
  swrConfig: SWRConfiguration = undefined
) {
  const { data } = useSWR(account, () => getSummonersIDs(account), swrConfig);
  return data;
}
