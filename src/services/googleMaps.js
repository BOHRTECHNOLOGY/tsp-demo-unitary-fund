let GoogleMaps;

export const registerGoogleMaps = (google) => {
    GoogleMaps = google
};

const computeForBatch = ({origins, destinations, service, startDate}) => {
    return new Promise((resolve, reject) => {

        // Make sure that date is a future date
        const shouldUseDate = startDate && startDate.getTime() > Date.now();

        service.getDistanceMatrix(
            {
                origins,
                destinations,
                travelMode: 'DRIVING',
                ...shouldUseDate && {drivingOptions: {departureTime: startDate}}
            }, (response, status) => {
                if (status !== 'OK') {
                    return reject(new Error(`Call to DistanceMatrixService failed with status: ${status}`));
                }

                return resolve(response.rows)
            })

    });
};

const promiseTimeout = timeout => new Promise(resolve => setTimeout(resolve, timeout));

export const getDistancesMatrix = async (points, startDate) => {
    const latLongs = points.map(({lat, lng}) => new GoogleMaps.LatLng(lat, lng));
    const service = new GoogleMaps.DistanceMatrixService();

    // Maximum of 100 elements is allowed in one request
    if (latLongs.length > 10) {
        const halfIndex = Math.floor(latLongs.length / 2);

        const firstBatch = await computeForBatch({
            origins: latLongs.slice(0, halfIndex),
            destinations: latLongs,
            service,
            startDate,
        });
        await promiseTimeout(10 * 1000); // Wait 10 seconds between requests to avoid OVER_QUERY_LIMIT error
        const secondBatch = await computeForBatch({
            origins: latLongs.slice(halfIndex),
            destinations: latLongs,
            service,
            startDate,
        });

        return firstBatch.concat(secondBatch)
    }

    return computeForBatch({origins: latLongs, destinations: latLongs, service, startDate})
};

export const transformToArrayOfArrays = (distances) => {
    return distances.map(({elements}) => elements.map(({duration}) => duration.value))
};