import os
import tempfile
import zipfile
import subprocess
import shutil
import threading
from flask import Blueprint, request, send_file, jsonify, render_template
from werkzeug.utils import secure_filename

convert_cdr_bp = Blueprint('convert_cdr', __name__)

ALLOWED_EXTENSIONS = {'cdr'}
OUTPUT_FORMATS = {'pdf', 'png', 'jpg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@convert_cdr_bp.route('/convert-cdr', methods=['GET'])
def convert_cdr_form():
    return render_template('convert_cdr.html')

@convert_cdr_bp.route('/convert-cdr', methods=['POST'])
def convert_cdr():
    if 'files' not in request.files:
        return jsonify({'error': 'No files part in the request'}), 400

    convert_format = request.form.get('convertFormat')
    if convert_format not in OUTPUT_FORMATS:
        return jsonify({'error': 'Invalid conversion format'}), 400

    files = request.files.getlist('files')
    if not files or not all(allowed_file(f.filename) for f in files):
        return jsonify({'error': 'Only .cdr files are allowed'}), 400

    temp_dir = tempfile.mkdtemp()
    output_files = []

    try:
        for uploaded_file in files:
            filename = secure_filename(uploaded_file.filename)
            input_path = os.path.join(temp_dir, filename)
            uploaded_file.save(input_path)

            base_name = os.path.splitext(filename)[0]
            output_path = os.path.join(temp_dir, f"{base_name}.{convert_format}")

            libreoffice_path = r"C:\Program Files\LibreOffice\program\soffice.exe"

            subprocess.run([
                libreoffice_path,
                "--headless",
                "--convert-to", convert_format,
                "--outdir", temp_dir,
                input_path
            ], check=True)

            if not os.path.exists(output_path):
                return jsonify({'error': f"Conversion output not found for {filename}"}), 500

            output_files.append(output_path)

        # Choose what to send
        if len(output_files) == 1:
            file_path = output_files[0]
            response = send_file(file_path, as_attachment=True, conditional=True)

        else:
            zip_path = os.path.join(temp_dir, "converted_files.zip")
            with zipfile.ZipFile(zip_path, 'w') as zipf:
                for f in output_files:
                    zipf.write(f, arcname=os.path.basename(f))
            output_files.append(zip_path)
            file_path = zip_path
            response = send_file(zip_path, as_attachment=True, download_name="converted_files.zip", conditional=True)

        # Schedule cleanup 5 seconds later (after file is sent)
        def delayed_cleanup():
            try:
                for f in output_files:
                    if os.path.exists(f):
                        os.remove(f)
                if os.path.exists(temp_dir):
                    shutil.rmtree(temp_dir)
                print(f"[CLEANUP] Deleted: {temp_dir}")
            except Exception as e:
                print(f"[CLEANUP ERROR] {e}")

        threading.Timer(5, delayed_cleanup).start()
        return response

    except subprocess.CalledProcessError as e:
        return jsonify({'error': f"LibreOffice conversion error: {str(e)}"}), 500

    except Exception as e:
        return jsonify({'error': 'Unexpected server error occurred.'}), 500
