import {COMPUTATION_STATUSES, MAP_ACTION_TYPES} from './mapActions';
import {MAX_SELECTED_POINTS_COUNT} from '../config/config';

const routes = [];
const dataPoints = [];

const DATA_POINTS_WITH_INDEXES = dataPoints.map((point, index) => ({...point, index}));
const DATA_POINTS_BY_PNI = dataPoints.reduce((previous, current, index) => ({
    ...previous,
    [current.pni]: {...current, index}
}), {});
const ROUTES_BY_NAME = routes.reduce((previous, current) => ({
    ...previous,
    [current.name]: current,
}), {});

export const defaultState = {
    selected: {},
    selectedCount: 0,
    dataPoints: DATA_POINTS_WITH_INDEXES,
    pointsByPni: DATA_POINTS_BY_PNI,
    routes,
    routesByName: ROUTES_BY_NAME,
    startPoint: null,
    endPoint: null,
    hoverPoint: null,
    startDate: null,
    computationStatus: COMPUTATION_STATUSES.DATA_INCOMPLETE,
    solutionDistances: null,
    solutionRoute: null,
};

if (process.env.NODE_ENV !== 'production') {
    routes.forEach(route => route.nodes.forEach(nodePni => {
        if (!defaultState.pointsByPni[nodePni]) {
            console.warn(`Unknown PNI: ${nodePni} is present in route: ${route.id}`)
        }
    }))
}

const mapReducer = (state = defaultState, action) => {
    switch (action.type) {
        case MAP_ACTION_TYPES.TOGGLE_SELECT_POINT:
            const selected = state.selected[action.index];
            if (!selected && state.selectedCount === MAX_SELECTED_POINTS_COUNT) {
                return state;
            }

            if (selected && state.computationStatus === COMPUTATION_STATUSES.IN_PROGRESS) {
                return state;
            }

            const nextCount = state.selectedCount + (selected ? -1 : 1);
            const computationStatus = nextCount >= 2
                ? COMPUTATION_STATUSES.READY_TO_COMPUTE
                : COMPUTATION_STATUSES.DATA_INCOMPLETE;

            const startPoint = action.index === state.startPoint && selected ? state.endPoint : state.startPoint;
            const endPoint = action.index === state.endPoint && selected ? state.startPoint : state.endPoint;

            return {
                ...state,
                selected: {
                    ...state.selected,
                    [action.index]: !selected
                },
                selectedCount: nextCount,
                computationStatus,
                startPoint,
                endPoint,

                // Any change to selection status will reset computation and selected route
                solutionDistances: defaultState.solutionDistances,
                solutionRoute: defaultState.solutionRoute,
                selectedRoute: defaultState.selectedRoute,
            };

        case MAP_ACTION_TYPES.DESELECT_ALL:
            return {
                ...state,
                selected: {},
                selectedCount: 0,
                startPoint: null,
                endPoint: null,
                startDate: null,

                computationStatus: COMPUTATION_STATUSES.DATA_INCOMPLETE,
                solutionDistances: defaultState.solutionDistances,
                solutionRoute: defaultState.solutionRoute,
                selectedRoute: defaultState.selectedRoute,
            };

        case MAP_ACTION_TYPES.START_COMPUTATION:
            return {
                ...state,
                computationStatus: COMPUTATION_STATUSES.IN_PROGRESS,
            };

        case MAP_ACTION_TYPES.COMPUTATION_RESULT:
            return {
                ...state,
                solutionRoute: action.solutionRoute,
                solutionDistances: action.solutionDistances,
                computationStatus: COMPUTATION_STATUSES.SUCCESS,
            };

        case MAP_ACTION_TYPES.COMPUTATION_ERROR:
            return {
                ...state,
                computationStatus: COMPUTATION_STATUSES.ERROR
            };

        case MAP_ACTION_TYPES.TOGGLE_START_POINT: {
            return {
                ...state,
                startPoint: state.startPoint === action.index ? state.endPoint : action.index,
                endPoint: state.endPoint === null ? action.index : state.endPoint,
                selectedRoute: defaultState.selectedRoute,
            }
        }
        case MAP_ACTION_TYPES.TOGGLE_END_POINT: {
            return {
                ...state,
                startPoint: state.startPoint === null ? action.index : state.startPoint,
                endPoint: state.endPoint === action.index ? state.endPoint : action.index,
                selectedRoute: defaultState.selectedRoute,
            }
        }
        case MAP_ACTION_TYPES.TOGGLE_HOVER: {
            return {
                ...state,
                hoverPoint: state.hoverPoint === action.index ? null : action.index
            }
        }
        case MAP_ACTION_TYPES.CHANGE_DATE : {
            const computationStatus = state.selectedCount > 2
                ? COMPUTATION_STATUSES.READY_TO_COMPUTE
                : COMPUTATION_STATUSES.DATA_INCOMPLETE;

            return {
                ...state,
                startDate: action.newDate,
                computationStatus
            }
        }

        case MAP_ACTION_TYPES.SELECT_ROUTE: {
            const selectedRoute = action.route;
            if (!selectedRoute) {
                return {
                    ...state,
                    selectedRoute: null
                }
            }

            const nextSelected = {};
            const route = state.routesByName[selectedRoute];
            route.nodes.forEach(nodePni => {
                nextSelected[state.pointsByPni[nodePni].index] = true;
            });

            const startPoint = state.pointsByPni[route.nodes[0]].index;
            const endPoint = state.pointsByPni[route.nodes[route.nodes.length - 1]].index;

            return {
                ...state,
                selectedRoute,
                selected: nextSelected,
                selectedCount: Object.keys(nextSelected).length,
                computationStatus: COMPUTATION_STATUSES.READY_TO_COMPUTE,
                startPoint,
                endPoint,
                solutionDistances: defaultState.solutionDistances,
                solutionRoute: defaultState.solutionRoute,
            }
        }

        default:
            return state
    }
};

export default mapReducer

