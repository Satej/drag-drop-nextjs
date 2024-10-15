FROM python:3.9-alpine
WORKDIR /app
COPY ./requirements.txt ./wait-for-it.sh ./entrypoint.sh ./
RUN chmod +x wait-for-it.sh entrypoint.sh
RUN apk add bash
RUN pip install --no-cache-dir -r requirements.txt
COPY ./ ./
EXPOSE 8000
CMD alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000 --reload
