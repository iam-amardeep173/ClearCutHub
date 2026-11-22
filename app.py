from flask import Flask, redirect, url_for, session, render_template, request, send_file, jsonify
import os
import uuid
from flask import Flask
import shutil  # to check if soffice exists
from PIL import Image, ImageColor
from rembg import remove
from io import BytesIO
import subprocess
import PyPDF2
import pikepdf
import fitz  # PyMuPDF for PDF resizing (not used here yet)
from reportlab.pdfgen import canvas
from werkzeug.utils import secure_filename  # << important!
from docx import Document
from docx2pdf import convert
import platform
import io
from flask import request, url_for
from PyPDF2 import PdfMerger
from PyPDF2 import PdfReader, PdfWriter
import traceback
import chardet
import zipfile
import pandas as pd
from pdf2docx import Converter
from pdf_ppt_convert import pdf_ppt_convert_app  # ✅ correct if in same folder
import pdf2pptx
from pdf_protect import pdf_protect_bp
from pdf_unlock import pdf_unlock_bp  # Import the Blueprint
from text_formatter import text_formatter
from convert_cdr import convert_cdr_bp
from compress_images import image_process_blueprint
from convert_webp import convert_webp_bp  # Correct import
# from signup import signup_bp
# from login import login_bp
from image_converter import image_converter_bp
from Compress_pdf import pdf_compressor_bp  # Case-sensitive!
import sqlite3
from merge_pdf import merge_pdf  # Import the Blueprint
from split_pdf import split_pdf_bp
from jpg_to_pdf import jpg_to_pdf_bp  # Import the Blueprint
from merge_csv_excel import merge_bp
from pdf_to_word import pdf_to_word_bp
from word_to_pdf import word_to_pdf_bp
from apscheduler.schedulers.background import BackgroundScheduler
from add_blank_page import add_blank_page_bp
# from apscheduler.schedulers.background import BackgroundScheduler
# from clean_blueprint import clean_bp, clean_old_files
# import atexit
from werkzeug.exceptions import RequestEntityTooLarge
# import requests

# ------------------ App Config ------------------

# Initialize Flask app
app = Flask(__name__)
app.secret_key = 'your_secret_key'

# ------------------ App Configuration ------------------

# Absolute paths
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
OUTPUT_FOLDER = os.path.join(BASE_DIR, 'outputs')
CONVERTED_FOLDER = os.path.join(BASE_DIR, 'converted')
COMPRESSED_FOLDER = os.path.join(BASE_DIR, 'static', 'compressed')

# Folder config
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['CONVERTED_FOLDER'] = CONVERTED_FOLDER
app.config['COMPRESSED_FOLDER'] = COMPRESSED_FOLDER

# File size limits
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB

# LibreOffice path (used in some converters)
os.environ['LIBREOFFICE_PATH'] = r'C:\Program Files\LibreOffice\program\soffice.exe'

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(CONVERTED_FOLDER, exist_ok=True)
os.makedirs(COMPRESSED_FOLDER, exist_ok=True)

# ------------------ Error Handling ------------------

@app.errorhandler(RequestEntityTooLarge)
def handle_large_file(error):
    return jsonify({"error": "File too large. Max allowed size is 10MB."}), 413


# app.register_blueprint(text_summarizer)
app.register_blueprint(pdf_ppt_convert_app, url_prefix='/pdf-ppt-converter')
app.register_blueprint(image_process_blueprint)
app.register_blueprint(convert_cdr_bp)
app.register_blueprint(convert_webp_bp)  # Ensure this line exists
# app.register_blueprint(signup_bp)
# app.register_blueprint(login_bp)
app.register_blueprint(image_converter_bp)
app.register_blueprint(pdf_compressor_bp)
app.register_blueprint(merge_pdf)
app.register_blueprint(split_pdf_bp)
app.register_blueprint(text_formatter)
app.register_blueprint(jpg_to_pdf_bp)
app.register_blueprint(merge_bp)
app.register_blueprint(pdf_to_word_bp)
app.register_blueprint(word_to_pdf_bp)
app.register_blueprint(add_blank_page_bp)
# app.register_blueprint(clean_bp)

app.register_blueprint(pdf_protect_bp, url_prefix='/pdf-protect') 
app.register_blueprint(pdf_unlock_bp, url_prefix='/pdf-unlock') 


# # Set up the scheduler
# scheduler = BackgroundScheduler()
# scheduler.add_job(func=clean_old_files, trigger='interval', minutes=1)
# scheduler.start()

# # Ensure scheduler shuts down with app
# atexit.register(lambda: scheduler.shutdown())


# Use absolute paths
# Set up file upload limits and paths

# Function to create the database and tables
# def create_db():
#     conn = sqlite3.connect('users.db')
#     cursor = conn.cursor()

#     cursor.execute("""
#     CREATE TABLE IF NOT EXISTS users (
#         id INTEGER PRIMARY KEY AUTOINCREMENT,
#         name TEXT NOT NULL,
#         email TEXT NOT NULL UNIQUE,
#         password TEXT NOT NULL
#     );
#     """)
#     conn.commit()
#     conn.close()

# # Create DB and table if they don't exist
# create_db()


# ------------------ Routes ------------------

# Home Page
# Home Page
@app.route('/')
def home():
    user = session.get('user')  # Get user info from session
    return render_template('index.html', user=user)

@app.route('/about')
def about():
    return render_template('Aboutme.html')

@app.route("/terms")
def terms():
    return render_template("terms.html")

@app.route("/privacy")
def privacy():
    return render_template("Privacy_Policy.html")

