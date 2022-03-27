import { LandInstance } from '../types/truffle-contracts';

import chai from 'chai';
import chaiAsPromise from 'chai-as-promised';

chai.use(chaiAsPromise);

const { expect } = chai;

const Land = artifacts.require('Land');

contract('Land', ([owner1, owner2]) => {
  const NAME = 'Metaverse Buildings';
  const SYMBOL = 'MBS';
  const COST = web3.utils.toWei('1', 'ether');

  const EVM_REVERT_MESSAGE = 'VM Exception while processing transaction: revert'

  let land: LandInstance;

  beforeEach(async () => {
    land = await Land.new(NAME, SYMBOL, COST)
  });

  describe('Deployment', () => {
    it('should return the contract name', async () => {
      const contractName = await land.name();

      expect(contractName).to.equal(NAME);
    });

    it('should return the contract symbol', async () => {
      const contractSymbol = await land.symbol();

      expect(contractSymbol).to.equal(SYMBOL);
    });

    it('should return the contract cost to mint', async () => {
      const contractCostToMint = (await land.cost()).toString();

      expect(contractCostToMint).to.equal(COST);
    });

    it('should return the contract max supply', async () => {
      const contractMaxSupply = (await land.maxSupply()).toString();

      expect(contractMaxSupply).to.equal('5');
    });

    it('should return the number of buildings/lands available', async () => {
      const availableBuildings = await land.getBuildings();

      expect(availableBuildings).to.have.lengthOf(5);
    });
  });

  describe('Minting', () => {
    describe('Success', () => {
      beforeEach(async () => {
        await land.mint(1, { from: owner1, value: COST });
      });

      it('should update the owner address', async () => {
        const owner = await land.ownerOf(1);

        expect(owner).to.equal(owner1);
      });

      it('should update the building details', async () => {
        const { owner: buildingOwner } = await land.getBuilding(1);

        expect(buildingOwner).to.equal(owner1);
      });
    });

    describe('Failure', () => {
      it('should prevent mint with 0 value', async () => {

        expect(
          land.mint(1, {from: owner1, value: '0'})
        ).to.be.rejectedWith(EVM_REVERT_MESSAGE);
      });

      it('should prevent mint with invalid ID', async () => {
        expect(
          land.mint(100, {from: owner1, value: COST})
        ).to.be.rejectedWith(EVM_REVERT_MESSAGE);
      });

      it('should prevent mint if already owned', async () => {
        await land.mint(1, {from: owner1, value: COST})

        expect(
          land.mint(1, {from: owner1, value: COST})
        ).to.be.rejectedWith(EVM_REVERT_MESSAGE);
      });
    });
  });

  describe('Transfer', () => {
    describe('Success', () => {
      beforeEach(async () => {
        await land.mint(1, { from: owner1, value: COST });
        await land.approve(owner2, 1, { from: owner1 });

        await land.transferFrom(owner1, owner2, 1, { from: owner2 });
      });

      it('should update the owner address', async () => {
        const owner = await land.ownerOf(1);

        expect(owner).to.equal(owner2);
      });

      it('should update the building details', async () => {
        const { owner: buildingOwner } = await land.getBuilding(1);

        expect(buildingOwner).to.equal(owner2);
      });
    });

    describe('Failure', () => {
      it('should prevent transfers without ownerships', async () => {
        expect(
          land.transferFrom(owner1, owner2, 1, { from: owner2 }),
        ).to.be.rejectedWith(EVM_REVERT_MESSAGE);
      });

      it('should prevent transfers without approval', async () => {
        await land.mint(1, { from: owner1, value: COST });

        expect(
          land.transferFrom(owner1, owner2, 1, { from: owner2 }),
        ).to.be.rejectedWith(EVM_REVERT_MESSAGE);
      });
    });
  })
});
