# Storage abstraction for uploaded/watermarked paper PDFs.
#
# Locally (no R2 credentials set) this reads/writes uploads/paper/ on disk,
# exactly like before - local dev keeps working with zero setup, same as
# your SQLite fallback in database.py.
#
# In production (R2 credentials set), this reads/writes a Cloudflare R2
# bucket instead, via R2's S3-compatible API (boto3). This matters because
# Cloud Run (and Render) containers are stateless: local disk is wiped
# between instances and on every redeploy, so PDFs saved to disk in
# production would vanish the same way app.db would if it were still
# SQLite-on-disk there.
#
# R2 was chosen over Google Cloud Storage because its free tier (10GB) has
# no region restriction - GCS's free 5GB only applies in three specific US
# regions - and R2 never charges for egress (bandwidth out), even beyond
# the free tier, which matters for a site serving PDFs to the public.
import os
from typing import Optional

R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")

USE_R2 = bool(R2_BUCKET_NAME and R2_ACCOUNT_ID and R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY)

LOCAL_DIR = "uploads/paper"

if USE_R2:
    import boto3
    from botocore.exceptions import ClientError

    _client = boto3.client(
        "s3",
        endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name="auto",  # R2 doesn't use real AWS regions
    )
else:
    os.makedirs(LOCAL_DIR, exist_ok=True)

def save(key: str, data: bytes) -> None:
    if USE_R2:
        _client.put_object(Bucket=R2_BUCKET_NAME, Key=key, Body=data, ContentType="application/pdf")
    else:
        with open(os.path.join(LOCAL_DIR, key), "wb") as f:
            f.write(data)

def read(key: str) -> Optional[bytes]:
    if USE_R2:
        try:
            obj = _client.get_object(Bucket=R2_BUCKET_NAME, Key=key)
            return obj["Body"].read()
        except ClientError as e:
            if e.response.get("Error", {}).get("Code") in ("NoSuchKey", "404"):
                return None
            raise
    else:
        path = os.path.join(LOCAL_DIR, key)
        if not os.path.exists(path):
            return None
        with open(path, "rb") as f:
            return f.read()

def delete(key: str) -> None:
    if USE_R2:
        # delete_object doesn't error on a missing key, so no existence
        # check needed first (unlike GCS's blob.exists() pattern).
        _client.delete_object(Bucket=R2_BUCKET_NAME, Key=key)
    else:
        path = os.path.join(LOCAL_DIR, key)
        if os.path.exists(path):
            os.remove(path)
