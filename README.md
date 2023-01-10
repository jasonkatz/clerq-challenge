# clerq-challenge

This is a solution to the clerq technical challenge implemented in TypeScript & Node.js by Jason Katz.

## Running Locally

On a local machine with Node.js & yarn installed, run `yarn` to install dependencies.
To build the project, run `yarn build`, and to run the server run `yarn start`.
Tests can be run with `yarn test`.

When the server is started, it will run on port `8080`.

There is a liveness endpoint `/test` to verify that the server is running and accessible via HTTP.

The endpoint to compute the settlement amount for a merchant is `GET /merchant/<merchantId>/settlement/<date>`, where the date is provided in ISO-8601 format. The endpoint can be hit through `curl` or any HTTP client.

## Explanation

This implementation involves a retry mechanism around the flakey ACME API to maximize chances that the data is both retrieved properly and that it's valid. An Axios retry mechanism is used for 5xx errors & timeouts from the API, and a separate retry mechanism is used for data validation (circular response & field validation).

The logic to interact with the ACME API is encapsulated in `src/acme-api.ts`.

The business logic for computing the settlement for a merchant is found in `src/settlement.ts`, with some logic to request all merchant transactions. This logic includes multiple requests to ACME API in case there are multiple pages of transactions that need to be fetched.

The business logic is unit tested in `test/settlement.test.ts` using `jest`.

Due to the time constraint, the response only contains the settlement amount, and nothing else. With additional time, metadata about the merchant and the relevant transactions would have been included in the response. Furthermore, additional automated testing & functionality to list merchants would have been included.
