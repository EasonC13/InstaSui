function getViewerReplyMarkup(nftId, network) {
  if (network == "mainnet") {
    return {
      inline_keyboard: [
        [
          {
            text: "View on Explorer",
            url: `https://suiexplorer.com/object/${nftId}?network=${network}`,
          },
        ],
        [
          {
            text: "View on Marketplace",
            url: `https://sui.bluemove.net/nft-detailt/${nftId}`,
          },
        ],
      ],
    };
  } else {
    return {
      inline_keyboard: [
        [
          {
            text: "View on Explorer",
            url: `https://suiexplorer.com/object/${nftId}?network=https%3A%2F%2Fsui-${network}-endpoint.blockvision.org`,
          },
        ],
      ],
    };
  }
}
export { getViewerReplyMarkup };
