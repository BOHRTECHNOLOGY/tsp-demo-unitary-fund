"""Module containing webservice to interact with TSP library."""
import json
import falcon
import numpy
import os
from tsp.solver import sample_from_distance_matrix

# poczta:warszawa
BASIC_AUTH_TOKEN = 'Basic cG9jenRhOndhcnN6YXdh'
STATIC_DIRECTORY = os.path.abspath(os.path.join(os.getcwd(), './build'))
INDEX_HTML = os.path.abspath(os.path.join(STATIC_DIRECTORY, './index.html'))

class AuthMiddleware(object):

    def process_request(self, req, resp):
        token = req.get_header('Authorization')
        if token is None or token != BASIC_AUTH_TOKEN:
            raise falcon.HTTPUnauthorized('Authentication required', headers=[('WWW-Authenticate', 'Basic realm=Authorization Required')])

class TSPResource(object):
    """Resource for computing TSP solution."""

    def on_post(self, req, resp):
        """The POST handler."""
        payload = json.load(req.bounded_stream)

        start = payload.get('start_node', None)
        end = payload.get('end_node', start)

        try:
            dist_matrix = numpy.array(payload['distances'], dtype='float64')
        except KeyError:
            msg = 'The "distances" matrix is absent from the request.'
            raise falcon.HTTPBadRequest('Bad request', msg)
        except ValueError:
            msg = 'The "distances" field should be a correct matrix.'
            raise falcon.HTTPBadRequest('Bad request', msg)

        if len(dist_matrix.shape) != 2 or dist_matrix.shape[0] != dist_matrix.shape[1]:
            raise falcon.HTTPBadRequest('Bad request', 'The "distances" matrix should be square.')

        dist_mul = payload.get('dist_mul', 1.0)
        const_mul = payload.get('const_mul', 8500.0)

        result = sample_from_distance_matrix(dist_matrix, dist_mul, const_mul, start=start, end=end)
        resp.content_type = falcon.MEDIA_JSON
        resp.body =  json.dumps({'route': result.route, 'distance': result.mileage,
                                 'energy': result.energy})

api = falcon.API(middleware=[
                     AuthMiddleware()
                 ])

def index_html_sink(req, resp):
    resp.content_type = 'text/html; charset=utf-8'

    with open(INDEX_HTML, 'rt') as f:
        resp.body = f.read()

api.add_sink(index_html_sink, prefix='^/$')
api.add_static_route('/', STATIC_DIRECTORY)
api.add_route('/tsp/solve', TSPResource())
