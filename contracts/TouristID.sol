// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TouristID {
    struct Tourist {
        string name;
        string email;
        string passportNumber;
        uint256 registrationTime;
        bool isActive;
        string locationHash;
    }

    mapping(string => Tourist) public tourists;
    mapping(address => string) public walletToTouristID;
    
    address public owner;
    uint256 public totalTourists;
    
    event TouristRegistered(string indexed touristID, string name, string email);
    event LocationUpdated(string indexed touristID, string locationHash);
    event TouristDeactivated(string indexed touristID);
    event SOSAlert(string indexed touristID, string locationHash, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerTourist(
        string memory _touristID,
        string memory _name,
        string memory _email,
        string memory _passportNumber
    ) external onlyOwner {
        require(bytes(tourists[_touristID].name).length == 0, "Tourist already registered");
        
        tourists[_touristID] = Tourist({
            name: _name,
            email: _email,
            passportNumber: _passportNumber,
            registrationTime: block.timestamp,
            isActive: true,
            locationHash: ""
        });
        
        walletToTouristID[msg.sender] = _touristID;
        totalTourists++;
        
        emit TouristRegistered(_touristID, _name, _email);
    }

    function updateLocation(string memory _touristID, string memory _locationHash) external {
        require(bytes(tourists[_touristID].name).length > 0, "Tourist not registered");
        require(tourists[_touristID].isActive, "Tourist account is deactivated");
        
        tourists[_touristID].locationHash = _locationHash;
        emit LocationUpdated(_touristID, _locationHash);
    }

    function triggerSOS(string memory _touristID, string memory _locationHash) external {
        require(bytes(tourists[_touristID].name).length > 0, "Tourist not registered");
        require(tourists[_touristID].isActive, "Tourist account is deactivated");
        
        tourists[_touristID].locationHash = _locationHash;
        emit SOSAlert(_touristID, _locationHash, block.timestamp);
    }

    function deactivateTourist(string memory _touristID) external onlyOwner {
        require(bytes(tourists[_touristID].name).length > 0, "Tourist not registered");
        tourists[_touristID].isActive = false;
        emit TouristDeactivated(_touristID);
    }

    function getTourist(string memory _touristID) external view returns (
        string memory name,
        string memory email,
        string memory passportNumber,
        uint256 registrationTime,
        bool isActive,
        string memory locationHash
    ) {
        Tourist memory tourist = tourists[_touristID];
        return (
            tourist.name,
            tourist.email,
            tourist.passportNumber,
            tourist.registrationTime,
            tourist.isActive,
            tourist.locationHash
        );
    }

    function verifyTourist(string memory _touristID) external view returns (bool) {
        return bytes(tourists[_touristID].name).length > 0 && tourists[_touristID].isActive;
    }
}
