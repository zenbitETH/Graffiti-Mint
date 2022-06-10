import Portis from "@portis/web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Alert, Button, Card, Col, Input, List, Menu, Row } from "antd";
import "antd/dist/antd.css";
import Authereum from "authereum";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import { useEventListener } from "eth-hooks/events/useEventListener";
import Fortmatic from "fortmatic";
// https://www.npmjs.com/package/ipfs-http-client
// import { create } from "ipfs-http-client";
import React, { useCallback, useEffect, useState } from "react";
import ReactJson from "react-json-view";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
//import Torus from "@toruslabs/torus-embed"
import WalletLink from "walletlink";
import Web3Modal from "web3modal";
import "./App.css";
import { Account, Address, AddressInput, Contract, Faucet, GasGauge, Header, Ramp, ThemeSwitch } from "./components";
import { INFURA_ID, NETWORK, NETWORKS } from "./constants";
import { Transactor } from "./helpers";
import { useContractConfig } from "./hooks";
import logo from "./assets/Graffitilogo.svg"
import GM from "./assets/GM.svg"
// import Hints from "./Hints";

const { BufferList } = require("bl");
const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

const { ethers } = require("ethers");

/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/scaffold-eth/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS.localhost; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;

// EXAMPLE STARTING JSON:
const STARTING_JSON = {
  description: "It's actually a bison?",
  external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
  image: "https://austingriffith.com/images/paintings/kraken.jpg",
  name: "Buffalo",
  attributes: [
    {
      trait_type: "BackgroundColor",
      value: "green",
    },
    {
      trait_type: "Eyes",
      value: "googly",
    },
  ],
};

// helper function to "Get" from IPFS
// you usually go content.toString() after this...
const getFromIPFS = async hashToGet => {
  for await (const file of ipfs.get(hashToGet)) {
    console.log(file.path);
    if (!file.content) continue;
    const content = new BufferList();
    for await (const chunk of file.content) {
      content.append(chunk);
    }
    console.log(content);
    return content;
  }
};

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
//
// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
// Using StaticJsonRpcProvider as the chainId won't change see https://github.com/ethers-io/ethers.js/issues/901
const scaffoldEthProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://rpc.scaffoldeth.io:48544")
  : null;
const poktMainnetProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider(
      "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
    )
  : null;
const mainnetInfura = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
  : null;
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

// Coinbase walletLink init
const walletLink = new WalletLink({
  appName: "coinbase",
});

// WalletLink provider
const walletLinkProvider = walletLink.makeWeb3Provider(`https://mainnet.infura.io/v3/${INFURA_ID}`, 1);

// Portis ID: 6255fb2b-58c8-433b-a2c9-62098c05ddc9
/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  network: "mainnet", // Optional. If using WalletConnect on xDai, change network to "xdai" and add RPC info below for xDai chain.
  cacheProvider: true, // optional
  theme: "dark", // optional. Change to "dark" for a dark theme.
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        bridge: "https://polygon.bridge.walletconnect.org",
        infuraId: INFURA_ID,
        rpc: {
          1: `https://mainnet.infura.io/v3/${INFURA_ID}`, // mainnet // For more WalletConnect providers: https://docs.walletconnect.org/quick-start/dapps/web3-provider#required
          42: `https://kovan.infura.io/v3/${INFURA_ID}`,
          100: "https://dai.poa.network", // xDai
        },
      },
    },
    portis: {
      display: {
        logo: "https://user-images.githubusercontent.com/9419140/128913641-d025bc0c-e059-42de-a57b-422f196867ce.png",
        name: "Portis",
        description: "Connect to Portis App",
      },
      package: Portis,
      options: {
        id: "6255fb2b-58c8-433b-a2c9-62098c05ddc9",
      },
    },
    fortmatic: {
      package: Fortmatic, // required
      options: {
        key: "pk_live_5A7C91B2FC585A17", // required
      },
    },
    "custom-walletlink": {
      display: {
        logo: "https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0",
        name: "Coinbase",
        description: "Connect to Coinbase Wallet (not Coinbase App)",
      },
      package: walletLinkProvider,
      connector: async (provider, _options) => {
        await provider.enable();
        return provider;
      },
    },
    authereum: {
      package: Authereum, // required
    },
  },
});

