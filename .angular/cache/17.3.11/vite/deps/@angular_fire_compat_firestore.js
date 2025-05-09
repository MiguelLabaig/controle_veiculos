import "./chunk-CDVNRDUK.js";
import {
  FIREBASE_APP_NAME,
  FIREBASE_OPTIONS,
  ɵapplyMixins,
  ɵcacheInstance,
  ɵfirebaseAppFactory,
  ɵlazySDKProxy
} from "./chunk-WJCYA2T2.js";
import {
  firebase
} from "./chunk-M7DFWCTJ.js";
import {
  AbstractUserDataWriter,
  Bytes,
  DatabaseId,
  DocumentKey,
  DocumentReference,
  DocumentSnapshot,
  FieldPath,
  FieldPath$1,
  FirestoreError,
  GeoPoint,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Se,
  Timestamp,
  WriteBatch,
  __PRIVATE_cast,
  __PRIVATE_debugAssert,
  __PRIVATE_isBase64Available,
  __PRIVATE_logWarn,
  __PRIVATE_validateIsNotUsedTogether,
  addDoc,
  arrayRemove,
  arrayUnion,
  clearIndexedDbPersistence,
  collection,
  collectionGroup,
  connectFirestoreEmulator,
  deleteDoc,
  deleteField,
  disableNetwork,
  doc,
  enableIndexedDbPersistence,
  enableMultiTabIndexedDbPersistence,
  enableNetwork,
  endAt,
  endBefore,
  ensureFirestoreConfigured,
  executeWrite,
  getDoc,
  getDocFromCache,
  getDocFromServer,
  getDocs,
  getDocsFromCache,
  getDocsFromServer,
  increment,
  limit,
  limitToLast,
  loadBundle,
  namedQuery,
  onSnapshot,
  onSnapshotsInSync,
  orderBy,
  query,
  queryEqual,
  refEqual,
  runTransaction,
  serverTimestamp,
  setDoc,
  setLogLevel,
  snapshotEqual,
  startAfter,
  startAt,
  updateDoc,
  waitForPendingWrites,
  where
} from "./chunk-WSUY6KZP.js";
import "./chunk-LJ7DGQ5M.js";
import {
  FirebaseApp
} from "./chunk-VDAXEOOY.js";
import {
  VERSION,
  keepUnstableUntilFirst,
  ɵAPP_CHECK_PROVIDER_NAME,
  ɵAngularFireSchedulers,
  ɵAppCheckInstances,
  ɵgetAllInstancesOf,
  ɵgetDefaultInstanceOf,
  ɵzoneWrap
} from "./chunk-CTNQU4HE.js";
import {
  Component,
  Deferred,
  ErrorFactory,
  Logger,
  _getProvider,
  _registerComponent,
  base64,
  getApp,
  getGlobal,
  getModularInstance,
  isIndexedDBAvailable,
  registerVersion,
  uuidv4
} from "./chunk-PNZCEXA2.js";
import {
  isPlatformServer
} from "./chunk-M4BJOSP5.js";
import {
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
  NgZone,
  Observable,
  Optional,
  PLATFORM_ID,
  Subject,
  asyncScheduler,
  concatMap,
  distinct,
  distinctUntilChanged,
  filter,
  first,
  from,
  map,
  merge,
  observeOn,
  of,
  pairwise,
  scan,
  setClassMetadata,
  shareReplay,
  startWith,
  subscribeOn,
  switchMap,
  switchMapTo,
  timer,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵinject
} from "./chunk-4PPUPQSW.js";
import {
  __async,
  __spreadValues
} from "./chunk-4HL624HE.js";

