import React from 'react';
import {connect} from 'react-redux'
import {toggleSelectPoint} from '../../reducers/mapActions';

import './marker.css';

import marker from './marker.svg';
import markerSelected from './marker_selected.svg';
import markerStart from './marker_start.svg';
import markerEnd from './marker_end.svg';
import {composeClasses} from '../../composeClasses';

const Popup = ({popup, label}) => (
    <div className="MarkerPopup">
        <p className="MarkerPopup-Title">{label}</p>
        <p className="MarkerPopup-Description">{popup}</p>
    </div>
);

const RouteIndex = ({index}) => (
    <div className="RouteIndex">
        {index}
    </div>
);

const Marker = ({label, popup, selected, toggle, $hover, solutionIndex, hovered, isStart, isEnd}) => {
    const isHovered = $hover || hovered;

    let markerIcon = marker;
    if (isStart) {
        markerIcon = markerStart;
    } else if (isEnd) {
        markerIcon = markerEnd
    } else if (selected) {
        markerIcon = markerSelected;
    }

    return (
        <div onClick={toggle}>
            <div className={composeClasses(['Marker', isHovered && 'Marker--isHovered'])}>
                <img src={markerIcon} alt=""/>
            </div>

            {isHovered && <Popup popup={popup} label={label}/>}

            {!!solutionIndex && <RouteIndex index={solutionIndex}/>}
        </div>
    )
};

const mapStateToProps = (store, ownProps) => ({
    selected: !!store.map.selected[ownProps.index],
    popup: store.map.dataPoints[ownProps.index].popup,
    label: store.map.dataPoints[ownProps.index].label,
    isStart: store.map.startPoint === ownProps.index,
    isEnd: store.map.endPoint === ownProps.index,
    solutionIndex: store.map.solutionRoute && store.map.solutionRoute.indexOf(ownProps.index) + 1,
    hovered: store.map.hoverPoint === ownProps.index
});

const mapDispatchToProps = (dispatch, {index}) => ({
    toggle: () => dispatch(toggleSelectPoint(index))
});

export default connect(mapStateToProps, mapDispatchToProps)(Marker)