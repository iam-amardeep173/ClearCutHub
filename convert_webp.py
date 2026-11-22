import os
import io
import zipfile
from flask import render_template, request, send_file, flash, Blueprint
from PIL import Image
from werkzeug.utils import secure_filename

# Blueprint setup
convert_webp_bp = Blueprint('convert_webp', __name__)

ALLOWED_FORMATS = ['png', 'jpg']
ALLOWED_EXTENSIONS = ['.webp']

@convert_webp_bp.route('/convert-webp', methods=['GET', 'POST'])
def convert_webp():
    if request.method == 'GET':
        return render_template('convert_webp.html')

    output_format = request.form.get('convertFormat')
    files = request.files.getlist('files')

    if not files or output_format not in ALLOWED_FORMATS:
        flash('Invalid input.')
        return ('Invalid format or no files uploaded.', 400)

    # Convert format for Pillow (JPG -> JPEG)
    img_format = 'JPEG' if output_format == 'jpg' else output_format.upper()

    # If only one file, return the image directly
    if len(files) == 1:
        file = files[0]
        filename = secure_filename(file.filename)
        if not filename.lower().endswith('.webp'):
            return ('Invalid file format.', 400)

        img = Image.open(file).convert("RGB" if output_format == 'jpg' else "RGBA")
        img_io = io.BytesIO()
        img.save(img_io, img_format)
        img_io.seek(0)

        return send_file(
            img_io,
            mimetype=f'image/{output_format}',
            as_attachment=True,
            download_name=f'converted.{output_format}'
        )

    # Multiple files -> create ZIP
    zip_io = io.BytesIO()
    with zipfile.ZipFile(zip_io, mode='w', compression=zipfile.ZIP_DEFLATED) as zipf:
        for file in files:
            filename = secure_filename(file.filename)
            if not filename.lower().endswith('.webp'):
                continue

            img = Image.open(file).convert("RGB" if output_format == 'jpg' else "RGBA")
            img_buffer = io.BytesIO()
            img.save(img_buffer, img_format)
            img_buffer.seek(0)

            zipf.writestr(f"{os.path.splitext(filename)[0]}.{output_format}", img_buffer.read())

    zip_io.seek(0)
    return send_file(
        zip_io,
        mimetype='application/zip',
        as_attachment=True,
        download_name='converted_images.zip'
    )
