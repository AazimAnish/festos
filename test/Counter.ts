// We don't have Ethereum specific assertions in Hardhat 3 yet
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("Counter", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  it("Should increment by 1", async function () {
    const counter = await viem.deployContract("Counter");

    await counter.write.inc();

    const count = await counter.read.x();

    assert.equal(count, BigInt(1));
  });

  it("Should increment by a given amount", async function () {
    const counter = await viem.deployContract("Counter");

    await counter.write.incBy([BigInt(1)]);

    const count = await counter.read.x();

    assert.equal(count, BigInt(1));
  });

  it("The sum of the Increment events should match the current value", async function () {
    const counter = await viem.deployContract("Counter");
    const deploymentBlockNumber = await publicClient.getBlockNumber();

    // run a series of increments
    for (let i = BigInt(1); i <= BigInt(10); i++) {
      await counter.write.incBy([i]);
    }

    const events = await publicClient.getContractEvents({
      address: counter.address,
      abi: counter.abi,
      eventName: "Increment",
      fromBlock: deploymentBlockNumber,
      strict: true,
    });

    // check that the aggregated events match the current value
    let total = BigInt(0);
    for (const event of events) {
      total += event.args.by;
    }

    assert.equal(total, await counter.read.x());
  });
});
