from flask import Blueprint, render_template
from flask import jsonify
import requests
from datetime import datetime

covid19 = Blueprint('covid19', __name__, template_folder='templates')
@covid19.route('/covid19/<country>')
def corona(country):

    case_types = ['confirmed', 'deaths']
    url = 'https://api.covid19api.com/total/dayone/country/{country}/status/{case_type}'

    labels = []
    values = []
    corona_table = {}
    for case_type in case_types:
        response = requests.get(url=url.format(country=country, case_type=case_type)).json()
        for entry in response:

            labels.append(datetime.strptime(entry['Date'][:10], '%Y-%m-%d').strftime('%b %d'))
            values.append(entry['Cases'])

        corona_table[case_type] = {
            'labels': labels,
            'values': values,
            'total': values[-1]
        }

        labels = []
        values = []

    increase_per_day = []
    for case_type in case_types:
        increase_per_day.append(corona_table[case_type]['values'][0])
        for index in range(1, len(corona_table[case_type]['values'])):
            increase_per_day.append(corona_table[case_type]['values'][index] - corona_table[case_type]['values'][index-1])

        corona_table[case_type].update({
            'values_diff': increase_per_day,
            'today': increase_per_day[-1],
            'yesterday': increase_per_day[-2]
        })

        increase_per_day = []

    return jsonify(corona_table)