// node_modules/@angular/fire/node_modules/@firebase/app-check/dist/esm/index.esm2017.js
var APP_CHECK_STATES = /* @__PURE__ */ new Map();
var DEFAULT_STATE = {
  activated: false,
  tokenObservers: []
};
var DEBUG_STATE = {
  initialized: false,
  enabled: false
};
function getStateReference(app) {
  return APP_CHECK_STATES.get(app) || Object.assign({}, DEFAULT_STATE);
}
function setInitialState(app, state) {
  APP_CHECK_STATES.set(app, state);
  return APP_CHECK_STATES.get(app);
}
function getDebugState() {
  return DEBUG_STATE;
}
var BASE_ENDPOINT = "https://content-firebaseappcheck.googleapis.com/v1";
var EXCHANGE_DEBUG_TOKEN_METHOD = "exchangeDebugToken";
var TOKEN_REFRESH_TIME = {
  /**
   * The offset time before token natural expiration to run the refresh.
   * This is currently 5 minutes.
   */
  OFFSET_DURATION: 5 * 60 * 1e3,
  /**
   * This is the first retrial wait after an error. This is currently
   * 30 seconds.
   */
  RETRIAL_MIN_WAIT: 30 * 1e3,
  /**
   * This is the maximum retrial wait, currently 16 minutes.
   */
  RETRIAL_MAX_WAIT: 16 * 60 * 1e3
};
var ONE_DAY = 24 * 60 * 60 * 1e3;
var Refresher = class {
  constructor(operation, retryPolicy, getWaitDuration, lowerBound, upperBound) {
    this.operation = operation;
    this.retryPolicy = retryPolicy;
    this.getWaitDuration = getWaitDuration;
    this.lowerBound = lowerBound;
    this.upperBound = upperBound;
    this.pending = null;
    this.nextErrorWaitInterval = lowerBound;
    if (lowerBound > upperBound) {
      throw new Error("Proactive refresh lower bound greater than upper bound!");
    }
  }
  start() {
    this.nextErrorWaitInterval = this.lowerBound;
    this.process(true).catch(() => {
    });
  }
  stop() {
    if (this.pending) {
      this.pending.reject("cancelled");
      this.pending = null;
    }
  }
  isRunning() {
    return !!this.pending;
  }
  process(hasSucceeded) {
    return __async(this, null, function* () {
      this.stop();
      try {
        this.pending = new Deferred();
        this.pending.promise.catch((_e) => {
        });
        yield sleep(this.getNextRun(hasSucceeded));
        this.pending.resolve();
        yield this.pending.promise;
        this.pending = new Deferred();
        this.pending.promise.catch((_e) => {
        });
        yield this.operation();
        this.pending.resolve();
        yield this.pending.promise;
        this.process(true).catch(() => {
        });
      } catch (error) {
        if (this.retryPolicy(error)) {
          this.process(false).catch(() => {
          });
        } else {
          this.stop();
        }
      }
    });
  }
  getNextRun(hasSucceeded) {
    if (hasSucceeded) {
      this.nextErrorWaitInterval = this.lowerBound;
      return this.getWaitDuration();
    } else {
      const currentErrorWaitInterval = this.nextErrorWaitInterval;
      this.nextErrorWaitInterval *= 2;
      if (this.nextErrorWaitInterval > this.upperBound) {
        this.nextErrorWaitInterval = this.upperBound;
      }
      return currentErrorWaitInterval;
    }
  }
};
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
var ERRORS = {
  [
    "already-initialized"
    /* AppCheckError.ALREADY_INITIALIZED */
  ]: "You have already called initializeAppCheck() for FirebaseApp {$appName} with different options. To avoid this error, call initializeAppCheck() with the same options as when it was originally called. This will return the already initialized instance.",
  [
    "use-before-activation"
    /* AppCheckError.USE_BEFORE_ACTIVATION */
  ]: "App Check is being used before initializeAppCheck() is called for FirebaseApp {$appName}. Call initializeAppCheck() before instantiating other Firebase services.",
  [
    "fetch-network-error"
    /* AppCheckError.FETCH_NETWORK_ERROR */
  ]: "Fetch failed to connect to a network. Check Internet connection. Original error: {$originalErrorMessage}.",
  [
    "fetch-parse-error"
    /* AppCheckError.FETCH_PARSE_ERROR */
  ]: "Fetch client could not parse response. Original error: {$originalErrorMessage}.",
  [
    "fetch-status-error"
    /* AppCheckError.FETCH_STATUS_ERROR */
  ]: "Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.",
  [
    "storage-open"
    /* AppCheckError.STORAGE_OPEN */
  ]: "Error thrown when opening storage. Original error: {$originalErrorMessage}.",
  [
    "storage-get"
    /* AppCheckError.STORAGE_GET */
  ]: "Error thrown when reading from storage. Original error: {$originalErrorMessage}.",
  [
    "storage-set"
    /* AppCheckError.STORAGE_WRITE */
  ]: "Error thrown when writing to storage. Original error: {$originalErrorMessage}.",
  [
    "recaptcha-error"
    /* AppCheckError.RECAPTCHA_ERROR */
  ]: "ReCAPTCHA error.",
  [
    "throttled"
    /* AppCheckError.THROTTLED */
  ]: `Requests throttled due to {$httpStatus} error. Attempts allowed again after {$time}`
};
var ERROR_FACTORY = new ErrorFactory("appCheck", "AppCheck", ERRORS);
function ensureActivated(app) {
  if (!getStateReference(app).activated) {
    throw ERROR_FACTORY.create("use-before-activation", {
      appName: app.name
    });
  }
}
function exchangeToken(_0, _1) {
  return __async(this, arguments, function* ({ url, body }, heartbeatServiceProvider) {
    const headers = {
      "Content-Type": "application/json"
    };
    const heartbeatService = heartbeatServiceProvider.getImmediate({
      optional: true
    });
    if (heartbeatService) {
      const heartbeatsHeader = yield heartbeatService.getHeartbeatsHeader();
      if (heartbeatsHeader) {
        headers["X-Firebase-Client"] = heartbeatsHeader;
      }
    }
    const options = {
      method: "POST",
      body: JSON.stringify(body),
      headers
    };
    let response;
    try {
      response = yield fetch(url, options);
    } catch (originalError) {
      throw ERROR_FACTORY.create("fetch-network-error", {
        originalErrorMessage: originalError === null || originalError === void 0 ? void 0 : originalError.message
      });
    }
    if (response.status !== 200) {
      throw ERROR_FACTORY.create("fetch-status-error", {
        httpStatus: response.status
      });
    }
    let responseBody;
    try {
      responseBody = yield response.json();
    } catch (originalError) {
      throw ERROR_FACTORY.create("fetch-parse-error", {
        originalErrorMessage: originalError === null || originalError === void 0 ? void 0 : originalError.message
      });
    }
    const match = responseBody.ttl.match(/^([\d.]+)(s)$/);
    if (!match || !match[2] || isNaN(Number(match[1]))) {
      throw ERROR_FACTORY.create("fetch-parse-error", {
        originalErrorMessage: `ttl field (timeToLive) is not in standard Protobuf Duration format: ${responseBody.ttl}`
      });
    }
    const timeToLiveAsNumber = Number(match[1]) * 1e3;
    const now = Date.now();
    return {
      token: responseBody.token,
      expireTimeMillis: now + timeToLiveAsNumber,
      issuedAtTimeMillis: now
    };
  });
}
function getExchangeDebugTokenRequest(app, debugToken) {
  const { projectId, appId, apiKey } = app.options;
  return {
    url: `${BASE_ENDPOINT}/projects/${projectId}/apps/${appId}:${EXCHANGE_DEBUG_TOKEN_METHOD}?key=${apiKey}`,
    body: {
      // eslint-disable-next-line
      debug_token: debugToken
    }
  };
}
var DB_NAME = "firebase-app-check-database";
var DB_VERSION = 1;
var STORE_NAME = "firebase-app-check-store";
var DEBUG_TOKEN_KEY = "debug-token";
var dbPromise = null;
function getDBPromise() {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      request.onerror = (event) => {
        var _a;
        reject(ERROR_FACTORY.create("storage-open", {
          originalErrorMessage: (_a = event.target.error) === null || _a === void 0 ? void 0 : _a.message
        }));
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        switch (event.oldVersion) {
          case 0:
            db.createObjectStore(STORE_NAME, {
              keyPath: "compositeKey"
            });
        }
      };
    } catch (e) {
      reject(ERROR_FACTORY.create("storage-open", {
        originalErrorMessage: e === null || e === void 0 ? void 0 : e.message
      }));
    }
  });
  return dbPromise;
}
function readTokenFromIndexedDB(app) {
  return read(computeKey(app));
}
function writeTokenToIndexedDB(app, token) {
  return write(computeKey(app), token);
}
function writeDebugTokenToIndexedDB(token) {
  return write(DEBUG_TOKEN_KEY, token);
}
function readDebugTokenFromIndexedDB() {
  return read(DEBUG_TOKEN_KEY);
}
function write(key, value) {
  return __async(this, null, function* () {
    const db = yield getDBPromise();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({
      compositeKey: key,
      value
    });
    return new Promise((resolve, reject) => {
      request.onsuccess = (_event) => {
        resolve();
      };
      transaction.onerror = (event) => {
        var _a;
        reject(ERROR_FACTORY.create("storage-set", {
          originalErrorMessage: (_a = event.target.error) === null || _a === void 0 ? void 0 : _a.message
        }));
      };
    });
  });
}
function read(key) {
  return __async(this, null, function* () {
    const db = yield getDBPromise();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const result = event.target.result;
        if (result) {
          resolve(result.value);
        } else {
          resolve(void 0);
        }
      };
      transaction.onerror = (event) => {
        var _a;
        reject(ERROR_FACTORY.create("storage-get", {
          originalErrorMessage: (_a = event.target.error) === null || _a === void 0 ? void 0 : _a.message
        }));
      };
    });
  });
}
function computeKey(app) {
  return `${app.options.appId}-${app.name}`;
}
var logger = new Logger("@firebase/app-check");
function readTokenFromStorage(app) {
  return __async(this, null, function* () {
    if (isIndexedDBAvailable()) {
      let token = void 0;
      try {
        token = yield readTokenFromIndexedDB(app);
      } catch (e) {
        logger.warn(`Failed to read token from IndexedDB. Error: ${e}`);
      }
      return token;
    }
    return void 0;
  });
}
function writeTokenToStorage(app, token) {
  if (isIndexedDBAvailable()) {
    return writeTokenToIndexedDB(app, token).catch((e) => {
      logger.warn(`Failed to write token to IndexedDB. Error: ${e}`);
    });
  }
  return Promise.resolve();
}
function readOrCreateDebugTokenFromStorage() {
  return __async(this, null, function* () {
    let existingDebugToken = void 0;
    try {
      existingDebugToken = yield readDebugTokenFromIndexedDB();
    } catch (_e) {
    }
    if (!existingDebugToken) {
      const newToken = uuidv4();
      writeDebugTokenToIndexedDB(newToken).catch((e) => logger.warn(`Failed to persist debug token to IndexedDB. Error: ${e}`));
      return newToken;
    } else {
      return existingDebugToken;
    }
  });
}
function isDebugMode() {
  const debugState = getDebugState();
  return debugState.enabled;
}
function getDebugToken() {
  return __async(this, null, function* () {
    const state = getDebugState();
    if (state.enabled && state.token) {
      return state.token.promise;
    } else {
      throw Error(`
            Can't get debug token in production mode.
        `);
    }
  });
}
function initializeDebugMode() {
  const globals = getGlobal();
  const debugState = getDebugState();
  debugState.initialized = true;
  if (typeof globals.FIREBASE_APPCHECK_DEBUG_TOKEN !== "string" && globals.FIREBASE_APPCHECK_DEBUG_TOKEN !== true) {
    return;
  }
  debugState.enabled = true;
  const deferredToken = new Deferred();
  debugState.token = deferredToken;
  if (typeof globals.FIREBASE_APPCHECK_DEBUG_TOKEN === "string") {
    deferredToken.resolve(globals.FIREBASE_APPCHECK_DEBUG_TOKEN);
  } else {
    deferredToken.resolve(readOrCreateDebugTokenFromStorage());
  }
}
var defaultTokenErrorData = { error: "UNKNOWN_ERROR" };
function formatDummyToken(tokenErrorData) {
  return base64.encodeString(
    JSON.stringify(tokenErrorData),
    /* webSafe= */
    false
  );
}
function getToken$2(appCheck, forceRefresh = false) {
  return __async(this, null, function* () {
    const app = appCheck.app;
    ensureActivated(app);
    const state = getStateReference(app);
    let token = state.token;
    let error = void 0;
    if (token && !isValid(token)) {
      state.token = void 0;
      token = void 0;
    }
    if (!token) {
      const cachedToken = yield state.cachedTokenPromise;
      if (cachedToken) {
        if (isValid(cachedToken)) {
          token = cachedToken;
        } else {
          yield writeTokenToStorage(app, void 0);
        }
      }
    }
    if (!forceRefresh && token && isValid(token)) {
      return {
        token: token.token
      };
    }
    let shouldCallListeners = false;
    if (isDebugMode()) {
      if (!state.exchangeTokenPromise) {
        state.exchangeTokenPromise = exchangeToken(getExchangeDebugTokenRequest(app, yield getDebugToken()), appCheck.heartbeatServiceProvider).finally(() => {
          state.exchangeTokenPromise = void 0;
        });
        shouldCallListeners = true;
      }
      const tokenFromDebugExchange = yield state.exchangeTokenPromise;
      yield writeTokenToStorage(app, tokenFromDebugExchange);
      state.token = tokenFromDebugExchange;
      return { token: tokenFromDebugExchange.token };
    }
    try {
      if (!state.exchangeTokenPromise) {
        state.exchangeTokenPromise = state.provider.getToken().finally(() => {
          state.exchangeTokenPromise = void 0;
        });
        shouldCallListeners = true;
      }
      token = yield getStateReference(app).exchangeTokenPromise;
    } catch (e) {
      if (e.code === `appCheck/${"throttled"}`) {
        logger.warn(e.message);
      } else {
        logger.error(e);
      }
      error = e;
    }
    let interopTokenResult;
    if (!token) {
      interopTokenResult = makeDummyTokenResult(error);
    } else if (error) {
      if (isValid(token)) {
        interopTokenResult = {
          token: token.token,
          internalError: error
        };
      } else {
        interopTokenResult = makeDummyTokenResult(error);
      }
    } else {
      interopTokenResult = {
        token: token.token
      };
      state.token = token;
      yield writeTokenToStorage(app, token);
    }
    if (shouldCallListeners) {
      notifyTokenListeners(app, interopTokenResult);
    }
    return interopTokenResult;
  });
}
function getLimitedUseToken$1(appCheck) {
  return __async(this, null, function* () {
    const app = appCheck.app;
    ensureActivated(app);
    const { provider } = getStateReference(app);
    if (isDebugMode()) {
      const debugToken = yield getDebugToken();
      const { token } = yield exchangeToken(getExchangeDebugTokenRequest(app, debugToken), appCheck.heartbeatServiceProvider);
      return { token };
    } else {
      const { token } = yield provider.getToken();
      return { token };
    }
  });
}
function addTokenListener(appCheck, type, listener, onError) {
  const { app } = appCheck;
  const state = getStateReference(app);
  const tokenObserver = {
    next: listener,
    error: onError,
    type
  };
  state.tokenObservers = [...state.tokenObservers, tokenObserver];
  if (state.token && isValid(state.token)) {
    const validToken = state.token;
    Promise.resolve().then(() => {
      listener({ token: validToken.token });
      initTokenRefresher(appCheck);
    }).catch(() => {
    });
  }
  void state.cachedTokenPromise.then(() => initTokenRefresher(appCheck));
}
function removeTokenListener(app, listener) {
  const state = getStateReference(app);
  const newObservers = state.tokenObservers.filter((tokenObserver) => tokenObserver.next !== listener);
  if (newObservers.length === 0 && state.tokenRefresher && state.tokenRefresher.isRunning()) {
    state.tokenRefresher.stop();
  }
  state.tokenObservers = newObservers;
}
function initTokenRefresher(appCheck) {
  const { app } = appCheck;
  const state = getStateReference(app);
  let refresher = state.tokenRefresher;
  if (!refresher) {
    refresher = createTokenRefresher(appCheck);
    state.tokenRefresher = refresher;
  }
  if (!refresher.isRunning() && state.isTokenAutoRefreshEnabled) {
    refresher.start();
  }
}
function createTokenRefresher(appCheck) {
  const { app } = appCheck;
  return new Refresher(
    // Keep in mind when this fails for any reason other than the ones
    // for which we should retry, it will effectively stop the proactive refresh.
    () => __async(this, null, function* () {
      const state = getStateReference(app);
      let result;
      if (!state.token) {
        result = yield getToken$2(appCheck);
      } else {
        result = yield getToken$2(appCheck, true);
      }
      if (result.error) {
        throw result.error;
      }
      if (result.internalError) {
        throw result.internalError;
      }
    }),
    () => {
      return true;
    },
    () => {
      const state = getStateReference(app);
      if (state.token) {
        let nextRefreshTimeMillis = state.token.issuedAtTimeMillis + (state.token.expireTimeMillis - state.token.issuedAtTimeMillis) * 0.5 + 5 * 60 * 1e3;
        const latestAllowableRefresh = state.token.expireTimeMillis - 5 * 60 * 1e3;
        nextRefreshTimeMillis = Math.min(nextRefreshTimeMillis, latestAllowableRefresh);
        return Math.max(0, nextRefreshTimeMillis - Date.now());
      } else {
        return 0;
      }
    },
    TOKEN_REFRESH_TIME.RETRIAL_MIN_WAIT,
    TOKEN_REFRESH_TIME.RETRIAL_MAX_WAIT
  );
}
function notifyTokenListeners(app, token) {
  const observers = getStateReference(app).tokenObservers;
  for (const observer of observers) {
    try {
      if (observer.type === "EXTERNAL" && token.error != null) {
        observer.error(token.error);
      } else {
        observer.next(token);
      }
    } catch (e) {
    }
  }
}
function isValid(token) {
  return token.expireTimeMillis - Date.now() > 0;
}
function makeDummyTokenResult(error) {
  return {
    token: formatDummyToken(defaultTokenErrorData),
    error
  };
}
var AppCheckService = class {
  constructor(app, heartbeatServiceProvider) {
    this.app = app;
    this.heartbeatServiceProvider = heartbeatServiceProvider;
  }
  _delete() {
    const { tokenObservers } = getStateReference(this.app);
    for (const tokenObserver of tokenObservers) {
      removeTokenListener(this.app, tokenObserver.next);
    }
    return Promise.resolve();
  }
};
function factory(app, heartbeatServiceProvider) {
  return new AppCheckService(app, heartbeatServiceProvider);
}
function internalFactory(appCheck) {
  return {
    getToken: (forceRefresh) => getToken$2(appCheck, forceRefresh),
    getLimitedUseToken: () => getLimitedUseToken$1(appCheck),
    addTokenListener: (listener) => addTokenListener(appCheck, "INTERNAL", listener),
    removeTokenListener: (listener) => removeTokenListener(appCheck.app, listener)
  };
}
var name = "@firebase/app-check";
var version = "0.8.8";
function initializeAppCheck(app = getApp(), options) {
  app = getModularInstance(app);
  const provider = _getProvider(app, "app-check");
  if (!getDebugState().initialized) {
    initializeDebugMode();
  }
  if (isDebugMode()) {
    void getDebugToken().then((token) => (
      // Not using logger because I don't think we ever want this accidentally hidden.
      console.log(`App Check debug token: ${token}. You will need to add it to your app's App Check settings in the Firebase console for it to work.`)
    ));
  }
  if (provider.isInitialized()) {
    const existingInstance = provider.getImmediate();
    const initialOptions = provider.getOptions();
    if (initialOptions.isTokenAutoRefreshEnabled === options.isTokenAutoRefreshEnabled && initialOptions.provider.isEqual(options.provider)) {
      return existingInstance;
    } else {
      throw ERROR_FACTORY.create("already-initialized", {
        appName: app.name
      });
    }
  }
  const appCheck = provider.initialize({ options });
  _activate(app, options.provider, options.isTokenAutoRefreshEnabled);
  if (getStateReference(app).isTokenAutoRefreshEnabled) {
    addTokenListener(appCheck, "INTERNAL", () => {
    });
  }
  return appCheck;
}
function _activate(app, provider, isTokenAutoRefreshEnabled) {
  const state = setInitialState(app, Object.assign({}, DEFAULT_STATE));
  state.activated = true;
  state.provider = provider;
  state.cachedTokenPromise = readTokenFromStorage(app).then((cachedToken) => {
    if (cachedToken && isValid(cachedToken)) {
      state.token = cachedToken;
      notifyTokenListeners(app, { token: cachedToken.token });
    }
    return cachedToken;
  });
  state.isTokenAutoRefreshEnabled = isTokenAutoRefreshEnabled === void 0 ? app.automaticDataCollectionEnabled : isTokenAutoRefreshEnabled;
  state.provider.initialize(app);
}
function setTokenAutoRefreshEnabled(appCheckInstance, isTokenAutoRefreshEnabled) {
  const app = appCheckInstance.app;
  const state = getStateReference(app);
  if (state.tokenRefresher) {
    if (isTokenAutoRefreshEnabled === true) {
      state.tokenRefresher.start();
    } else {
      state.tokenRefresher.stop();
    }
  }
  state.isTokenAutoRefreshEnabled = isTokenAutoRefreshEnabled;
}
function getToken(appCheckInstance, forceRefresh) {
  return __async(this, null, function* () {
    const result = yield getToken$2(appCheckInstance, forceRefresh);
    if (result.error) {
      throw result.error;
    }
    return { token: result.token };
  });
}
function getLimitedUseToken(appCheckInstance) {
  return getLimitedUseToken$1(appCheckInstance);
}
function onTokenChanged(appCheckInstance, onNextOrObserver, onError, onCompletion) {
  let nextFn = () => {
  };
  let errorFn = () => {
  };
  if (onNextOrObserver.next != null) {
    nextFn = onNextOrObserver.next.bind(onNextOrObserver);
  } else {
    nextFn = onNextOrObserver;
  }
  if (onNextOrObserver.error != null) {
    errorFn = onNextOrObserver.error.bind(onNextOrObserver);
  } else if (onError) {
    errorFn = onError;
  }
  addTokenListener(appCheckInstance, "EXTERNAL", nextFn, errorFn);
  return () => removeTokenListener(appCheckInstance.app, nextFn);
}
var APP_CHECK_NAME = "app-check";
var APP_CHECK_NAME_INTERNAL = "app-check-internal";
function registerAppCheck() {
  _registerComponent(new Component(
    APP_CHECK_NAME,
    (container) => {
      const app = container.getProvider("app").getImmediate();
      const heartbeatServiceProvider = container.getProvider("heartbeat");
      return factory(app, heartbeatServiceProvider);
    },
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setInstantiationMode(
    "EXPLICIT"
    /* InstantiationMode.EXPLICIT */
  ).setInstanceCreatedCallback((container, _identifier, _appcheckService) => {
    container.getProvider(APP_CHECK_NAME_INTERNAL).initialize();
  }));
  _registerComponent(new Component(
    APP_CHECK_NAME_INTERNAL,
    (container) => {
      const appCheck = container.getProvider("app-check").getImmediate();
      return internalFactory(appCheck);
    },
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setInstantiationMode(
    "EXPLICIT"
    /* InstantiationMode.EXPLICIT */
  ));
  registerVersion(name, version);
}
registerAppCheck();

// node_modules/@angular/fire/fesm2022/angular-fire-app-check.mjs
var AppCheck = class {
  constructor(appCheck) {
    return appCheck;
  }
};
var appCheckInstance$ = timer(0, 300).pipe(concatMap(() => from(ɵgetAllInstancesOf(ɵAPP_CHECK_PROVIDER_NAME))), distinct());
var PROVIDED_APP_CHECK_INSTANCES = new InjectionToken("angularfire2.app-check-instances");
function defaultAppCheckInstanceFactory(provided, defaultApp) {
  const defaultAppCheck = ɵgetDefaultInstanceOf(ɵAPP_CHECK_PROVIDER_NAME, provided, defaultApp);
  return defaultAppCheck && new AppCheck(defaultAppCheck);
}
var LOCALHOSTS = ["localhost", "0.0.0.0", "127.0.0.1"];
var isLocalhost = typeof window !== "undefined" && LOCALHOSTS.includes(window.location.hostname);
var APP_CHECK_INSTANCES_PROVIDER = {
  provide: ɵAppCheckInstances,
  deps: [[new Optional(), PROVIDED_APP_CHECK_INSTANCES]]
};
var DEFAULT_APP_CHECK_INSTANCE_PROVIDER = {
  provide: AppCheck,
  useFactory: defaultAppCheckInstanceFactory,
  deps: [[new Optional(), PROVIDED_APP_CHECK_INSTANCES], FirebaseApp, PLATFORM_ID]
};
var AppCheckModule = class _AppCheckModule {
  constructor() {
    registerVersion("angularfire", VERSION.full, "app-check");
  }
  static ɵfac = function AppCheckModule_Factory(t) {
    return new (t || _AppCheckModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _AppCheckModule
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [DEFAULT_APP_CHECK_INSTANCE_PROVIDER, APP_CHECK_INSTANCES_PROVIDER]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AppCheckModule, [{
    type: NgModule,
    args: [{
      providers: [DEFAULT_APP_CHECK_INSTANCE_PROVIDER, APP_CHECK_INSTANCES_PROVIDER]
    }]
  }], () => [], null);
})();
var getLimitedUseToken2 = ɵzoneWrap(getLimitedUseToken, true);
var getToken2 = ɵzoneWrap(getToken, true);
var initializeAppCheck2 = ɵzoneWrap(initializeAppCheck, true);
var onTokenChanged2 = ɵzoneWrap(onTokenChanged, true);
var setTokenAutoRefreshEnabled2 = ɵzoneWrap(setTokenAutoRefreshEnabled, true);

// node_modules/@angular/fire/fesm2022/angular-fire-compat-auth.mjs
var proxyPolyfillCompat = {
  name: null,
  config: null,
  emulatorConfig: null,
  app: null,
  applyActionCode: null,
  checkActionCode: null,
  confirmPasswordReset: null,
  createUserWithEmailAndPassword: null,
  currentUser: null,
  fetchSignInMethodsForEmail: null,
  isSignInWithEmailLink: null,
  getRedirectResult: null,
  languageCode: null,
  settings: null,
  onAuthStateChanged: null,
  onIdTokenChanged: null,
  sendSignInLinkToEmail: null,
  sendPasswordResetEmail: null,
  setPersistence: null,
  signInAndRetrieveDataWithCredential: null,
  signInAnonymously: null,
  signInWithCredential: null,
  signInWithCustomToken: null,
  signInWithEmailAndPassword: null,
  signInWithPhoneNumber: null,
  signInWithEmailLink: null,
  signInWithPopup: null,
  signInWithRedirect: null,
  signOut: null,
  tenantId: null,
  updateCurrentUser: null,
  useDeviceLanguage: null,
  useEmulator: null,
  verifyPasswordResetCode: null
};
var USE_EMULATOR = new InjectionToken("angularfire2.auth.use-emulator");
var SETTINGS = new InjectionToken("angularfire2.auth.settings");
var TENANT_ID = new InjectionToken("angularfire2.auth.tenant-id");
var LANGUAGE_CODE = new InjectionToken("angularfire2.auth.langugage-code");
var USE_DEVICE_LANGUAGE = new InjectionToken("angularfire2.auth.use-device-language");
var PERSISTENCE = new InjectionToken("angularfire.auth.persistence");
var ɵauthFactory = (app, zone, useEmulator, tenantId, languageCode, useDeviceLanguage, settings, persistence) => ɵcacheInstance(`${app.name}.auth`, "AngularFireAuth", app.name, () => {
  const auth = zone.runOutsideAngular(() => app.auth());
  if (useEmulator) {
    auth.useEmulator(...useEmulator);
  }
  if (tenantId) {
    auth.tenantId = tenantId;
  }
  auth.languageCode = languageCode;
  if (useDeviceLanguage) {
    auth.useDeviceLanguage();
  }
  if (settings) {
    for (const [k, v] of Object.entries(settings)) {
      auth.settings[k] = v;
    }
  }
  if (persistence) {
    auth.setPersistence(persistence);
  }
  return auth;
}, [useEmulator, tenantId, languageCode, useDeviceLanguage, settings, persistence]);
var AngularFireAuth = class _AngularFireAuth {
  /**
   * Observable of authentication state; as of Firebase 4.0 this is only triggered via sign-in/out
   */
  authState;
  /**
   * Observable of the currently signed-in user's JWT token used to identify the user to a Firebase service (or null).
   */
  idToken;
  /**
   * Observable of the currently signed-in user (or null).
   */
  user;
  /**
   * Observable of the currently signed-in user's IdTokenResult object which contains the ID token JWT string and other
   * helper properties for getting different data associated with the token as well as all the decoded payload claims
   * (or null).
   */
  idTokenResult;
  /**
   * Observable of the currently signed-in user's credential, or null
   */
  credential;
  constructor(options, name3, platformId, zone, schedulers, useEmulator, settings, tenantId, languageCode, useDeviceLanguage, persistence, _appCheckInstances) {
    const logins = new Subject();
    const auth = of(void 0).pipe(observeOn(schedulers.outsideAngular), switchMap(() => zone.runOutsideAngular(() => import("./index.esm-IXLCSQYW.js"))), map(() => ɵfirebaseAppFactory(options, zone, name3)), map((app) => ɵauthFactory(app, zone, useEmulator, tenantId, languageCode, useDeviceLanguage, settings, persistence)), shareReplay({
      bufferSize: 1,
      refCount: false
    }));
    if (isPlatformServer(platformId)) {
      this.authState = this.user = this.idToken = this.idTokenResult = this.credential = of(null);
    } else {
      auth.pipe(first()).subscribe();
      const redirectResult = auth.pipe(switchMap((auth2) => auth2.getRedirectResult().then((it) => it, () => null)), keepUnstableUntilFirst, shareReplay({
        bufferSize: 1,
        refCount: false
      }));
      const authStateChanged = auth.pipe(switchMap((auth2) => new Observable((sub) => ({
        unsubscribe: zone.runOutsideAngular(() => auth2.onAuthStateChanged((next) => sub.next(next), (err) => sub.error(err), () => sub.complete()))
      }))));
      const idTokenChanged = auth.pipe(switchMap((auth2) => new Observable((sub) => ({
        unsubscribe: zone.runOutsideAngular(() => auth2.onIdTokenChanged((next) => sub.next(next), (err) => sub.error(err), () => sub.complete()))
      }))));
      this.authState = redirectResult.pipe(switchMapTo(authStateChanged), subscribeOn(schedulers.outsideAngular), observeOn(schedulers.insideAngular));
      this.user = redirectResult.pipe(switchMapTo(idTokenChanged), subscribeOn(schedulers.outsideAngular), observeOn(schedulers.insideAngular));
      this.idToken = this.user.pipe(switchMap((user) => user ? from(user.getIdToken()) : of(null)));
      this.idTokenResult = this.user.pipe(switchMap((user) => user ? from(user.getIdTokenResult()) : of(null)));
      this.credential = merge(
        redirectResult,
        logins,
        // pipe in null authState to make credential zipable, just a weird devexp if
        // authState and user go null to still have a credential
        this.authState.pipe(filter((it) => !it))
      ).pipe(
        // handle the { user: { } } when a user is already logged in, rather have null
        // TODO handle the type corcersion better
        map((credential) => credential?.user ? credential : null),
        subscribeOn(schedulers.outsideAngular),
        observeOn(schedulers.insideAngular)
      );
    }
    return ɵlazySDKProxy(this, auth, zone, {
      spy: {
        apply: (name4, _, val) => {
          if (name4.startsWith("signIn") || name4.startsWith("createUser")) {
            val.then((user) => logins.next(user));
          }
        }
      }
    });
  }
  static ɵfac = function AngularFireAuth_Factory(t) {
    return new (t || _AngularFireAuth)(ɵɵinject(FIREBASE_OPTIONS), ɵɵinject(FIREBASE_APP_NAME, 8), ɵɵinject(PLATFORM_ID), ɵɵinject(NgZone), ɵɵinject(ɵAngularFireSchedulers), ɵɵinject(USE_EMULATOR, 8), ɵɵinject(SETTINGS, 8), ɵɵinject(TENANT_ID, 8), ɵɵinject(LANGUAGE_CODE, 8), ɵɵinject(USE_DEVICE_LANGUAGE, 8), ɵɵinject(PERSISTENCE, 8), ɵɵinject(ɵAppCheckInstances, 8));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _AngularFireAuth,
    factory: _AngularFireAuth.ɵfac,
    providedIn: "any"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AngularFireAuth, [{
    type: Injectable,
    args: [{
      providedIn: "any"
    }]
  }], () => [{
    type: void 0,
    decorators: [{
      type: Inject,
      args: [FIREBASE_OPTIONS]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [FIREBASE_APP_NAME]
    }]
  }, {
    type: Object,
    decorators: [{
      type: Inject,
      args: [PLATFORM_ID]
    }]
  }, {
    type: NgZone
  }, {
    type: ɵAngularFireSchedulers
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [USE_EMULATOR]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [SETTINGS]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [TENANT_ID]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [LANGUAGE_CODE]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [USE_DEVICE_LANGUAGE]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [PERSISTENCE]
    }]
  }, {
    type: ɵAppCheckInstances,
    decorators: [{
      type: Optional
    }]
  }], null);
})();
ɵapplyMixins(AngularFireAuth, [proxyPolyfillCompat]);
var AngularFireAuthModule = class _AngularFireAuthModule {
  constructor() {
    firebase.registerVersion("angularfire", VERSION.full, "auth-compat");
  }
  static ɵfac = function AngularFireAuthModule_Factory(t) {
    return new (t || _AngularFireAuthModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _AngularFireAuthModule
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [AngularFireAuth]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AngularFireAuthModule, [{
    type: NgModule,
    args: [{
      providers: [AngularFireAuth]
    }]
  }], () => [], null);
})();

