// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {ERC20, ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract Token is ERC20, ERC20Permit {
    uint256 immutable public FEE_AFTER; // 10000

    constructor(string memory name_, string memory symbol_, uint256 feeAfter_) ERC20(name_, symbol_)  ERC20Permit(name_)  {
        FEE_AFTER = feeAfter_;
    }

    function _update(address from, address to, uint256 value) internal override(ERC20) {
        if (from != address(0) && to != address(0)) {
            uint256 feeAfter = value / 10000 * FEE_AFTER;
            ERC20._update(from, to, feeAfter);
            ERC20._update(from, address(0), value - feeAfter);
        } else {
            ERC20._update(from, to, value);
        }
    }

    function mint(address account, uint256 value) external {
        _mint(account, value);
    }
}
