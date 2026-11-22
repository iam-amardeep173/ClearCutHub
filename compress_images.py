import os
import uuid
import cv2
import numpy as np
from io import BytesIO
from flask import Blueprint, request, jsonify, send_file, render_template, current_app
from werkzeug.utils import secure_filename
from PIL import Image

# Blueprint initialization
image_process_blueprint = Blueprint('image_process', __name__)

# Allowed extensions for images
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

# Define the allowed file types check
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Route to render the HTML page
@image_process_blueprint.route('/compress-image/', methods=['GET'])
def compress_image_page():
    return render_template("compress_images.html")

# Route to handle the compression request
@image_process_blueprint.route('/compress-image/', methods=['POST'])
def compress_image():
    COMPRESSED_FOLDER = os.path.join(current_app.root_path, 'static', 'compressed')

    if not os.path.exists(COMPRESSED_FOLDER):
        os.makedirs(COMPRESSED_FOLDER)

    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if image_file and allowed_file(image_file.filename):
        filename = secure_filename(image_file.filename)
        ext = filename.rsplit('.', 1)[1].lower()
        unique_name = f"{uuid.uuid4().hex}.jpg"
        output_path = os.path.join(COMPRESSED_FOLDER, unique_name)

        try:
            image_bytes = image_file.read()

            option = request.form.get("option")
            if option == "compress_quality":
                quality_option = request.form.get("compression_quality", "medium")
                quality_map = {"low": 30, "medium": 50, "high": 70}
                quality = quality_map.get(quality_option, 50)

                img = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
                encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
                _, compressed_image = cv2.imencode('.jpg', img, encode_param)

                with open(output_path, "wb") as out_file:
                    out_file.write(compressed_image)

            elif option == "target_size":
                target_kb = float(request.form.get("target_size_kb", 500))
                if target_kb <= 0:
                    return jsonify({'error': 'Invalid target size value'}), 400

                compressed_image_io, final_size_kb = compress_to_target(BytesIO(image_bytes), target_kb)

                with open(output_path, "wb") as out_file:
                    out_file.write(compressed_image_io.read())
            else:
                return jsonify({'error': 'Invalid compression option selected'}), 400

            size_kb = os.path.getsize(output_path) / 1024

            return jsonify({
                'download_link': f"/static/compressed/{unique_name}",
                'size_kb': round(size_kb, 2)
            })

        except Exception as e:
            return jsonify({'error': f'Compression failed: {str(e)}'}), 500

    return jsonify({'error': 'Unsupported file type'}), 400


# ✅ Updated compress_to_target using in-memory method
def compress_to_target(image_stream, target_kb, max_quality=95, step=5):
    img = Image.open(image_stream).convert("RGB")

    quality = max_quality
    min_quality = 10

    while quality >= min_quality:
        buffer = BytesIO()
        img.save(buffer, format="JPEG", quality=quality, optimize=True)
        size_kb = buffer.tell() / 1024

        if size_kb <= target_kb:
            break

        quality -= step

    buffer.seek(0)
    return buffer, size_kb
