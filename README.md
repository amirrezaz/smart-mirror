# Newsroom batch dashboard

Newsroom dashboard which shows batch subscription and registrations on big screen.

### Setup working environment
- Create virtual env
```
virtualenv env
source env/bin/activate
pip install -r requirements.txt
```
- Set the virtual environment python interpreter as a default interpreter of the project
- Set environment variable (or instead of export use your pycharm interface to setup env variables)
```
export PROFILE=/path/to/your/config/local.ini
export GCLOUD_PROJECT=tmg-plat-dev
```

### Running locally
Run gunicorn server 
```
gunicorn -b :8000 app:app
```

### Deployment

Build the docker image (the container registry is stored in tmg-datalake even if you are working with the dev environment
the source image will be in tmg-datalake)
```
docker build -t eu.gcr.io/tmg-datalake/newsroom-batch-dashboard:{version} .
gcloud docker -- push eu.gcr.io/tmg-datalake/newsroom-batch-dashboard:{version}
```

Point to the dev or prod cluster to deploy on dev or prod
```
gcloud container clusters get-credentials services-cluster --zone europe-west1-c --project [tmg-plat-dev or tmg-datalake]
```

Deploy on Kubernetes Engine
```
cd deployment
helm install --name=newsroom-batch-dashboard . --values=profiles/[dev.yaml or prod.yaml]
```

Upgrade Kubernetes Engine
```
cd deployment
helm upgrade newsroom-batch-dashboard . --values=profiles/[dev.yaml or prod.yaml]

```

Delete from Kubernetes Engine
```
cd deployment
helm del --purge newsroom-batch-dashboard
```

