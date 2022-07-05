import Image from "next/image";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import { useCallback, useEffect, useReducer, useState } from "react";
import { providers } from "ethers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faGithub,
  faTelegramPlane,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { shortenAddress } from "../functions/format";
import { useGraphSummonerIDs } from "../services/hooks";
import useRarityLibrary from "../hooks/useRarityLibrary";
import { chunkArrayByNumber } from "../functions/chunkArray";
import Loader from "../components/Loader";
import { expForLevel } from "../functions/expForLevel";

const INFURA_ID = "460f40a260564ac4a4f4b3fffb032dad";

const opts = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: INFURA_ID,
    },
  },
};

let web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    providerOptions: opts,
  });
}

type ActionType =
  | {
      type: "SET_WEB3_PROVIDER";
      instance?: StateType["instance"];
      provider?: StateType["provider"];
      address?: StateType["address"];
      chainId?: StateType["chainId"];
    }
  | {
      type: "SET_CHAIN_ID";
      chainId?: StateType["chainId"];
    }
  | {
      type: "SET_ADDRESS";
      address?: StateType["address"];
    }
  | {
      type: "RESET_WEB3_PROVIDER";
    };

type StateType = {
  instance?: any;
  provider?: any;
  address?: string;
  chainId?: number;
};

const initialState: StateType = {
  instance: null,
  provider: null,
  address: null,
  chainId: null,
};

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case "SET_WEB3_PROVIDER":
      return {
        ...state,
        instance: action.instance,
        provider: action.provider,
        address: action.address,
        chainId: action.chainId,
      };
    case "SET_ADDRESS":
      return {
        ...state,
        address: action.address,
      };
    case "SET_CHAIN_ID":
      return {
        ...state,
        chainId: action.chainId,
      };
    case "RESET_WEB3_PROVIDER":
      return initialState;
    default:
      throw new Error();
  }
}

