import React from "react";

export type Action = "PUSH" | "POP" | "REPLACE";
export type UnregisterCallback = () => void;
export type LocationListener = (location: Location, action: Action) => void;

export interface History {
  listen(listener: LocationListener): UnregisterCallback;
  push(path: string): void;
}

export type SerializableLocation = Pick<
  Location,
  | "hash"
  | "host"
  | "hostname"
  | "href"
  | "origin"
  | "pathname"
  | "port"
  | "protocol"
  | "search"
>;

export interface PersistenceAdapter {
  getKey: () => string;
  onSave: (key: string, location: SerializableLocation) => Promise<string>;
  onLoad: (key: string) => Promise<SerializableLocation | null>;
  onClear: (key: string) => Promise<void>;
}

export interface Props<H extends History> {
  history: H;
  adapter: PersistenceAdapter;
}

export default class ReactPersistRoute<
  H extends History
> extends React.Component<Props<H>> {
  private _isMounted = true;
  private _unlisten?: UnregisterCallback;

  async componentDidMount() {
    const {
      history,
      adapter: { getKey, onLoad }
    } = this.props;

    const location = await onLoad(getKey());

    if (this._isMounted) {
      if (location) {
        history.push(location.href);
      }

      this._unlisten = history.listen(this.onRouteChanged);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this._unlisten && this._unlisten();
  }

  onRouteChanged: LocationListener = ({
    hash,
    host,
    hostname,
    href,
    origin,
    pathname,
    port,
    protocol,
    search
  }) => {
    const {
      adapter: { getKey, onSave }
    } = this.props;

    onSave(getKey(), {
      hash,
      host,
      hostname,
      href,
      origin,
      pathname,
      port,
      protocol,
      search
    });
  };

  render() {
    return <React.Fragment>{this.props.children}</React.Fragment>;
  }
}
