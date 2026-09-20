FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (separate layer so this step is cached and
# skipped on rebuilds unless requirements.txt itself changes).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Then the actual application code.
COPY . .

# Cloud Run sets PORT itself (always 8080) and ignores EXPOSE, but this
# documents intent and matches local `docker run -p 8080:8080` usage.
EXPOSE 8080

CMD ["python", "main.py"]