// node_modules/@angular/fire/node_modules/@firebase/firestore-compat/dist/index.esm2017.js
var name2 = "@firebase/firestore-compat";
var version2 = "0.3.38";
function validateSetOptions(methodName, options) {
  if (options === void 0) {
    return {
      merge: false
    };
  }
  if (options.mergeFields !== void 0 && options.merge !== void 0) {
    throw new FirestoreError("invalid-argument", `Invalid options passed to function ${methodName}(): You cannot specify both "merge" and "mergeFields".`);
  }
  return options;
}
function assertUint8ArrayAvailable() {
  if (typeof Uint8Array === "undefined") {
    throw new FirestoreError("unimplemented", "Uint8Arrays are not available in this environment.");
  }
}
function assertBase64Available() {
  if (!__PRIVATE_isBase64Available()) {
    throw new FirestoreError("unimplemented", "Blobs are unavailable in Firestore in this environment.");
  }
}
var Blob = class _Blob {
  constructor(_delegate) {
    this._delegate = _delegate;
  }
  static fromBase64String(base642) {
    assertBase64Available();
    return new _Blob(Bytes.fromBase64String(base642));
  }
  static fromUint8Array(array) {
    assertUint8ArrayAvailable();
    return new _Blob(Bytes.fromUint8Array(array));
  }
  toBase64() {
    assertBase64Available();
    return this._delegate.toBase64();
  }
  toUint8Array() {
    assertUint8ArrayAvailable();
    return this._delegate.toUint8Array();
  }
  isEqual(other) {
    return this._delegate.isEqual(other._delegate);
  }
  toString() {
    return "Blob(base64: " + this.toBase64() + ")";
  }
};
function isPartialObserver(obj) {
  return implementsAnyMethods(obj, ["next", "error", "complete"]);
}
function implementsAnyMethods(obj, methods) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const object = obj;
  for (const method of methods) {
    if (method in object && typeof object[method] === "function") {
      return true;
    }
  }
  return false;
}
var IndexedDbPersistenceProvider = class {
  enableIndexedDbPersistence(firestore, forceOwnership) {
    return enableIndexedDbPersistence(firestore._delegate, { forceOwnership });
  }
  enableMultiTabIndexedDbPersistence(firestore) {
    return enableMultiTabIndexedDbPersistence(firestore._delegate);
  }
  clearIndexedDbPersistence(firestore) {
    return clearIndexedDbPersistence(firestore._delegate);
  }
};
var Firestore = class {
  constructor(databaseIdOrApp, _delegate, _persistenceProvider) {
    this._delegate = _delegate;
    this._persistenceProvider = _persistenceProvider;
    this.INTERNAL = {
      delete: () => this.terminate()
    };
    if (!(databaseIdOrApp instanceof DatabaseId)) {
      this._appCompat = databaseIdOrApp;
    }
  }
  get _databaseId() {
    return this._delegate._databaseId;
  }
  settings(settingsLiteral) {
    const currentSettings = this._delegate._getSettings();
    if (!settingsLiteral.merge && currentSettings.host !== settingsLiteral.host) {
      __PRIVATE_logWarn("You are overriding the original host. If you did not intend to override your settings, use {merge: true}.");
    }
    if (settingsLiteral.merge) {
      settingsLiteral = Object.assign(Object.assign({}, currentSettings), settingsLiteral);
      delete settingsLiteral.merge;
    }
    this._delegate._setSettings(settingsLiteral);
  }
  useEmulator(host, port, options = {}) {
    connectFirestoreEmulator(this._delegate, host, port, options);
  }
  enableNetwork() {
    return enableNetwork(this._delegate);
  }
  disableNetwork() {
    return disableNetwork(this._delegate);
  }
  enablePersistence(settings) {
    let synchronizeTabs = false;
    let experimentalForceOwningTab = false;
    if (settings) {
      synchronizeTabs = !!settings.synchronizeTabs;
      experimentalForceOwningTab = !!settings.experimentalForceOwningTab;
      __PRIVATE_validateIsNotUsedTogether("synchronizeTabs", synchronizeTabs, "experimentalForceOwningTab", experimentalForceOwningTab);
    }
    return synchronizeTabs ? this._persistenceProvider.enableMultiTabIndexedDbPersistence(this) : this._persistenceProvider.enableIndexedDbPersistence(this, experimentalForceOwningTab);
  }
  clearPersistence() {
    return this._persistenceProvider.clearIndexedDbPersistence(this);
  }
  terminate() {
    if (this._appCompat) {
      this._appCompat._removeServiceInstance("firestore-compat");
      this._appCompat._removeServiceInstance("firestore");
    }
    return this._delegate._delete();
  }
  waitForPendingWrites() {
    return waitForPendingWrites(this._delegate);
  }
  onSnapshotsInSync(arg) {
    return onSnapshotsInSync(this._delegate, arg);
  }
  get app() {
    if (!this._appCompat) {
      throw new FirestoreError("failed-precondition", "Firestore was not initialized using the Firebase SDK. 'app' is not available");
    }
    return this._appCompat;
  }
  collection(pathString) {
    try {
      return new CollectionReference(this, collection(this._delegate, pathString));
    } catch (e) {
      throw replaceFunctionName(e, "collection()", "Firestore.collection()");
    }
  }
  doc(pathString) {
    try {
      return new DocumentReference2(this, doc(this._delegate, pathString));
    } catch (e) {
      throw replaceFunctionName(e, "doc()", "Firestore.doc()");
    }
  }
  collectionGroup(collectionId) {
    try {
      return new Query(this, collectionGroup(this._delegate, collectionId));
    } catch (e) {
      throw replaceFunctionName(e, "collectionGroup()", "Firestore.collectionGroup()");
    }
  }
  runTransaction(updateFunction) {
    return runTransaction(this._delegate, (transaction) => updateFunction(new Transaction(this, transaction)));
  }
  batch() {
    ensureFirestoreConfigured(this._delegate);
    return new WriteBatch2(new WriteBatch(this._delegate, (mutations) => executeWrite(this._delegate, mutations)));
  }
  loadBundle(bundleData) {
    return loadBundle(this._delegate, bundleData);
  }
  namedQuery(name3) {
    return namedQuery(this._delegate, name3).then((expQuery) => {
      if (!expQuery) {
        return null;
      }
      return new Query(
        this,
        // We can pass `expQuery` here directly since named queries don't have a UserDataConverter.
        // Otherwise, we would have to create a new ExpQuery and pass the old UserDataConverter.
        expQuery
      );
    });
  }
};
var UserDataWriter = class extends AbstractUserDataWriter {
  constructor(firestore) {
    super();
    this.firestore = firestore;
  }
  convertBytes(bytes) {
    return new Blob(new Bytes(bytes));
  }
  convertReference(name3) {
    const key = this.convertDocumentKey(name3, this.firestore._databaseId);
    return DocumentReference2.forKey(
      key,
      this.firestore,
      /* converter= */
      null
    );
  }
};
function setLogLevel2(level) {
  setLogLevel(level);
}
var Transaction = class {
  constructor(_firestore, _delegate) {
    this._firestore = _firestore;
    this._delegate = _delegate;
    this._userDataWriter = new UserDataWriter(_firestore);
  }
  get(documentRef) {
    const ref = castReference(documentRef);
    return this._delegate.get(ref).then((result) => new DocumentSnapshot2(this._firestore, new DocumentSnapshot(this._firestore._delegate, this._userDataWriter, result._key, result._document, result.metadata, ref.converter)));
  }
  set(documentRef, data, options) {
    const ref = castReference(documentRef);
    if (options) {
      validateSetOptions("Transaction.set", options);
      this._delegate.set(ref, data, options);
    } else {
      this._delegate.set(ref, data);
    }
    return this;
  }
  update(documentRef, dataOrField, value, ...moreFieldsAndValues) {
    const ref = castReference(documentRef);
    if (arguments.length === 2) {
      this._delegate.update(ref, dataOrField);
    } else {
      this._delegate.update(ref, dataOrField, value, ...moreFieldsAndValues);
    }
    return this;
  }
  delete(documentRef) {
    const ref = castReference(documentRef);
    this._delegate.delete(ref);
    return this;
  }
};
var WriteBatch2 = class {
  constructor(_delegate) {
    this._delegate = _delegate;
  }
  set(documentRef, data, options) {
    const ref = castReference(documentRef);
    if (options) {
      validateSetOptions("WriteBatch.set", options);
      this._delegate.set(ref, data, options);
    } else {
      this._delegate.set(ref, data);
    }
    return this;
  }
  update(documentRef, dataOrField, value, ...moreFieldsAndValues) {
    const ref = castReference(documentRef);
    if (arguments.length === 2) {
      this._delegate.update(ref, dataOrField);
    } else {
      this._delegate.update(ref, dataOrField, value, ...moreFieldsAndValues);
    }
    return this;
  }
  delete(documentRef) {
    const ref = castReference(documentRef);
    this._delegate.delete(ref);
    return this;
  }
  commit() {
    return this._delegate.commit();
  }
};
var FirestoreDataConverter = class _FirestoreDataConverter {
  constructor(_firestore, _userDataWriter, _delegate) {
    this._firestore = _firestore;
    this._userDataWriter = _userDataWriter;
    this._delegate = _delegate;
  }
  fromFirestore(snapshot, options) {
    const expSnapshot = new QueryDocumentSnapshot(
      this._firestore._delegate,
      this._userDataWriter,
      snapshot._key,
      snapshot._document,
      snapshot.metadata,
      /* converter= */
      null
    );
    return this._delegate.fromFirestore(new QueryDocumentSnapshot2(this._firestore, expSnapshot), options !== null && options !== void 0 ? options : {});
  }
  toFirestore(modelObject, options) {
    if (!options) {
      return this._delegate.toFirestore(modelObject);
    } else {
      return this._delegate.toFirestore(modelObject, options);
    }
  }
  // Use the same instance of `FirestoreDataConverter` for the given instances
  // of `Firestore` and `PublicFirestoreDataConverter` so that isEqual() will
  // compare equal for two objects created with the same converter instance.
  static getInstance(firestore, converter) {
    const converterMapByFirestore = _FirestoreDataConverter.INSTANCES;
    let untypedConverterByConverter = converterMapByFirestore.get(firestore);
    if (!untypedConverterByConverter) {
      untypedConverterByConverter = /* @__PURE__ */ new WeakMap();
      converterMapByFirestore.set(firestore, untypedConverterByConverter);
    }
    let instance = untypedConverterByConverter.get(converter);
    if (!instance) {
      instance = new _FirestoreDataConverter(firestore, new UserDataWriter(firestore), converter);
      untypedConverterByConverter.set(converter, instance);
    }
    return instance;
  }
};
FirestoreDataConverter.INSTANCES = /* @__PURE__ */ new WeakMap();
var DocumentReference2 = class _DocumentReference {
  constructor(firestore, _delegate) {
    this.firestore = firestore;
    this._delegate = _delegate;
    this._userDataWriter = new UserDataWriter(firestore);
  }
  static forPath(path, firestore, converter) {
    if (path.length % 2 !== 0) {
      throw new FirestoreError("invalid-argument", `Invalid document reference. Document references must have an even number of segments, but ${path.canonicalString()} has ${path.length}`);
    }
    return new _DocumentReference(firestore, new DocumentReference(firestore._delegate, converter, new DocumentKey(path)));
  }
  static forKey(key, firestore, converter) {
    return new _DocumentReference(firestore, new DocumentReference(firestore._delegate, converter, key));
  }
  get id() {
    return this._delegate.id;
  }
  get parent() {
    return new CollectionReference(this.firestore, this._delegate.parent);
  }
  get path() {
    return this._delegate.path;
  }
  collection(pathString) {
    try {
      return new CollectionReference(this.firestore, collection(this._delegate, pathString));
    } catch (e) {
      throw replaceFunctionName(e, "collection()", "DocumentReference.collection()");
    }
  }
  isEqual(other) {
    other = getModularInstance(other);
    if (!(other instanceof DocumentReference)) {
      return false;
    }
    return refEqual(this._delegate, other);
  }
  set(value, options) {
    options = validateSetOptions("DocumentReference.set", options);
    try {
      if (options) {
        return setDoc(this._delegate, value, options);
      } else {
        return setDoc(this._delegate, value);
      }
    } catch (e) {
      throw replaceFunctionName(e, "setDoc()", "DocumentReference.set()");
    }
  }
  update(fieldOrUpdateData, value, ...moreFieldsAndValues) {
    try {
      if (arguments.length === 1) {
        return updateDoc(this._delegate, fieldOrUpdateData);
      } else {
        return updateDoc(this._delegate, fieldOrUpdateData, value, ...moreFieldsAndValues);
      }
    } catch (e) {
      throw replaceFunctionName(e, "updateDoc()", "DocumentReference.update()");
    }
  }
  delete() {
    return deleteDoc(this._delegate);
  }
  onSnapshot(...args) {
    const options = extractSnapshotOptions(args);
    const observer = wrapObserver(args, (result) => new DocumentSnapshot2(this.firestore, new DocumentSnapshot(this.firestore._delegate, this._userDataWriter, result._key, result._document, result.metadata, this._delegate.converter)));
    return onSnapshot(this._delegate, options, observer);
  }
  get(options) {
    let snap;
    if ((options === null || options === void 0 ? void 0 : options.source) === "cache") {
      snap = getDocFromCache(this._delegate);
    } else if ((options === null || options === void 0 ? void 0 : options.source) === "server") {
      snap = getDocFromServer(this._delegate);
    } else {
      snap = getDoc(this._delegate);
    }
    return snap.then((result) => new DocumentSnapshot2(this.firestore, new DocumentSnapshot(this.firestore._delegate, this._userDataWriter, result._key, result._document, result.metadata, this._delegate.converter)));
  }
  withConverter(converter) {
    return new _DocumentReference(this.firestore, converter ? this._delegate.withConverter(FirestoreDataConverter.getInstance(this.firestore, converter)) : this._delegate.withConverter(null));
  }
};
function replaceFunctionName(e, original, updated) {
  e.message = e.message.replace(original, updated);
  return e;
}
function extractSnapshotOptions(args) {
  for (const arg of args) {
    if (typeof arg === "object" && !isPartialObserver(arg)) {
      return arg;
    }
  }
  return {};
}
function wrapObserver(args, wrapper) {
  var _a, _b;
  let userObserver;
  if (isPartialObserver(args[0])) {
    userObserver = args[0];
  } else if (isPartialObserver(args[1])) {
    userObserver = args[1];
  } else if (typeof args[0] === "function") {
    userObserver = {
      next: args[0],
      error: args[1],
      complete: args[2]
    };
  } else {
    userObserver = {
      next: args[1],
      error: args[2],
      complete: args[3]
    };
  }
  return {
    next: (val) => {
      if (userObserver.next) {
        userObserver.next(wrapper(val));
      }
    },
    error: (_a = userObserver.error) === null || _a === void 0 ? void 0 : _a.bind(userObserver),
    complete: (_b = userObserver.complete) === null || _b === void 0 ? void 0 : _b.bind(userObserver)
  };
}
var DocumentSnapshot2 = class {
  constructor(_firestore, _delegate) {
    this._firestore = _firestore;
    this._delegate = _delegate;
  }
  get ref() {
    return new DocumentReference2(this._firestore, this._delegate.ref);
  }
  get id() {
    return this._delegate.id;
  }
  get metadata() {
    return this._delegate.metadata;
  }
  get exists() {
    return this._delegate.exists();
  }
  data(options) {
    return this._delegate.data(options);
  }
  get(fieldPath, options) {
    return this._delegate.get(fieldPath, options);
  }
  isEqual(other) {
    return snapshotEqual(this._delegate, other._delegate);
  }
};
var QueryDocumentSnapshot2 = class extends DocumentSnapshot2 {
  data(options) {
    const data = this._delegate.data(options);
    if (this._delegate._converter) {
      return data;
    } else {
      __PRIVATE_debugAssert(data !== void 0, "Document in a QueryDocumentSnapshot should exist");
      return data;
    }
  }
};
var Query = class _Query {
  constructor(firestore, _delegate) {
    this.firestore = firestore;
    this._delegate = _delegate;
    this._userDataWriter = new UserDataWriter(firestore);
  }
  where(fieldPath, opStr, value) {
    try {
      return new _Query(this.firestore, query(this._delegate, where(fieldPath, opStr, value)));
    } catch (e) {
      throw replaceFunctionName(e, /(orderBy|where)\(\)/, "Query.$1()");
    }
  }
  orderBy(fieldPath, directionStr) {
    try {
      return new _Query(this.firestore, query(this._delegate, orderBy(fieldPath, directionStr)));
    } catch (e) {
      throw replaceFunctionName(e, /(orderBy|where)\(\)/, "Query.$1()");
    }
  }
  limit(n) {
    try {
      return new _Query(this.firestore, query(this._delegate, limit(n)));
    } catch (e) {
      throw replaceFunctionName(e, "limit()", "Query.limit()");
    }
  }
  limitToLast(n) {
    try {
      return new _Query(this.firestore, query(this._delegate, limitToLast(n)));
    } catch (e) {
      throw replaceFunctionName(e, "limitToLast()", "Query.limitToLast()");
    }
  }
  startAt(...args) {
    try {
      return new _Query(this.firestore, query(this._delegate, startAt(...args)));
    } catch (e) {
      throw replaceFunctionName(e, "startAt()", "Query.startAt()");
    }
  }
  startAfter(...args) {
    try {
      return new _Query(this.firestore, query(this._delegate, startAfter(...args)));
    } catch (e) {
      throw replaceFunctionName(e, "startAfter()", "Query.startAfter()");
    }
  }
  endBefore(...args) {
    try {
      return new _Query(this.firestore, query(this._delegate, endBefore(...args)));
    } catch (e) {
      throw replaceFunctionName(e, "endBefore()", "Query.endBefore()");
    }
  }
  endAt(...args) {
    try {
      return new _Query(this.firestore, query(this._delegate, endAt(...args)));
    } catch (e) {
      throw replaceFunctionName(e, "endAt()", "Query.endAt()");
    }
  }
  isEqual(other) {
    return queryEqual(this._delegate, other._delegate);
  }
  get(options) {
    let query2;
    if ((options === null || options === void 0 ? void 0 : options.source) === "cache") {
      query2 = getDocsFromCache(this._delegate);
    } else if ((options === null || options === void 0 ? void 0 : options.source) === "server") {
      query2 = getDocsFromServer(this._delegate);
    } else {
      query2 = getDocs(this._delegate);
    }
    return query2.then((result) => new QuerySnapshot2(this.firestore, new QuerySnapshot(this.firestore._delegate, this._userDataWriter, this._delegate, result._snapshot)));
  }
  onSnapshot(...args) {
    const options = extractSnapshotOptions(args);
    const observer = wrapObserver(args, (snap) => new QuerySnapshot2(this.firestore, new QuerySnapshot(this.firestore._delegate, this._userDataWriter, this._delegate, snap._snapshot)));
    return onSnapshot(this._delegate, options, observer);
  }
  withConverter(converter) {
    return new _Query(this.firestore, converter ? this._delegate.withConverter(FirestoreDataConverter.getInstance(this.firestore, converter)) : this._delegate.withConverter(null));
  }
};
var DocumentChange = class {
  constructor(_firestore, _delegate) {
    this._firestore = _firestore;
    this._delegate = _delegate;
  }
  get type() {
    return this._delegate.type;
  }
  get doc() {
    return new QueryDocumentSnapshot2(this._firestore, this._delegate.doc);
  }
  get oldIndex() {
    return this._delegate.oldIndex;
  }
  get newIndex() {
    return this._delegate.newIndex;
  }
};
var QuerySnapshot2 = class {
  constructor(_firestore, _delegate) {
    this._firestore = _firestore;
    this._delegate = _delegate;
  }
  get query() {
    return new Query(this._firestore, this._delegate.query);
  }
  get metadata() {
    return this._delegate.metadata;
  }
  get size() {
    return this._delegate.size;
  }
  get empty() {
    return this._delegate.empty;
  }
  get docs() {
    return this._delegate.docs.map((doc2) => new QueryDocumentSnapshot2(this._firestore, doc2));
  }
  docChanges(options) {
    return this._delegate.docChanges(options).map((docChange) => new DocumentChange(this._firestore, docChange));
  }
  forEach(callback, thisArg) {
    this._delegate.forEach((snapshot) => {
      callback.call(thisArg, new QueryDocumentSnapshot2(this._firestore, snapshot));
    });
  }
  isEqual(other) {
    return snapshotEqual(this._delegate, other._delegate);
  }
};
var CollectionReference = class _CollectionReference extends Query {
  constructor(firestore, _delegate) {
    super(firestore, _delegate);
    this.firestore = firestore;
    this._delegate = _delegate;
  }
  get id() {
    return this._delegate.id;
  }
  get path() {
    return this._delegate.path;
  }
  get parent() {
    const docRef = this._delegate.parent;
    return docRef ? new DocumentReference2(this.firestore, docRef) : null;
  }
  doc(documentPath) {
    try {
      if (documentPath === void 0) {
        return new DocumentReference2(this.firestore, doc(this._delegate));
      } else {
        return new DocumentReference2(this.firestore, doc(this._delegate, documentPath));
      }
    } catch (e) {
      throw replaceFunctionName(e, "doc()", "CollectionReference.doc()");
    }
  }
  add(data) {
    return addDoc(this._delegate, data).then((docRef) => new DocumentReference2(this.firestore, docRef));
  }
  isEqual(other) {
    return refEqual(this._delegate, other._delegate);
  }
  withConverter(converter) {
    return new _CollectionReference(this.firestore, converter ? this._delegate.withConverter(FirestoreDataConverter.getInstance(this.firestore, converter)) : this._delegate.withConverter(null));
  }
};
function castReference(documentRef) {
  return __PRIVATE_cast(documentRef, DocumentReference);
}
var FieldPath2 = class _FieldPath {
  /**
   * Creates a FieldPath from the provided field names. If more than one field
   * name is provided, the path will point to a nested field in a document.
   *
   * @param fieldNames - A list of field names.
   */
  constructor(...fieldNames) {
    this._delegate = new FieldPath(...fieldNames);
  }
  static documentId() {
    return new _FieldPath(FieldPath$1.keyField().canonicalString());
  }
  isEqual(other) {
    other = getModularInstance(other);
    if (!(other instanceof FieldPath)) {
      return false;
    }
    return this._delegate._internalPath.isEqual(other._internalPath);
  }
};
var FieldValue = class _FieldValue {
  constructor(_delegate) {
    this._delegate = _delegate;
  }
  static serverTimestamp() {
    const delegate = serverTimestamp();
    delegate._methodName = "FieldValue.serverTimestamp";
    return new _FieldValue(delegate);
  }
  static delete() {
    const delegate = deleteField();
    delegate._methodName = "FieldValue.delete";
    return new _FieldValue(delegate);
  }
  static arrayUnion(...elements) {
    const delegate = arrayUnion(...elements);
    delegate._methodName = "FieldValue.arrayUnion";
    return new _FieldValue(delegate);
  }
  static arrayRemove(...elements) {
    const delegate = arrayRemove(...elements);
    delegate._methodName = "FieldValue.arrayRemove";
    return new _FieldValue(delegate);
  }
  static increment(n) {
    const delegate = increment(n);
    delegate._methodName = "FieldValue.increment";
    return new _FieldValue(delegate);
  }
  isEqual(other) {
    return this._delegate.isEqual(other._delegate);
  }
};
var firestoreNamespace = {
  Firestore,
  GeoPoint,
  Timestamp,
  Blob,
  Transaction,
  WriteBatch: WriteBatch2,
  DocumentReference: DocumentReference2,
  DocumentSnapshot: DocumentSnapshot2,
  Query,
  QueryDocumentSnapshot: QueryDocumentSnapshot2,
  QuerySnapshot: QuerySnapshot2,
  CollectionReference,
  FieldPath: FieldPath2,
  FieldValue,
  setLogLevel: setLogLevel2,
  CACHE_SIZE_UNLIMITED: Se
};
function configureForFirebase(firebase2, firestoreFactory) {
  firebase2.INTERNAL.registerComponent(new Component("firestore-compat", (container) => {
    const app = container.getProvider("app-compat").getImmediate();
    const firestoreExp = container.getProvider("firestore").getImmediate();
    return firestoreFactory(app, firestoreExp);
  }, "PUBLIC").setServiceProps(Object.assign({}, firestoreNamespace)));
}
function registerFirestore(instance) {
  configureForFirebase(instance, (app, firestoreExp) => new Firestore(app, firestoreExp, new IndexedDbPersistenceProvider()));
  instance.registerVersion(name2, version2);
}
registerFirestore(firebase);

