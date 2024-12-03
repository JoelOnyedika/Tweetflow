import os
from flask import Flask, request, jsonify
import mimetypes
from b2sdk.v2 import InMemoryAccountInfo, B2Api
import uuid
from functools import lru_cache

class Upload:
    def __init__(self):
        self.B2_APPLICATION_KEY_ID = os.getenv('B2_APPLICATION_KEY_ID')
        self.B2_APPLICATION_KEY = os.getenv('B2_APPLICATION_KEY')
        self.B2_BUCKET_NAME = os.getenv('B2_BUCKET_NAME')
        self.count = 1

    @lru_cache(maxsize=1)
    def get_b2_api(self):
        """Create and return a cached B2Api instance"""
        info = InMemoryAccountInfo()
        print('gotten b2 api')
        return B2Api(info)

    def handle_backblaze_connection(self):
        """Initialize connection to Backblaze B2"""
        try:
            b2_api = self.get_b2_api()
            b2_api.authorize_account('production', self.B2_APPLICATION_KEY_ID, self.B2_APPLICATION_KEY)
            bucket = b2_api.get_bucket_by_name(self.B2_BUCKET_NAME)
            print('returning bucket')
            return bucket
        except Exception as e:
            return jsonify({
                "": {
                    "message": "Could not connect to storage service",
                    "details": str(e)
                }
            }, status=500)

    def upload_media(self, user_id: str, local_file_path: str, title: str):
        try:
            bucket = self.handle_backblaze_connection()
        except Exception as e:
            print("Error:", e)
            return jsonify({"error": {"message": "Unable to connect to storage."}}), 500

        base_path = f'videos/{user_id}'
        file_name = f'{title}.mp4'
        b2_destination_path = f'{base_path}/{file_name}'

        try:
            files = bucket.ls(base_path, recursive=True)
            while any(file[0].file_name == b2_destination_path for file in files):
                b2_destination_path = f"{base_path}/{title} ({self.count}).mp4"
                self.count += 1

            if not os.path.isfile(local_file_path):
                print('file does not exist on this system')
                return jsonify({"error": {"message": "File does not exist on the server."}}), 400

            print('Uploading file...')
            uploaded_file = bucket.upload_local_file(local_file=local_file_path, file_name=b2_destination_path)

            file_url = f'https://f005.backblazeb2.com/file/{self.B2_BUCKET_NAME}/{b2_destination_path}'
            print(file_url)
            return file_url
        except Exception as e:
            print(e)
            return jsonify({'error': {'message': "Something went wrong while uploading the file."}}), 500

            