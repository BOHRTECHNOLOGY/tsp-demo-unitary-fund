import React from 'react';
import PropTypes from 'prop-types'

import {composeClasses} from '../../composeClasses';

import startIcon from './start.svg';
import finishIcon from './finish.svg';

import './marker.css';

const Marker = ({selected, toggle, isStart, isEnd}) => {
    if (isStart || isEnd) {
        const icon = isStart ? startIcon : finishIcon;
        return (
            <img
                src={icon}
                alt=""
                onClick={toggle}
                className="MarkerIcon"
            />
        )
    }

    return (
        <div
            onClick={toggle}
            className={composeClasses(['Marker', selected && 'isSelected'])}
        />
    )
};

Marker.propTypes = {
    selected: PropTypes.bool,
    toggle: PropTypes.func.isRequired,
    isStart: PropTypes.bool,
    isEnd: PropTypes.bool,
};

Marker.defaultProps = {
    isEnd: false,
    isStart: false,
    selected: false
};

export default Marker
