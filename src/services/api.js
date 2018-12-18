import superagent from 'superagent'

// TODO mock remove
const shuffle = (array) => {
    let counter = array.length;
    const result = [...array];

    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;

        const temp = result[counter];
        result[counter] = result[index];
        result[index] = temp;
    }

    return result;
};

export async function solve(distances) {
    const indexes = distances.map((e, index) => index);
    const solution = [indexes[0], ...shuffle(indexes.slice(1, indexes.length - 1)), indexes[indexes.length - 1]];
    return new Promise(resolve => setTimeout(() => resolve(solution), 3000));

    // TODO implement proper API call
    const {body} = await superagent.post('/tsp/solve')
        .send({
            distances,
            start_node: 0,
            end_node: distances.length - 1
        })
        .retry(2)
        .accept('application/json');

    return body
}