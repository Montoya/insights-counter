import { OnTransactionHandler } from '@metamask/snaps-types';
import { panel, text } from '@metamask/snaps-ui';
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
    !hasProperty(transaction, 'to') ||
    typeof transaction.to !== 'string'
  ) {
    console.warn('Unknown transaction type.');
    return { content: text('Unknown transaction') };
  }

  let state = (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  })) as { addresses: {}, lastTx: 0 } || null; 

  if (!state) { // if no data this is likely null 
    state = { addresses: {}, lastTx: 0 };
    // initialize state if empty and set default data
    await snap.request({
      method: 'snap_manageState',
      params: { operation: 'update', newState: state },
    });
  }

  let interactions = state.addresses['address:'+transaction.to] || 0; 

  const rightNow = Date.now(); 
  const lastTx = state.lastTx || 0; 
  const distance = rightNow - lastTx; 

  // tx insights can fire multiple times so an extra check is added to make sure the last tx was at least 4 seconds ago 
  if(distance > 3999) { 
    /* at least 4 seconds has passed */ 
    interactions++; 
    state.addresses['address:'+transaction.to] = interactions; 
    state.lastTx = rightNow; 
  }

  let returnText = 'You have interacted with this address '+interactions+' times.'; 
  if(interactions < 2) { 
    returnText = 'This is the **first time** you are interacting with this address.'; 
  }

  await snap.request({
    method: 'snap_manageState',
    params: { operation: 'update', newState: state },
  });

  return { content: panel([
    text('**You are interacting with:** ' + transaction.to),
    text(returnText)
  ]) };
};