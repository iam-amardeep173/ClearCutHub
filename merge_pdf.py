from flask import Blueprint, request, render_template, send_file, jsonify
from PyPDF2 import PdfMerger
from io import BytesIO
import uuid

# Define Blueprint
merge_pdf = Blueprint('merge_pdf', __name__)

# Render the page
@merge_pdf.route('/merge-pdf')
def merge_pdf_page():
    return render_template('merge_pdf.html')

# Merge handler route
@merge_pdf.route('/merge-pdf-files', methods=['POST'])
def merge_pdf_files():
    files = request.files.getlist('pdf_files[]')

    # Ensure minimum two files
    if not files or len(files) < 2:
        return jsonify({'error': 'Please upload at least two PDF files.'}), 400

    merger = PdfMerger()

    try:
        for file in files:
            if file and file.filename.lower().endswith('.pdf'):
                file.seek(0)
                # Check for valid PDF header
                if file.read(4) != b'%PDF':
                    return jsonify({'error': f"{file.filename} is not a valid PDF."}), 400
                file.seek(0)
                merger.append(BytesIO(file.read()))

        output_pdf = BytesIO()
        merger.write(output_pdf)
        merger.close()
        output_pdf.seek(0)

        # Send file directly without saving
        return send_file(
            output_pdf,
            as_attachment=True,
            download_name=f"merged_{uuid.uuid4().hex}.pdf",
            mimetype='application/pdf'
        )

    except Exception as e:
        return jsonify({'error': f'Failed to merge PDFs: {str(e)}'}), 500
