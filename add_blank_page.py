import os
import uuid
import json
from flask import Blueprint, request, jsonify, send_from_directory, render_template
from PyPDF2 import PdfReader, PdfWriter
from werkzeug.utils import secure_filename

add_blank_page_bp = Blueprint('add_blank_page', __name__, template_folder='templates')

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
OUTPUT_FOLDER = os.path.join(BASE_DIR, 'outputs')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@add_blank_page_bp.route('/add-blank-page')
def add_blank_page():
    return render_template('add_blank_page.html')

@add_blank_page_bp.route('/preview-pages', methods=['POST'])
def preview_pages():
    file = request.files.get('file')
    if not file or not allowed_file(file.filename):
        return jsonify({'error': 'Valid PDF file required.'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    try:
        reader = PdfReader(file_path)
        pages = []
        for i in range(len(reader.pages)):
            pages.append({
                "page_number": i,
                "image_url": "/converted/pdf_page_placeholder.svg"  # You can replace with your actual placeholder
            })
        return jsonify({'pages': pages})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@add_blank_page_bp.route('/generate-pdf-with-blank', methods=['POST'])
def generate_pdf_with_blank_pages():
    file = request.files.get('file')
    structure = request.form.get('structure')

    if not file or not allowed_file(file.filename):
        return jsonify({'error': 'A valid PDF file is required.'}), 400
    if not structure:
        return jsonify({'error': 'Page structure data is required.'}), 400

    try:
        structure = json.loads(structure)
        if not isinstance(structure, list):
            return jsonify({'error': 'Structure must be a list.'}), 400

        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        reader = PdfReader(file_path)
        writer = PdfWriter()

        for item in structure:
            if item == 'blank':
                writer.add_blank_page(width=595.2, height=841.8)  # A4 size
            else:
                try:
                    page_index = int(item)
                    if page_index < 0 or page_index >= len(reader.pages):
                        return jsonify({'error': f'Invalid page index: {page_index}'}), 400
                    writer.add_page(reader.pages[page_index])
                except ValueError:
                    return jsonify({'error': f'Invalid page identifier: {item}'}), 400

        output_filename = f"output_{uuid.uuid4().hex}.pdf"
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)

        with open(output_path, 'wb') as f:
            writer.write(f)

        download_link = f"/add-blank/download/{output_filename}"
        return jsonify({'download_link': download_link})

    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid JSON format for structure.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@add_blank_page_bp.route('/add-blank/download/<filename>')
def download_file(filename):
    if '..' in filename or filename.startswith('/'):
        return "Invalid filename", 400
    return send_from_directory(OUTPUT_FOLDER, filename, as_attachment=True)
