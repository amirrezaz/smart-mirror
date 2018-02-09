from flask import Flask
from flask import render_template
from google.cloud import bigquery
from datetime import date, timedelta
from flask import jsonify

app = Flask(__name__)


@app.route('/')
def dashboard():

    return render_template(
        "dashboard.html"
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


@app.route('/yesterday_registrations')
def yesterday_registrations():

    client = bigquery.Client(project='tmg-datalake')

    yesterday = date.today() - timedelta(1)

    results = query(
        client,
        """
        SELECT count_registrations
        from [registrations.daily_registrations]
        where ACCOUNT_CREATED='{}'
        """.format(
            yesterday.strftime('%Y-%m-%d')
        )
    )

    for result in results:
        return jsonify({'yesterday_registrations': result.count_registrations})


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

    return jsonify({'monthly_registrations': [{
            'date': months[int(row.registration_date[4:6])-1] + ' ' + row.registration_date[:4],
            'count': row.count_registrations
        } for row in results]})


