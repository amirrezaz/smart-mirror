from flask import Blueprint, render_template
import requests
from flask import jsonify
from datetime import datetime
import conf

quote_of_the_day = Blueprint('quote_of_the_day', __name__, template_folder='templates')
@quote_of_the_day.route('/quote/')
def quote():
    url = 'http://api.forismatic.com/api/1.0/?method=getQuote&&format=json&lang=en'
    response = requests.get(url=url).json()

    return jsonify ({
        'text': response['quoteText'],
        'author': response['quoteAuthor']
    })
