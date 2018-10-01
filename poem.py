from flask import Blueprint, render_template
import requests
from flask import jsonify
from datetime import datetime
import conf
import csv
import random

poem = Blueprint('poem', __name__, template_folder='templates')
@poem.route('/poem/')
def khayyam():
    with open('static/khayyam.csv', 'r') as poet_file:
        csv_reader = csv.reader(poet_file, delimiter=',')
        lines = [(row[0], row[1], row[2], row[3]) for row in csv_reader]
    poem = lines[random.randint(0, len(lines)-1)]

    return jsonify({
        'poem': poem,
        'author': 'خیام'
    })

