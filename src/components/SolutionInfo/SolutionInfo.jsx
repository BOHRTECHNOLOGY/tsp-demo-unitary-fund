import React from 'react'
import PropTypes from 'prop-types';
import {connect} from 'react-redux'

import './SolutionInfo.css'

const LOCAL_MACHINE_MARKER = 'local';

const SolutionInfo = ({info}) => {
    if (!info) {
        return null
    }

    if (info.machine === LOCAL_MACHINE_MARKER) {
        return (
            <div className="SolutionInfo LocalMachineInfo">
                <p><b>At this moment the quantum computer is unavailable.</b></p>
                <p><b>Solution has been calculated using a regular, non-quantum computer :(</b></p>
                <p><b>Please try again later!</b></p>
            </div>
        )
    }

    return (
        <div className="SolutionInfo">
            <p>Waiting in queue: <b>{info.duration - info.total_time} [ms]</b></p>
            <p>Time spent on quantum computer: <b>{info.total_time} [ms]</b></p>
            <p>Total distance: <b>{Math.round(info.mileage / 1000)} [km]</b></p>
            <p>Machine: <b>{info.machine}</b></p>
        </div>
    )
};

SolutionInfo.propTypes = {
    info: PropTypes.shape({
        chip_runtime: PropTypes.number,
        machine: PropTypes.string.isRequired,
        mileage: PropTypes.number.isRequired,
        qpu_programming_time: PropTypes.number,
        total_time: PropTypes.number,
        duration: PropTypes.number.isRequired,
    })
};

const mapStateToProps = (state) => ({
    info: state.map.info,
});

export default connect(mapStateToProps)(SolutionInfo)