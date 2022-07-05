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