function App(props) {
  const mainnetProvider =
    poktMainnetProvider && poktMainnetProvider._isProvider
      ? poktMainnetProvider
      : scaffoldEthProvider && scaffoldEthProvider._network
      ? scaffoldEthProvider
      : mainnetInfura;

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  const contractConfig = useContractConfig();

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });

  // Then read your DAI balance like:
  const myMainnetDAIBalance = useContractReader(mainnetContracts, "DAI", "balanceOf", [
    "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  ]);

  // keep track of a variable from the contract in the local React state:
  const balance = useContractReader(readContracts, "GraffitiMint", "balanceOf", [address]);
  console.log("🤗 balance:", balance);

  // 📟 Listen for broadcast events
  const transferEvents = useEventListener(readContracts, "GraffitiMint", "Transfer", localProvider, 1);
  console.log("📟 Transfer events:", transferEvents);

  //
  // 🧠 This effect will update graffitiMints by polling when your balance changes
  //
  const yourBalance = balance && balance.toNumber && balance.toNumber();
  const [graffitiMints, setGraffitiMints] = useState();

  useEffect(() => {
    const updateGraffitiMints = async () => {
      const collectibleUpdate = [];
      for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
        try {
          console.log("GEtting token index", tokenIndex);
          const tokenId = await readContracts.GraffitiMint.tokenOfOwnerByIndex(address, tokenIndex);
          console.log("tokenId", tokenId);
          const tokenURI = await readContracts.GraffitiMint.tokenURI(tokenId);
          console.log("tokenURI", tokenURI);

          const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
          console.log("ipfsHash", ipfsHash);

          const jsonManifestBuffer = await getFromIPFS(ipfsHash);

          try {
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
            console.log("jsonManifest", jsonManifest);
            collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: address, ...jsonManifest });
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setGraffitiMints(collectibleUpdate);
    };
    updateGraffitiMints();
  }, [address, yourBalance]);

  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (
      DEBUG &&
      mainnetProvider &&
      address &&
      selectedChainId &&
      yourLocalBalance &&
      yourMainnetBalance &&
      readContracts &&
      writeContracts &&
      mainnetContracts
    ) {
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
      console.log("🌎 mainnetProvider", mainnetProvider);
      console.log("🏠 localChainId", localChainId);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log("💵 yourLocalBalance", yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : "...");
      console.log("💵 yourMainnetBalance", yourMainnetBalance ? ethers.utils.formatEther(yourMainnetBalance) : "...");
      console.log("📝 readContracts", readContracts);
      console.log("🌍 DAI contract on mainnet:", mainnetContracts);
      console.log("💵 yourMainnetDAIBalance", myMainnetDAIBalance);
      console.log("🔐 writeContracts", writeContracts);
    }
  }, [
    mainnetProvider,
    address,
    selectedChainId,
    yourLocalBalance,
    yourMainnetBalance,
    readContracts,
    writeContracts,
    mainnetContracts,
  ]);

  let networkDisplay = "";
  if (NETWORKCHECK && localChainId && selectedChainId && localChainId !== selectedChainId) {
    const networkSelected = NETWORK(selectedChainId);
    const networkLocal = NETWORK(localChainId);
    if (selectedChainId === 1337 && localChainId === 31337) {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network ID"
            description={
              <div>
                You have <b>chain id 1337</b> for localhost and you need to change it to <b>31337</b> to work with
                HardHat.
                <div>(MetaMask -&gt; Settings -&gt; Networks -&gt; Chain ID -&gt; 31337)</div>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    } else {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network"
            description={
              <div>
                You have <b>{networkSelected && networkSelected.name}</b> selected and you need to be on{" "}
                <Button
                  onClick={async () => {
                    const ethereum = window.ethereum;
                    const data = [
                      {
                        chainId: "0x" + targetNetwork.chainId.toString(16),
                        chainName: targetNetwork.name,
                        nativeCurrency: targetNetwork.nativeCurrency,
                        rpcUrls: [targetNetwork.rpcUrl],
                        blockExplorerUrls: [targetNetwork.blockExplorer],
                      },
                    ];
                    console.log("data", data);

                    let switchTx;
                    // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
                    try {
                      switchTx = await ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: data[0].chainId }],
                      });
                    } catch (switchError) {
                      // not checking specific error code, because maybe we're not using MetaMask
                      try {
                        switchTx = await ethereum.request({
                          method: "wallet_addEthereumChain",
                          params: data,
                        });
                      } catch (addError) {
                        // handle "add" error
                      }
                    }

                    if (switchTx) {
                      console.log(switchTx);
                    }
                  }}
                >
                  <b>{networkLocal && networkLocal.name}</b>
                </Button>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    }
  } else {
    networkDisplay = (
      <div class="network">
        {targetNetwork.name}
      </div>
    );
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  let faucetHint = "";
  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;

  const [faucetClicked, setFaucetClicked] = useState(false);
  if (
    !faucetClicked &&
    localProvider &&
    localProvider._network &&
    localProvider._network.chainId == 31337 &&
    yourLocalBalance &&
    ethers.utils.formatEther(yourLocalBalance) <= 0
  ) {
    faucetHint = (
      <div style={{ padding: 16 }}>
        <Button
          type="primary"
          onClick={() => {
            faucetTx({
              to: address,
              value: ethers.utils.parseEther("0.01"),
            });
            setFaucetClicked(true);
          }}
        >
          💰 Grab funds from the faucet ⛽️
        </Button>
      </div>
    );
  }

  const [yourJSON, setYourJSON] = useState(STARTING_JSON);
  const [sending, setSending] = useState();
  const [ipfsHash, setIpfsHash] = useState();
  const [ipfsDownHash, setIpfsDownHash] = useState();
  const [downloading, setDownloading] = useState();
  const [ipfsContent, setIpfsContent] = useState();
  const [transferToAddresses, setTransferToAddresses] = useState({});
  const [minting, setMinting] = useState(false);
  const [count, setCount] = useState(1);

  // the json for the nfts
  const json = {
    1: {
      description: "Here comes the kraken. Painted by members of Querétaro City Police Department @Expo Arte Urbano 2016 in Santa Mónica 2 neighborhood.",
      external_url: "https://zenbit.mx", // <-- this can link to a page for the specific file too
      image: "https://bafybeifidd4bvvq52nnndn62abg6z6orbsbsdk7zjog5bq6auzlowyoozm.ipfs.nftstorage.link/Kraken.png",
      name: "Kraken Police",
      attributes: [
        {
          trait_type: "Artist",
          value: "Querétaro City Police",
        },
        {
          trait_type: "Event",
          value: "Expo Arte Urbano 2016",
        },
        {
          trait_type: "Location",
          value: "Parque Santa Mónica",
        },
        {
          trait_type: "City",
          value: "Querétaro",
        },
        {
          trait_type: "Country",
          value: "México",
        },
        {
          trait_type: "Energy Boost",
          value: 200,
        },
        {
          trait_type: "Chips Boost",
          value: 20,
        },
        {
          trait_type: "Country",
          value: "México",
        },
      ],
    },
    2: {
      description: "La respuesta esta en tu corazon reads in spanish for The answer is in your heart. Painted by Yamilet @Expo Arte Urbano 2016 in Santa Mónica 2 neighborhood.",
      external_url: "https://zenbit.mx", // <-- this can link to a page for the specific file too
      image: "https://bafybeifidd4bvvq52nnndn62abg6z6orbsbsdk7zjog5bq6auzlowyoozm.ipfs.nftstorage.link/answer.png",
      name: "The Answer",
      attributes: [
        {
          trait_type: "Artist",
          value: "Yamilet",
        },
        {
          trait_type: "Event",
          value: "Expo Arte Urbano 2016",
        },
        {
          trait_type: "Location",
          value: "Parque Santa Mónica",
        },
        {
          trait_type: "City",
          value: "Querétaro",
        },
        {
          trait_type: "Country",
          value: "México",
        },
        {
          trait_type: "Energy Boost",
          value: 500,
        },
        {
          trait_type: "Chips Boost",
          value: 200,
        },
        {
          trait_type: "Country",
          value: "México",
        },
      ],
    },
    3: {
      description: "The sleeping dragon now is awake and loud. Painted by Fausto @Expo Arte Urbano 2016 in Santa Mónica 2 neighborhood.",
      external_url: "https://zenbit.mx", // <-- this can link to a page for the specific file too
      image: "https://bafybeifidd4bvvq52nnndn62abg6z6orbsbsdk7zjog5bq6auzlowyoozm.ipfs.nftstorage.link/dragon.png",
      name: "Quetzalcoatl awakes",
      attributes: [
        {
          trait_type: "Artist",
          value: "Fausto",
        },
        {
          trait_type: "Event",
          value: "Expo Arte Urbano 2016",
        },
        {
          trait_type: "Location",
          value: "Parque Santa Mónica",
        },
        {
          trait_type: "City",
          value: "Querétaro",
        },
        {
          trait_type: "Country",
          value: "México",
        },
        {
          trait_type: "Energy Boost",
          value: 350,
        },
        {
          trait_type: "Chips Boost",
          value: 500,
        },
        {
          trait_type: "Country",
          value: "México",
        },
      ],
    },
    4: {
      description: "Leafs and flower shapes captured on graffiti. Painted by Anon @Expo Arte Urbano 2016 in Santa Mónica 2 neighborhood.",
      external_url: "https://zenbit.mx", // <-- this can link to a page for the specific file too
      image: "https://bafybeifidd4bvvq52nnndn62abg6z6orbsbsdk7zjog5bq6auzlowyoozm.ipfs.nftstorage.link/floral.png",
      name: "Floral Nature",
      attributes: [
        {
          trait_type: "Artist",
          value: "Fausto",
        },
        {
          trait_type: "Event",
          value: "Expo Arte Urbano 2016",
        },
        {
          trait_type: "Location",
          value: "Parque Santa Mónica",
        },
        {
          trait_type: "City",
          value: "Querétaro",
        },
        {
          trait_type: "Country",
          value: "México",
        },
        {
          trait_type: "Energy Boost",
          value: 100,
        },
        {
          trait_type: "Chips Boost",
          value: 0,
        },
        {
          trait_type: "Country",
          value: "México",
        },
      ],
    },
    5: {
      description: "The galaxy is playing in an infinite hula hoop loop. Painted by Dryms @Expo Arte Urbano 2016 in Santa Mónica 2 neighborhood.",
      external_url: "https://zenbit.mx", // <-- this can link to a page for the specific file too
      image: "https://bafybeifidd4bvvq52nnndn62abg6z6orbsbsdk7zjog5bq6auzlowyoozm.ipfs.nftstorage.link/hula.png",
      name: "The galaxy plays",
      attributes: [
        {
          trait_type: "Artist",
          value: "Dryms",
        },
        {
          trait_type: "Event",
          value: "Expo Arte Urbano 2016",
        },
        {
          trait_type: "Location",
          value: "Parque Santa Mónica",
        },
        {
          trait_type: "City",
          value: "Querétaro",
        },
        {
          trait_type: "Country",
          value: "México",
        },
        {
          trait_type: "Energy Boost",
          value: 500,
        },
        {
          trait_type: "Chips Boost",
          value: 500,
        },
        {
          trait_type: "Country",
          value: "México",
        },
      ],
    },
    6: {
      description: "Santa Monica 2 faces: the thug face and the uglier face. Painted by Fausto @Expo Arte Urbano 2016 in Santa Mónica 2 neighborhood.",
      external_url: "https://zenbit.mx", // <-- this can link to a page for the specific file too
      image: "https://bafybeifidd4bvvq52nnndn62abg6z6orbsbsdk7zjog5bq6auzlowyoozm.ipfs.nftstorage.link/santa.png",
      name: "Santa Monica",
      attributes: [
        {
          trait_type: "Artist",
          value: "Fausto",
        },
        {
          trait_type: "Event",
          value: "Expo Arte Urbano 2016",
        },
        {
          trait_type: "Location",
          value: "Parque Santa Mónica",
        },
        {
          trait_type: "City",
          value: "Querétaro",
        },
        {
          trait_type: "Country",
          value: "México",
        },
        {
          trait_type: "Energy Boost",
          value: 500,
        },
        {
          trait_type: "Chips Boost",
          value: 500,
        },
        {
          trait_type: "Country",
          value: "México",
        },
      ],
    },
    7: {
      description: "Spacetime will tear us appart. Painted by Juano Banano @Expo Arte Urbano 2016 in Santa Mónica 2 neighborhood.",
      external_url: "https://zenbit.mx", // <-- this can link to a page for the specific file too
      image: "https://bafybeifidd4bvvq52nnndn62abg6z6orbsbsdk7zjog5bq6auzlowyoozm.ipfs.nftstorage.link/spacetime.png",
      name: "Spacetime",
      attributes: [
        {
          trait_type: "Artist",
          value: "Juano Banano",
        },
        {
          trait_type: "Event",
          value: "Expo Arte Urbano 2016",
        },
        {
          trait_type: "Location",
          value: "Parque Santa Mónica",
        },
        {
          trait_type: "City",
          value: "Querétaro",
        },
        {
          trait_type: "Country",
          value: "México",
        },
        {
          trait_type: "Energy Boost",
          value: 500,
        },
        {
          trait_type: "Chips Boost",
          value: 500,
        },
        {
          trait_type: "Country",
          value: "México",
        },
      ],
    },
    8: {
      description: "Into the new wave. Painted by Anon @Expo Arte Urbano 2016 in Santa Mónica 2 neighborhood.",
      external_url: "https://zenbit.mx", // <-- this can link to a page for the specific file too
      image: "https://bafybeifidd4bvvq52nnndn62abg6z6orbsbsdk7zjog5bq6auzlowyoozm.ipfs.nftstorage.link/waves.png",
      name: "Waves",
      attributes: [
        {
          trait_type: "Artist",
          value: "Anon",
        },
        {
          trait_type: "Event",
          value: "Expo Arte Urbano 2016",
        },
        {
          trait_type: "Location",
          value: "Parque Santa Mónica",
        },
        {
          trait_type: "City",
          value: "Querétaro",
        },
        {
          trait_type: "Country",
          value: "México",
        },
        {
          trait_type: "Energy Boost",
          value: 100,
        },
        {
          trait_type: "Chips Boost",
          value: 100,
        },
        {
          trait_type: "Country",
          value: "México",
        },
      ],
    },
    9: {
      description: "This is not Yoda. Painted by Missael @Expo Arte Urbano 2016 in Santa Mónica 2 neighborhood.",
      external_url: "https://zenbit.mx", // <-- this can link to a page for the specific file too
      image: "https://bafybeifidd4bvvq52nnndn62abg6z6orbsbsdk7zjog5bq6auzlowyoozm.ipfs.nftstorage.link/yoda.png",
      name: "Not Yoda",
      attributes: [
        {
          trait_type: "Artist",
          value: "Missael",
        },
        {
          trait_type: "Event",
          value: "Expo Arte Urbano 2016",
        },
        {
          trait_type: "Location",
          value: "Parque Santa Mónica",
        },
        {
          trait_type: "City",
          value: "Querétaro",
        },
        {
          trait_type: "Country",
          value: "México",
        },
        {
          trait_type: "Energy Boost",
          value: 1000,
        },
        {
          trait_type: "Chips Boost",
          value: 1000,
        },
        {
          trait_type: "Country",
          value: "México",
        },
      ],
    },
  };

  const mintItem = async () => {
    // upload to ipfs
    const uploaded = await ipfs.add(JSON.stringify(json[count]));
    setCount(count + 1);
    console.log("Uploaded Hash: ", uploaded);
    const result = tx(
      writeContracts &&
        writeContracts.GraffitiMint &&
        writeContracts.GraffitiMint.mintItem(address, uploaded.path),
      update => {
        console.log("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          console.log(" 🍾 Transaction " + update.hash + " finished!");
          console.log(
            " ⛽️ " +
              update.gasUsed +
              "/" +
              (update.gasLimit || update.gas) +
              " @ " +
              parseFloat(update.gasPrice) / 1000000000 +
              " gwei",
          );
        }
      },
    );
  };

  let locale = {
    emptyText: (
    <div class="emptyBG">
      <div class="emoji">🚨</div>
      'Theres no Graffitis yet'<br/>
      <div class="press">press Mint NFT</div>
      
    </div>)
  };

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      {networkDisplay}
      <BrowserRouter >
        <div class="navs">
            <Link class="allGM" onClick={() => { setRoute("/"); }} to="/">
              Graffiti Mints
            </Link>
            <Link
              class="allGM2"
              onClick={() => {
                setRoute("/transfers");
              }}
              to="/transfers"
            >
              Transfers
            </Link>

        {/*<Menu.Item key="/ipfsup">
            <Link
              onClick={() => {
                setRoute("/ipfsup");
              }}
              to="/ipfsup"
            >
              IPFS Upload
            </Link>
          </Menu.Item>
          <Menu.Item key="/ipfsdown">
            <Link
              onClick={() => {
                setRoute("/ipfsdown");
              }}
              to="/ipfsdown"
            >
              IPFS Download
            </Link>
          </Menu.Item>
          <Menu.Item key="/debugcontracts">
            <Link
              onClick={() => {
                setRoute("/debugcontracts");
              }}
              to="/debugcontracts"
            >
              Debug Contracts
            </Link>
            </Menu.Item>*/}
        </div>
        <Switch>
          <Route exact path="/">
            <div class="capBT">
              <div
                disabled={minting}
                class="mintBT"
                onClick={() => {
                  mintItem();
                }}
              >
                <img height="150px" src={GM} />
                <div>Mint NFT</div>
              </div>
            </div>
            <div class="conLS" style={{margin: "auto"}}>
              <List
                locale={locale}
                
              
                dataSource={graffitiMints}
                renderItem={item => {
                  const id = item.id.toNumber();
                  return (
                    <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                      
                      <div class="graffitis">
                          <div class="nftitle" >
                            <span >#{id} {item.name}</span> 
                          <div class="owner">
                              owner:{" "}
                            <Address
                              address={item.owner}
                              ensProvider={mainnetProvider}
                              blockExplorer={blockExplorer}
                              fontSize={16}
                            />
                        </div>
                          </div>
                        
                      
                        <div>
                          <img class="GMGM" src={item.image} style={{ maxWidth: 350  }} />
                        </div>
                        <div class="descri">{item.description}</div>
                        <div>
                        
                        <AddressInput
                          ensProvider={mainnetProvider}
                          placeholder="transfer to address"
                          value={transferToAddresses[id]}
                          onChange={newValue => {
                            const update = {};
                            update[id] = newValue;
                            setTransferToAddresses({ ...transferToAddresses, ...update });
                          }}
                        />
                        <Button
                          onClick={() => {
                            console.log("writeContracts", writeContracts);
                            tx(writeContracts.GraffitiMint.transferFrom(address, transferToAddresses[id], id));
                          }}
                        >
                          Transfer
                        </Button>
                      </div>
                      </div>
                      
                    </List.Item>
                  );
                }}
              />
            </div>
          </Route>

          <Route path="/transfers">
            <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
              <List
                dataSource={transferEvents}
                renderItem={item => {
                  return (
                    <List.Item key={item[0] + "_" + item[1] + "_" + item.blockNumber + "_" + item.args[2].toNumber()}>
                      <span style={{ fontSize: 16, marginRight: 8 }}>#{item.args[2].toNumber()}</span>
                      <Address address={item.args[0]} ensProvider={mainnetProvider} fontSize={16} /> =&gt;
                      <Address address={item.args[1]} ensProvider={mainnetProvider} fontSize={16} />
                    </List.Item>
                  );
                }}
              />
            </div>
          </Route>

          <Route path="/ipfsup">
            <div style={{ paddingTop: 32, width: 740, margin: "auto", textAlign: "left" }}>
              <ReactJson
                style={{ padding: 8 }}
                src={yourJSON}
                theme="pop"
                enableClipboard={false}
                onEdit={(edit, a) => {
                  setYourJSON(edit.updated_src);
                }}
                onAdd={(add, a) => {
                  setYourJSON(add.updated_src);
                }}
                onDelete={(del, a) => {
                  setYourJSON(del.updated_src);
                }}
              />
            </div>

            <Button
              style={{ margin: 8 }}
              loading={sending}
              size="large"
              shape="round"
              type="primary"
              onClick={async () => {
                console.log("UPLOADING...", yourJSON);
                setSending(true);
                setIpfsHash();
                const result = await ipfs.add(JSON.stringify(yourJSON)); // addToIPFS(JSON.stringify(yourJSON))
                if (result && result.path) {
                  setIpfsHash(result.path);
                }
                setSending(false);
                console.log("RESULT:", result);
              }}
            >
              Upload to IPFS
            </Button>

            <div style={{ padding: 16, paddingBottom: 150 }}>{ipfsHash}</div>
          </Route>
          <Route path="/ipfsdown">
            <div style={{ paddingTop: 32, width: 740, margin: "auto" }}>
              <Input
                value={ipfsDownHash}
                placeHolder="IPFS hash (like QmadqNw8zkdrrwdtPFK1pLi8PPxmkQ4pDJXY8ozHtz6tZq)"
                onChange={e => {
                  setIpfsDownHash(e.target.value);
                }}
              />
            </div>
            <Button
              style={{ margin: 8 }}
              loading={sending}
              size="large"
              shape="round"
              type="primary"
              onClick={async () => {
                console.log("DOWNLOADING...", ipfsDownHash);
                setDownloading(true);
                setIpfsContent();
                const result = await getFromIPFS(ipfsDownHash); // addToIPFS(JSON.stringify(yourJSON))
                if (result && result.toString) {
                  setIpfsContent(result.toString());
                }
                setDownloading(false);
              }}
            >
              Download from IPFS
            </Button>

            <pre style={{ padding: 16, width: 500, margin: "auto", paddingBottom: 150 }}>{ipfsContent}</pre>
          </Route>
          <Route path="/debugcontracts">
            <Contract
              name="GraffitiMint"
              signer={userSigner}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              contractConfig={contractConfig}
            />
          </Route>
        </Switch>
      </BrowserRouter>

      

      {/*
      <ThemeSwitch /> 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userSigner={userSigner}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
        {faucetHint}
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: 
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[4, 4]}>
          <Col span={8}>
            <Ramp price={price} address={address} networks={NETWORKS} />
          </Col>

          <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
            <GasGauge gasPrice={gasPrice} />
          </Col>
          <Col span={8} style={{ textAlign: "center", opacity: 1 }}>
            <Button
              onClick={() => {
                window.open("https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA");
              }}
              size="large"
              shape="round"
            >
              <span style={{ marginRight: 8 }} role="img" aria-label="support">
                💬
              </span>
              Support
            </Button>
          </Col>
        </Row>
_
        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {
              faucetAvailable ? (
                <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
              ) : (
                ""
              )
            }
          </Col>
        </Row>
      </div>*/}
    </div>
  );
}

export default App;
