import {combineReducers} from 'redux'

import mapReducer from './mapReducer'

export default combineReducers({
    map: mapReducer,
})