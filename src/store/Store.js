import {applyMiddleware, compose, createStore} from 'redux';
import thunk from 'redux-thunk'

import rootReducer from '../reducers/rootReducer';

const middleware = [applyMiddleware(thunk)];
if (process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION__) {
    middleware.push(window.__REDUX_DEVTOOLS_EXTENSION__())
}

const store = createStore(
    rootReducer,
    compose(...middleware)
);

export default store;