import superagent from 'superagent'

export async function solve(distances, startNode, endNode) {
    const {body} = await superagent.post('/tsp/solve')
        .send({
            distances,
            ...startNode !== undefined && {start_node: startNode},
            ...endNode !== undefined && {end_node: endNode},
        })
        .retry(2)
        .accept('application/json');

    return body
}