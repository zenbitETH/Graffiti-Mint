/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");
const ipfsAPI = require("ipfs-http-client");

const ipfs = ipfsAPI({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",
});

const delayMS = 1000; // sometimes xDAI needs a 6000ms break lol 😅

const main = async () => {
  // ADDRESS TO MINT TO:
  const toAddress = "YOUR_FRONTEND_ADDRESS";

  console.log("\n\n 🎫 Minting to " + toAddress + "...\n");

  const { deployer } = await getNamedAccounts();
  const graffitiMint = await ethers.getContract("GraffitiMint", deployer);

  const kraken = {
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
  };
  console.log("Uploading kraken...");
  const uploaded = await ipfs.add(JSON.stringify(kraken));

  console.log("Minting kraken with IPFS hash (" + uploaded.path + ")");
  await graffitiMint.mintItem(toAddress, uploaded.path, {
    gasLimit: 400000,
  });

  await sleep(delayMS);

  const answer = {
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
  };
  console.log("Uploading answer...");
  const uploadedanswer = await ipfs.add(JSON.stringify(answer));

  console.log("Minting answer with IPFS hash (" + uploadedanswer.path + ")");
  await graffitiMint.mintItem(toAddress, uploadedanswer.path, {
    gasLimit: 400000,
  });

  await sleep(delayMS);

  const quetzalcoatl = {
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
  };
  console.log("Uploading quetzalcoatl...");
  const uploadedquetzalcoatl = await ipfs.add(JSON.stringify(quetzalcoatl));

  console.log("Minting quetzalcoatl with IPFS hash (" + uploadedquetzalcoatl.path + ")");
  await graffitiMint.mintItem(toAddress, uploadedquetzalcoatl.path, {
    gasLimit: 400000,
  });

  await sleep(delayMS);

  const floral = {
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
  };
  console.log("Uploading floral...");
  const uploadedfloral = await ipfs.add(JSON.stringify(floral));

  console.log("Minting floral with IPFS hash (" + uploadedfloral.path + ")");
  await graffitiMint.mintItem(toAddress, uploadedfloral.path, {
    gasLimit: 400000,
  });

  await sleep(delayMS);

  const hula = {
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
  };
  console.log("Uploading hula...");
  const uploadedhula = await ipfs.add(JSON.stringify(hula));

  console.log("Minting hula with IPFS hash (" + uploadedhula.path + ")");
  await graffitiMint.mintItem(toAddress, uploadedhula.path, {
    gasLimit: 400000,
  });

  await sleep(delayMS);

  const santa = {
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
  };
  console.log("Uploading santa...");
  const uploadedsanta = await ipfs.add(JSON.stringify(santa));

  console.log("Minting santa with IPFS hash (" + uploadedsanta.path + ")");
  await graffitiMint.mintItem(toAddress, uploadedsanta.path, {
    gasLimit: 400000,
  });

  const spacetime = {
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
  };
  console.log("Uploading spacetime...");
  const uploadedspacetime = await ipfs.add(JSON.stringify(spacetime));

  console.log("Minting spacetime with IPFS hash (" + uploadedspacetime.path + ")");
  await graffitiMint.mintItem(toAddress, uploadedspacetime.path, {
    gasLimit: 400000,
  });

  const waves = {
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
  };
  console.log("Uploading waves...");
  const uploadedwaves = await ipfs.add(JSON.stringify(waves));

  console.log("Minting waves with IPFS hash (" + uploadedwaves.path + ")");
  await graffitiMint.mintItem(toAddress, uploadedwaves.path, {
    gasLimit: 400000,
  });

  const notyoda = {
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
  };
  console.log("Uploading notyoda...");
  const uploadednotyoda = await ipfs.add(JSON.stringify(notyoda));

  console.log("Minting notyoda with IPFS hash (" + uploadednotyoda.path + ")");
  await graffitiMint.mintItem(toAddress, uploadednotyoda.path, {
    gasLimit: 400000,
  });

  console.log(
    "Transferring Ownership of GraffitiMint to " + toAddress + "..."
  );

  await graffitiMint.transferOwnership(toAddress, { gasLimit: 400000 });

  await sleep(delayMS);

  /*


  console.log("Minting answer...")
  await graffitiMint.mintItem("0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1","answer.jpg")

  */

  // const secondContract = await deploy("SecondContract")

  // const exampleToken = await deploy("ExampleToken")
  // const examplePriceOracle = await deploy("ExamplePriceOracle")
  // const smartContractWallet = await deploy("SmartContractWallet",[exampleToken.address,examplePriceOracle.address])

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
