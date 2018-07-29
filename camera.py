from flask import Blueprint, render_template
from flask import jsonify
import conf
import os
import requests
import dropbox
from datetime import datetime
from subprocess import call
from picamera import PiCamera
from face_recognition.recognition import recognition
import time
import subprocess

capture = Blueprint('capture', __name__, template_folder='templates')
@capture.route('/capture/')
def camera_capture():
    config = conf.Config()
    access_token = config.params.get('dropbox',{}).get('access_token', None)
    app_folder = config.params.get('dropbox',{}).get('app_folder', None)

    recognition.stop()
    camera = PiCamera()
    camera.start_preview()
    count_down = 5
    while count_down > 0:
        camera.annotate_text = str(count_down)
        count_down -= 1
        time.sleep(1)
    camera.annotate_text = ''
    camera.stop_preview()
    camera.capture('image.jpg')
    camera.close()
    recognition.start()

    dbx = dropbox.Dropbox(access_token)

    with open("image.jpg", "rb") as imageFile:
        f = imageFile.read()
        dbx.files_upload(
            f,
            '/{app_folder}/{filename}.jpg'.format(
                app_folder=app_folder,
                filename=datetime.now().strftime('%s')
            )
        )

    return jsonify ({
        'status': 'done'
    })


record = Blueprint('record', __name__, template_folder='templates')
@capture.route('/record/')
def camera_record():
    config = conf.Config()
    access_token = config.params.get('dropbox',{}).get('access_token', None)
    app_folder = config.params.get('dropbox',{}).get('app_folder', None)

    recognition.stop()
    camera = PiCamera()
    camera.resolution = (1024, 768)
    camera.start_preview()

    camera.start_recording('video.h264')
    camera.wait_recording(10)
    camera.stop_recording()
    camera.stop_preview()
    camera.close()
    recognition.start()

    subprocess.call(['MP4Box', '-add', 'video.h264', 'video.mp4'])

    dbx = dropbox.Dropbox(access_token)

    with open("video.mp4", "rb") as videoFile:
        f = videoFile.read()
        dbx.files_upload(
            f,
            '/{app_folder}/{filename}.mp4'.format(
                app_folder=app_folder,
                filename=datetime.now().strftime('%s')
            )
        )

    return jsonify({
        'status': 'done'
    })
