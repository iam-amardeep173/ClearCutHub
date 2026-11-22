# jpg_to_pdf.py
from flask import Blueprint, render_template, request, jsonify, send_file
from PIL import Image
import io
import traceback

# Create the Blueprint for JPG to PDF
jpg_to_pdf_bp = Blueprint('jpg_to_pdf', __name__)

@jpg_to_pdf_bp.route("/jpg-to-pdf")
def jpg_to_pdf_page():
    return render_template("jpg_to_pdf.html")

@jpg_to_pdf_bp.route("/jpg-to-pdf", methods=["POST"])
def convert_jpg_to_pdf():
    try:
        files = request.files.getlist("images")
        if not files:
            return jsonify({'error': 'No images uploaded'}), 400

        images = []
        for file in files:
            if file and file.filename.lower().endswith((".jpg", ".jpeg")):
                img = Image.open(file.stream).convert("RGB")  # safer with .stream
                images.append(img)

        if not images:
            return jsonify({'error': 'No valid JPG images'}), 400

        pdf_io = io.BytesIO()
        first_image = images[0]
        remaining_images = images[1:]
        first_image.save(pdf_io, format="PDF", save_all=True, append_images=remaining_images)
        pdf_io.seek(0)

        return send_file(pdf_io, mimetype="application/pdf", as_attachment=True, download_name="converted.pdf")

    except Exception as e:
        print("Error during conversion:", str(e))
        traceback.print_exc()
        return jsonify({'error': f"Conversion error: {str(e)}"}), 500
