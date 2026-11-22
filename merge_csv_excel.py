from flask import Blueprint, request, send_file, abort, render_template, jsonify
import pandas as pd
import io
import os
import tempfile
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge

merge_bp = Blueprint('merge_csv_excel', __name__)

# Configuration
ALLOWED_EXTENSIONS = {'csv', 'xlsx'}
MAX_CONTENT_LENGTH = 1 * 1024 * 1024 * 1024  # 1GB

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@merge_bp.route('/merge-csv-excel', methods=['GET'])
def show_merge_page():
    return render_template('merge_csv_excel.html')

@merge_bp.route('/merge-csv-excel', methods=['POST'])
def merge_csv_excel():
    try:
        # Validate request
        if 'merge_files[]' not in request.files:
            return jsonify({"error": "No files uploaded"}), 400
            
        files = request.files.getlist('merge_files[]')
        file_type = request.form.get('file_type', 'csv')

        if not files or len(files) < 1:
            return jsonify({"error": "No files selected"}), 400

        # Validate file type
        if file_type not in ['csv', 'excel']:
            return jsonify({"error": "Invalid file type specified"}), 400

        dataframes = []
        all_columns = set()
        skipped_files = []
        temp_files = []

        try:
            for f in files:
                if not f or f.filename == '':
                    continue

                if not allowed_file(f.filename):
                    skipped_files.append(f"{f.filename} – Invalid file type")
                    continue

                filename = secure_filename(f.filename)
                ext = filename.rsplit('.', 1)[1].lower()

                if (file_type == 'excel' and ext != 'xlsx') or (file_type == 'csv' and ext != 'csv'):
                    skipped_files.append(f"{f.filename} – Extension mismatch with selected type")
                    continue

                try:
                    if f.content_length < 10 * 1024 * 1024:
                        df = pd.read_csv(f.stream) if ext == 'csv' else pd.read_excel(f.stream)
                    else:
                        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
                            f.save(tmp_file.name)
                            temp_files.append(tmp_file.name)
                            df = pd.read_csv(tmp_file.name) if ext == 'csv' else pd.read_excel(tmp_file.name)

                    if df.empty or df.columns.isnull().all():
                        skipped_files.append(f"{f.filename} – Empty or invalid structure")
                        continue

                    all_columns.update(df.columns)
                    dataframes.append(df)

                except Exception as e:
                    skipped_files.append(f"{f.filename} – Error: {str(e)}")

            if not dataframes:
                return jsonify({"error": "No valid data to merge", "skipped": skipped_files}), 400

            all_columns = list(all_columns)
            aligned_dataframes = [df.reindex(columns=all_columns) for df in dataframes]
            merged_df = pd.concat(aligned_dataframes, ignore_index=True)

            buf = io.BytesIO()
            if file_type == 'csv':
                merged_df.to_csv(buf, index=False, encoding='utf-8-sig')
                mimetype = 'text/csv'
                filename = 'merged.csv'
            else:
                with pd.ExcelWriter(buf, engine='xlsxwriter') as writer:
                    merged_df.to_excel(writer, index=False)
                mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                filename = 'merged.xlsx'

            buf.seek(0)
            response = send_file(
                buf,
                mimetype=mimetype,
                as_attachment=True,
                download_name=filename
            )

            # Add custom header for skipped info
            response.headers['X-Skipped-Files'] = ', '.join(skipped_files)
            return response

        finally:
            for temp_file in temp_files:
                try:
                    os.remove(temp_file)
                except:
                    pass

    except RequestEntityTooLarge:
        return jsonify({"error": "Total upload size exceeds 1GB limit"}), 413
        
    except pd.errors.ParserError as e:
        return jsonify({"error": f"Invalid file format: {str(e)}"}), 400
        
    except Exception as e:
        return jsonify({"error": f"Processing error: {str(e)}"}), 500

@merge_bp.app_errorhandler(413)
def handle_large_file_error(e):
    return jsonify({"error": "Total upload size exceeds 1GB limit"}), 413