import { auth } from '../firebase';
import { OperationType, FirestoreErrorInfo } from '../types';

let globalSetError: ((err: Error) => void) | null = null;

export const setGlobalErrorHandler = (handler: (err: Error) => void) => {
  globalSetError = handler;
};

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  const err = new Error(JSON.stringify(errInfo));
  console.error('Firestore Error: ', err.message);
  if (globalSetError) {
    globalSetError(err);
  } else {
    throw err;
  }
}
