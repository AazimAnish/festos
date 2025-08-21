import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

describe('EventFactory', async function () {
  it('Should deploy successfully', async function () {
    const { viem } = await network.connect();
    const eventFactory = await viem.deployContract('EventFactory');

    assert.equal(typeof eventFactory.address, 'string');
    assert.equal(eventFactory.address.length, 42);
  });

  it('Should have correct initial state', async function () {
    const { viem } = await network.connect();
    const eventFactory = await viem.deployContract('EventFactory');

    const totalEvents = await eventFactory.read.getTotalEvents();
    const totalTickets = await eventFactory.read.getTotalTickets();
    const platformFee = await eventFactory.read.platformFee();

    assert.equal(totalEvents, BigInt(0));
    assert.equal(totalTickets, BigInt(0));
    assert.equal(platformFee, BigInt(250)); // 2.5%
  });

  it('Should create an event successfully', async function () {
    const { viem } = await network.connect();
    const eventFactory = await viem.deployContract('EventFactory');

    const eventData = {
      title: 'Test Event',
      description: 'A test event',
      location: 'Test Location',
      startTime: BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
      endTime: BigInt(Math.floor(Date.now() / 1000) + 7200), // 2 hours from now
      maxCapacity: BigInt(100),
      ticketPrice: BigInt('100000000000000000'), // 0.1 ETH in wei
      requireApproval: false,
      hasPOAP: false,
      poapMetadata: '',
    };

    // Create event
    await eventFactory.write.createEvent([
      eventData.title,
      eventData.description,
      eventData.location,
      eventData.startTime,
      eventData.endTime,
      eventData.maxCapacity,
      eventData.ticketPrice,
      eventData.requireApproval,
      eventData.hasPOAP,
      eventData.poapMetadata,
    ]);

    // Check event count increased
    const totalEvents = await eventFactory.read.getTotalEvents();
    assert.equal(totalEvents, BigInt(1));
  });
});
