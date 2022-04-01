// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract RedMarketplace {
    struct ListingItem {
        // uint256 id;
        address tokenAddress;
        uint256 tokenId;
        address seller;
        uint256 askingPrice;
        bool isForSale;
    }

    // ListingItem[] public items;
    uint256 private _listingId = 0;
    mapping(uint256 => ListingItem) private items;

    event itemAdded();
    event itemSold();

    modifier OnlyItemOwner(address tokenAddress, uint256 tokenId) {
        IERC721 nftContract = IERC721(tokenAddress);
        require(nftContract.ownerOf(tokenId) == msg.sender);
        _;
    }

    modifier HasTransferApproval(address tokenAddress, uint256 tokenId) {
        IERC721 nftContract = IERC721(tokenAddress);
        require(nftContract.getApproved(tokenId) == msg.sender);
        _;
    }

    function listItem(
        uint256 tokenId,
        address tokenAddress,
        uint256 askingPrice,
        bool isForSale
    )
        external
        OnlyItemOwner(tokenAddress, tokenId)
        HasTransferApproval(tokenAddress, tokenId)
    {
        ListingItem memory listing = ListingItem(
            tokenAddress,
            tokenId,
            msg.sender,
            askingPrice,
            isForSale
        );
        items[_listingId] = listing;
        _listingId++;
    }

    function createOffer(uint256 listingId) external {
        ListingItem storage listing = items[listingId];
        require(listing.isForSale, "Listing is NOT accepting offer");
    }
}
