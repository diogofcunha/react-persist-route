import React from "react";
import { render, cleanup } from "react-testing-library";
import ReactPersistRoute, {
  Props,
  LocationListener,
  History,
  SerializableLocation
} from "../..";
import URL from "url";
import { createLocalStorageAdapter } from "../../Adapters/localStorageAdapter";

describe("Local storage adapter integration", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(cleanup);

  const setup = () => {
    const toEmit: LocationListener[] = [];

    const emit = (location: Location) => {
      toEmit.forEach(te => te(location, "PUSH"));
    };

    const unlisten = jest.fn();
    const key = "mypwa";

    const history: History = {
      listen: (f: LocationListener) => {
        toEmit.push(f);

        return unlisten;
      },
      push: jest.fn()
    };

    const fallback: SerializableLocation = {
      hash: "",
      pathname: "/home",
      search: ""
    };

    const props: Props<History> = {
      shouldSaveRoute: () => true,
      history,
      adapter: createLocalStorageAdapter(key, fallback)
    };

    return {
      props,
      key,
      toEmit,
      emit,
      unlisten,
      fallback
    };
  };

  const getLocation = (urlStr: string): Location => {
    const url = URL.parse(urlStr);

    return {
      ancestorOrigins: {} as any,
      hash: url.hash || "",
      host: url.host || "",
      hostname: url.hostname || "",
      origin: "",
      href: url.href || "",
      pathname: url.pathname || "",
      port: url.port || "",
      search: url.search || "",
      protocol: url.protocol || "",
      assign: jest.fn(),
      reload: jest.fn(),
      replace: jest.fn()
    };
  };

  describe("when component loads", () => {
    describe("when local storage does not have a saved location", () => {
      test("should push to fallback", () => {
        const { props, fallback } = setup();

        render(<ReactPersistRoute {...props} />);

        jest.runAllTimers();

        expect(props.history.push).toHaveBeenCalledWith(fallback);
      });
    });

    describe("when local storage has a saved location", () => {
      test("should push to fallback when saved value is not valid", () => {
        const { props, fallback, key } = setup();

        localStorage.setItem(key, "random");
        render(<ReactPersistRoute {...props} />);

        jest.runAllTimers();

        expect(props.history.push).toHaveBeenCalledWith(fallback);
      });

      test("should push to the saved location when it is valid", () => {
        const { props, key } = setup();

        const savedLocation: SerializableLocation = {
          hash: "",
          pathname: "/u/diogo/profile",
          search: ""
        };

        localStorage.setItem(key, JSON.stringify(savedLocation));

        render(<ReactPersistRoute {...props} />);

        jest.runAllTimers();

        expect(props.history.push).toHaveBeenCalledWith({
          hash: "",
          pathname: "/u/diogo/profile",
          search: ""
        });
      });
    });
  });

  describe("when route changes", () => {
    test("should save the serialized location to local storage for basic urls", () => {
      const { props, emit, key } = setup();

      render(<ReactPersistRoute {...props} />);

      jest.runAllTimers();

      // Change route.
      emit(getLocation("https://mypwa.com/u/1"));
      jest.runAllTimers();

      expect(JSON.parse(localStorage.getItem(key)!)).toMatchInlineSnapshot(`
Object {
  "hash": "",
  "pathname": "/u/1",
  "search": "",
}
`);
    });

    test("should save the serialized location to local storage for urls with search", () => {
      const { props, emit, key } = setup();

      render(<ReactPersistRoute {...props} />);

      jest.runAllTimers();

      // Change route.
      emit(getLocation("https://mypwa.com/u/1?q=getit"));
      jest.runAllTimers();

      expect(JSON.parse(localStorage.getItem(key)!)).toMatchInlineSnapshot(`
Object {
  "hash": "",
  "pathname": "/u/1",
  "search": "?q=getit",
}
`);
    });

    test("should save the serialized location to local storage for urls with port", () => {
      const { props, emit, key } = setup();

      render(<ReactPersistRoute {...props} />);

      jest.runAllTimers();

      // Change route.
      emit(getLocation("https://mypwa:8080/u/1"));
      jest.runAllTimers();

      expect(JSON.parse(localStorage.getItem(key)!)).toMatchInlineSnapshot(`
Object {
  "hash": "",
  "pathname": "/u/1",
  "search": "",
}
`);
    });

    test("should save the serialized location to local storage for urls with hash", () => {
      const { props, emit, key } = setup();

      render(<ReactPersistRoute {...props} />);

      jest.runAllTimers();

      // Change route.
      emit(getLocation("https://mypwa/u/1#input"));
      jest.runAllTimers();

      expect(JSON.parse(localStorage.getItem(key)!)).toMatchInlineSnapshot(`
Object {
  "hash": "#input",
  "pathname": "/u/1",
  "search": "",
}
`);
    });
  });
});
