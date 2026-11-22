import os
import tempfile
import platform
import subprocess
import threading
import time

from flask import Blueprint, render_template, request, send_file, jsonify, current_app, after_this_request
from werkzeug.utils import secure_filename
from pdf2image import convert_from_path, exceptions as pdf2image_exceptions
from pptx import Presentation
from pptx.util import Inches, Pt
import PyPDF2

pdf_ppt_convert_app = Blueprint('pdf_ppt_convert', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'ppt', 'pptx'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@pdf_ppt_convert_app.route('/')
def pdf_ppt_page():
    return render_template('pdf_ppt_convert.html')


def extract_text_from_pdf(pdf_path):
    """Extract text from PDF using PyPDF2."""
    text = ""
    with open(pdf_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def convert_pdf_to_ppt(pdf_path, ppt_path):
    # Set poppler path if on Windows
    poppler_path = r"C:\poppler-24.08.0\Library\bin" if platform.system() == "Windows" else None

    try:
        images = convert_from_path(pdf_path, poppler_path=poppler_path)
    except Exception as e:
        raise RuntimeError(f"Error converting PDF to images: {e}")

    text = extract_text_from_pdf(pdf_path)
    prs = Presentation()
    prs.slide_width = Inches(11.69)
    prs.slide_height = Inches(8.27)

    for img in images:
        slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank slide
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
            tmp_path = tmp.name
            img.save(tmp_path, 'PNG')

        slide.shapes.add_picture(tmp_path, Inches(0), Inches(0),
                                 width=prs.slide_width, height=prs.slide_height)

        # Optional: Add extracted text as an editable textbox
        if text:
            textbox = slide.shapes.add_textbox(Inches(0.5), Inches(0.5), Inches(10), Inches(7))
            text_frame = textbox.text_frame
            text_frame.text = text
            for paragraph in text_frame.paragraphs:
                for run in paragraph.runs:
                    run.font.size = Pt(12)

        os.unlink(tmp_path)

    prs.save(ppt_path)


@pdf_ppt_convert_app.route('/convert', methods=['POST'])
def convert_pdf_ppt():
    file = request.files.get('file')
    convert_type = request.form.get("convertType", "").replace("_", "-")

    if convert_type not in ["pdf-to-ppt", "ppt-to-pdf"]:
        return jsonify({"error": "Invalid conversion type. Valid types are pdf-to-ppt and ppt-to-pdf"}), 400

    if not file or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid or no file provided. Only PDF, PPT, and PPTX are allowed.'}), 400

    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)

    filename = secure_filename(file.filename)
    input_path = os.path.join(upload_folder, filename)
    output_path = None

    try:
        file.save(input_path)

        if convert_type == 'pdf-to-ppt':
            output_path = os.path.splitext(input_path)[0] + '.pptx'
            convert_pdf_to_ppt(input_path, output_path)

        elif convert_type == 'ppt-to-pdf':
            output_path = os.path.splitext(input_path)[0] + '.pdf'
            libreoffice_path = r'C:\Program Files\LibreOffice\program\soffice.exe' if platform.system() == "Windows" else 'libreoffice'

            result = subprocess.run([
                libreoffice_path, '--headless', '--convert-to', 'pdf',
                '--outdir', upload_folder, input_path
            ], capture_output=True, text=True)

            if result.returncode != 0:
                print("LibreOffice stderr:", result.stderr)
                raise subprocess.CalledProcessError(result.returncode, result.args, output=result.stdout, stderr=result.stderr)

        if not os.path.exists(output_path):
            return jsonify({'error': 'Conversion failed. No output file generated.'}), 500

        # Schedule delayed deletion of files to avoid WinError 32
        @after_this_request
        def remove_file(response):
            def delayed_delete(paths):
                time.sleep(5)  # Give enough time for response to complete
                for path in paths:
                    try:
                        if os.path.exists(path):
                            os.remove(path)
                            print(f"Deleted: {path}")
                    except Exception as e:
                        print(f"Error removing file {path}: {str(e)}")

            threading.Thread(target=delayed_delete, args=([input_path, output_path],)).start()
            return response

        return send_file(output_path, as_attachment=True)

    except subprocess.CalledProcessError as e:
        return jsonify({'error': f'Conversion failed: {e.stderr}'}), 500
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500
