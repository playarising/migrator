import { MongoClient } from "mongodb";
import { ethers, utils } from "ethers";
import { RARITY_LIB, VERIFICATION_MESSAGE } from "../../constants";
import RARITY_LIB_ABI from "../../constants/abi/rarity_library.json";
import { getSummonersIDs } from "../../services/fetchers";
import { chunkArrayByNumber } from "../../functions/chunkArray";
import { expForLevel } from "../../functions/expForLevel";
import { calcNewExperience } from "../../functions/calcNewExperience";
import { Contract } from "@ethersproject/contracts";
import { ObjectID } from "bson";

async function items(lib: Contract, address: string): Promise<any[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const items = await lib.items1(address);
      resolve(
        items.map((value) => {
          return {
            token_id: parseInt(value.token_id.toString(), 10),
            base_type: value.base_type,
            item_type: value.item_type,
            crafted: value.crafted,
            crafter: parseInt(value.crafter.toString(), 10),
          };
        })
      );
    } catch (e) {
      reject(e);
    }
  });
}

async function summoners_full(lib: Contract, ids: number[]) {
  return new Promise(async (resolve, reject) => {
    try {
      const summoners = await lib?.summoners_full(ids);
      resolve(
        summoners.map((value, i) => {
          return {
            id: ids[i],
            ability_scores: {
              attributes: {
                _cha:
                  value.ability_scores.attributes._cha === 0
                    ? 8
                    : value.ability_scores.attributes._cha,
                _con:
                  value.ability_scores.attributes._con === 0
                    ? 8
                    : value.ability_scores.attributes._con,
                _dex:
                  value.ability_scores.attributes._dex === 0
                    ? 8
                    : value.ability_scores.attributes._dex,
                _int:
                  value.ability_scores.attributes._int === 0
                    ? 8
                    : value.ability_scores.attributes._int,
                _str:
                  value.ability_scores.attributes._str === 0
                    ? 8
                    : value.ability_scores.attributes._str,
                _wis:
                  value.ability_scores.attributes._wis === 0
                    ? 8
                    : value.ability_scores.attributes._wis,
              },
              created: value.ability_scores.created,
              modifiers: {
                _cha: value.ability_scores.modifiers._cha,
                _con: value.ability_scores.modifiers._con,
                _dex: value.ability_scores.modifiers._dex,
                _int: value.ability_scores.modifiers._int,
                _str: value.ability_scores.modifiers._str,
                _wis: value.ability_scores.modifiers._wis,
              },
              spent_points: parseInt(
                value.ability_scores.spent_points.toString()
              ),
              total_points: parseInt(
                value.ability_scores.total_points.toString()
              ),
            },
            base: {
              _class: parseInt(value.base.class.toString()),
              _level: parseInt(value.base.level.toString()),
              _log: parseInt(value.base.log.toString()),
              _name: value.base.name,
              _xp: parseInt(
                utils.formatUnits(value.base.xp.toString(), "ether")
              ),
            },
            gold: {
              balance: parseInt(utils.formatUnits(value.gold.balance, "ether")),
              claimable: parseInt(
                utils.formatUnits(value.gold.claimable, "ether")
              ),
              claimed: parseInt(utils.formatUnits(value.gold.claimed, "ether")),
            },
            materials: {
              balance: parseInt(value.materials[0].balance),
              scout: parseInt(value.materials[0].scout.toString()),
              log: parseInt(value.materials[0].log.toString()),
            },
            skills: {
              class_skills: value.skills.class_skills,
              skills: value.skills.skills,
              spent_points: parseInt(value.skills.spent_points.toString()),
              total_points: parseInt(value.skills.total_points.toString()),
            },
            misc: {
              daycare_days_paid: parseInt(
                value.misc.daycare_days_paid.toString()
              ),
            },
          };
        })
      );
    } catch (e) {
      reject(e);
    }
  });
}

export default async function handler(req, res) {
  const body = JSON.parse(req.body);
  if (!body.address || !body.signature) {
    res
      .status(200)
      .json({ success: false, error: "missing address or signature" });
    return;
  }

  const address = ethers.utils.verifyMessage(
    VERIFICATION_MESSAGE,
    body.signature
  );
  if (address !== body.address) {
    res.status(200).json({ success: false, error: "invalid signature" });
    return;
  }

  const connection = new MongoClient(process.env.DATABASE_URL);
  await connection.connect();

  const db = connection.db("arising");
  const query: { _id: any } = { _id: body.address.toLowerCase() };
  const data = await db.collection("experience").findOne(query);

  if (data) {
    res.status(200).json({ success: false, error: "migration already done" });
    return;
  }

  const ids = await getSummonersIDs(body.address.toLowerCase());

  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpcapi-tracing.fantom.network"
  );

  const lib = new ethers.Contract(RARITY_LIB, RARITY_LIB_ABI, provider);

  const items_data = await items(lib, address);

  const chunks: number[][] = chunkArrayByNumber(ids, 70);
  const fetchers = [];
  for (let chunk of chunks) {
    fetchers.push(summoners_full(lib, chunk));
  }
  const fetcherChunks = chunkArrayByNumber(fetchers, 5);
  let full_data = [];
  for (let fChunk of fetcherChunks) {
    const chunk_response = await Promise.all(fChunk);
    full_data = full_data.concat(...chunk_response);
  }
  const summoners_full_data = [].concat(...full_data);

  const levels = summoners_full_data
    .map((s) => expForLevel(s.base._level - 1))
    .reduce((a, b) => a + b, 0);
  const xp = summoners_full_data
    .map((s) => s.base._xp)
    .reduce((a, b) => a + b, 0);
  const gold = summoners_full_data
    .map((s) => s.gold.balance)
    .reduce((a, b) => a + b, 0);
  const material = summoners_full_data
    .map((s) => s.materials.balance)
    .reduce((a, b) => a + b, 0);

  const new_experience = calcNewExperience(
    summoners_full_data.length,
    gold,
    material,
    items_data.length,
    xp + levels
  );

  const experience = parseFloat(new_experience.toFixed(2));

  const insert: { _id?: any; experience: number } = {
    _id: body.address.toLowerCase(),
    experience,
  };

  await db.collection("experience").insertOne(insert);

  res.status(200).json({ success: true, experience });
}
