import axios, { AxiosResponse } from "axios";
import axiosRetry from "axios-retry";

import {
  MerchantDetails,
  AcmeMerchantDetails,
  Page,
  MerchantTransaction,
  AcmeMerchantTransaction,
} from "./types";

// Creating retry mechanism to re-attempt requests that time out or result in 5xx errors
axiosRetry(axios, { retries: 5 });

const REQUEST_TIMEOUT_MS = 3000;

const UUID_REGEX =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
const AMOUNT_REGEX = /^-?\d{0,12}(?:\.\d{0,2})?$/;

const API_URL = "https://acme-payments.clerq.io/tech_assessment";

export async function getMerchantDetails(
  merchantId: string
): Promise<MerchantDetails> {
  const response = await executeApiGetRequest<AcmeMerchantDetails>(
    `/merchants/${merchantId}`,
    {},
    validateMerchantDetailsResponse
  );
  const { data } = response;

  return adaptMerchantDetailsResponse(data);
}

export async function getMerchantTransactions(
  merchantId: string,
  upToDate: string
): Promise<Page<MerchantTransaction>> {
  // TODO
  const response = await executeApiGetRequest(
    "/transacations",
    { created_at_lte: upToDate },
    validateMerchantTransactionsResponse
  );
  const { data } = response;

  return adaptMerchantTransactionsResponse(data);
}

class DataValidationError extends Error {
  constructor() {
    super();
  }
}

async function executeApiGetRequest<T>(
  path: string,
  params: any,
  validate: (data: T) => void
): Promise<AxiosResponse<T>> {
  // Retry 5 times, on top of the 5 axios retries that we have setup - handles parsing errors
  for (let i = 0; i < 5; ++i) {
    try {
      const response = await axios.get(`${API_URL}${path}`, {
        params,
        timeout: REQUEST_TIMEOUT_MS,
      });

      validate(response.data);

      return response;
    } catch (e) {
      if (e instanceof DataValidationError) {
        console.log("Validation error - retrying");
      } else {
        console.log("API error - retrying");
      }
    }
  }
}

function validateMerchantDetailsResponse(
  apiResponse: AcmeMerchantDetails
): void {
  if (
    new Date(apiResponse.created_at).toString() === "Invalid Date" ||
    new Date(apiResponse.updated_at).toString() === "Invalid Date" ||
    !UUID_REGEX.test(apiResponse.id)
  ) {
    throw new DataValidationError();
  }
}

function validateMerchantTransactionsResponse(
  apiResponse: Page<AcmeMerchantTransaction>
): void {
  apiResponse.results.forEach((transaction: AcmeMerchantTransaction) => {
    if (
      new Date(transaction.created_at).toString() === "Invalid Date" ||
      new Date(transaction.updated_at).toString() === "Invalid Date"
    ) {
      throw new DataValidationError();
    }

    if (!AMOUNT_REGEX.test(transaction.amount)) {
      throw new DataValidationError();
    }

    if (
      !UUID_REGEX.test(transaction.id) ||
      !UUID_REGEX.test(transaction.customer) ||
      !UUID_REGEX.test(transaction.merchant) ||
      !UUID_REGEX.test(transaction.order)
    ) {
      throw new DataValidationError();
    }

    if (transaction.type !== "PURCHASE" && transaction.type !== "REFUND") {
      throw new DataValidationError();
    }
  });
}

function adaptMerchantDetailsResponse(
  apiResponse: AcmeMerchantDetails
): MerchantDetails {
  return {
    id: apiResponse.id,
    name: apiResponse.name,
    createdAt: new Date(apiResponse.created_at),
    updatedAt: new Date(apiResponse.updated_at),
  };
}

function adaptMerchantTransactionsResponse(
  apiResponse: Page<AcmeMerchantTransaction>
): Page<MerchantTransaction> {
  return {
    count: apiResponse.count,
    next: apiResponse.next,
    previous: apiResponse.previous,
    results: apiResponse.results.map((result: AcmeMerchantTransaction) => ({
      id: result.id,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
      amount: parseFloat(result.amount),
      type: result.type as "PURCHASE" | "REFUND",
      customer: result.customer,
      merchant: result.merchant,
      order: result.order,
    })),
  };
}
