import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

describe('EventFactory getActiveEvents', async function () {
  it('Should return empty array when no events exist', async function () {
    const { viem } = await network.connect();
    const eventFactory = await viem.deployContract('EventFactory');

    const activeEvents = await eventFactory.read.getActiveEvents([BigInt(0), BigInt(10)]);
    assert.equal(activeEvents.length, 0);
  });

  it('Should return active events correctly', async function () {
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

    // Get active events
    const activeEvents = await eventFactory.read.getActiveEvents([BigInt(0), BigInt(10)]);
    assert.equal(activeEvents.length, 1);
    assert.equal(activeEvents[0].title, eventData.title);
  });

  it('Should handle pagination correctly', async function () {
    const { viem } = await network.connect();
    const eventFactory = await viem.deployContract('EventFactory');

    // Create multiple events
    for (let i = 0; i < 3; i++) {
      const eventData = {
        title: `Test Event ${i}`,
        description: `A test event ${i}`,
        location: `Test Location ${i}`,
        startTime: BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
        endTime: BigInt(Math.floor(Date.now() / 1000) + 7200), // 2 hours from now
        maxCapacity: BigInt(100),
        ticketPrice: BigInt('100000000000000000'), // 0.1 ETH in wei
        requireApproval: false,
        hasPOAP: false,
        poapMetadata: '',
      };

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
    }

    // Test pagination
    const activeEvents = await eventFactory.read.getActiveEvents([BigInt(0), BigInt(2)]);
    assert.equal(activeEvents.length, 2);

    const activeEvents2 = await eventFactory.read.getActiveEvents([BigInt(2), BigInt(2)]);
    assert.equal(activeEvents2.length, 1);
  });
});
