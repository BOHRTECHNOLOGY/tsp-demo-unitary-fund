import rawPoints from '../data/points.json'
import {MAP_ACTION_TYPES} from './mapActions';
import {MAX_SELECTED_POINTS_COUNT, MIN_SELECTED_POINTS_COUNT} from '../config/config';

// Ensure each point has a unique id
// Create a map for easier access
const MAP_POINTS_BY_ID = rawPoints.reduce((previous, point, id) => ({...previous, [id]: {...point, id}}), {});

export const defaultState = {
    pointsById: MAP_POINTS_BY_ID,
    selected: []
};

const mapReducer = (state = defaultState, action) => {
    switch (action.type) {
        case MAP_ACTION_TYPES.POINT_TOGGLE:
            if (state.selected.includes(action.id)) {
                return {
                    ...state,
                    selected: state.selected.filter(element => element !== action.id)
                }
            }

            if (state.selected.length === MAX_SELECTED_POINTS_COUNT) {
                return state;
            }

            return {
                ...state,
                selected: state.selected.concat(action.id)
            };

        default:
            return state;
    }
};

export default mapReducer

export const getPointsList = state => Object.values(state.pointsById)
    .map(point => ({
            ...point,
            selected: state.selected.includes(point.id),
            isStart: state.selected[0] === point.id,
            isEnd: state.selected.length > 1 && state.selected[state.selected.length - 1] === point.id,
        }
    ));

export const isReadyToCompute = state => state.selected.length >= MIN_SELECTED_POINTS_COUNT;
