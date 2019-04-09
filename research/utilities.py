import numpy as np

def create_random_distance_matrix(N):
    nodes_list = []
    for i in range(N):
        nodes_list.append(np.random.rand(2) * 10)
    nodes_array = np.array(nodes_list)
    number_of_nodes = len(nodes_array)
    matrix = np.zeros((number_of_nodes, number_of_nodes))
    for i in range(number_of_nodes):
        for j in range(i, number_of_nodes):
            matrix[i][j] = distance_between_points(nodes_array[i], nodes_array[j])
            matrix[j][i] = matrix[i][j]
    return matrix

def distance_between_points(point_A, point_B):
    return np.sqrt((point_A[0] - point_B[0])**2 + (point_A[1] - point_B[1])**2)
