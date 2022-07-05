import Image from "next/image";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import { useCallback, useReducer } from "react";
import { providers } from "ethers";

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
      provider?: StateType["provider"];
      web3Provider?: StateType["web3Provider"];
      address?: StateType["address"];
    }
  | {
      type: "SET_ADDRESS";
      address?: StateType["address"];
    }
  | {
      type: "RESET_WEB3_PROVIDER";
    };

type StateType = {
  provider?: any;
  web3Provider?: any;
  address?: string;
};

const initialState: StateType = {
  provider: null,
  web3Provider: null,
  address: null,
};

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case "SET_WEB3_PROVIDER":
      return {
        ...state,
        provider: action.provider,
        web3Provider: action.web3Provider,
        address: action.address,
      };
    case "SET_ADDRESS":
      return {
        ...state,
        address: action.address,
      };
    case "RESET_WEB3_PROVIDER":
      return initialState;
    default:
      throw new Error();
  }
}

export default function Home(): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { provider, web3Provider, address } = state;

  const connect = useCallback(async function () {
    const provider = await web3Modal.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    dispatch({
      type: "SET_WEB3_PROVIDER",
      provider,
      web3Provider,
      address,
    });
  }, []);

  const disconnect = useCallback(
    async function () {
      await web3Modal.clearCachedProvider();
      if (provider?.disconnect && typeof provider.disconnect === "function") {
        await provider.disconnect();
      }
      dispatch({
        type: "RESET_WEB3_PROVIDER",
      });
    },
    [provider]
  );

  return (
    <>
      <div className="w-[400px] mx-auto">
        <div className="mx-auto">
          <Image src="/logo.png" width="400px" height="250px" />
        </div>
      </div>
      <div className="my-2">
        <h1 className="text-white text-3xl text-center">Rarity Migrator</h1>
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
        <div className="bg-light-silver text-center py-1 px-2 border-white border-2 rounded-lg max-w-[125px] mx-auto">
          <button onClick={connect}>
            <span className="text-lg">Connect</span>
          </button>
        </div>
      </div>
    </>
  );
}
