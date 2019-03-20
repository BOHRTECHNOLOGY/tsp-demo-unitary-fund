"""Module containing functions for solving TSP using D-Wave's Qbsolv."""
from collections import namedtuple
from dwave_qbsolv import QBSolv
import numpy as np
from tsp.qubo import construct_qubo, route_from_sample
from tsp.utils import create_distance_matrix, calculate_mileage


TSPSolution = namedtuple('TSPSolution', ['route', 'energy', 'mileage', 'info'])
DWAVE_ENDPOINT = 'https://cloud.dwavesys.com/sapi'

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
    dist_matrix = np.array(dist_matrix)
    number_of_locations = dist_matrix.shape[0]
    max_distance = np.max(dist_matrix)
    dist_matrix = dist_matrix / max_distance

    qubo = construct_qubo(dist_matrix, dist_mul, const_mul)
    use_dwave = kwargs.get('use_dwave', False)
    token = kwargs.get('dwave_token', None)
    solver = kwargs.get('solver', None)

    if 'use_dwave' in kwargs:
        del kwargs['use_dwave']
        del kwargs['dwave_token']
    import gc

    if use_dwave:
        try:
            num_reads = 1000
            if number_of_locations > 7:
                num_reads = 2000
            print("Start solving using D-Wave!")
            # solver = EmbeddingComposite(DWaveSampler(token=token, endpoint=DWAVE_ENDPOINT))
            result = solver.sample_qubo(qubo, num_reads=num_reads, chain_strength=const_mul*2)
            info = {"total_time": result.info['timing']['total_real_time']/10e3,
                "machine": "DWAVE 2000Q"}
        except Exception as e:
            print(e)
            print("D-Wave failed, switched to QBSolv!")
            result = QBSolv().sample_qubo(qubo, **kwargs)
            info = {"machine": "local"}
    else:
        print("Start solving using QBSolv")
        result = QBSolv().sample_qubo(qubo, **kwargs)
        info = {"machine": "local"}
    print("Got answer!")
    route = route_from_sample(next(iter(result.samples())), number_of_locations, start, end)
    mileage = calculate_mileage(dist_matrix * max_distance, route)
    info['mileage'] = mileage
    print("Problem solved!")
    energy = result.data_vectors['energy'][0]
    del solver
    del result
    gc.collect()
    return TSPSolution(route, energy, mileage, info)
