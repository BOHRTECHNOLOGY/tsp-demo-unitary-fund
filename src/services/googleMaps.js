let GoogleMaps;

export const registerGoogleMaps = (google) => {
    GoogleMaps = google
};

const promiseTimeout = timeout => new Promise(resolve => setTimeout(resolve, timeout));

const computeMatrix = ({latLongs, service, attempts = 3}) => new Promise((resolve, reject) => {
    service.getDistanceMatrix(
        {
            origins: latLongs,
            destinations: latLongs,
            travelMode: 'DRIVING',
        }, async (response, status) => {
            if (status !== 'OK') {
                if (attempts === 0) {
                    return reject(new Error(`Call to DistanceMatrixService failed with status: ${status}`));
                }
                try {
                    await promiseTimeout(2000);
                    return resolve(await computeMatrix({latLongs, service, attempts: attempts - 1}))
                } catch (err) {
                    return reject(err);
                }
            }

            return resolve(response.rows)
        })
});

export const getDistancesMatrix = async (points) => {
    const latLongs = points.map(({lat, lng}) => new GoogleMaps.LatLng(lat, lng));
    const service = new GoogleMaps.DistanceMatrixService();

    const distances = await computeMatrix({latLongs, service});

    return distances.map(({elements}) => elements.map(({duration}) => duration.value))
};