from google.cloud import bigquery
import json


def query(client, query_str):

    job_config = bigquery.QueryJobConfig()
    job_config.use_legacy_sql = True

    query_job = client.query(
        query_str,
        job_config=job_config
    )

    results = query_job.result()  # Waits for job to complete.

    return results


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
        return json.dumps({'total_active_logged': result.Total_active_logged})

if __name__ == '__main__':
    print total_active_logged()
