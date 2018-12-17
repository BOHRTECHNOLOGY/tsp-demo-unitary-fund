import React, {Component} from 'react';
import {Provider} from 'react-redux'

import Store from './store/Store';
import TSPSolverPage from './pages/SolverPage';

class App extends Component {
    render() {
        return (
            <Provider store={Store}>
                <TSPSolverPage/>
            </Provider>
        );
    }
}

export default App;
