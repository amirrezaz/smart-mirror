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

    recognition.stop()
    camera = PiCamera()
    camera.resolution = (1280, 720)

    camera.start_preview()
    count_down = 5
    while count_down > 0:
        camera.annotate_text = str(count_down)
        count_down -= 1
        time.sleep(1)
    camera.annotate_text = ''
    camera.stop_preview()
    image_name = "{}.jpg".format(datetime.now().strftime('%s'))
    camera.capture('static/{}'.format(image_name))
    camera.close()
    recognition.start()

    return jsonify({
        'image_name': image_name
    })


upload = Blueprint('upload', __name__, template_folder='templates')
@capture.route('/upload/{image_name}')
def camera_upload(image_name):
    config = conf.Config()
    access_token = config.params.get('dropbox',{}).get('access_token', None)
    app_folder = config.params.get('dropbox',{}).get('app_folder', None)

    dbx = dropbox.Dropbox(access_token)

    with open("static/{}".format(image_name), "rb") as imageFile:
        f = imageFile.read()
        dbx.files_upload(
            f,
            '/{app_folder}/{filename}.jpg'.format(
                app_folder=app_folder,
                filename=datetime.now().strftime('%s')
            )
        )

    return jsonify({
        'status': 'done'
    })


upload_video = Blueprint('upload_video', __name__, template_folder='templates')
@capture.route('/upload_video/{video_name}')
def upload_video(video_name):
    config = conf.Config()
    access_token = config.params.get('dropbox',{}).get('access_token', None)
    app_folder = config.params.get('dropbox',{}).get('app_folder', None)

    dbx = dropbox.Dropbox(access_token)

    with open("static/{}".format(video_name), "rb") as imageFile:
        f = imageFile.read()
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


record = Blueprint('record', __name__, template_folder='templates')
@capture.route('/record/')
def camera_record():

    recognition.stop()
    camera = PiCamera()
    camera.resolution = (1024, 768)
    camera.start_preview()

    camera.start_recording('static/video.h264')
    camera.wait_recording(10)
    camera.stop_recording()
    camera.stop_preview()
    camera.close()

    video_name = "{}.mp4".format(datetime.now().strftime('%s'))

    subprocess.call(['MP4Box', '-add', 'static/video.h264', 'static/{}'.format(video_name)])

    recognition.start()

    return jsonify({
        'video_name': video_name
    })
