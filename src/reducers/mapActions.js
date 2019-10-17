import {getSelectedPoints, isReadyToCompute} from './mapReducer';
import {getDistancesMatrix} from '../services/googleMaps';
import {solve} from '../services/api';

export const MAP_ACTION_TYPES = {
    POINT_TOGGLE: 'POINT_TOGGLE',
    COMPUTE_START: 'COMPUTE_START',
    COMPUTE_SUCCESS: 'COMPUTE_SUCCESS',
    COMPUTE_ERROR: 'COMPUTE_ERROR',
    RESET: 'RESET',
    CHOOSE_RANDOM: 'CHOOSE_RANDOM'
};

const mapActionCreators = {
    pointToggle: (id) => ({type: MAP_ACTION_TYPES.POINT_TOGGLE, id}),
    computeStart: () => ({type: MAP_ACTION_TYPES.COMPUTE_START}),
    computeSuccess: (solution, info) => ({type: MAP_ACTION_TYPES.COMPUTE_SUCCESS, solution, info}),
    computeError: () => ({type: MAP_ACTION_TYPES.COMPUTE_ERROR}),
    reset: () => ({type: MAP_ACTION_TYPES.RESET}),
    chooseRandom: () => ({type: MAP_ACTION_TYPES.CHOOSE_RANDOM})
};

export const mapActions = {
    togglePoint: id => mapActionCreators.pointToggle(id),

    computeSolution: () => async (dispatch, getState) => {
        const state = getState();
        if (!isReadyToCompute(state.map)) {
            return;
        }
        try{
            dispatch(mapActionCreators.computeStart());

            const selectedPoints = getSelectedPoints(state.map);
            const start = Date.now();

            const distances = await getDistancesMatrix(selectedPoints);
            const {route: solutionIndexes, info} = await solve(distances);
            const solution = solutionIndexes.map(index => state.map.selected[index]);

            dispatch(mapActionCreators.computeSuccess(solution, {...info, duration: Date.now() - start}));
        }catch(error){
            console.error(error);
            dispatch(mapActionCreators.computeError())
        }
    },

    reset: () => mapActionCreators.reset(),

    chooseRandom: () => mapActionCreators.chooseRandom()
};
