import os
import shutil
from flask import Blueprint, request, jsonify, current_app, render_template, url_for
from werkzeug.utils import secure_filename
from pdf2docx import Converter
from threading import Thread
import time

# Blueprint setup
pdf_to_word_bp = Blueprint('pdf_to_word', __name__)

MAX_FILE_SIZE_MB = 10  # Max allowed file size

def allowed_file(filename):
    return filename.lower().endswith('.pdf')

def delete_file_later(file_path, delay=300):
    """Delete a file after a delay."""
    time.sleep(delay)
    if os.path.exists(file_path):
        os.remove(file_path)

@pdf_to_word_bp.route('/pdf-to-word')
def pdf_to_word_page():
    return render_template('pdf_to_word.html')

@pdf_to_word_bp.route('/convert-pdf-to-word', methods=['POST'])
def convert_pdf_to_word():
    if 'pdf_file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['pdf_file']
    filename = secure_filename(file.filename)

    if not allowed_file(filename):
        return jsonify({'error': 'Invalid file type. Only PDF is allowed.'}), 400

    file.seek(0, os.SEEK_END)
    if file.tell() > MAX_FILE_SIZE_MB * 1024 * 1024:
        return jsonify({'error': f'Max file size is {MAX_FILE_SIZE_MB}MB'}), 413
    file.seek(0)

    upload_folder = current_app.config['UPLOAD_FOLDER']
    output_folder = current_app.config['OUTPUT_FOLDER']
    static_output_folder = os.path.join(current_app.static_folder, 'outputs')

    os.makedirs(upload_folder, exist_ok=True)
    os.makedirs(output_folder, exist_ok=True)
    os.makedirs(static_output_folder, exist_ok=True)

    input_path = os.path.join(upload_folder, filename)
    file.save(input_path)

    # Convert file name
    output_filename = os.path.splitext(filename)[0] + '.docx'
    output_path = os.path.join(output_folder, output_filename)

    try:
        # Convert PDF to Word
        cv = Converter(input_path)
        cv.convert(output_path, start=0, end=None)
        cv.close()

        if not os.path.exists(output_path):
            return jsonify({'error': 'Conversion failed. Output file missing.'}), 500

        # Move to static folder to make it downloadable
        final_path = os.path.join(static_output_folder, output_filename)
        shutil.move(output_path, final_path)

        # Generate downloadable URL
        output_url = url_for('static', filename=f'outputs/{output_filename}', _external=True)

        # Schedule deletion
        Thread(target=delete_file_later, args=(input_path,)).start()
        Thread(target=delete_file_later, args=(final_path,)).start()

        return jsonify({'download_link': output_url})

    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500
