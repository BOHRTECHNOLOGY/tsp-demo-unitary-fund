import React from 'react'
import PropTypes from 'prop-types';
import {connect} from 'react-redux'

import {mapActions} from '../../reducers/mapActions';

const ChooseRandomButton = ({chooseRandom, resetMode}) => {
    if (resetMode) {
        return null
    }

    return (
        <button
            className='button btn btn-primary btn-xl my-5'
            onClick={chooseRandom}
        >
            Choose for me
        </button>
    )
};

ChooseRandomButton.propTypes = {
    resetMode: PropTypes.bool,
    chooseRandom: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
    resetMode: !!state.map.solution,
});

const mapDispatchToProps = (dispatch) => ({
    chooseRandom: () => dispatch(mapActions.chooseRandom()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChooseRandomButton)