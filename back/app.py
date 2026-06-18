import os
import boto3
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
import uuid
import io

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = Flask(__name__)
CORS(app)  

# Configurar S3
s3_client = boto3.client(
    's3',
    endpoint_url=os.getenv('S3_ENDPOINT', 'http://localhost:4566'),
    aws_access_key_id='test',  
    aws_secret_access_key='test',
    region_name=os.getenv('AWS_REGION', 'us-east-1')
)

BUCKET_NAME = os.getenv('S3_BUCKET', 'clondrive-files')

@app.route('/api/files/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Crear un nombre único para el archivo en S3
    s3_key = f"{uuid.uuid4()}-{file.filename}"
    
    try:
        # Subir el archivo directamente a LocalStack S3
        s3_client.upload_fileobj(
            file,
            BUCKET_NAME,
            s3_key,
            ExtraArgs={'ContentType': file.content_type}
        )
        return jsonify({
            'message': 'File uploaded successfully',
            'original_name': file.filename,
            's3_key': s3_key
        }), 201
    except Exception as e:
        print(f"Error uploading: {e}")
        return jsonify({'error': 'Failed to upload file'}), 500

@app.route('/api/files', methods=['GET'])
def list_files():
    try:
        response = s3_client.list_objects_v2(Bucket=BUCKET_NAME)
        
        if 'Contents' not in response:
            return jsonify([])  # Bucket vacío
            
        files = response['Contents']
        
        # Ordenar archivos por fecha de modificación y tomar ultimos 3
        files.sort(key=lambda x: x['LastModified'], reverse=True)
        top_3_files = files[:3]
        
        result = []
        for f in top_3_files:
            # Extraemos el nombre original
            s3_key = f['Key']
            original_name = s3_key[37:] if len(s3_key) > 37 else s3_key
            
            result.append({
                's3_key': s3_key,
                'original_name': original_name,
                'size': f['Size'],
                'last_modified': f['LastModified'].isoformat()
            })
            
        return jsonify(result)
    except Exception as e:
        print(f"Error listing files: {e}")
        return jsonify({'error': 'Failed to list files'}), 500

@app.route('/api/files/download/<path:s3_key>', methods=['GET'])
def download_file(s3_key):
    try:
        # Descargar el archivo desde LocalStack
        file_obj = io.BytesIO()
        s3_client.download_fileobj(BUCKET_NAME, s3_key, file_obj)
        file_obj.seek(0)
        
        original_name = s3_key[37:] if len(s3_key) > 37 else s3_key
        
        return send_file(
            file_obj,
            as_attachment=True,
            download_name=original_name
        )
    except Exception as e:
        print(f"Error downloading: {e}")
        return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3001))
    print(f"Starting server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
