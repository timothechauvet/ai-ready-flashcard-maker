FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY decks/ /app/decks/
COPY main.py .

RUN mkdir -p /data

ENV YASSSF_DB_PATH=/data/yasssf.db

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