@app.route("/features")
def features():
    return render_template("features.html")

@app.route("/pricing")
def pricing():
    return render_template("pricing.html")

@app.route("/documentation")
def documentation():
    return render_template("documentation.html")    

@app.route("/system-status")
@app.route("/System_Status")
def system_status():
    return render_template("System_Status.html")


@app.route("/cookie-policy")
def cookie_policy():
    return render_template("Cookie.html")        
# Logout
# @app.route('/logout')
# def logout():
#     session.pop('user', None)  # Remove user from session
#     return redirect(url_for('home'))  # Redirect to home page after logging out

# Dashboard
@app.route('/dashboard')
def dashboard():
    user = session.get('user')
    if user:
        return render_template('dashboard.html', user=user)
    return redirect(url_for('login.login'))  # Redirect to login if not logged in
# Upload the file in google drive
# @app.route('/upload-from-drive', methods=['POST'])
# def upload_from_drive():
#     data = request.get_json()
#     file_id = data.get('fileId')
#     access_token = data.get('accessToken')

#     if not file_id or not access_token:
#         return jsonify({'error': 'Missing fileId or accessToken'}), 400

#     # Build download URL for Google Drive API
#     download_url = f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media"
#     headers = {
#         'Authorization': f'Bearer {access_token}'
#     }

#     try:
#         response = requests.get(download_url, headers=headers, stream=True)
#         if response.status_code != 200:
#             return jsonify({'error': 'Failed to download file from Drive'}), 500

#         # Save the file
#         filename = f"{file_id}.pdf"
#         file_path = os.path.join(UPLOAD_FOLDER, filename)
#         with open(file_path, 'wb') as f:
#             for chunk in response.iter_content(1024):
#                 if chunk:
#                     f.write(chunk)

#         # Optional: return file path or just confirmation
#         return jsonify({'message': 'File uploaded', 'path': file_path})

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# ------------------ Background Remove ------------------

# Background Remover Page (No login required)
@app.route('/background-remove')
def background_remover():
    return render_template('background_remove.html')

# Background Remove Processing Route (No login required)
@app.route('/remove-bg', methods=['POST'])
def remove_bg():
    # No session check here, so users don't need to be logged in
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    bg_mode = request.form.get('background_mode', 'transparent')
    bg_color = request.form.get('background_color', 'transparent')
    threshold = float(request.form.get('threshold', 0.5))
    smoothing = int(request.form.get('smoothing', 2))
    bg_image_file = request.files.get('background_image')

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    input_path = os.path.join(UPLOAD_FOLDER, file.filename)
    output_filename = 'no_bg_' + os.path.splitext(file.filename)[0] + '.png'
    output_path = os.path.join(OUTPUT_FOLDER, output_filename)

    file.save(input_path)

    # Remove background
    with open(input_path, 'rb') as i:
        input_image = i.read()
        output_image = remove(input_image)

    img = Image.open(BytesIO(output_image)).convert("RGBA")

    # Background handling
    if bg_mode == 'color' and bg_color != 'transparent':
        rgb = ImageColor.getcolor(bg_color, "RGBA")
        background = Image.new('RGBA', img.size, rgb)
        background.paste(img, (0, 0), img)
        img = background
    elif bg_mode == 'image' and bg_image_file:
        bg_image_path = os.path.join(UPLOAD_FOLDER, bg_image_file.filename)
        bg_image_file.save(bg_image_path)
        bg_image = Image.open(bg_image_path).convert('RGBA')
        bg_image = bg_image.resize(img.size)
        bg_image.paste(img, (0, 0), img)
        img = bg_image

    img.save(output_path, format="PNG")

    # Serve the result
    with open(output_path, 'rb') as f:
        image_data = f.read()

    return send_file(BytesIO(image_data), mimetype='image/png', as_attachment=False, download_name=output_filename)

# ------------------ Image Resize ------------------

@app.route('/resize-image')
def resize_image_page():
    return render_template('image_resize.html')

@app.route('/resize', methods=['POST'])
def resize_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    width = int(request.form.get('width', 500))  # Default to 500 if not provided
    height = int(request.form.get('height', 500))  # Default to 500 if not provided

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    input_path = os.path.join(UPLOAD_FOLDER, file.filename)
    output_filename = 'resized_' + os.path.splitext(file.filename)[0] + '.png'
    output_path = os.path.join(OUTPUT_FOLDER, output_filename)

    # Save the uploaded file to disk
    file.save(input_path)

    try:
        # Open the image using Pillow
        img = Image.open(input_path)
        original_size = img.size  # Get the original image size (width, height)
        print(f"Original image size: {original_size}")  # Debugging log
        
        # Resize the image
        img = img.resize((width, height))
        resized_size = img.size  # Get the resized image size
        print(f"Resized image size: {resized_size}")  # Debugging log
        
        # Save the resized image
        img.save(output_path, format="PNG")
    except Exception as e:
        return jsonify({'error': f'Error resizing image: {str(e)}'}), 500

    # Open the resized image for sending as a response
    with open(output_path, 'rb') as f:
        image_data = f.read()

    # Return the resized image as a response
    return send_file(BytesIO(image_data), mimetype='image/png', as_attachment=False, download_name=output_filename)


# ------------------ File Download ------------------

@app.route('/download/<filename>')
def download_file(filename):
    for folder in [OUTPUT_FOLDER, CONVERTED_FOLDER]:
        file_path = os.path.join(folder, filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
    return "File not found", 404



# ------------------ Main ------------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=True)
