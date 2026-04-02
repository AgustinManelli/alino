import { UserStore } from "@/store/useUserDataStore";

let userStoreInstance: UserStore | null = null;

export function setUserStore(store: UserStore) {
  userStoreInstance = store;
}

export function getUserStore(): UserStore | null {
  return userStoreInstance;
}