import React from "react";
import { render, cleanup } from "react-testing-library";
import ReactPersistRoute, {
  Props,
  LocationListener,
  History,
  SerializableLocation
} from "..";
import URL from "url";

describe("<ReactPersistRoute />", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(cleanup);

  const setup = (extraProps: Partial<Props<History>> = {}) => {
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

    const props: Props<History> = ({
      history,
      adapter: {
        onClear: jest.fn(),
        onLoad: jest.fn(),
        onSave: jest.fn(),
        getKey: () => key
      },
      ...extraProps
    } as Partial<Props<History>>) as Props<History>;

    return {
      props,
      key,
      toEmit,
      emit,
      unlisten
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
    test("when component unmounts before loading key should generate a no-op", () => {
      const { props, unlisten, toEmit } = setup();
      const { unmount } = render(<ReactPersistRoute {...props} />);

      unmount();

      jest.runAllTimers();

      expect(props.adapter.onLoad).toHaveBeenCalled();
      expect(unlisten).not.toHaveBeenCalled();
      expect(toEmit.length).toBe(0);
      expect(props.history.push).not.toHaveBeenCalled();
    });

    describe("when a saved location is not loaded", () => {
      test("should not push history", () => {
        const { props } = setup();

        render(<ReactPersistRoute {...props} />);

        jest.runAllTimers();

        expect(props.adapter.onLoad).toHaveBeenCalled();
        expect(props.history.push).not.toHaveBeenCalled();
      });

      test("should open listen connection", () => {
        const { props, toEmit } = setup();

        render(<ReactPersistRoute {...props} />);

        expect(toEmit.length).toBe(0);
        jest.runAllTimers();
        expect(toEmit.length).toBe(1);
      });

      test("should not call unlisten when component is not unmounted", () => {
        const { props, unlisten, toEmit } = setup();

        render(<ReactPersistRoute {...props} />);

        expect(toEmit.length).toBe(0);
        jest.runAllTimers();
        expect(unlisten).not.toHaveBeenCalled();
      });
    });

    describe("when a saved location is loaded", () => {
      test("should push to history", () => {
        const { props, key } = setup();

        (props.adapter.onLoad as jest.Mock<any, any>).mockImplementation(
          (k: string): SerializableLocation => {
            if (k === key) {
              return {
                hash: "",
                pathname: "/u/1",
                search: ""
              };
            }

            throw new Error("Ups wrong key");
          }
        );

        render(<ReactPersistRoute {...props} />);

        jest.runAllTimers();

        expect(props.history.push).toHaveBeenCalledWith({
          hash: "",
          pathname: "/u/1",
          search: ""
        });
      });

      test("should open listen connection", () => {
        const { props, key, toEmit } = setup();

        (props.adapter.onLoad as jest.Mock<any, any>).mockImplementation(
          (k: string): SerializableLocation => {
            if (k === key) {
              return {
                hash: "",
                pathname: "/u/1",
                search: ""
              };
            }

            throw new Error("Ups wrong key");
          }
        );

        render(<ReactPersistRoute {...props} />);

        expect(toEmit.length).toBe(0);
        jest.runAllTimers();
        expect(toEmit.length).toBe(1);
      });

      test("should not call unlisten when component is not unmounted", () => {
        const { props, key, unlisten } = setup();

        (props.adapter.onLoad as jest.Mock<any, any>).mockImplementation(
          (k: string): SerializableLocation => {
            if (k === key) {
              return {
                hash: "",
                pathname: "/u/1",
                search: ""
              };
            }

            throw new Error("Ups wrong key");
          }
        );

        jest.runAllTimers();
        expect(unlisten).not.toHaveBeenCalled();
      });
    });
  });

  describe("when route changes", () => {
    test("should call adpater's onSave with the serialized location for basic urls", () => {
      const { props, emit } = setup();

      render(<ReactPersistRoute {...props} />);

      jest.runAllTimers();

      // Change route.
      emit(getLocation("https://mypwa.com/u/1"));
      jest.runAllTimers();

      expect(props.adapter.onSave).toMatchSnapshot();
    });

    test("should call adpater's onSave with the serialized location for urls with search", () => {
      const { props, emit } = setup();

      render(<ReactPersistRoute {...props} />);

      jest.runAllTimers();

      // Change route.
      emit(getLocation("https://mypwa.com/u/1?q=getit"));
      jest.runAllTimers();

      expect(props.adapter.onSave).toMatchSnapshot();
    });

    test("should call adpater's onSave with the serialized location for urls with port", () => {
      const { props, emit } = setup();

      render(<ReactPersistRoute {...props} />);

      jest.runAllTimers();

      // Change route.
      emit(getLocation("https://mypwa:8080/u/1"));
      jest.runAllTimers();

      expect(props.adapter.onSave).toMatchSnapshot();
    });

    test("should call adpater's onSave with the serialized location for urls with hash", () => {
      const { props, emit } = setup();

      render(<ReactPersistRoute {...props} />);

      jest.runAllTimers();

      // Change route.
      emit(getLocation("https://mypwa/u/1#input"));
      jest.runAllTimers();

      expect(props.adapter.onSave).toMatchSnapshot();
    });

    describe("an shouldSaveRoute is supplied", () => {
      test("should call shouldSaveRoute when changing routes with the value that is candidate for save", () => {
        const shouldSaveRoute = jest.fn();
        const { props, emit } = setup({ shouldSaveRoute });

        render(<ReactPersistRoute {...props} />);

        jest.runAllTimers();

        // Change route.
        emit(getLocation("https://mypwa.com/u/1"));
        jest.runAllTimers();

        expect(shouldSaveRoute).toHaveBeenCalledWith({
          hash: "",
          pathname: "/u/1",
          search: ""
        });
      });

      test("should call adpater's onSave with the serialized location when shouldSaveRoute returns true", () => {
        const { props, emit } = setup({ shouldSaveRoute: () => true });

        render(<ReactPersistRoute {...props} />);

        jest.runAllTimers();

        // Change route.
        emit(getLocation("https://mypwa.com/u/1"));
        jest.runAllTimers();

        expect(props.adapter.onSave).toMatchSnapshot();
      });

      test("should not call adpater's onSave with the serialized location when shouldSaveRoute returns false", () => {
        const { props, emit } = setup({ shouldSaveRoute: () => false });

        render(<ReactPersistRoute {...props} />);

        jest.runAllTimers();

        // Change route.
        emit(getLocation("https://mypwa.com/u/1"));
        jest.runAllTimers();

        expect(props.adapter.onSave).not.toHaveBeenCalled();
      });
    });
  });
});
