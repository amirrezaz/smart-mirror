from google.cloud import bigquery
import time
import uuid





def get_dataset(project, dataset_name):
    """
    get the dataset in GC
    :param project: project name
    :param dataset_name: dataset name
    :return: dataset
    """

    client = bigquery.Client(project=project)
    dataset = client.dataset(
        dataset_name=dataset_name,
        project=project
    )

    return dataset


def run_query(project, query=None, query_file_name=None, params={}, use_legacy_sql=False, destination=None):
    """
    Running query on Google Cloud BQ
    the input should be either query of query file

    :param project: project_name
    :param query: query string
    :param query_file_name: query filename
    :param params: query parameters dictionary {'p1':'v1','p2':'v2',...}
    :param use_legacy_sql: True or False(default)
    :param destination: dataset_name.table_name
    """

    if not query and not query_file_name:
        raise Exception("Either query or query_file_name should be provided.")

    if query_file_name:
        with open(query_file_name, mode="rb") as query_file:
            query = query_file.read()

    query = query.format(**params)

    client = bigquery.Client(project=project)
    job = client.run_async_query(str(uuid.uuid4()), query)
    job.use_legacy_sql = use_legacy_sql
    job.allow_large_results = True

    if destination:
        dataset_name = destination.split('.')[0]
        table_name = destination.split('.')[1]
        dataset = get_dataset(project, dataset_name)
        table = dataset.table(name=table_name)
        if table.exists():
            table.delete()

        job.destination = table


    job.begin()
    while True:
        job.reload()  # Refreshes the state via a GET request.
        if job.state == 'DONE':
            if job.error_result:
                raise RuntimeError(job.errors)
            break
        time.sleep(1)

    results =



