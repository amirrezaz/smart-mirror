from flask import Flask
from flask import render_template
from google.cloud import bigquery
from datetime import date, timedelta
from flask import jsonify
import mysql.connector
import os
import conf

app = Flask(__name__)


@app.route('/')
def dashboard():

    return render_template(
        "dashboard.html",
        today=date_format(date.today())
    )

if __name__ == '__main__':
    app.run()


def query(client, query_str):

    job_config = bigquery.QueryJobConfig()
    job_config.use_legacy_sql = True

    query_job = client.query(
        query_str,
        job_config=job_config
    )

    results = query_job.result()  # Waits for job to complete.

    return results


@app.route('/total_active_logged')
def total_active_logged():

    client = bigquery.Client(project='tmg-datalake')

    results = query(
        client,
        """
        SELECT Total_active_logged
        from
        [registrations.total_active_logged]
        """
    )

    for result in results:
        return jsonify({'total_active_logged': result.Total_active_logged})


@app.route('/seven_days_registrations')
def seven_days_registrations():

    client = bigquery.Client(project='tmg-datalake')

    end_date = date.today() - timedelta(1)
    start_date = date.today() - timedelta(7)

    results = query(
        client,
        """
        SELECT count_registrations, STRFTIME_UTC_USEC(ACCOUNT_CREATED ,"%Y%m%d") as date
        FROM [registrations.daily_registrations]
        WHERE STRFTIME_UTC_USEC(ACCOUNT_CREATED ,"%Y%m%d") >= '{start_date}' AND
              STRFTIME_UTC_USEC(ACCOUNT_CREATED ,"%Y%m%d") <= '{end_date}'
        """.format(
            start_date=start_date.strftime('%Y%m%d'),
            end_date=end_date.strftime('%Y%m%d')
        )
    )

    return jsonify({
        'seven_days_registrations': sorted([{
            'date': result.date,
            'count': result.count_registrations
        } for result in results], key=lambda registration: registration['date']),
        'date_range': date_range_format(start_date, end_date)
    })


@app.route('/monthly_registrations')
def monthly_registrations():

    client = bigquery.Client(project='tmg-datalake')

    results = query(
        client,
        """
        SELECT registration_date, count_registrations
        from [registrations.monthly_registrations]
        ORDER BY registration_date ASC
        """
    )

    months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
        'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]

    return jsonify({
        'monthly_registrations': [{
            'date': {
                'month': months[int(row.registration_date[4:6])-1],
                'year': row.registration_date[:4]
            },
            'count': row.count_registrations
        } for row in results]
    })


@app.route('/seven_days_subscriptions')
def seven_days_subscription():

    config = conf.Config()

    username = config.params.get('MySql', 'username')
    password = config.params.get('MySql', 'password')

    cnx = mysql.connector.connect(
        host=config.params.get('MySql', 'host'),
        user=username if username else os.environ.get('DB_USER', None),
        password=password if password else os.environ.get('DB_PASSWORD', None),
        database=config.params.get('MySql', 'database')
    )

    cursor = cnx.cursor()

    start_date = date.today() - timedelta(7)
    end_date = date.today() - timedelta(1)

    app_root = os.path.dirname(os.path.abspath(__file__))  # refers to application_top
    query_file_path = os.path.join(app_root, 'queries', 'yesterday_subs.sql')

    with open(query_file_path) as query_file:

        query = query_file.read()

        cursor.execute(query.format(
            start_date=start_date.strftime('%Y%m%d'),
            end_date=end_date.strftime('%Y%m%d')
        ))

        subscriptions = [{
            'date': event_effective_date,
            'count': int(count_subscriptions)
        } for (event_effective_date, count_subscriptions) in cursor]

        cursor.close()
        cnx.close()

        return jsonify({
            'seven_days_subscriptions': sorted(subscriptions, key=lambda subscription: subscription['date']),
            'date_range': date_range_format(start_date, end_date)
        })


def date_format(date):

    suffix = 'th' if 11 <= date.day <= 13 else {1: 'st', 2: 'nd', 3: 'rd'}.get(date.day % 10, 'th')
    return date.strftime('%A {S}').replace('{S}', str(date.day) + suffix)


def date_range_format(start_date, end_date):
    if start_date.month == end_date.month:
        return '{month} {start_day} - {end_day}'.format(
            month=start_date.strftime('%B'),
            start_day=start_date.day,
            end_day=end_date.day
        )
    else:
        return '{start_month} {start_day} - {end_month} {end_day}'.format(
            start_month=start_date.strftime('%B'),
            end_month=end_date.strftime('%B'),
            start_day=start_date.day,
            end_day=end_date.day
        )