// node_modules/@angular/fire/fesm2022/angular-fire-compat-firestore.mjs
function _fromRef(ref, scheduler = asyncScheduler) {
  return new Observable((subscriber) => {
    let unsubscribe;
    if (scheduler != null) {
      scheduler.schedule(() => {
        unsubscribe = ref.onSnapshot({
          includeMetadataChanges: true
        }, subscriber);
      });
    } else {
      unsubscribe = ref.onSnapshot({
        includeMetadataChanges: true
      }, subscriber);
    }
    return () => {
      if (unsubscribe != null) {
        unsubscribe();
      }
    };
  });
}
function fromRef(ref, scheduler) {
  return _fromRef(ref, scheduler);
}
function fromDocRef(ref, scheduler) {
  return fromRef(ref, scheduler).pipe(startWith(void 0), pairwise(), map((snapshots) => {
    const [priorPayload, payload] = snapshots;
    if (!payload.exists) {
      return {
        payload,
        type: "removed"
      };
    }
    if (!priorPayload?.exists) {
      return {
        payload,
        type: "added"
      };
    }
    return {
      payload,
      type: "modified"
    };
  }));
}
function fromCollectionRef(ref, scheduler) {
  return fromRef(ref, scheduler).pipe(map((payload) => ({
    payload,
    type: "query"
  })));
}
var AngularFirestoreDocument = class {
  ref;
  afs;
  /**
   * The constructor takes in a DocumentReference to provide wrapper methods
   * for data operations, data streaming, and Symbol.observable.
   */
  constructor(ref, afs) {
    this.ref = ref;
    this.afs = afs;
  }
  /**
   * Create or overwrite a single document.
   */
  set(data, options) {
    return this.ref.set(data, options);
  }
  /**
   * Update some fields of a document without overwriting the entire document.
   */
  update(data) {
    return this.ref.update(data);
  }
  /**
   * Delete a document.
   */
  delete() {
    return this.ref.delete();
  }
  /**
   * Create a reference to a sub-collection given a path and an optional query
   * function.
   */
  collection(path, queryFn) {
    const collectionRef = this.ref.collection(path);
    const {
      ref,
      query: query2
    } = associateQuery(collectionRef, queryFn);
    return new AngularFirestoreCollection(ref, query2, this.afs);
  }
  /**
   * Listen to snapshot updates from the document.
   */
  snapshotChanges() {
    const scheduledFromDocRef$ = fromDocRef(this.ref, this.afs.schedulers.outsideAngular);
    return scheduledFromDocRef$.pipe(keepUnstableUntilFirst);
  }
  valueChanges(options = {}) {
    return this.snapshotChanges().pipe(map(({
      payload
    }) => options.idField ? __spreadValues(__spreadValues({}, payload.data()), {
      [options.idField]: payload.id
    }) : payload.data()));
  }
  /**
   * Retrieve the document once.
   */
  get(options) {
    return from(this.ref.get(options)).pipe(keepUnstableUntilFirst);
  }
};
function docChanges(query2, scheduler) {
  return fromCollectionRef(query2, scheduler).pipe(startWith(void 0), pairwise(), map((actionTuple) => {
    const [priorAction, action] = actionTuple;
    const docChanges2 = action.payload.docChanges();
    const actions = docChanges2.map((change) => ({
      type: change.type,
      payload: change
    }));
    if (priorAction && JSON.stringify(priorAction.payload.metadata) !== JSON.stringify(action.payload.metadata)) {
      action.payload.docs.forEach((currentDoc, currentIndex) => {
        const docChange = docChanges2.find((d) => d.doc.ref.isEqual(currentDoc.ref));
        const priorDoc = priorAction?.payload.docs.find((d) => d.ref.isEqual(currentDoc.ref));
        if (docChange && JSON.stringify(docChange.doc.metadata) === JSON.stringify(currentDoc.metadata) || !docChange && priorDoc && JSON.stringify(priorDoc.metadata) === JSON.stringify(currentDoc.metadata)) {
        } else {
          actions.push({
            type: "modified",
            payload: {
              oldIndex: currentIndex,
              newIndex: currentIndex,
              type: "modified",
              doc: currentDoc
            }
          });
        }
      });
    }
    return actions;
  }));
}
function sortedChanges(query2, events, scheduler) {
  return docChanges(query2, scheduler).pipe(
    scan((current, changes) => combineChanges(current, changes.map((it) => it.payload), events), []),
    distinctUntilChanged(),
    // cut down on unneed change cycles
    map((changes) => changes.map((c) => ({
      type: c.type,
      payload: c
    })))
  );
}
function combineChanges(current, changes, events) {
  changes.forEach((change) => {
    if (events.indexOf(change.type) > -1) {
      current = combineChange(current, change);
    }
  });
  return current;
}
function sliceAndSplice(original, start, deleteCount, ...args) {
  const returnArray = original.slice();
  returnArray.splice(start, deleteCount, ...args);
  return returnArray;
}
function combineChange(combined, change) {
  switch (change.type) {
    case "added":
      if (combined[change.newIndex] && combined[change.newIndex].doc.ref.isEqual(change.doc.ref)) {
      } else {
        return sliceAndSplice(combined, change.newIndex, 0, change);
      }
      break;
    case "modified":
      if (combined[change.oldIndex] == null || combined[change.oldIndex].doc.ref.isEqual(change.doc.ref)) {
        if (change.oldIndex !== change.newIndex) {
          const copiedArray = combined.slice();
          copiedArray.splice(change.oldIndex, 1);
          copiedArray.splice(change.newIndex, 0, change);
          return copiedArray;
        } else {
          return sliceAndSplice(combined, change.newIndex, 1, change);
        }
      }
      break;
    case "removed":
      if (combined[change.oldIndex] && combined[change.oldIndex].doc.ref.isEqual(change.doc.ref)) {
        return sliceAndSplice(combined, change.oldIndex, 1);
      }
      break;
  }
  return combined;
}
function validateEventsArray(events) {
  if (!events || events.length === 0) {
    events = ["added", "removed", "modified"];
  }
  return events;
}
var AngularFirestoreCollection = class {
  ref;
  query;
  afs;
  /**
   * The constructor takes in a CollectionReference and Query to provide wrapper methods
   * for data operations and data streaming.
   *
   * Note: Data operation methods are done on the reference not the query. This means
   * when you update data it is not updating data to the window of your query unless
   * the data fits the criteria of the query. See the AssociatedRefence type for details
   * on this implication.
   */
  constructor(ref, query2, afs) {
    this.ref = ref;
    this.query = query2;
    this.afs = afs;
  }
  /**
   * Listen to the latest change in the stream. This method returns changes
   * as they occur and they are not sorted by query order. This allows you to construct
   * your own data structure.
   */
  stateChanges(events) {
    let source = docChanges(this.query, this.afs.schedulers.outsideAngular);
    if (events && events.length > 0) {
      source = source.pipe(map((actions) => actions.filter((change) => events.indexOf(change.type) > -1)));
    }
    return source.pipe(
      // We want to filter out empty arrays, but always emit at first, so the developer knows
      // that the collection has been resolve; even if it's empty
      startWith(void 0),
      pairwise(),
      filter(([prior, current]) => current.length > 0 || !prior),
      map(([, current]) => current),
      keepUnstableUntilFirst
    );
  }
  /**
   * Create a stream of changes as they occur it time. This method is similar to stateChanges()
   * but it collects each event in an array over time.
   */
  auditTrail(events) {
    return this.stateChanges(events).pipe(scan((current, action) => [...current, ...action], []));
  }
  /**
   * Create a stream of synchronized changes. This method keeps the local array in sorted
   * query order.
   */
  snapshotChanges(events) {
    const validatedEvents = validateEventsArray(events);
    const scheduledSortedChanges$ = sortedChanges(this.query, validatedEvents, this.afs.schedulers.outsideAngular);
    return scheduledSortedChanges$.pipe(keepUnstableUntilFirst);
  }
  valueChanges(options = {}) {
    return fromCollectionRef(this.query, this.afs.schedulers.outsideAngular).pipe(map((actions) => actions.payload.docs.map((a) => {
      if (options.idField) {
        return __spreadValues(__spreadValues({}, a.data()), {
          [options.idField]: a.id
        });
      } else {
        return a.data();
      }
    })), keepUnstableUntilFirst);
  }
  /**
   * Retrieve the results of the query once.
   */
  get(options) {
    return from(this.query.get(options)).pipe(keepUnstableUntilFirst);
  }
  /**
   * Add data to a collection reference.
   *
   * Note: Data operation methods are done on the reference not the query. This means
   * when you update data it is not updating data to the window of your query unless
   * the data fits the criteria of the query.
   */
  add(data) {
    return this.ref.add(data);
  }
  /**
   * Create a reference to a single document in a collection.
   */
  doc(path) {
    return new AngularFirestoreDocument(this.ref.doc(path), this.afs);
  }
};
var AngularFirestoreCollectionGroup = class {
  query;
  afs;
  /**
   * The constructor takes in a CollectionGroupQuery to provide wrapper methods
   * for data operations and data streaming.
   */
  constructor(query2, afs) {
    this.query = query2;
    this.afs = afs;
  }
  /**
   * Listen to the latest change in the stream. This method returns changes
   * as they occur and they are not sorted by query order. This allows you to construct
   * your own data structure.
   */
  stateChanges(events) {
    if (!events || events.length === 0) {
      return docChanges(this.query, this.afs.schedulers.outsideAngular).pipe(keepUnstableUntilFirst);
    }
    return docChanges(this.query, this.afs.schedulers.outsideAngular).pipe(map((actions) => actions.filter((change) => events.indexOf(change.type) > -1)), filter((changes) => changes.length > 0), keepUnstableUntilFirst);
  }
  /**
   * Create a stream of changes as they occur it time. This method is similar to stateChanges()
   * but it collects each event in an array over time.
   */
  auditTrail(events) {
    return this.stateChanges(events).pipe(scan((current, action) => [...current, ...action], []));
  }
  /**
   * Create a stream of synchronized changes. This method keeps the local array in sorted
   * query order.
   */
  snapshotChanges(events) {
    const validatedEvents = validateEventsArray(events);
    const scheduledSortedChanges$ = sortedChanges(this.query, validatedEvents, this.afs.schedulers.outsideAngular);
    return scheduledSortedChanges$.pipe(keepUnstableUntilFirst);
  }
  valueChanges(options = {}) {
    const fromCollectionRefScheduled$ = fromCollectionRef(this.query, this.afs.schedulers.outsideAngular);
    return fromCollectionRefScheduled$.pipe(map((actions) => actions.payload.docs.map((a) => {
      if (options.idField) {
        return __spreadValues({
          [options.idField]: a.id
        }, a.data());
      } else {
        return a.data();
      }
    })), keepUnstableUntilFirst);
  }
  /**
   * Retrieve the results of the query once.
   */
  get(options) {
    return from(this.query.get(options)).pipe(keepUnstableUntilFirst);
  }
};
var ENABLE_PERSISTENCE = new InjectionToken("angularfire2.enableFirestorePersistence");
var PERSISTENCE_SETTINGS = new InjectionToken("angularfire2.firestore.persistenceSettings");
var SETTINGS2 = new InjectionToken("angularfire2.firestore.settings");
var USE_EMULATOR2 = new InjectionToken("angularfire2.firestore.use-emulator");
function associateQuery(collectionRef, queryFn = (ref) => ref) {
  const query2 = queryFn(collectionRef);
  const ref = collectionRef;
  return {
    query: query2,
    ref
  };
}
var AngularFirestore = class _AngularFirestore {
  schedulers;
  firestore;
  persistenceEnabled$;
  /**
   * Each Feature of AngularFire has a FirebaseApp injected. This way we
   * don't rely on the main Firebase App instance and we can create named
   * apps and use multiple apps.
   */
  constructor(options, name3, shouldEnablePersistence, settings, platformId, zone, schedulers, persistenceSettings, _useEmulator, auth, useAuthEmulator, authSettings, tenantId, languageCode, useDeviceLanguage, persistence, _appCheckInstances) {
    this.schedulers = schedulers;
    const app = ɵfirebaseAppFactory(options, zone, name3);
    const useEmulator = _useEmulator;
    if (auth) {
      ɵauthFactory(app, zone, useAuthEmulator, tenantId, languageCode, useDeviceLanguage, authSettings, persistence);
    }
    [this.firestore, this.persistenceEnabled$] = ɵcacheInstance(`${app.name}.firestore`, "AngularFirestore", app.name, () => {
      const firestore = zone.runOutsideAngular(() => app.firestore());
      if (settings) {
        firestore.settings(settings);
      }
      if (useEmulator) {
        firestore.useEmulator(...useEmulator);
      }
      if (shouldEnablePersistence && !isPlatformServer(platformId)) {
        const enablePersistence = () => {
          try {
            return from(firestore.enablePersistence(persistenceSettings || void 0).then(() => true, () => false));
          } catch (e) {
            if (typeof console !== "undefined") {
              console.warn(e);
            }
            return of(false);
          }
        };
        return [firestore, zone.runOutsideAngular(enablePersistence)];
      } else {
        return [firestore, of(false)];
      }
    }, [settings, useEmulator, shouldEnablePersistence]);
  }
  collection(pathOrRef, queryFn) {
    let collectionRef;
    if (typeof pathOrRef === "string") {
      collectionRef = this.firestore.collection(pathOrRef);
    } else {
      collectionRef = pathOrRef;
    }
    const {
      ref,
      query: query2
    } = associateQuery(collectionRef, queryFn);
    const refInZone = this.schedulers.ngZone.run(() => ref);
    return new AngularFirestoreCollection(refInZone, query2, this);
  }
  /**
   * Create a reference to a Firestore Collection Group based on a collectionId
   * and an optional query function to narrow the result
   * set.
   */
  collectionGroup(collectionId, queryGroupFn) {
    const queryFn = queryGroupFn || ((ref) => ref);
    const collectionGroup2 = this.firestore.collectionGroup(collectionId);
    return new AngularFirestoreCollectionGroup(queryFn(collectionGroup2), this);
  }
  doc(pathOrRef) {
    let ref;
    if (typeof pathOrRef === "string") {
      ref = this.firestore.doc(pathOrRef);
    } else {
      ref = pathOrRef;
    }
    const refInZone = this.schedulers.ngZone.run(() => ref);
    return new AngularFirestoreDocument(refInZone, this);
  }
  /**
   * Returns a generated Firestore Document Id.
   */
  createId() {
    return this.firestore.collection("_").doc().id;
  }
  static ɵfac = function AngularFirestore_Factory(t) {
    return new (t || _AngularFirestore)(ɵɵinject(FIREBASE_OPTIONS), ɵɵinject(FIREBASE_APP_NAME, 8), ɵɵinject(ENABLE_PERSISTENCE, 8), ɵɵinject(SETTINGS2, 8), ɵɵinject(PLATFORM_ID), ɵɵinject(NgZone), ɵɵinject(ɵAngularFireSchedulers), ɵɵinject(PERSISTENCE_SETTINGS, 8), ɵɵinject(USE_EMULATOR2, 8), ɵɵinject(AngularFireAuth, 8), ɵɵinject(USE_EMULATOR, 8), ɵɵinject(SETTINGS, 8), ɵɵinject(TENANT_ID, 8), ɵɵinject(LANGUAGE_CODE, 8), ɵɵinject(USE_DEVICE_LANGUAGE, 8), ɵɵinject(PERSISTENCE, 8), ɵɵinject(ɵAppCheckInstances, 8));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _AngularFirestore,
    factory: _AngularFirestore.ɵfac,
    providedIn: "any"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AngularFirestore, [{
    type: Injectable,
    args: [{
      providedIn: "any"
    }]
  }], () => [{
    type: void 0,
    decorators: [{
      type: Inject,
      args: [FIREBASE_OPTIONS]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [FIREBASE_APP_NAME]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [ENABLE_PERSISTENCE]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [SETTINGS2]
    }]
  }, {
    type: Object,
    decorators: [{
      type: Inject,
      args: [PLATFORM_ID]
    }]
  }, {
    type: NgZone
  }, {
    type: ɵAngularFireSchedulers
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [PERSISTENCE_SETTINGS]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [USE_EMULATOR2]
    }]
  }, {
    type: AngularFireAuth,
    decorators: [{
      type: Optional
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [USE_EMULATOR]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [SETTINGS]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [TENANT_ID]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [LANGUAGE_CODE]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [USE_DEVICE_LANGUAGE]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [PERSISTENCE]
    }]
  }, {
    type: ɵAppCheckInstances,
    decorators: [{
      type: Optional
    }]
  }], null);
})();
var AngularFirestoreModule = class _AngularFirestoreModule {
  constructor() {
    firebase.registerVersion("angularfire", VERSION.full, "fst-compat");
  }
  /**
   * Attempt to enable persistent storage, if possible
   */
  static enablePersistence(persistenceSettings) {
    return {
      ngModule: _AngularFirestoreModule,
      providers: [{
        provide: ENABLE_PERSISTENCE,
        useValue: true
      }, {
        provide: PERSISTENCE_SETTINGS,
        useValue: persistenceSettings
      }]
    };
  }
  static ɵfac = function AngularFirestoreModule_Factory(t) {
    return new (t || _AngularFirestoreModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _AngularFirestoreModule
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [AngularFirestore]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AngularFirestoreModule, [{
    type: NgModule,
    args: [{
      providers: [AngularFirestore]
    }]
  }], () => [], null);
})();
export {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreCollectionGroup,
  AngularFirestoreDocument,
  AngularFirestoreModule,
  ENABLE_PERSISTENCE,
  PERSISTENCE_SETTINGS,
  SETTINGS2 as SETTINGS,
  USE_EMULATOR2 as USE_EMULATOR,
  associateQuery,
  combineChange,
  combineChanges,
  docChanges,
  fromCollectionRef,
  fromDocRef,
  fromRef,
  sortedChanges,
  validateEventsArray
};
/*! Bundled license information:

@firebase/app-check/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app-check/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app-check/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app-check/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app-check/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app-check/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore-compat/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
//# sourceMappingURL=@angular_fire_compat_firestore.js.map
