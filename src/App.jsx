import React from 'react';
import {Provider} from 'react-redux'

import Store from './store/Store';
import FindRouteButton from './components/FindRouteButton/FindRouteButton';
import Map from './components/Map/Map';
import SolutionInfo from './components/SolutionInfo/SolutionInfo';
import ChooseRandomButton from './components/ChooseRandomButton/ChooseRandomButton';

const App = () => (
    <Provider store={Store}>
        <div className="container">
            <div className="MapsBox">
                <Map/>
            </div>
            <div className="ButtonContainer">
                <SolutionInfo/>
                <ChooseRandomButton/>
                <FindRouteButton/>
            </div>
        </div>
    </Provider>
);

export default App;
