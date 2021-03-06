import { createLocalStorageAdapter } from "../localStorageAdapter";
import { SerializableLocation } from "../..";

describe("local storage adapter", () => {
  afterEach(() => {
    localStorage.clear();
  });

  const appKey = "testapp";

  describe("onSave", () => {
    test("should save a location to local storage when there is none saved", async () => {
      const adapter = createLocalStorageAdapter(appKey, {
        hash: "",
        pathname: "/u/1",
        search: ""
      });

      const locationToSave: SerializableLocation = {
        hash: "",
        pathname: "/u/235",
        search: ""
      };

      await adapter.onSave(appKey, locationToSave);

      expect(localStorage.getItem(appKey)).toBe(JSON.stringify(locationToSave));
    });

    test("should save a location to local storage when there is one saved", async () => {
      const originalLocation: SerializableLocation = {
        hash: "",
        pathname: "/u/1",
        search: ""
      };

      localStorage.setItem(appKey, JSON.stringify(originalLocation));

      const adapter = createLocalStorageAdapter(appKey, originalLocation);

      const locationToSave: SerializableLocation = {
        hash: "",
        pathname: "/u/234535",
        search: ""
      };

      await adapter.onSave(appKey, locationToSave);

      expect(localStorage.getItem(appKey)).toBe(JSON.stringify(locationToSave));
    });
  });

  describe("onLoad", () => {
    test("should return the fallback when there is no item on local storage for the app key", async () => {
      const originalLocation = {
        hash: "",
        host: "mypwa.com",
        hostname: "mypwa.com",
        href: "https://mypwa.com/home",
        origin: "",
        pathname: "/home",
        port: "",
        protocol: "https:",
        search: ""
      };

      expect(localStorage.getItem(appKey)).toBeNull();

      const adapter = createLocalStorageAdapter(appKey, originalLocation);

      const loaded = await adapter.onLoad(appKey);

      expect(loaded).toEqual(originalLocation);
    });

    test("should return the fallback when there is a problem parsing the saved location", async () => {
      const originalLocation: SerializableLocation = {
        hash: "",
        pathname: "/home",
        search: ""
      };

      localStorage.setItem(appKey, "random");

      const adapter = createLocalStorageAdapter(appKey, originalLocation);

      const loaded = await adapter.onLoad(appKey);

      expect(loaded).toEqual(originalLocation);
    });

    test("should return the saved location when there is one", async () => {
      const savedLocation: SerializableLocation = {
        hash: "",
        pathname: "/u/234535",
        search: ""
      };

      localStorage.setItem(appKey, JSON.stringify(savedLocation));

      const adapter = createLocalStorageAdapter(appKey, {
        hash: "",
        pathname: "/home",
        search: ""
      });

      const loaded = await adapter.onLoad(appKey);

      expect(loaded).toEqual(savedLocation);
    });
  });

  describe("onClear", () => {
    test("should clear the saved location from local storage", async () => {
      const savedLocation: SerializableLocation = {
        hash: "",
        pathname: "/u/234535",
        search: ""
      };

      localStorage.setItem(appKey, JSON.stringify(savedLocation));

      const adapter = createLocalStorageAdapter(appKey, {
        hash: "",
        pathname: "/home",
        search: ""
      });

      adapter.onClear(appKey);

      expect(localStorage.getItem(appKey)).toBe(null);
    });
  });
});
