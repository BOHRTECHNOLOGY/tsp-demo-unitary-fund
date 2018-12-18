import React, {Component} from 'react';
import GoogleMapReact from 'google-map-react';
import {connect} from 'react-redux'
import PropTypes from 'prop-types'

import {GOOGLE_MAPS_API_KEY} from '../../config/config';
import Marker from '../Marker/Marker';
import {registerGoogleMaps} from '../../services/googleMaps';
import {getPointsList, getSolutionRoute} from '../../reducers/mapReducer';
import {mapActions} from '../../reducers/mapActions';

import './Map.css';

const InProgressOverlay = () => (
    <div className="InProgressOverlay">
        Finding solution in progress
    </div>
);

const shapeOfPoint = PropTypes.shape({
    id: PropTypes.number.isRequired,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
});

class Map extends Component {
    static propTypes = {
        pointsList: PropTypes.arrayOf(shapeOfPoint).isRequired,
        findingSolutionInProgress: PropTypes.bool,
        solutionRoute: PropTypes.arrayOf(shapeOfPoint),
        togglePoint: PropTypes.func.isRequired,
    };

    static defaultProps = {
        center: {
            // Warsaw's position
            lat: 52.23,
            lng: 21.01
        },
        dataPoints: [],
        zoom: 12
    };

    apiIsLoaded(map, maps) {
        // This is required to provide the Google Maps SDK to DistanceMatrix service
        registerGoogleMaps(maps);
        this.setState({map, maps});

        // Disable non-marker clickable spots on map
        map.setOptions({clickableIcons: false})
    }

    componentWillReceiveProps(newProps, oldProps) {
        const oldSolutionRoute = oldProps.solutionRoute && oldProps.solutionRoute.map(({id}) => id).join('');
        const solutionRoute = newProps.solutionRoute && newProps.solutionRoute.map(({id}) => id).join('');
        if (solutionRoute !== oldSolutionRoute) {
            if (this.state.path) {
                this.state.path.setMap(null);
            }

            if (solutionRoute) {
                const pathCoordinates = newProps.solutionRoute.map(({lat, lng}) => ({lat, lng}));

                const path = new this.state.maps.Polyline({
                    path: pathCoordinates,
                    geodesic: true,
                    strokeColor: '#ff1500',
                    strokeOpacity: 0.9,
                    strokeWeight: 2
                });

                path.setMap(this.state.map);
                this.setState({path})
            }
        }
    }

    render() {
        return (
            <div className="Map">
                {this.props.findingSolutionInProgress && <InProgressOverlay/>}
                <GoogleMapReact
                    bootstrapURLKeys={{key: GOOGLE_MAPS_API_KEY}}
                    defaultCenter={this.props.center}
                    defaultZoom={this.props.zoom}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={({map, maps}) => this.apiIsLoaded(map, maps)}
                >
                    {
                        this.props.pointsList.map((point) => (
                            <Marker {...point}
                                    key={point.id}
                                    toggle={() => this.props.togglePoint(point.id)}
                            />))
                    }


                </GoogleMapReact>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    pointsList: getPointsList(state.map),
    solutionRoute: getSolutionRoute(state.map),
    findingSolutionInProgress: state.map.findingSolutionInProgress,
});

const mapDispatchToProps = (dispatch) => ({
    togglePoint: id => dispatch(mapActions.togglePoint(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(Map);