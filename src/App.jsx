import React, {Component} from 'react';
import {Provider} from 'react-redux'

import Store from './store/Store';
import FindRouteButton from './components/FindRouteButton/FindRouteButton';
import Map from './components/Map/Map';

class App extends Component {
    render() {
        return (
            <Provider store={Store}>
                <div className="container">
                    <div className="MapsBox">
                        <Map/>
                    </div>
                    <div className="ButtonContainer">
                        <FindRouteButton/>
                    </div>
                </div>
            </Provider>
        );
    }
}

export default App;
