# Insights Snap

Steps to code this yourself: 

## 1. Go to the snap manifest `packages/snap/snap.manifest.json` and change the permissions to the following:  

```JSON
  "initialPermissions": {
    "snap_manageState": {}, 
    "endowment:transaction-insight": {}
  },
```

## 2. Go to the snap source code `packages/snap/src/index.ts` and replace it with this: 

```TypeScript
import { OnTransactionHandler } from '@metamask/snaps-types';
import { text } from '@metamask/snaps-ui';
import { hasProperty, isObject } from '@metamask/utils';

/**
 * Handle an incoming transaction, and return any insights.
 *
 * @param args - The request handler args as object.
 * @param args.transaction - The transaction object.
 * @returns The transaction insights.
 */
export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  if (
    !isObject(transaction) ||
    !hasProperty(transaction, 'data') ||
    typeof transaction.data !== 'string'
  ) {
    console.warn('Unknown transaction type.');
    return { content: text('Unknown transaction') };
  }

  return { content: text('**Test:** Successful') };
};
```

This will handle a typical transaction and show a generic message in the transaction insights interface. 

Run `yarn && yarn start` to build the snap, launch the local server, and install it. 

You can then try going to a generic contract on mainnet and interact with it to see the transaction insights displayed: [Simple Storage](https://etherscan.io/address/0x48b4cb193b587c6f2dab1a9123a7bd5e7d490ced#writeContract). 

## 3. Modify the snap source code return to get and display the address you are interacting with:

```Typescript
  return { content: text('**You are interacting with:** ' + transaction.to) };
```