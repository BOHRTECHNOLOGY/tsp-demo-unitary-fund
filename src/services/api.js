import superagent from 'superagent'

export async function solve(distances) {
    try {
    const {body} = await superagent.post('/tsp/solve')
        .send({
            distances,
            start_node: 0,
            end_node: distances.length - 1,
            use_dwave: true
        })
        .accept('application/json');

    return body;
    }
    catch (e) {
        const {body} = await superagent.post('/tsp/solve')
            .send({
                distances,
                start_node: 0,
                end_node: distances.length - 1,
                use_dwave: false
            })
            .accept('application/json');

    return body;

    }
}