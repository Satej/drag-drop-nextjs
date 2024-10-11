#!/bin/sh
./wait-for-it.sh db:5432
alembic upgrade head
uvicorn main:app --host 0.0.0.0 --port 8000 --reload