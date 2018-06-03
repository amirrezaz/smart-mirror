from flask import Blueprint, render_template
from flask import jsonify
import conf
import os
import requests


distance_matrix = Blueprint('distance_matrix', __name__, template_folder='templates')
@distance_matrix.route('/distance/<origin>/<destination>')
def distance(origin, destination):
    config = conf.Config()
    api_key = config.params.get('google_map',{}).get('api_key', None)

    url = 'https://maps.googleapis.com/maps/api/distancematrix/json?' \
          'origins={origin}&destinations={destination}&key={key}'.format(
        key = api_key,
        origin = origin,
        destination = destination
    )

    response = requests.get(url=url).json()

    return jsonify ({
        'duration': response['rows'][0]['elements'][0]['duration']['text']
    })


