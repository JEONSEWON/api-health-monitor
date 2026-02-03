#!/bin/bash

# Run Celery worker and beat (scheduler)

# Celery worker
celery -A app.celery_app worker --loglevel=info --concurrency=4 &

# Celery beat (scheduler)
celery -A app.celery_app beat --loglevel=info &

# Wait for both processes
wait
