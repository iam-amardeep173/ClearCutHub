from flask import (
    Flask, Blueprint, render_template, request, jsonify,
    url_for, session, send_from_directory
)
import os
import uuid
import fitz  # PyMuPDF
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader, PdfWriter

# Blueprint setup
split_pdf_bp = Blueprint('split_pdf', __name__, template_folder='templates')

# Base directory (absolute)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Uploads and static output directories
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
OUTPUT_FOLDER = os.path.join(BASE_DIR, 'static', 'outputs')  # Moved to static

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@split_pdf_bp.route('/split-pdf')
def split_pdf_page():
    return render_template('split_pdf.html')

@split_pdf_bp.route('/preview-pages', methods=['POST'])
def preview_pages():
    file = request.files.get('file')
    if not file or not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Please upload a valid PDF file'}), 400

    filename = secure_filename(file.filename)
    input_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(input_path)

    doc = fitz.open(input_path)
    preview_images = []

    for page_number in range(len(doc)):
        page = doc.load_page(page_number)
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        image_filename = f"{uuid.uuid4().hex}_page_{page_number}.png"
        image_path = os.path.join(OUTPUT_FOLDER, image_filename)
        pix.save(image_path)

        preview_images.append({
            'page_number': page_number + 1,
            'image_url': url_for('static', filename=f'outputs/{image_filename}')
        })

    session['current_pdf'] = filename
    return jsonify({'pages': preview_images})

@split_pdf_bp.route('/delete-pages', methods=['POST'])
def delete_pages():
    data = request.get_json()
    pages_to_delete = data.get('pages', [])
    original_filename = session.get('current_pdf')

    if not original_filename:
        return jsonify({'error': 'No PDF session found'}), 400

    input_path = os.path.join(UPLOAD_FOLDER, original_filename)
    output_filename = f'split_{uuid.uuid4().hex}.pdf'
    output_path = os.path.join(OUTPUT_FOLDER, output_filename)

    try:
        reader = PdfReader(input_path)
        writer = PdfWriter()

        for i in range(len(reader.pages)):
            if i not in pages_to_delete:  # Pages are 0-indexed now
                writer.add_page(reader.pages[i])

        with open(output_path, 'wb') as f:
            writer.write(f)

        return jsonify({
            'download_link': url_for('static', filename=f'outputs/{output_filename}', _external=True)
        })

    except Exception as e:
        return jsonify({'error': f'Error while deleting pages: {str(e)}'}), 500
