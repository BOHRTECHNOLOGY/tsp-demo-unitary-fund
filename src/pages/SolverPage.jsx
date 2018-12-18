import React from 'react';

import Map from '../components/Map/Map';
import FindRouteButton from '../components/FindRouteButton/FindRouteButton';

import './SolverPage.css';

const SolverPage = () => (
    <div className="container">
        <div className="Column">
            <div className="MapsBox">
                <Map/>
            </div>
            <div className="ButtonContainer">
                <FindRouteButton/>
            </div>
        </div>
    </div>
);

export default SolverPage