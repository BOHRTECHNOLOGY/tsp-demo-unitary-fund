import React, {Component} from 'react';
import GoogleMapReact from 'google-map-react';
import {connect} from 'react-redux'

import {GOOGLE_MAPS_API_KEY} from '../../config/config';
import Marker from '../Marker/Marker';
import {registerGoogleMaps} from '../../services/googleMaps';

class Map extends Component {
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
        const oldSolutionRoute = oldProps.solutionRoute && oldProps.solutionRoute.join('');
        const solutionRoute = newProps.solutionRoute && newProps.solutionRoute.join('');
        if (solutionRoute !== oldSolutionRoute) {
            if (this.state.path) {
                this.state.path.setMap(null);
            }

            if (solutionRoute) {
                const pathCoordinates = newProps.solutionRoute.map(index => this.props.dataPoints[index])
                    .map(({lat, lng}) => ({lat, lng}));

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
            <div style={{height: '100%'}}>
                <GoogleMapReact
                    bootstrapURLKeys={{key: GOOGLE_MAPS_API_KEY}}
                    defaultCenter={this.props.center}
                    defaultZoom={this.props.zoom}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={({map, maps}) => this.apiIsLoaded(map, maps)}
                >
                    {
                        this.props.dataPoints.map((point, index) => (
                            <Marker {...point}
                                    index={index}
                                    key={`${point.label}.${point.popup}.${point.lat}.${point.lng}`}
                            />))
                    }


                </GoogleMapReact>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    dataPoints: state.map.dataPoints,
    solutionRoute: state.map.solutionRoute,
});

export default connect(mapStateToProps)(Map);