from datetime import datetime
from datetime import timedelta
from pyicloud import PyiCloudService
from apiclient.discovery import build
from httplib2 import Http
from oauth2client import file, client, tools
from flask import Blueprint, render_template
from flask import jsonify
import conf
import os


icloud_calendar = Blueprint('icloud_calendar', __name__, template_folder='templates')
@icloud_calendar.route('/calendar/icloud/')
def calendar():
    config = conf.Config()
    username = config.params.get('icloud',{}).get('username', None)
    password = config.params.get('icloud',{}).get('password', None)

    icloud_api = PyiCloudService(username, password)

    if icloud_api.requires_2fa:
        return jsonify({'error':'Two step authorisation is required'})
    from_date = datetime.today()
    end_date = from_date + timedelta(days=14)

    events = icloud_api.calendar.events(from_date, end_date)

    results = []
    for event in events:

        title = event['title']
        start_date = event['startDate']
        end_date = event['endDate']

        start_date_object = datetime(start_date[1],start_date[2],start_date[3],start_date[4],start_date[5])
        end_date_object = datetime(end_date[1],end_date[2],end_date[3],end_date[4],end_date[5])

        start_date_object = start_date_object + timedelta(hours=1)
        date_formatted = start_date_object.strftime('%a, %d %b')
        date_str = start_date_object.strftime('%Y%m%d')

        event_item = {
            'title': title,
            'start': None if start_date[4] == 0 and start_date[5] == 0 else start_date_object.strftime('%H:%M'),
            'end': None if end_date[4] == 0 and end_date[5] == 0 else end_date_object.strftime('%H:%M')
        }

        date_item = {
            'date': date_str,
            'date_formatted': date_formatted,
            'events': [event_item]
        }

        date_index = next((index for (index, d) in enumerate(results) if d["date"] == date_str), None)

        if date_index:
            results[date_index]['events'].append(event_item)
        else:
            results.append(date_item)


    return jsonify({
        'days': sorted(results, key=lambda k: k['date'])
    })

google_calendar = Blueprint('google_calendar', __name__, template_folder='templates')
@google_calendar.route('/calendar/google')
def calendar():

    SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'
    credentials_file = '{}/credentials/credentials.json'.format(os.path.dirname(os.path.abspath(__file__)))
    store = file.Storage(credentials_file)
    creds = store.get()
    client_secret_file = '{}/credentials/client_secret.json'.format(os.path.dirname(os.path.abspath(__file__)))
    if not creds or creds.invalid:
        flow = client.flow_from_clientsecrets(client_secret_file, SCOPES)
        creds = tools.run_flow(flow, store)
    service = build('calendar', 'v3', http=creds.authorize(Http()))


    from_date = datetime.today()
    end_date = from_date + timedelta(days=14)

    events_result = service.events().list(
        calendarId='primary',
        timeMin=from_date.isoformat() + 'Z',
        timeMax=end_date.isoformat() + 'Z',
        singleEvents=True,
        orderBy='startTime'
    ).execute()

    events = events_result.get('items', [])
    results = []
    for event in events:

        title = event['summary']
        start_date = event['start'].get('dateTime', event['start'].get('date'))
        start_date_object = datetime.strptime(start_date[:19], '%Y-%m-%dT%H:%M:%S')

        date_formatted = start_date_object.strftime('%a, %d %b')
        date_str = start_date_object.strftime('%Y%m%d')

        event_item = {
            'title': title,
            'start': None if start_date_object.hour == 0 and start_date_object.minute == 0 else start_date_object.strftime('%H:%M'),
        }

        date_item = {
            'date': date_str,
            'date_formatted': date_formatted,
            'events': [event_item]
        }

        date_index = next((index for (index, d) in enumerate(results) if d["date"] == date_str), None)

        if date_index is None:
            results.append(date_item)
        else:
            results[date_index]['events'].append(event_item)


    return jsonify({
        'days': sorted(results, key=lambda k: k['date'])
    })