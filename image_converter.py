from flask import Blueprint, request, render_template, jsonify, url_for, current_app, send_from_directory
from werkzeug.utils import secure_filename
from PIL import Image
import os
import uuid

image_converter_bp = Blueprint('image_converter', __name__, template_folder='templates')

@image_converter_bp.route("/image-convert", methods=["GET"])
def jpg_to_png_page():
    return render_template("image_convert.html")

@image_converter_bp.route("/image-convert", methods=["POST"])
def image_convert():
    try:
        files = request.files.getlist("images")
        conversion_type = request.form.get("conversion_type")

        conversion_map = {
            'jpg_to_png': 'png',
            'png_to_jpg': 'jpg'
        }

        target_ext = conversion_map.get(conversion_type)
        if not target_ext:
            return jsonify({'error': 'Invalid conversion type'}), 400

        output_files = []

        upload_folder = current_app.config.get("UPLOAD_FOLDER")
        converted_folder = current_app.config.get("CONVERTED_FOLDER")

        if not upload_folder or not converted_folder:
            return jsonify({'error': 'Server configuration error: folders not set'}), 500

        for file in files:
            if file.filename == '':
                continue  # skip empty filenames
            filename = secure_filename(file.filename)
            input_path = os.path.join(upload_folder, filename)
            file.save(input_path)

            img = Image.open(input_path).convert("RGB")
            converted_filename = f"{uuid.uuid4()}.{target_ext}"
            output_path = os.path.join(converted_folder, converted_filename)

            format_ext = "JPEG" if target_ext == "jpg" else "PNG"
            img.save(output_path, format=format_ext)

            output_files.append(
                url_for('image_converter.download_file', filename=converted_filename, _external=True)
            )

        if not output_files:
            return jsonify({'error': 'No valid image files uploaded'}), 400

        return jsonify({'files': output_files})

    except Exception as e:
        return jsonify({'error': f'Image conversion error: {str(e)}'}), 500


@image_converter_bp.route('/download/<filename>')
def download_file(filename):
    try:
        converted_folder = current_app.config.get("CONVERTED_FOLDER")
        if not converted_folder:
            return jsonify({'error': 'Converted folder not set in configuration'}), 500

        # Ensure the file exists in the directory
        file_path = os.path.join(converted_folder, filename)
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404

        return send_from_directory(converted_folder, filename)

    except Exception as e:
        return jsonify({'error': f'Error while downloading the file: {str(e)}'}), 500
