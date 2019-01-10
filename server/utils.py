"""Utility functions for the rest of TSP package."""
import geopy.distance
import numpy


def distance(first, second):
    """Compute distance between two locations given their lat-long coordinates.

    :param first: coordinates of first location as a pair of floating point
     numbers representing lattitude and longitude.
    :type first: sequence of floats
    :param second: coordinates of second location.
    :type second: sequence of floats
    :returns: geodesic distance between first and second in kilometers, calculated
     using WGS-84 ellipsoid reference system.
    :rtype: float
    """
    return geopy.distance.distance(first, second).km

def create_distance_matrix(locations):
    """Compute distance matrix for given locations.

    :param locations: a sequence of cordinates
    :type location: sequence of pairs of floats
    :returns: a matrix M of shape len(locations) x len(locations) such that
     M[i, j] is a distance between i-th and j-th location.
    :rtype: numpy.ndarray
    """
    size = len(locations)
    result = numpy.zeros((size, size))
    for i in range(size):
        for j in range(i+1, size):
            result[i, j] = result[j, i] = distance(locations[i], locations[j])
    return result

def calculate_mileage(distance_matrix, route):
    """Calculate total mileage travelled using the given route.

    :param distance_matrix: distance matrix, i.e. a matrix M such that M[i,j]
     is a distance between i-th and j-th location. It is assumed that this matrix
     is symmetric.
    :type distance_matrix: numpy.ndarray
    :param route: sequence of locations visited in TSP solution. For instance,
     if the solution is to start in 1, then go to 0, go to 2 and come back to 1,
     this parameter should be [1, 0, 2].
    :type route: sequence of ints
    :returns: mileage of the route, i.e. total distance travelled, in whatever units
     distance_matrix is specified.
    :rtype: number
    """
    mileage = 0
    for i in range(len(route)-1):
        mileage += distance_matrix[route[i], route[i+1]]
    return mileage
