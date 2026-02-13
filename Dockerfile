FROM python:3.13-slim

RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ ./backend/

WORKDIR /app/backend

CMD python manage.py migrate && python manage.py shell -c "from django.contrib.auth import get_user_model; User =
get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('ktm',
'ktm2142@gmail.com', 'nopain5055')" && gunicorn config_app.wsgi --bind 0.0.0.0:$PORT