import os
from flask import Blueprint, render_template, request, url_for, send_from_directory, jsonify
from werkzeug.utils import secure_filename
import pikepdf  # Import pikepdf for password protection

pdf_protect_bp = Blueprint(
    'pdf_protect',
    __name__,
    template_folder='templates',
    static_folder='static'
)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads_protected')
PROTECTED_FOLDER = os.path.join(BASE_DIR, 'protected')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROTECTED_FOLDER, exist_ok=True)


@pdf_protect_bp.route('/', methods=['GET'])
def protect_pdf_form():
    return render_template('pdf_protect.html')


@pdf_protect_bp.route('/protect-pdf', methods=['POST'])
def protect_pdf():
    uploaded_file = request.files.get('pdf_file')
    password = request.form.get('password')

    if not uploaded_file or not password:
        return jsonify({"error": "Please upload a file and provide a password."}), 400

    filename = secure_filename(uploaded_file.filename)
    upload_path = os.path.join(UPLOAD_FOLDER, filename)
    uploaded_file.save(upload_path)

    protected_filename = f"protected_{filename}"
    protected_path = os.path.join(PROTECTED_FOLDER, protected_filename)

    try:
        # 🔐 Apply password protection using pikepdf
        with pikepdf.open(upload_path) as pdf:
            pdf.save(
                protected_path,
                encryption=pikepdf.Encryption(
                    user=password,
                    owner=password,
                    R=4  # 128-bit AES encryption
                )
            )

        download_url = url_for('pdf_protect.download_protected', filename=protected_filename)
        return jsonify({"download_url": download_url}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to protect PDF: {str(e)}"}), 500


@pdf_protect_bp.route('/download/<filename>', methods=['GET'])
def download_protected(filename):
    return send_from_directory(PROTECTED_FOLDER, filename, as_attachment=True)
