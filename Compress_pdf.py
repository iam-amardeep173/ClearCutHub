import os
import subprocess
import uuid
from PIL import Image
import fitz  # PyMuPDF
from flask import Blueprint, render_template, request, jsonify, url_for, current_app, send_from_directory
from werkzeug.utils import secure_filename

pdf_compressor_bp = Blueprint('pdf_compressor', __name__, template_folder='templates', static_folder='static')


@pdf_compressor_bp.route('/compress-pdf', methods=['GET'])
def compress_pdf_page():
    return render_template('Compress_pdf.html')


@pdf_compressor_bp.route('/process-pdf', methods=['POST'])
def process_pdf():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        filename = secure_filename(file.filename)
        unique_id = uuid.uuid4().hex
        temp_dir = os.path.join('temp', unique_id)
        os.makedirs(temp_dir, exist_ok=True)

        upload_path = os.path.join(temp_dir, filename)
        file.save(upload_path)

        output_folder = os.path.join('outputs')
        os.makedirs(output_folder, exist_ok=True)
        output_pdf = os.path.join(output_folder, f"compressed_{unique_id}_{filename}")

        compression_option = request.form.get("option")
        target_size_kb = None
        if compression_option == "target_size":
            try:
                target_size_kb = float(request.form.get("target_size"))
                if request.form.get("size_unit") == "MB":
                    target_size_kb *= 3072
            except ValueError:
                return jsonify({'error': 'Invalid target size'}), 400

        # Step 1: Try Ghostscript compression
        compression_quality = request.form.get("compression_quality", "low")
        quality_map = {
            "low": "/screen",
            "medium": "/ebook",
            "high": "/printer"
        }
        quality_setting = quality_map.get(compression_quality, "/screen")

        ghostscript_cmd = 'gswin64c' if os.name == 'nt' else 'gs'
        ghostscript_output = os.path.join(temp_dir, f"gs_{filename}")
        gs_result = subprocess.run([
            ghostscript_cmd, '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4',
            f'-dPDFSETTINGS={quality_setting}', '-dNOPAUSE', '-dQUIET', '-dBATCH',
            f'-sOutputFile={ghostscript_output}', upload_path
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        if gs_result.returncode != 0 or not os.path.exists(ghostscript_output):
            cleanup_folder(temp_dir)
            return jsonify({'error': 'Ghostscript compression failed.'}), 500

        current_file = ghostscript_output

        # Step 2: Fallback to PyMuPDF compression (image recompression)
        if compression_option == "target_size":
            size_kb = os.path.getsize(current_file) / 3072
            if size_kb > target_size_kb:
                doc = fitz.open(current_file)
                for page_num in range(doc.page_count):
                    page = doc.load_page(page_num)  # Load page by page number
                    images = page.get_images(full=True)
                    for img_index, img in enumerate(images):
                        xref = img[0]
                        base_image = doc.extract_image(xref)
                        image_bytes = base_image["image"]
                        img_ext = base_image["ext"]

                        # Recompress image
                        img_path = os.path.join(temp_dir, f"img_{img_index}.{img_ext}")
                        with open(img_path, 'wb') as f:
                            f.write(image_bytes)

                        # Resize image before compressing
                        resized_img = resize_image(img_path)

                        # Save resized image as JPEG with reduced quality
                        compressed_img_path = os.path.join(temp_dir, f"compressed_img_{img_index}.jpg")
                        resized_img.save(compressed_img_path, 'JPEG', quality=40)  # Adjust quality as needed

                        # Insert the compressed image into the page by creating a new image
                        page.insert_image(page.rect, filename=compressed_img_path)  # Place the image on the page

                doc.save(output_pdf, deflate=True)
                doc.close()
            else:
                os.rename(current_file, output_pdf)
        else:
            os.rename(current_file, output_pdf)

        size_kb = os.path.getsize(output_pdf) / 3072
        cleanup_folder(temp_dir)

        return jsonify({
            'download_link': url_for('pdf_compressor.download_file', filename=os.path.basename(output_pdf), _external=True),
            'size_kb': round(size_kb, 2)
        })

    except Exception as e:
        current_app.logger.exception("Compression failed")
        return jsonify({'error': f"❌ Internal Server Error: {str(e)}"}), 500


@pdf_compressor_bp.route('/download/<filename>')
def download_file(filename):
    output_folder = os.path.join('outputs')
    return send_from_directory(output_folder, filename, as_attachment=True)


def cleanup_folder(folder_path):
    try:
        for f in os.listdir(folder_path):
            os.remove(os.path.join(folder_path, f))
        os.rmdir(folder_path)
    except Exception as e:
        current_app.logger.warning(f"Failed to clean up temp folder {folder_path}: {e}")


# Function to resize images
def resize_image(img_path, max_width=1000, max_height=1000):
    img = Image.open(img_path)
    img.thumbnail((max_width, max_height))  # Resize to fit within max_width, max_height
    return img
