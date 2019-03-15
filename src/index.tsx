import React from "react";

export type Action = "PUSH" | "POP" | "REPLACE";
export type UnregisterCallback = () => void;
export type LocationListener = (location: Location, action: Action) => void;

export type SerializableLocation = Pick<
  Location,
  "hash" | "pathname" | "search"
>;

export interface History {
  listen(listener: LocationListener): UnregisterCallback;
  push(path: SerializableLocation): void;
}

export interface PersistenceAdapter {
  getKey: () => string;
  onSave: (key: string, location: SerializableLocation) => Promise<string>;
  onLoad: (key: string) => Promise<SerializableLocation | null>;
  onClear: (key: string) => Promise<void>;
}

export interface Props<H extends History> {
  history: H;
  adapter: PersistenceAdapter;
  shouldSaveRoute: (location: SerializableLocation) => boolean;
}

export default class ReactPersistRoute<
  H extends History
> extends React.Component<Props<H>> {
  private _isMounted = true;
  private _unlisten?: UnregisterCallback;

  static defaultProps = {
    shouldSaveRoute: () => true
  };

  async componentDidMount() {
    const {
      history,
      adapter: { getKey, onLoad }
    } = this.props;

    const location = await onLoad(getKey());

    if (this._isMounted) {
      if (location) {
        history.push(location);
      }

      this._unlisten = history.listen(this.onRouteChanged);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this._unlisten && this._unlisten();
  }

  onRouteChanged: LocationListener = ({ hash, pathname, search }) => {
    const {
      adapter: { getKey, onSave },
      shouldSaveRoute
    } = this.props;

    const toSave: SerializableLocation = {
      hash,
      pathname,
      search
    };

    if (shouldSaveRoute(toSave)) {
      onSave(getKey(), toSave);
    }
  };

  render() {
    return <React.Fragment>{this.props.children}</React.Fragment>;
  }
}
