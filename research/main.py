from minorminer import find_embedding
import dwave_networkx as dnx
import networkx as nx
import utilities
import numpy as np
import pdb
import os, sys, inspect
currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
sys.path.insert(0,parentdir) 

from tsp.qubo import construct_qubo

def main():
    for graph_size in range(4, 10):
        print("TSP size:", graph_size)
        min_max_chain = 1000
        min_mean_chain = 1000
        best_embedding = None
        for i in range(1000):
            distance_matrix = utilities.create_random_distance_matrix(graph_size)
            qubo_params = {'cost_constant': 10, 'constraint_constant': 400}
            qubo_dict = construct_qubo(distance_matrix)

            embedding = get_embedding(qubo_dict)
            evaluation = evaluate_embedding(embedding)
            if evaluation[1] < min_max_chain:
                min_max_chain = evaluation[1]
                min_mean_chain = evaluation[2]
                best_embedding = embedding
                print(i, evaluation)
            elif evaluation[1] == min_max_chain:
                if evaluation[2] < min_mean_chain:
                    min_max_chain = evaluation[1]
                    min_mean_chain = evaluation[2]
                    best_embedding = embedding
                    print(i, evaluation)
 
        import numpy as np
        np.save('embedding_' + str(graph_size) + '.npy', best_embedding) 


def get_embedding(qubo_dict):
    # graph = dnx.chimera_graph(16, 16, 4)
    edges_array = np.genfromtxt("Dwave_2000Q_edges.csv", delimiter=',')
    
    edges = []
    for item in edges_array:
        edges.append((item[0], item[1]))
    try:
        embedding = find_embedding(qubo_dict, edges)
    except Exception as e:
        print(e)
        return [np.nan, np.nan, np.nan]

    if len(embedding) == 0:
        return [np.nan, np.nan, np.nan]
    return embedding


def evaluate_embedding(embedding):
    all_chains = []
    chain_lenghts = []
    for node, chain in embedding.items():
        all_chains += chain
        chain_lenghts.append(len(chain))
    n_qubits = len(np.unique(all_chains))
    max_chain = np.max(chain_lenghts)
    mean_chain = np.mean(chain_lenghts)
    return [n_qubits, max_chain, mean_chain]


if __name__ == '__main__':
    main()