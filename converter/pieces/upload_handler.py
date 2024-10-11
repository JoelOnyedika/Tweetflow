import os
from flask import Flask, request, jsonify
import mimetypes
from b2sdk.v2 import InMemoryAccountInfo, B2Api
import uuid

B2_APPLICATION_KEY_ID = os.getenv('B2_APPLICATION_KEY_ID')
B2_APPLICATION_KEY = os.getenv('B2_APPLICATION_KEY')
B2_BUCKET_NAME = os.getenv('B2_BUCKET_NAME')

info = InMemoryAccountInfo()
b2_api = B2Api(info)



def upload_media(type: str, user_id: str, template_id: str, file: any):
    try:
        # Authorize account using application key ID and key
        b2_api.authorize_account('production', B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY)
        print("Successfully authorized Backblaze B2 account!")
        
        # Get the bucket by name and print its details
        bucket = b2_api.get_bucket_by_name(B2_BUCKET_NAME)
        print(f"Bucket found: {bucket.name}")

    except Exception as e:
        print("Error:", e)
        return jsonify({ "error": {"message": "Unable to connect to storage."} })

    randomUUID = uuid.uuid4()
    file_path = f'{type}s/{user_id}/{template_id}/{randomUUID}'

    if type not in ['image', 'video']:
        return jsonify({'error': {'message': 'Invalid type'}}), 400

    try:
        # Upload the file to Backblaze
        uploaded_file = bucket.upload_bytes(file.read(), file_path)

        # Get the file URL
        file_url = b2_api.get_download_url_for_fileId(uploaded_file.id_)
        return jsonify({"data": file_url}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': {'message': "Something went wrong while uploading file"}}), 500
