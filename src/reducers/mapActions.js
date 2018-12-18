import {getSelectedPoints, isReadyToCompute} from './mapReducer';
import {getDistancesMatrix} from '../services/googleMaps';
import {solve} from '../services/api';

export const MAP_ACTION_TYPES = {
    POINT_TOGGLE: 'POINT_TOGGLE',
    COMPUTE_START: 'COMPUTE_START',
    COMPUTE_SUCCESS: 'COMPUTE_SUCCESS',
    RESET: 'RESET'
};

const mapActionCreators = {
    pointToggle: (id) => ({type: MAP_ACTION_TYPES.POINT_TOGGLE, id}),
    computeStart: () => ({type: MAP_ACTION_TYPES.COMPUTE_START}),
    computeSuccess: (solution) => ({type: MAP_ACTION_TYPES.COMPUTE_SUCCESS, solution}),
    reset: () => ({type: MAP_ACTION_TYPES.RESET})
};

export const mapActions = {
    togglePoint: id => mapActionCreators.pointToggle(id),

    computeSolution: () => async (dispatch, getState) => {
        const state = getState();
        if (!isReadyToCompute(state.map)) {
            return;
        }

        dispatch(mapActionCreators.computeStart());

        const selectedPoints = getSelectedPoints(state.map);

        const distances = await getDistancesMatrix(selectedPoints);
        const solutionIndexes = await solve(distances);
        const solution = solutionIndexes.map(index => state.map.selected[index]);

        dispatch(mapActionCreators.computeSuccess(solution));
    },

    reset: () => mapActionCreators.reset(),
};