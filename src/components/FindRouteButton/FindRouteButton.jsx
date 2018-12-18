import React from 'react'
import PropTypes from 'prop-types';
import {connect} from 'react-redux'

import {isReadyToCompute} from '../../reducers/mapReducer';
import {mapActions} from '../../reducers/mapActions';
import {composeClasses} from '../../composeClasses';

import './FindRouteButton.css'

const FindRouteButton = ({computeBlocked, computingInProgress, compute, reset, resetMode}) => {
    const disabled = resetMode ? computingInProgress : computeBlocked;

    return (
        <button
            className={composeClasses(['FindRouteButton', disabled && 'isDisabled'])}
            disabled={disabled}
            onClick={resetMode ? reset : compute}
        >
            {resetMode ? 'Reset' : 'Find Optimal Route'}
        </button>
    )
};

FindRouteButton.propTypes = {
    resetMode: PropTypes.bool,
    computeBlocked: PropTypes.bool,
    computingInProgress: PropTypes.bool,
    compute: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
    computeBlocked: !isReadyToCompute(state.map),
    computingInProgress: state.map.computingInProgress,
    resetMode: !!state.map.solution,
});

const mapDispatchToProps = (dispatch) => ({
    compute: () => dispatch(mapActions.computeSolution()),
    reset: () => dispatch(mapActions.reset()),
});

export default connect(mapStateToProps, mapDispatchToProps)(FindRouteButton)