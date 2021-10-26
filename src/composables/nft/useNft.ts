import useWeb3 from '@/services/web3/useWeb3';
import axios from 'axios';
import { nftContractService } from '@/services/nft/nft-contracts.service';

export default function useNft() {
  async function useNftImageUrl() {
    const { account } = useWeb3();
    if (!account.value) {
      return null;
    }
    const balance = await nftContractService.earlyLudwigNft.balanceOf(
      account.value
    );
    if (parseInt(balance) === 0) {
      return null;
    }

    // we just take the first nft
    const tokenId = await nftContractService.earlyLudwigNft.tokenOfOwnerByIndex(
      account.value,
      0
    );

    const ipfsMetadataUri = await nftContractService.earlyLudwigNft.tokenURI(
      tokenId
    );
    const metadataCid = ipfsMetadataUri.replace('ipfs://', '');
    const metadataResponse = await axios.get(
      `https://ipfs.io/ipfs/${metadataCid}`
    );
    const ipfsImageUri = metadataResponse.data.image;
    const imageCid = ipfsImageUri.replace('ipfs://', '');

    return `https://ipfs.io/ipfs/${imageCid}`;
  }
  return {
    useNftImage: useNftImageUrl
  };
}
