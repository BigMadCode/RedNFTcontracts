// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RedGovernance {
    IERC20 redToken;
    address admin = 0x2D001A055B29504D6C029fd4f46470b18D74bd17; // TODO
    uint256 votingFee = 100 * 10**18; // TODO
    uint256 votingReward = 15 * 10**18; // TODO
    uint256 internal rewardPerHour = 1000; // TODO

    struct Stake {
        address user;
        uint256 amount;
        uint256 since;
        uint256 claimable;
    }

    struct StakingSummary {
        uint256 total_amount;
        uint256 governanceReward;
        Stake[] stakes;
    }

    mapping(address => StakingSummary) private StakingInfo;

    constructor() {
        redToken = IERC20(0x2D001A055B29504D6C029fd4f46470b18D74bd17); // Token Address
    }

    function vote() external returns (bool) {
        StakingSummary memory summary = hasStake(msg.sender);
        require(
            summary.total_amount >= 10000000 * (10**18),
            "Please stake atleast 10M Red tokens to vote"
        );
        redToken.transfer(admin, votingFee);
        StakingInfo[msg.sender].governanceReward =
            summary.governanceReward +
            votingReward;
        return true;
    }

    function claimGovernanceReward() external returns (uint256) {
        require(
            StakingInfo[msg.sender].governanceReward > 0,
            "Insufficient governance reward"
        );
        uint256 governanceReward = StakingInfo[msg.sender].governanceReward;
        StakingInfo[msg.sender].governanceReward = 0;
        redToken.transferFrom(admin, msg.sender, governanceReward);
        return governanceReward;
    }

    function stake(uint256 _amount) external returns (bool) {
        require(_amount > 0, "Insufficient staking amount");
        redToken.transfer(admin, _amount);
        uint256 timestamp = block.timestamp;
        Stake memory newStake = Stake(msg.sender, _amount, timestamp, 0);
        StakingInfo[msg.sender].stakes.push(newStake);
        return true;
    }

    function withdrawStake(uint256 _amount, uint256 index)
        external
        returns (bool)
    {
        require(_amount > 0, "Invalid amount");
        Stake memory current_stake = StakingInfo[msg.sender].stakes[index];
        require(_amount <= current_stake.amount, "Insufficient staking amount");
        uint256 reward = calculateStakeReward(current_stake);
        current_stake.amount = current_stake.amount - _amount;
        StakingInfo[msg.sender].stakes[index].amount = current_stake.amount;
        redToken.transferFrom(admin, msg.sender, _amount + reward);
        return true;
    }

    function calculateStakeReward(Stake memory _current_stake)
        internal
        view
        returns (uint256)
    {
        return
            (((block.timestamp - _current_stake.since) / 1 hours) *
                _current_stake.amount) / rewardPerHour;
    }

    function hasStake(address _staker)
        public
        view
        returns (StakingSummary memory)
    {
        uint256 totalStakeAmount;
        StakingSummary memory summary = StakingInfo[_staker];
        for (uint256 s = 0; s < summary.stakes.length; s += 1) {
            uint256 availableReward = calculateStakeReward(summary.stakes[s]);
            summary.stakes[s].claimable = availableReward;
            totalStakeAmount = totalStakeAmount + summary.stakes[s].amount;
        }
        summary.total_amount = totalStakeAmount;
        return summary;
    }
}
