from flask import Blueprint, render_template
import requests
from flask import jsonify
from datetime import datetime
import conf


location_weather = Blueprint('location_weather', __name__, template_folder='templates')
@location_weather.route('/weather/<location_name>')
def weather(location_name):

    config = conf.Config()

    locations = config.params.get('weather',{}).get('locations',[])
    if not locations:
        return jsonify({'error':'locations are not defined in the config file.'})

    for location in locations:
        if location.get('name', None) == location_name:
            break
        else:
            location = None

    if not location:
        return jsonify({'error':'location {} is not defined in the config file.'.format(location_name)})

    key = config.params.get('weather', {}).get('key', None)
    long = location.get('long', None)
    lat = location.get('lat', None)

    if all([key, long, lat]):
        url = 'https://api.darksky.net/forecast/{key}/{long},{lat}?units=uk2'.format(
            key=key,
            long=long,
            lat=lat
        )
        response = requests.get(url=url).json()
    else:
        return jsonify({'error':'key, long and lat should be defined in the config file.'})

    daily = [{
        'icon': daily_data['icon'],
        'day': datetime.fromtimestamp(daily_data['time']).strftime('%A'),
        'temperature_high': int(round(daily_data['temperatureHigh'])),
        'temperature_low': int(round(daily_data['temperatureLow'])),
        'humidity': daily_data['humidity'],
        'wind_speed': int(round(daily_data['windSpeed'])),
        'summary': daily_data['summary']

    } for daily_data in response['daily']['data']]

    hourly = [{
        'icon': hourly_data['icon'],
        'day': datetime.fromtimestamp(hourly_data['time']).strftime('%A'),
        'time': datetime.fromtimestamp(hourly_data['time']).strftime('%H:%M'),
        'temperature': int(round(hourly_data['temperature'])),
        'humidity': hourly_data['humidity'],
        'wind_speed': int(round(hourly_data['windSpeed'])),
        'feels_like': int(round(hourly_data['apparentTemperature']))
    } for hourly_data in response['hourly']['data']]

    current = {
        'temperature': int(round(response['currently']['temperature'])),
        'feels_like': int(round(response['currently']['apparentTemperature'])),
        'wind_speed': int(round(response['currently']['windSpeed'])),
        'icon': response['currently']['icon'],
        'humidity': response['currently']['humidity'],
        'precip_type': response['currently'].get('precipType', None),
        'precip_prob': int(round(100*response['currently'].get('precipProbability',0))),
        'summary': response['currently']['summary']
    }

    alerts = [{
        'title': alert['title'],
        'severity': alert['severity']
    } for alert in response.get('alerts',[])]

    return jsonify({
        'current' : current,
        'daily': daily,
        'alerts': alerts,
        'hourly': hourly
    })