export default function Home(): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { instance, provider, address, chainId } = state;

  const connect = useCallback(async function () {
    const instance = await web3Modal.connect();
    const provider = new providers.Web3Provider(instance);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    dispatch({
      type: "SET_WEB3_PROVIDER",
      instance,
      provider,
      address,
      chainId: network.chainId,
    });
  }, []);

  const disconnect = useCallback(
    async function () {
      await web3Modal.clearCachedProvider();
      if (instance?.disconnect && typeof instance.disconnect === "function") {
        await instance.disconnect();
      }
      dispatch({
        type: "RESET_WEB3_PROVIDER",
      });
    },
    [provider]
  );

  useEffect(() => {
    if (instance?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        dispatch({
          type: "SET_ADDRESS",
          address: accounts[0],
        });
      };

      const handleChainChanged = (_hexChainId: string) => {
        console.log(_hexChainId);
        dispatch({
          type: "SET_CHAIN_ID",
          chainId: parseInt(_hexChainId, 16),
        });
      };

      const handleDisconnect = async () => {
        await disconnect();
      };

      instance.on("accountsChanged", handleAccountsChanged);
      instance.on("chainChanged", handleChainChanged);
      instance.on("disconnect", handleDisconnect);

      return () => {
        if (instance.removeListener) {
          instance.removeListener("accountsChanged", handleAccountsChanged);
          instance.removeListener("chainChanged", handleChainChanged);
          instance.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [instance, disconnect]);

  const ids = useGraphSummonerIDs(address);

  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<{
    summoners: number;
    gold: number;
    material: number;
    total_experience: number;
    items: number;
  }>({
    summoners: 0,
    gold: 0,
    material: 0,
    total_experience: 0,
    items: 0,
  });

  const { summoners_full, items } = useRarityLibrary(address, provider);

  const fetch_data = useCallback(
    async (ids, address) => {
      const items_data = await items(address);
      const chunks: number[][] = chunkArrayByNumber(ids, 50);
      const fetchers = [];
      for (let chunk of chunks) {
        fetchers.push(summoners_full(chunk));
      }
      const fetcherChunks = chunkArrayByNumber(fetchers, 10);
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
      setData({
        summoners: summoners_full_data.length,
        items: items_data.length,
        total_experience: xp + levels,
        gold,
        material,
      });

      setLoading(false);
    },
    [summoners_full, items]
  );

  useEffect(() => {
    if (!ids || !address || !provider || chainId !== 250) return;
    fetch_data(ids, address);
  }, [ids, address, chainId]);

  return (
    <>
      <div className="w-[400px] mx-auto">
        <div className="mx-auto mt-20">
          <Image src="/logo.png" width="400px" height="127px" />
        </div>
      </div>
      <div className="text-white text-3xl gap-x-3 flex flex-row justify-center">
        <a href="https://github.com/playarising" target="_blank">
          <FontAwesomeIcon icon={faGithub} />
        </a>
        <a href="https://t.me/playarising" target="_blank">
          <FontAwesomeIcon icon={faTelegramPlane} />
        </a>
        <a href="https://twitter.com/PlayArising" target="_blank">
          <FontAwesomeIcon icon={faTwitter} />
        </a>
        <a href="https://instagram.com/PlayArising" target="_blank">
          <FontAwesomeIcon icon={faInstagram} />
        </a>
      </div>
      <div>
        <h1 className="text-white text-3xl text-center mt-10">
          Rarity Migrator
        </h1>
      </div>
      <div className="mx-10">
        <div className="mt-10 px-10 border-white border-2 rounded-lg max-w-[800px] mx-auto bg-dark-silver">
          <p className="text-white text-sm text-center my-2">
            This tool will help you convert all your Rarity Manifested assets
            into Arising.
          </p>
          <p className="text-white text-sm text-center my-2">
            None of your rarity elements will be burned or transferred. This
            tool will only count them and convert them to EXPERIENCE that can be
            used later to one or multiple Arising characters once the game is
            available.
          </p>
        </div>
      </div>
      <div className="mt-10 mx-auto text-dark">
        {provider ? (
          chainId !== 250 ? (
            <>
              <div className="mx-10 my-5">
                <div className="px-10 border-white border-2 rounded-lg max-w-[350px] mx-auto bg-red-800">
                  <p className="text-white text-sm text-center my-2">
                    Connect to the Fantom Network
                  </p>
                </div>
              </div>
              <div className="bg-light-silver text-center py-1 px-2 border-white border-2 rounded-lg max-w-[125px] mx-auto">
                <button onClick={disconnect}>
                  <span className="text-lg">Disconnect</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mx-10 my-5">
                <div className="px-10 border-white border-2 rounded-lg max-w-[200px] mx-auto bg-dark-silver">
                  <p className="text-white text-sm text-center my-2">
                    {shortenAddress(address)}
                  </p>
                </div>
              </div>
              {loading ? (
                <div className="flex flex-row justify-center text-lg">
                  <Loader />
                </div>
              ) : (
                <>
                  <div className="mx-10 my-5 text-white text-center text-xl">
                    <h1>Rarity Assets</h1>
                  </div>
                  <div className="flex flex-row justify-center text-white gap-x-5 my-5">
                    <div className="text-center">
                      <h1>Summoners</h1>
                      <p>{data.summoners}</p>
                    </div>
                    <div className="text-center">
                      <h1>Total Experience</h1>
                      <p>{data.total_experience.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <h1>Total Gold</h1>
                      <p>{data.gold.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-row justify-center text-white gap-x-5 my-5">
                    <div className="text-center">
                      <h1>Total Material</h1>
                      <p>{data.material.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <h1>Items</h1>
                      <p>{data.items}</p>
                    </div>
                  </div>
                  <div className="bg-light-silver text-center py-1 px-2 border-white border-2 rounded-lg max-w-[125px] mx-auto">
                    <button onClick={disconnect}>
                      <span className="text-lg">Disconnect</span>
                    </button>
                  </div>
                </>
              )}
            </>
          )
        ) : (
          <div className="bg-light-silver text-center py-1 px-2 border-white border-2 rounded-lg max-w-[125px] mx-auto">
            <button onClick={connect}>
              <span className="text-lg">Connect</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
