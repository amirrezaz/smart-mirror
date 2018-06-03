from flask import Flask
from flask import render_template
from weather import location_weather
from calendars import google_calendar, icloud_calendar
from news import rss_feed
from quote import quote_of_the_day
from map import distance_matrix
from camera import capture
from flask import g
import threading
from celery import Celery
from flask import jsonify


app = Flask(__name__)
app.register_blueprint(location_weather)
app.register_blueprint(google_calendar)
app.register_blueprint(icloud_calendar)
app.register_blueprint(rss_feed)
app.register_blueprint(quote_of_the_day)
app.register_blueprint(distance_matrix)
app.register_blueprint(capture)

face_id = None

@app.route('/')
def mirror():

    print(face_id)
    return render_template(
        "mirror.html"
    )

@app.route('/face')
def face():

    return jsonify({
        'id': face_id
    })


def face_recognition():
    def start_loop():
        while True:
            global face_id
            face_id = 2

    print('Started runner')
    thread = threading.Thread(target=start_loop)
    thread.start()


if __name__ == '__main__':
    face_recognition()
    app.run()

