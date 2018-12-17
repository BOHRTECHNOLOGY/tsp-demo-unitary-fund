import React from 'react';

import Map from '../components/Map/Map';

import './SolverPage.css';
import FindRouteButton from '../components/FindRouteButton/FindRouteButton';

const SolverPage = () => (
    <div className="container">
        <div className="MapsBox">
            <Map/>
        </div>
        <FindRouteButton/>
    </div>
);

export default SolverPage