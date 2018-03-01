FROM python:2.7

# Loading application
COPY . /newsroom-batch-dashboard


# Installing application
WORKDIR /newsroom-batch-dashboard
RUN pip install --upgrade pip setuptools six
RUN pip install -r requirements.txt
