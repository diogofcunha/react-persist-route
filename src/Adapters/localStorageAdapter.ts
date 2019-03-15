import { PersistenceAdapter, SerializableLocation } from "..";

export const createLocalStorageAdapter = (
  appKey: string,
  loadFallback: SerializableLocation
): PersistenceAdapter => {
  return {
    getKey: () => appKey,
    onLoad: async (key: string) => {
      try {
        const stringifyiedLocation = localStorage.getItem(key);

        if (stringifyiedLocation) {
          return JSON.parse(stringifyiedLocation) as SerializableLocation;
        }
      } catch (ex) {
        console.info(`Could not find entry, loading fallback`);
      }

      return loadFallback;
    },
    onSave: async (key: string, location: SerializableLocation) => {
      try {
        localStorage.setItem(key, JSON.stringify(location));
        return key;
      } catch (ex) {
        throw new Error(
          `Failed to save route transition for key ${key}: ${ex}`
        );
      }
    },
    onClear: async (key: string) => {
      localStorage.removeItem(key);
    }
  };
};
