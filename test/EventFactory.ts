import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { network } from 'hardhat';

describe('EventFactory', async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  it('Should deploy successfully', async function () {
    const eventFactory = await viem.deployContract('EventFactory');

    assert.equal(typeof eventFactory.address, 'string');
    assert.equal(eventFactory.address.length, 42);
  });

  it('Should have correct initial state', async function () {
    const eventFactory = await viem.deployContract('EventFactory');

    const totalEvents = await eventFactory.read.getTotalEvents();
    const totalTickets = await eventFactory.read.getTotalTickets();
    const platformFee = await eventFactory.read.platformFee();

    assert.equal(totalEvents, BigInt(0));
    assert.equal(totalTickets, BigInt(0));
    assert.equal(platformFee, BigInt(250)); // 2.5%
  });
});
