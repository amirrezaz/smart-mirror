from flask import Flask
from flask import render_template
from weather import location_weather
from calendars import google_calendar, icloud_calendar
from news import rss_feed
from quote import quote_of_the_day
from map import distance_matrix
from camera import capture, record
from face import face
from flask import jsonify
import time
from screen import power
from face_recognition.recognition import recognition

app = Flask(__name__)
app.register_blueprint(location_weather)
app.register_blueprint(google_calendar)
app.register_blueprint(icloud_calendar)
app.register_blueprint(rss_feed)
app.register_blueprint(quote_of_the_day)
app.register_blueprint(distance_matrix)
app.register_blueprint(capture)
app.register_blueprint(record)
app.register_blueprint(power)
app.register_blueprint(face)

@app.route('/')
def mirror():

    return render_template(
        "mirror.html"
    )

# face_id = 1


# def recognize():
#     while True:
#         global face_id
#         face_id = 1
#     return


if __name__ == '__main__':
    recognition.start()
    app.run()
