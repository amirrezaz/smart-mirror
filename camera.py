from flask import Blueprint, render_template
from flask import jsonify
import conf
import os
import requests
import dropbox
from datetime import datetime
from subprocess import call
from flask import g

capture = Blueprint('capture', __name__, template_folder='templates')
@capture.route('/capture/')
def camera_capture():
    print('*******')
    print(g.face_id)
    config = conf.Config()
    access_token = config.params.get('dropbox',{}).get('access_token', None)
    app_folder = config.params.get('dropbox',{}).get('app_folder', None)

    call(["raspistill", "-o", "cam.jpg"])

    dbx = dropbox.Dropbox(access_token)

    with open("/Users/zareiana/Downloads/amir.jpg", "rb") as imageFile:
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