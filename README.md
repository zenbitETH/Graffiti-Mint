# Graffiti Mint

Graffiti Mint is a dApp used to manage and sell NFTs from artwork created at an in person graffiti event in Querétaro city. Users that purchase a pass to events are granted early access to mint NFTs and help local artists to monetize their talent.

## Technologies Used

Frontend was built off of [scaffold-eth](https://github.com/scaffold-eth/scaffold-eth/tree/buyer-mints-nft) with private access to the minting page managed by [Unlock](https://unlock-protocol.com/)

[OpenZeppelin ERC721Enumerable](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721Enumerable.sol) was used for artwork NFTs

IPFS pinning via [Pinata](https://www.pinata.cloud/)

## Installation

```bash
git clone https://github.com/zenbitETH/Graffiti-Mint

cd Graffiti-Mint

git checkout buyer-mints-nft

yarn
```

> upload the default art to IPFS:

```bash

yarn upload

```

> install and start your 👷‍ Hardhat chain in another terminal:

```bash
cd buyer-mints-nft

yarn chain
```

> in a third terminal window, deploy all the things and start your 📱 frontend:

```bash
cd buyer-mints-nft

yarn deploy

yarn start
```

📱 Open http://localhost:3000 to see the app

---

## License

[MIT](https://choosealicense.com/licenses/mit/)
