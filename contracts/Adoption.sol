pragma solidity ^0.8.0;

contract Adoption {
    address[16] public adopters;

    function adopt(uint256 petId) public returns (uint256) {
        require(petId >= 0 && petId <= 15);
        adopters[petId] = msg.sender;
        return petId;
    }

    // Retrieving the adopters
    function getAdopters() public view returns (address[16] memory) {
        return adopters;
    }
}
