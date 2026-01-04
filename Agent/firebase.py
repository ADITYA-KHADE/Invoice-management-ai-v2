import os

import firebase_admin
from firebase_admin import credentials, storage

cred = credentials.Certificate("serviceAccountKey.json")

# Bucket name must NOT include gs:// prefix. Example: "your-project-id.appspot.com"
storage_bucket = os.getenv("FIREBASE_STORAGE_BUCKET", "bitcode-dev.appspot.com")

# Initialize the Firebase app once and reuse the default app.
try:
    firebase_admin.get_app()
except ValueError:
    firebase_admin.initialize_app(cred, {
        "storageBucket": storage_bucket,
    })

bucket = storage.bucket()


def get_bucket():
    """Return the initialized Cloud Storage bucket."""
    return bucket
