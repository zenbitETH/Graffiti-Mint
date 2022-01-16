# Graffiti Mint

Graffiti Mint is a dApp used to manage and sell NFTs from artwork created at an in person graffiti event in Querétaro city. Users that purchase a pass to events are granted early access to mint NFTs and help local artists to monetize their talent.

## Technologies Used

Frontend was built off of [scaffold-eth](https://github.com/scaffold-eth/scaffold-eth/tree/buyer-mints-nft) with private access to the minting page managed by [Unlock](https://unlock-protocol.com/)

[OpenZeppelin ERC721Enumerable](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721Enumerable.sol) was used for artwork NFTs

IPFS pinning via [Pinata](https://www.pinata.cloud/)

## NFThack 2022 Contracts
[🧪 Rinkenby testnet 🧪](https://rinkeby.etherscan.io/address/0xb21ce070d62a2a98cfcf1d105b70e37c3feacd5e)

[🌌 Polygon Mainnet 🌌](https://polygonscan.com/tx/0xd7ffe03f0e85ad748400bd8be03338548fa30822c0b6771727906f8394dcd87b)

## Installation

From root:

```bash
yarn install
yarn upload
yarn deploy
yarn start
```

📱 Open http://localhost:3000 to see the app

Set your Metamask or other wallet to Rinkeby to mint!

---

## License

[MIT](https://choosealicense.com/licenses/mit/)
