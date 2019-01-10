"""Module containing functions for solving TSP using D-Wave's Qbsolv."""
from collections import namedtuple
from dwave_qbsolv import QBSolv
import numpy
from tsp.qubo import construct_qubo, route_from_sample
from tsp.utils import create_distance_matrix, calculate_mileage

TSPSolution = namedtuple('TSPSolution', ['route', 'energy', 'mileage'])

def sample_from_locations(locations, dist_mul=1, const_mul=8500, **kwargs):
    """Sample TSP qubo from given locations and return lowet-energy solution.

    :param locations: coordinates of places to visit in (lat, long) format.
    :type locations: sequence of floating point pairs.
    :param dist_mul: constant by which target function is multiplied in QUBO.
     default is 1 as in original TSP 48 notebook.
    :type dist_mul: number
    :param const_mul: constant by which constraints are multiplied in QUBO.
     Defaults to 8500 as in original TSP 48 notebook.
    param kwargs: additional keyword arguments to pass to sample_qubo call.
    :returns: namedtuple with "route", "energy" and "mileage" fields where:
     - route is a sequence of indices of consecutively visited locations.
     - energy is  as energy of the solution
     - mileage is the total distance travelled (including return to starting point).
     Please note that mileage is returned in kilometers.
    :rtype: TSPSOlution
    """
    dist_matrix = create_distance_matrix(locations)
    return sample_from_distance_matrix(dist_matrix, dist_mul, const_mul, **kwargs)

def sample_from_distance_matrix(dist_matrix, dist_mul=1, const_mul=8500, start=None, end=None, **kwargs):
    """Sample TSP qubo from given distance matrix and return lowest-energy sdolution.

    This is basically the same as :py:func:`sample_from_locations` except it skips
    calculation of distance matrix (which is instead given as parameter) and can
    take into account starting and ending node.
    """
    dist_matrix = numpy.array(dist_matrix)
    number_of_locations = dist_matrix.shape[0]
    if start is not None and end is not None and start != end:
        # if both start and end are given and they are different
        # then we are dealing in non-returning TSP - and have to add dummy node
        dist_matrix = add_dummy_node(dist_matrix, start, end)
    qubo = construct_qubo(dist_matrix, dist_mul, const_mul)
    result = QBSolv().sample_qubo(qubo, **kwargs)
    route = route_from_sample(next(iter(result.samples())), number_of_locations, start, end)
    mileage = calculate_mileage(dist_matrix, route)
    return TSPSolution(route, result.data_vectors['energy'][0], mileage)

def add_dummy_node(distance_matrix, start, end):
    """Add a dummy node to the distance matrix, allowing one to solve non-cyclic TSP problem."""
    problem_size = distance_matrix.shape[0]
    augmented_matrix = numpy.zeros((problem_size+1, problem_size+1))
    augmented_matrix[0:problem_size, 0:problem_size] = distance_matrix
    penalty = distance_matrix.sum()
    for i in range(problem_size):
        if i not in (start, end):
            # We make sure that it is only feasible to go from start to dummy
            # or from end to dummy (and in opposite direction)
            # Routes connecting dummy and other nodes should be not favourable
            # because their total cost is much larger than this
            augmented_matrix[i, problem_size] = penalty
            augmented_matrix[problem_size, i] = penalty
    return augmented_matrix
