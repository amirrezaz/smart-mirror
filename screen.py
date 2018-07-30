from flask import Blueprint, render_template
from flask import jsonify
from utility import screen

power = Blueprint('power', __name__, template_folder='templates')
@capture.route('/power/<type>')
def screen_power(type):

    if type == 'off':
        screen.turn_off_hard()
    else:
        screen.turn_on_hard()

    return jsonify({
        'status': screen.is_on
    })
