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

Go back to the dapp, reconnect the snap to install the latest version, and go back to the contract to interact with it. This time you will see the address of the contract. 

## 4. Use manageState to store a counter for each address you interact with: 

```TypeScript
  let state = (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  })) as { addresses: {} } || null; 

  if (!state) { // if no data this is likely null 
    state = { addresses: {} };
    // initialize state if empty and set default data
    await snap.request({
      method: 'snap_manageState',
      params: { operation: 'update', newState: state },
    });
  }

  let interactions = state.addresses['address:'+transaction.to] || 0; 

  interactions++; 

  let returnText = 'You have interacted with this address '+interactions+' times.'; 
  if(interactions < 2) { 
    returnText = 'This is the **first time** you are interacting with this address.'; 
  }

  state.addresses['address:'+transaction.to] = interactions; 

  snap.request({
    method: 'snap_manageState',
    params: { operation: 'update', newState: state },
  });
```

Add the panel type to the types you request from `snaps-ui`: 

```TypeScript
import { panel, text } from '@metamask/snaps-ui';
```

And modify the return value to display the number of times the user has interacted with this address: 

```TypeScript
  return { content: panel([
    text('**You are interacting with:** ' + transaction.to),
    text(returnText)
  ]) };
```

Reconnect the snap to install the latest version, then try interacting with a contract multiple times to see the count go up. You can try interacting with different addresses and you will that the result matches how many times you interact with each one!