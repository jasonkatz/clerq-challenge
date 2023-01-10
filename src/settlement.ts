import { getMerchantTransactions } from "./acme-api";
import { Page, MerchantTransaction } from "./types";

export async function calculateSettlement(
  merchantId: string,
  upToDate: string
): Promise<number> {
  let pageNumber = 1;
  let currentPage: Page<MerchantTransaction> = await getMerchantTransactions(
    merchantId,
    upToDate
  );

  let transactions: MerchantTransaction[] = currentPage.results;

  while (currentPage.next !== null) {
    ++pageNumber;
    currentPage = await getMerchantTransactions(
      merchantId,
      upToDate,
      pageNumber
    );
    transactions = transactions.concat(currentPage.results);
  }

  const result = transactions.reduce(
    (acc: number, obj: MerchantTransaction) => {
      const modifier = obj.type === "REFUND" ? -1 : 1;
      return acc + modifier * obj.amount;
    },
    0
  );

  return result;
}
