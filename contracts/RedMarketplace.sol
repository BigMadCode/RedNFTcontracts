// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RedMarketplace {
    using Counters for Counters.Counter;

    IERC20 redToken;
    address redMinterAddress = 0x2D001A055B29504D6C029fd4f46470b18D74bd17; // TODO

    struct ListingItem {
        uint256 itemId;
        address tokenAddress;
        uint256 tokenId;
        address payable owner;
        uint256 askingPrice;
        bool isForSale;
        uint256 royalty;
    }

    struct Offer {
        uint256 offerId;
        address creator;
        uint256 itemId;
        uint256 amount;
        bool isOfferOpen;
    }

    constructor() {
        redToken = IERC20(0x2D001A055B29504D6C029fd4f46470b18D74bd17); // Token Address
    }

    Counters.Counter private _listingIdCounter;
    Counters.Counter private _offerIdCounter;
    mapping(uint256 => ListingItem) private items;
    mapping(uint256 => Offer) private offers;

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
        bool isForSale,
        address owner
    )
        external
        OnlyItemOwner(tokenAddress, tokenId)
        HasTransferApproval(tokenAddress, tokenId)
    {
        require(askingPrice > 0, "Price must be at least 1 RED");
        uint256 listingId = _listingIdCounter.current();
        uint256 royalty = 10;
        if (msg.sender == redMinterAddress) {
            royalty = 30;
        }
        ListingItem memory listing = ListingItem(
            listingId,
            tokenAddress,
            tokenId,
            payable(owner),
            askingPrice,
            isForSale,
            royalty
        );
        items[listingId] = listing;
        _listingIdCounter.increment();
    }

    function updateAskingPrice(uint256 listingId, uint256 askingPrice)
        external
    {
        require(items[listingId].owner == msg.sender, "Unauthorized user");
        items[listingId].askingPrice = askingPrice;
    }

    function cancelListing(uint256 listingId) external {
        require(items[listingId].owner == msg.sender, "Unauthorized user");
        items[listingId].isForSale = false;
    }

    function createOffer(uint256 listingId, uint256 amount) external {
        ListingItem storage listing = items[listingId];
        require(listing.isForSale, "Listed item is NOT accepting offers");
        require(
            redToken.balanceOf(msg.sender) >= listing.askingPrice,
            "Insufficient RED token balance"
        );
        uint256 offerId = _offerIdCounter.current();
        Offer memory offer = Offer(
            offerId,
            msg.sender,
            listingId,
            amount,
            true
        );
        offers[offerId] = offer;
        uint256 royalty = (amount * listing.royalty) / 100;
        redToken.approve(items[listingId].owner, amount - royalty);
        redToken.approve(redMinterAddress, royalty);
    }

    function cancelOffer(uint256 offerId) external {
        require(offers[offerId].creator == msg.sender, "Unauthorized user");
        offers[offerId].isOfferOpen = false;
    }

    function getAllowance(address offerCreator) public view returns (uint256) {
        return redToken.allowance(offerCreator, msg.sender);
    }

    function acceptOffer(address _nftContract, uint256 offerId) external {
        Offer storage offer = offers[offerId];
        ListingItem storage listing = items[offer.itemId];
        require(listing.owner == msg.sender, "Unauthorized user");
        require(offer.isOfferOpen, "Offer is closed");
        require(
            offer.amount >= getAllowance(offer.creator),
            "Token transfer not approved by the offer creator"
        );
        uint256 royalty = (offer.amount * listing.royalty) / 100;
        redToken.transfer(msg.sender, offer.amount - royalty);
        redToken.transfer(redMinterAddress, royalty);
        IERC721(_nftContract).safeTransferFrom(
            msg.sender,
            offer.creator,
            listing.tokenId
        );
        items[offer.itemId].owner = payable(offer.creator);
    }

    function buyNow(
        address _nftContract,
        uint256 listingId,
        uint256 amount
    ) external {
        ListingItem storage listing = items[listingId];
        require(listing.isForSale, "Listed item is NOT for sale");
        require(amount >= listing.askingPrice, "Insufficient RED token amount");
        require(
            redToken.balanceOf(msg.sender) >= listing.askingPrice,
            "Insufficient RED token balance"
        );
        uint256 royalty = (listing.askingPrice * listing.royalty) / 100;
        redToken.transfer(listing.owner, listing.askingPrice - royalty);
        redToken.transfer(redMinterAddress, royalty);

        IERC721(_nftContract).safeTransferFrom(
            listing.owner,
            msg.sender,
            listing.tokenId
        );
        items[listingId].owner = payable(msg.sender);
    }
}
