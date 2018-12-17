import React from 'react';
import {connect} from 'react-redux'

import Map from '../components/Map/Map';

import './SolverPage.css';

const SolverPage = ({computationStatus}) => (
    <div className="container">
        <div className="MapsBox">
            <Map/>
        </div>
    </div>
);

const mapStateToProps = (state) => ({
    computationStatus: state.map.computationStatus
});

export default connect(mapStateToProps)(SolverPage)