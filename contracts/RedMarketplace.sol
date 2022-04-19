// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RedMarketplace {
    using Counters for Counters.Counter;

    IERC20 redToken;
    address redMinterAddress = 0x01Dc00E095788275224187812B3f92f5eF8dD069; // TODO

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

    constructor(address redTokenAddress) {
        redToken = IERC20(redTokenAddress); // Token Address
    }

    Counters.Counter private _listingIdCounter;
    Counters.Counter private _offerIdCounter;
    mapping(uint256 => ListingItem) private items;
    mapping(uint256 => Offer) private offers;

    event itemAdded(ListingItem item);
    event listingUpdated(ListingItem item);
    event itemSold();
    event offerCreated(Offer offer);
    event offerCancelled(Offer offer);

    modifier OnlyItemOwner(address tokenAddress, uint256 tokenId) {
        IERC721 nftContract = IERC721(tokenAddress);
        require(nftContract.ownerOf(tokenId) == msg.sender);
        _;
    }

    modifier HasTransferApproval(address tokenAddress, uint256 tokenId) {
        IERC721 nftContract = IERC721(tokenAddress);
        require(nftContract.getApproved(tokenId) == address(this));
        _;
    }

    function getRedMinterAddress() public view returns (address) {
        return redMinterAddress;
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
        emit itemAdded(listing);
    }

    function updateAskingPrice(uint256 listingId, uint256 askingPrice)
        external
    {
        require(items[listingId].owner == msg.sender, "Unauthorized user");
        require(askingPrice > 0, "Price must be at least 1 RED");
        items[listingId].askingPrice = askingPrice;
    }

    function updateListingStatus(uint256 listingId, bool listingStatus)
        external
    {
        require(items[listingId].owner == msg.sender, "Unauthorized user");
        items[listingId].isForSale = listingStatus;
        emit listingUpdated(items[listingId]);
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
        //uint256 royalty = (amount * listing.royalty) / 100;
        require(redToken.allowance(offer.creator, address(this)) > amount, "insufficient allowance, re-initialize wallet");
        //redToken.approve(redMinterAddress, royalty);
        emit offerCreated(offer);
    }

    function cancelOffer(uint256 offerId) external {
        require(offers[offerId].creator == msg.sender, "Unauthorized user");
        offers[offerId].isOfferOpen = false;
        emit offerCancelled(offers[offerId]);
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
        redToken.transferFrom(
            offer.creator,
            listing.owner,
            offer.amount - royalty
        );
        redToken.transferFrom(offer.creator, redMinterAddress, royalty);
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
        redToken.transferFrom(
            msg.sender,
            listing.owner,
            listing.askingPrice - royalty
        );
        redToken.transferFrom(msg.sender, redMinterAddress, royalty);

        IERC721(_nftContract).safeTransferFrom(
            listing.owner,
            msg.sender,
            listing.tokenId
        );
        items[listingId].owner = payable(msg.sender);
    }

    function getListingById(uint256 listingId)
        public
        view
        returns (ListingItem memory)
    {
        return items[listingId];
    }

    function getOfferById(uint256 offerId) public view returns (Offer memory) {
        return offers[offerId];
    }
}
