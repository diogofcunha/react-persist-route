# 💾 react-persist-route 📱

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[build-badge]: https://img.shields.io/travis/diogofcunha/react-persist-route/master.png?style=flat-square
[build]: https://travis-ci.org/diogofcunha/react-persist-route
[npm-badge]: https://img.shields.io/npm/v/react-persist-route.png?style=flat-square
[npm]: https://www.npmjs.com/package/react-persist-route
[coveralls-badge]: https://img.shields.io/coveralls/diogofcunha/react-persist-route/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/diogofcunha/react-persist-route

### 🚀 Save your url information, anywhere and anyhow.

This package enables to possibility of saving url transitions with minimum work, it is compatible with your favorite routers, **react-router** and **@reach/router**.

# The problem

In some specific situations you may need to persist route information for your web app, this is specially useful for **iOS PWAs** since they always redirect the user to the home page when launched (https://stackoverflow.com/questions/6930771/stop-reloading-of-web-app-launched-from-iphone-home-screen). Although this package won't solve issues related to multi factor auth on ios pwas, it will save your user a lot of pain while using the app on the day to day.

# Usage

```javascript
import ReactPersistRoute from "react-persist-route";
import {createLocalStorageAdapter} from "react-persist-route/lib/Adapters/localStorageAdapter"

const history = ... // History can be the history object from react-router of reach route

// The fallback url for your app, generally would be the home page.
const fallback = {
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

const adapter = createLocalStorageAdapter('appkey', fallback)


<ReactPersistRoute history={history} adapter={adapter}/>
```

# Main concepts

### Persistence Adapters

A persistence adapter is a an object of that implements the following interface

```typescript
export interface PersistenceAdapter {
  getKey: () => string;
  onSave: (key: string, location: SerializableLocation) => Promise<string>;
  onLoad: (key: string) => Promise<SerializableLocation | null>;
  onClear: (key: string) => Promise<void>;
}
```

The main goal of persistence adapters is enable save to any data source (LocalStorage, indexedDB, server). This package the following adapters out of the box (this doesn't mean you need to use them):

- Local storage
