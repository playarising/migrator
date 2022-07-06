import { pager } from "./utils";
import { getSummoners } from "./queries";

export const rarity_graph = async (query, variables = {}) =>
  pager(
    "https://api.thegraph.com/subgraphs/name/rarity-adventure/rarity",
    query,
    variables
  );

export const getSummonersIDs = async (account: string) => {
  const ids = await rarity_graph(getSummoners, {
    owner: account.toLowerCase(),
  });
  return ids.summoners.map((s) => {
    return parseInt(s.id);
  });
};

export const getExperience = async (
  address: string
): Promise<{ migrated: boolean; success: boolean; experience: number }> => {
  const exp = await fetch("/api/check", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
  return await exp.json();
};

export const submitMigration = async (
  signature: string,
  address: string
): Promise<{ success: boolean }> => {
  const exp = await fetch("/api/submit", {
    method: "POST",
    body: JSON.stringify({ signature, address }),
  });
  return await exp.json();
};
