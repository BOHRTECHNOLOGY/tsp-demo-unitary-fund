import {getDistancesMatrix, transformToArrayOfArrays} from '../services/googleMaps';
import {solve} from '../services/api';

export const MAP_ACTION_TYPES = {
    TOGGLE_SELECT_POINT: 'TOGGLE_SELECT_POINT',
    DESELECT_ALL: 'DESELECT_ALL',

    TOGGLE_START_POINT: 'TOGGLE_START_POINT',
    TOGGLE_END_POINT: 'TOGGLE_END_POINT',

    TOGGLE_HOVER: 'TOGGLE_HOVER',
    CHANGE_DATE: 'CHANGE_DATE',

    START_COMPUTATION: 'START_COMPUTATION',
    COMPUTATION_ERROR: 'COMPUTATION_ERROR',
    COMPUTATION_RESULT: 'COMPUTATION_RESULT',

    SELECT_ROUTE: 'SELECT_ROUTE'
};

export const COMPUTATION_STATUSES = {
    DATA_INCOMPLETE: 'DATA_INCOMPLETE',
    READY_TO_COMPUTE: 'READY_TO_COMPUTE',
    IN_PROGRESS: 'IN_PROGRESS',
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS'
};

const startComputation = () => ({type: MAP_ACTION_TYPES.START_COMPUTATION});
const computationResult = (solutionDistances, solutionRoute) => ({
    type: MAP_ACTION_TYPES.COMPUTATION_RESULT,
    solutionDistances,
    solutionRoute
});
const computationError = error => ({type: MAP_ACTION_TYPES.COMPUTATION_ERROR, error});
export const toggleSelectPoint = index => ({type: MAP_ACTION_TYPES.TOGGLE_SELECT_POINT, index});
export const deselectAll = () => ({type: MAP_ACTION_TYPES.DESELECT_ALL});

export const compute = () => async (dispatch, getState) => {
    dispatch(startComputation());

    const {map} = getState();

    const selectedPoints = map.dataPoints.filter((_, index) => map.selected[index]);
    const selectedPointsIndexes = map.dataPoints.map((_, index) => index).filter(index => map.selected[index]);
    try {
        const distances = await getDistancesMatrix(selectedPoints, map.startDate && map.startDate.toDate());
        const distancesAsArray = transformToArrayOfArrays(distances);

        const startPoint = map.startPoint && selectedPointsIndexes.indexOf(map.startPoint);
        const endPoint = map.endPoint && selectedPointsIndexes.indexOf(map.endPoint);

        const {route} = await solve(distancesAsArray, startPoint, endPoint);
        const solutionRoute = route.map(routeIndex => selectedPointsIndexes[routeIndex]);

        const solutionDistances = [];
        let fromIndex = 0;
        let toIndex = 1;
        while (toIndex !== route.length) {
            solutionDistances.push(distances[route[fromIndex]].elements[route[toIndex]]);
            fromIndex++;
            toIndex++;
        }

        dispatch(computationResult(solutionDistances, solutionRoute))
    } catch (error) {
        console.error(error);
        dispatch(computationError(error))
    }
};

export const toggleStartPoint = index => ({type: MAP_ACTION_TYPES.TOGGLE_START_POINT, index});
export const toggleEndPoint = index => ({type: MAP_ACTION_TYPES.TOGGLE_END_POINT, index});
export const toggleHoverPoint = index => ({type: MAP_ACTION_TYPES.TOGGLE_HOVER, index});
export const changeDate = newDate => ({type: MAP_ACTION_TYPES.CHANGE_DATE, newDate});
export const selectRoute = route => ({type: MAP_ACTION_TYPES.SELECT_ROUTE, route})