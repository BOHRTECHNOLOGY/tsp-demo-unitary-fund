"""Utilities for constructing and solving TSP QUBO."""
from collections import defaultdict
from functools import partial


def construct_qubo(distance_matrix, dist_mul=1, const_mul=8500):
    """Construct QUBO for TSP problem given distance matrix and model parameters.

    :param distance_matrix: matrix M such that M[i,j] is a distance between
     i-th and j-th location. It is assumed that this matrix is symmetric and
     contains only nonnegative entries.
    :type distance_matrix: numpy.ndarray
    :param dist_mul: multiplier for coefficients of QUBO corresponding to target
     function. Defaults to 1 as in original TSP-48 notebook.
    :type dist_mul: number
    :param const_mul: multiplier for constraints coefficients. Defaults to
     8500 as in original TSP-48 notebook
    :type const_mul: number
    :returns: mapping (i, j) -> coefficient, where (i, j) are encoded QUBO's
     variables. The returned mapping is always symmetric.
    :rtype: defaultdict(float)
    """
    number_of_locations = distance_matrix.shape[0]

    x = partial(map_x_to_qubit, num_variables=number_of_locations)
    qubo = defaultdict(float)

    # First: add row constraints. Don't include first row, as it is fixed
    # as a part of optimized encoding
    for row in range(1, number_of_locations-1):
        for i in range(1, number_of_locations-1):
            qubo[(x(row, i), x(row, i))] += -const_mul
            for j in range(i+1, number_of_locations-1):
                qubo[(x(row, i), x(row, j))] += 2 * const_mul
                qubo[(x(row, j), x(row, i))] += 2 * const_mul

    # Second: add column constraints. Note that we treat i=0 in special way
    # due to an optimized encoding
    for col in range(1, number_of_locations-1):
        for i in range(1, number_of_locations-1):
            qubo[(x(i, col), x(i, col))] += -const_mul
            for j in range(i+1, number_of_locations-1):
                qubo[(x(i, col), x(j, col))] += 2 * const_mul
                qubo[(x(j, col), x(i, col))] += 2 * const_mul

    # Third: add the objective function
    for i in range(1, number_of_locations-1):
        # First and last steps are special as they produce linear terms
        dist_to_first =  distance_matrix[0, i]
        dist_to_last =  distance_matrix[-1, i]
        qubo[x(1, i), x(1, i)] += dist_mul * dist_to_first
        qubo[(x(number_of_locations-2, i), x(number_of_locations-2, i))] += dist_mul * dist_to_last
        for j in range(1, number_of_locations-1):
            if i != j:
                for step in range(1, number_of_locations-2):
                    dist = distance_matrix[i, j]
                    qubo[(x(step, i), x((step+1), j))] += dist_mul * dist
    return qubo

def map_x_to_qubit(i, j, num_variables):
    """Map indices of x{i, j} variable to corresponding qubit number."""
    return i * num_variables + j

def map_qubit_to_x(qubit_no, num_variables):
    """This reverses map_x_to_qubit."""
    return divmod(qubit_no, num_variables)

def route_from_sample(sample, number_of_locations, start=None, end=None):
    """Given the solution of QUBO and number of locations, read corresponding route.

    :param sample: sample obtained from the solver. The expected format is
     a mapping qubit -> {0 ,1}
    :type sample: Mapping
    :param number_of_locations: number of locations provided as the input for the problem.
     This could be deduced from sample but would require additional effot.
    :type number_of_locations: int
    :returns: sequence route such that route[i] contains number of location
     that should be visited in i-th step.
    :rtype: sequence of ints

    .. note::
       This function does not check whether all of the constraints are satisfied,
       and if solution is found that violates some of them, the behaviour is
       not well defined.
    """
    number_of_nodes = number_of_locations

    route = [-1 for _ in range(number_of_nodes)]
    route[0] = start
    route[-1] = end
    print(sample)
    for qubit in sample:
        if sample[qubit] > 0:
            # Note that mapping takes into account number of nodes, not locations
            step, location = map_qubit_to_x(qubit, number_of_nodes)
            route[step] = location
    print(route)
    print(start, end)
    print(adjust_ends_acyclic(route, start, end))

    return adjust_ends_acyclic(route, start, end)


def adjust_ends_cyclic(route, start):
    """Adjust ending points in route, assuming the passed route should be cyclic.

    :param route: an initial route encoded as a sequence, i.e. route[i] = j if
     and only if j-th node should be visited in ith step. It is assumed that this
     route should be cyclic, but does not contain the second occurence of first node.
     For instance [0, 1, 2] encodes cycle 0 -> 1 -> 2 -> 0.
    :type route: sequence of ints.
    :param start: determines where should the route start. If None it is assumed
     that we con't care.
    :type start: int
    :returns: adjusted route, i.e. the same route as passed except:
     - if start is given, the first node in route is start
     - first and last node in route are the same.
    """
    if start is not None:
        start_index = route.index(start)
        route = route[start_index:] + route[0:start_index]
    route.append(route[0])
    return route

def adjust_ends_acyclic(route, start, end):
    """Adjust ending poinsts in route, assuming the passed route should be acyclic.

    :param route: an initial route encoded as a sequence, i.e. route[i] = j if
     and only if j-th node should be visited in ith step. It is assumed that this
     route is acyclic, i.e. sequence [0, 1, 2] encodes route 0 -> 1 -> 2.
    :param start: node that should appear first in the route
    :type start: int
    :param end: node that should appear last in the route
    :type end: int
    :returns: adjusted route, i.e. one in which `start` is first node and `end` is last node.
    :rtype: sequence.

    .. notes::

    This function assumes that it is possibly to correctly adjust the given route.
    If the solver returned invalid solution, and it is passed here, the result is
    undefined.
    """
    start_index = route.index(start)
    end_index = route.index(end)
    if (start_index+1) % len(route) == end_index:
        route = route[start_index::-1] + route[-1:start_index:-1]
    else:
        route = route[start_index:] + route[0:start_index]
    return route
