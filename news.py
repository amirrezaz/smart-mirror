from flask import Blueprint, render_template
import requests
from flask import jsonify
from datetime import datetime
import conf
import feedparser

rss_feed = Blueprint('rss_feed', __name__, template_folder='templates')
@rss_feed.route('/news/<news_channel>')
def news_feed(news_channel):
    config = conf.Config()
    feed_url = config.params.get('news_feed',{}).get(news_channel, None)
    if not feed_url:
        return jsonify({'error':'feed url is not specified in the config file.'})

    feed = feedparser.parse(feed_url)

    results = []
    for entry in feed.entries:
        results.append({
            'title':entry.title,
            'description': entry.description
        })

    return jsonify({
        'news' : results,
    })

