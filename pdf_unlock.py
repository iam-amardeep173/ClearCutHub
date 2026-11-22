from flask import Blueprint, render_template, request, url_for, send_from_directory, jsonify
from werkzeug.utils import secure_filename
import pikepdf  # Used for unlocking PDF
import os

pdf_unlock_bp = Blueprint(
    'pdf_unlock',
    __name__,
    template_folder='templates',
    static_folder='static'
)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads_unlocked')
UNLOCKED_FOLDER = os.path.join(BASE_DIR, 'unlocked')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(UNLOCKED_FOLDER, exist_ok=True)

@pdf_unlock_bp.route('/', methods=['GET'])
def unlock_pdf_form():
    return render_template('pdf_unlock.html')

@pdf_unlock_bp.route('/unlock-pdf', methods=['POST'])
def unlock_pdf():
    uploaded_file = request.files.get('pdf_file')
    password = request.form.get('password')

    if not uploaded_file or not password:
        return jsonify({"error": "Please upload a file and provide the current password."}), 400

    filename = secure_filename(uploaded_file.filename)
    upload_path = os.path.join(UPLOAD_FOLDER, filename)
    uploaded_file.save(upload_path)

    unlocked_filename = f"unlocked_{filename}"
    unlocked_path = os.path.join(UNLOCKED_FOLDER, unlocked_filename)

    try:
        # Attempt to unlock PDF using the provided password
        with pikepdf.open(upload_path, password=password) as pdf:
            pdf.save(unlocked_path)  # Save without password

        download_url = url_for('pdf_unlock.download_unlocked', filename=unlocked_filename)
        return jsonify({"download_url": download_url}), 200

    except pikepdf._qpdf.PasswordError:
        return jsonify({"error": "Incorrect password. Could not unlock the PDF."}), 401
    except Exception as e:
        return jsonify({"error": f"Failed to unlock PDF: {str(e)}"}), 500

@pdf_unlock_bp.route('/download/<filename>', methods=['GET'])
def download_unlocked(filename):
    return send_from_directory(UNLOCKED_FOLDER, filename, as_attachment=True)
