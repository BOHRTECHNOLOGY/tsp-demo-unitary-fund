import rawPoints from '../data/points.json'
import randomPaths from '../data/random.json'
import {MAP_ACTION_TYPES} from './mapActions';
import {MAX_SELECTED_POINTS_COUNT, MIN_SELECTED_POINTS_COUNT} from '../config/config';

// Ensure each point has a unique id
// Create a map for easier access
const MAP_POINTS_BY_ID = rawPoints.reduce((previous, point, id) => ({...previous, [id]: {...point, id}}), {});

const getRandomPath = () => randomPaths[Math.ceil(Math.random() * randomPaths.length) - 1];

export const defaultState = {
    pointsById: MAP_POINTS_BY_ID,
    selected: [],
    findingSolutionInProgress: false,
    solution: null,
    error: false,
};

const mapReducer = (state = defaultState, action) => {
    switch (action.type) {
        case MAP_ACTION_TYPES.POINT_TOGGLE:
            if (isSolutionLocked(state)) {
                return state;
            }

            if (isPointSelected(state, action.id)) {
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

        case MAP_ACTION_TYPES.COMPUTE_START:
            return {
                ...state,
                findingSolutionInProgress: true,
                solution: null,
                error: false,
            };

        case MAP_ACTION_TYPES.COMPUTE_SUCCESS:
            return {
                ...state,
                findingSolutionInProgress: false,
                solution: action.solution,
                info: action.info,
            };

        case MAP_ACTION_TYPES.COMPUTE_ERROR:
            return {
                ...state,
                findingSolutionInProgress: false,
                error: true,
            };

        case MAP_ACTION_TYPES.CHOOSE_RANDOM:
            return {
                ...state,
                selected: getRandomPath(),
            };

        case MAP_ACTION_TYPES.RESET:
            return defaultState;

        default:
            return state;

    }
};

export default mapReducer

export const getPointsList = state => Object.values(state.pointsById)
    .map(point => ({
            ...point,
            selected: isPointSelected(state, point.id),
            isStart: state.selected[0] === point.id,
            isEnd: state.selected.length > 1 && state.selected[state.selected.length - 1] === point.id,
        }
    ));

export const isReadyToCompute = state => state.selected.length >= MIN_SELECTED_POINTS_COUNT;

export const isPointSelected = (state, pointId) => state.selected.includes(pointId);

export const isSolutionLocked = state => state.findingSolutionInProgress || state.solution;

export const getSelectedPoints = state => state.selected.map(id => state.pointsById[id]);

export const getSolutionRoute = state => state.solution && state.solution.map(id => state.pointsById[id]);
