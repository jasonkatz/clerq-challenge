import { reset, stub, SinonStub } from "sinon";
import { v4 as uuid } from "uuid";

import { calculateSettlement } from "../src/settlement";
import * as AcmeAPI from "../src/acme-api";
import { MerchantTransaction, Page } from "../src/types";

let acmeStub: SinonStub;

const mockTransactions: Page<MerchantTransaction> = {
  count: 10,
  next: null,
  previous: null,
  results: Array.from(Array(10).keys()).map((i: number) => ({
    id: `t${i}`,
    amount: 10,
    type: "SALE",
    customer: "c${i}",
    merchant: "test-merchant",
    order: "o${i}",
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
};

describe("settlement calculator", () => {
  beforeAll(() => {
    acmeStub = stub(AcmeAPI, "getMerchantTransactions");
  });

  beforeEach(() => {
    acmeStub.resolves(mockTransactions);
  });

  afterEach(() => {
    reset();
  });

  test("returns total if all sale transactions", async () => {
    acmeStub.resolves({
      count: 10,
      next: null,
      previous: null,
      results: Array.from(Array(10).keys()).map(() =>
        createTestTransaction(10, "SALE")
      ),
    });

    const result = await calculateSettlement("", "");

    expect(acmeStub.calledOnce).toBe(true);
    expect(result).toBe(100);
  });

  test("returns total if all refund transactions", async () => {
    acmeStub.resolves({
      count: 10,
      next: null,
      previous: null,
      results: Array.from(Array(10).keys()).map(() =>
        createTestTransaction(10, "REFUND")
      ),
    });

    const result = await calculateSettlement("", "");

    expect(acmeStub.calledOnce).toBe(true);
    expect(result).toBe(-100);
  });

  test("returns total if mixed transactions", async () => {
    acmeStub.resolves({
      count: 10,
      next: null,
      previous: null,
      results: Array.from(Array(10).keys())
        .map(() => createTestTransaction(10, "SALE"))
        .concat(
          Array.from(Array(10).keys()).map(() =>
            createTestTransaction(5, "REFUND")
          )
        ),
    });

    const result = await calculateSettlement("", "");

    expect(acmeStub.calledOnce).toBe(true);
    expect(result).toBe(50);
  });

  test("calculates settlement from cumulative transactions as long as next is defined", async () => {
    acmeStub.onCall(0).resolves({
      count: 1,
      next: "next-page-uri",
      previous: null,
      results: [createTestTransaction(10, "SALE")],
    });
    acmeStub.onCall(1).resolves({
      count: 1,
      next: null,
      previous: null,
      results: [createTestTransaction(2, "REFUND")],
    });

    const result = await calculateSettlement("", "");

    expect(acmeStub.calledTwice).toBe(true);
    expect(result).toBe(8);
  });
});

function createTestTransaction(
  amount: number,
  type: "SALE" | "REFUND"
): MerchantTransaction {
  return {
    id: uuid(),
    amount,
    type,
    customer: uuid(),
    merchant: "test-merchant",
    order: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
