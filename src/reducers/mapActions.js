export const MAP_ACTION_TYPES = {
    POINT_TOGGLE: 'POINT_TOGGLE',
};

const mapActionCreators = {
    pointToggle: (id) => ({type: MAP_ACTION_TYPES.POINT_TOGGLE, id})
};

export const mapActions = {
    togglePoint: id => mapActionCreators.pointToggle(id)
};