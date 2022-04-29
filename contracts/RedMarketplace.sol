// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RedMarketplace {
    using Counters for Counters.Counter;

    IERC20 redToken;

    struct ListingItem {
        uint256 itemId;
        address tokenAddress;
        uint256 tokenId;
        address payable owner;
        uint256 askingPrice;
        bool isForSale;
        uint256 listingFee;
    }

    struct Offer {
        uint256 offerId;
        address creator;
        uint256 itemId;
        uint256 amount;
        bool isOfferOpen;
    }

    address deployerAccount;

    constructor(address redTokenAddress) {
        redToken = IERC20(redTokenAddress); // Token Address
        deployerAccount = msg.sender;
    }

    Counters.Counter private _listingIdCounter;
    Counters.Counter private _offerIdCounter;
    mapping(uint256 => ListingItem) private items;
    mapping(uint256 => Offer) private offers;
    mapping(address => bool) private isBlacklisted;

    event itemAdded(ListingItem item);
    event listingUpdated(ListingItem item);
    event itemSold(ListingItem item);
    event offerCreated(Offer offer);
    event offerAccepted(Offer offer);
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
        return deployerAccount;
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
        require(!isBlacklisted[msg.sender], "User is blacklisted");
        require(askingPrice > 0, "Price must be at least 1 RED");
        uint256 listingId = _listingIdCounter.current();
        uint256 listingFee = 10;
        if (msg.sender == deployerAccount) {
            listingFee = 30;
        }
        ListingItem memory listing = ListingItem(
            listingId,
            tokenAddress,
            tokenId,
            payable(owner),
            askingPrice,
            isForSale,
            listingFee
        );
        items[listingId] = listing;
        _listingIdCounter.increment();
        emit itemAdded(listing);
    }

    function updateAskingPrice(uint256 listingId, uint256 askingPrice)
        external
    {
        require(!isBlacklisted[msg.sender], "User is blacklisted");
        require(items[listingId].owner == msg.sender, "Unauthorized user");
        require(askingPrice > 0, "Price must be at least 1 RED");
        items[listingId].askingPrice = askingPrice;
    }

    function updateListingStatus(
        uint256 listingId,
        bool listingStatus,
        uint256 askingPrice
    ) external {
        require(!isBlacklisted[msg.sender], "User is blacklisted");
        require(items[listingId].owner == msg.sender, "Unauthorized user");
        require(askingPrice > 0, "Price must be at least 1 RED");

        items[listingId].isForSale = listingStatus;
        items[listingId].askingPrice = askingPrice;

        emit listingUpdated(items[listingId]);
    }

    function createOffer(uint256 listingId, uint256 amount) external {
        require(!isBlacklisted[msg.sender], "User is blacklisted");
        ListingItem storage listing = items[listingId];
        require(listing.isForSale, "Listed item is NOT accepting offers");
        require(listing.owner != msg.sender, "Owner cannot create offer");
        require(
            redToken.balanceOf(msg.sender) >= listing.askingPrice,
            "Insufficient RED token balance"
        );
        require(
            redToken.allowance(msg.sender, address(this)) > amount,
            "insufficient allowance, re-initialize wallet"
        );
        uint256 offerId = _offerIdCounter.current();
        _offerIdCounter.increment();
        Offer memory offer = Offer(
            offerId,
            msg.sender,
            listingId,
            amount,
            true
        );
        offers[offerId] = offer;
        emit offerCreated(offer);
    }

    function cancelOffer(uint256 offerId) external {
        require(!isBlacklisted[msg.sender], "User is blacklisted");
        require(offers[offerId].creator == msg.sender, "Unauthorized user");
        offers[offerId].isOfferOpen = false;
        emit offerCancelled(offers[offerId]);
    }

    function getAllowance(address offerCreator)
        internal
        view
        returns (uint256)
    {
        return redToken.allowance(offerCreator, address(this));
    }

    function acceptOffer(address _nftContract, uint256 offerId) external {
        require(!isBlacklisted[msg.sender], "User is blacklisted");
        Offer storage offer = offers[offerId];
        ListingItem storage listing = items[offer.itemId];
        require(listing.owner == msg.sender, "Unauthorized user");
        require(offer.isOfferOpen, "Offer is closed");
        require(
            offer.amount <= getAllowance(offer.creator),
            "Token transfer not approved by the offer creator"
        );
        uint256 listingFee = (offer.amount * listing.listingFee) / 100;
        redToken.transferFrom(
            offer.creator,
            listing.owner,
            offer.amount - listingFee
        );
        redToken.transferFrom(offer.creator, address(this), listingFee);
        IERC721(_nftContract).safeTransferFrom(
            msg.sender,
            offer.creator,
            listing.tokenId
        );
        items[offer.itemId].owner = payable(offer.creator);
        items[offer.itemId].isForSale = false;
        emit itemSold(items[offer.itemId]);
        emit offerAccepted(offers[offerId]);
    }

    function buyNow(
        address _nftContract,
        uint256 listingId,
        uint256 amount
    ) external {
        require(!isBlacklisted[msg.sender], "User is blacklisted");
        ListingItem storage listing = items[listingId];
        require(listing.isForSale, "Listed item is NOT for sale");
        require(amount >= listing.askingPrice, "Insufficient RED token amount");
        require(
            redToken.balanceOf(msg.sender) >= listing.askingPrice,
            "Insufficient RED token balance"
        );
        uint256 listingFee = (listing.askingPrice * listing.listingFee) / 100;
        redToken.transferFrom(
            msg.sender,
            listing.owner,
            listing.askingPrice - listingFee
        );
        redToken.transferFrom(msg.sender, address(this), listingFee);

        IERC721(_nftContract).safeTransferFrom(
            listing.owner,
            msg.sender,
            listing.tokenId
        );
        items[listingId].owner = payable(msg.sender);
        items[listingId].isForSale = false;
        emit itemSold(items[listingId]);
    }

    function updateBlacklistUser(address userAddress, bool status) external {
        require(deployerAccount == msg.sender, "Unauthorized account");
        isBlacklisted[userAddress] = status;
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
