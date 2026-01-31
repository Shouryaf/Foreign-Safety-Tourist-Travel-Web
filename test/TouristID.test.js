const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TouristID Contract", function () {
  let TouristID;
  let touristID;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    TouristID = await ethers.getContractFactory("TouristID");
    [owner, addr1, addr2] = await ethers.getSigners();
    touristID = await TouristID.deploy();
    await touristID.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await touristID.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero tourists", async function () {
      expect(await touristID.totalTourists()).to.equal(0);
    });
  });

  describe("Tourist Registration", function () {
    it("Should register a new tourist", async function () {
      const touristId = "TOURIST_001";
      const name = "John Doe";
      const email = "john@example.com";
      const passport = "AB123456";

      await touristID.registerTourist(touristId, name, email, passport);

      const tourist = await touristID.getTourist(touristId);
      expect(tourist.name).to.equal(name);
      expect(tourist.email).to.equal(email);
      expect(tourist.passportNumber).to.equal(passport);
      expect(tourist.isActive).to.equal(true);
      expect(await touristID.totalTourists()).to.equal(1);
    });

    it("Should not allow duplicate registration", async function () {
      const touristId = "TOURIST_001";
      await touristID.registerTourist(touristId, "John", "john@example.com", "AB123456");
      
      await expect(
        touristID.registerTourist(touristId, "Jane", "jane@example.com", "CD789012")
      ).to.be.revertedWith("Tourist already registered");
    });

    it("Should only allow owner to register tourists", async function () {
      await expect(
        touristID.connect(addr1).registerTourist("TOURIST_001", "John", "john@example.com", "AB123456")
      ).to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("Location Updates", function () {
    beforeEach(async function () {
      await touristID.registerTourist("TOURIST_001", "John", "john@example.com", "AB123456");
    });

    it("Should update tourist location", async function () {
      const locationHash = "lat:40.7128,lng:-74.0060";
      await touristID.updateLocation("TOURIST_001", locationHash);

      const tourist = await touristID.getTourist("TOURIST_001");
      expect(tourist.locationHash).to.equal(locationHash);
    });

    it("Should not update location for unregistered tourist", async function () {
      await expect(
        touristID.updateLocation("TOURIST_999", "lat:40.7128,lng:-74.0060")
      ).to.be.revertedWith("Tourist not registered");
    });
  });

  describe("SOS Alerts", function () {
    beforeEach(async function () {
      await touristID.registerTourist("TOURIST_001", "John", "john@example.com", "AB123456");
    });

    it("Should trigger SOS alert", async function () {
      const locationHash = "lat:40.7128,lng:-74.0060";
      
      await expect(touristID.triggerSOS("TOURIST_001", locationHash))
        .to.emit(touristID, "SOSAlert")
        .withArgs("TOURIST_001", locationHash, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
    });

    it("Should not trigger SOS for unregistered tourist", async function () {
      await expect(
        touristID.triggerSOS("TOURIST_999", "lat:40.7128,lng:-74.0060")
      ).to.be.revertedWith("Tourist not registered");
    });
  });

  describe("Tourist Verification", function () {
    it("Should verify registered and active tourist", async function () {
      await touristID.registerTourist("TOURIST_001", "John", "john@example.com", "AB123456");
      expect(await touristID.verifyTourist("TOURIST_001")).to.equal(true);
    });

    it("Should not verify unregistered tourist", async function () {
      expect(await touristID.verifyTourist("TOURIST_999")).to.equal(false);
    });

    it("Should not verify deactivated tourist", async function () {
      await touristID.registerTourist("TOURIST_001", "John", "john@example.com", "AB123456");
      await touristID.deactivateTourist("TOURIST_001");
      expect(await touristID.verifyTourist("TOURIST_001")).to.equal(false);
    });
  });
});
