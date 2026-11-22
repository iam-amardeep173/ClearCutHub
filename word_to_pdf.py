import os
import subprocess
import shutil
import threading
from flask import Blueprint, render_template, request, jsonify, url_for, current_app, send_from_directory
from werkzeug.utils import secure_filename

word_to_pdf_bp = Blueprint('word_to_pdf_bp', __name__)


@word_to_pdf_bp.route('/word-to-pdf')
def word_to_pdf_page():
    return render_template('word_to_pdf.html')


@word_to_pdf_bp.route('/convert-word-to-pdf', methods=['POST'])
def convert_word_to_pdf():
    if 'word_file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['word_file']
    filename = secure_filename(file.filename)

    if not filename.lower().endswith(('.doc', '.docx')):
        return jsonify({'error': 'Please upload a .doc or .docx file'}), 400

    input_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    output_folder = current_app.config['OUTPUT_FOLDER']
    file.save(input_path)

    libreoffice_path = os.environ.get('LIBREOFFICE_PATH', 'soffice')
    if not shutil.which(libreoffice_path):
        return jsonify({'error': 'LibreOffice not found or LIBREOFFICE_PATH is incorrect.'}), 500

    try:
        subprocess.run([
            libreoffice_path,
            '--headless',
            '--convert-to', 'pdf',
            '--outdir', output_folder,
            input_path
        ], check=True)

        output_pdf = os.path.splitext(filename)[0] + '.pdf'
        output_path = os.path.join(output_folder, output_pdf)

        if not os.path.exists(output_path):
            return jsonify({'error': 'Conversion failed. Output file not found.'}), 500

        # Schedule auto-delete after 5 minutes
        threading.Timer(300, safe_delete_file, args=[output_path]).start()

        download_url = url_for('word_to_pdf_bp.serve_converted_pdf', filename=output_pdf, _external=True)
        return jsonify({'download_link': download_url})

    except subprocess.CalledProcessError as e:
        return jsonify({'error': f'LibreOffice conversion failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500


@word_to_pdf_bp.route('/download-word-pdf/<filename>')
def serve_converted_pdf(filename):
    return send_from_directory(current_app.config['OUTPUT_FOLDER'], filename, as_attachment=True)


def safe_delete_file(filepath):
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"[INFO] Deleted file: {filepath}")
    except Exception as e:
        print(f"[ERROR] Failed to delete file {filepath}: {e}")
