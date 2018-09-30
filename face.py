from flask import Blueprint, render_template
from flask import jsonify
from utility import screen
from face_recognition.recognition import recognition

face = Blueprint('face', __name__, template_folder='templates')
@face.route('/face/')
def face_recognition():

    # if recognition.face_id is None:
    #     screen.turn_off()
    # else:
    #     screen.turn_on()

    return jsonify({
        'id': recognition.face_id
    })


