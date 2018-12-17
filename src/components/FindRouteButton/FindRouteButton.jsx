import React from 'react'
import PropTypes from 'prop-types';
import {connect} from 'react-redux'

import {isReadyToCompute} from '../../reducers/mapReducer';

const FindRouteButton = ({disabled, onClick}) => (
    <button
        disabled={disabled}
        onClick={onClick}
    >
        Find Optimal Route
    </button>
);

FindRouteButton.propTypes = {
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
};

const mapStateToProps = (state) => ({
    disabled: !isReadyToCompute(state.map)
});

export default connect(mapStateToProps)(FindRouteButton)