#!/bin/sh
./wait-for-it.sh
alembic upgrade head && uvicorn main:app --host 0.0.0.0
