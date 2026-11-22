# import os
# import time
# import stat
# from pathlib import Path
# from flask import Blueprint, jsonify

# clean_bp = Blueprint('clean_bp', __name__)

# # Use environment variable PROJECT_BASE_PATH; fallback to parent folder of this file
# BASE_PATH = Path(os.getenv("PROJECT_BASE_PATH", default=Path(__file__).resolve().parent.parent))

# FOLDERS_TO_CLEAN = [
#     "upload",
#     "converted",
#     "outputs",
#     "protected",
#     "unlocked",
#     "uploads",
#     "uploads_protected",
#     "uploads_unlocked"
# ]

# FILE_AGE_LIMIT_SECONDS = 60  # 1 minute for testing; change to 300 for production

# def clean_old_files():
#     print(f"[CLEANER] Running cleanup at {time.strftime('%Y-%m-%d %H:%M:%S')}")
#     print(f"[CLEANER] Using BASE_PATH: {BASE_PATH}")
#     current_time = time.time()
#     deleted_files = []
#     errors = []

#     for folder_name in FOLDERS_TO_CLEAN:
#         folder_path = BASE_PATH / folder_name
#         print(f"[DEBUG] Scanning folder: {folder_path}")

#         if not folder_path.exists():
#             print(f"[WARNING] Folder does NOT exist: {folder_path}")
#             errors.append(f"Missing folder: {folder_path}")
#             continue

#         for file_path in folder_path.iterdir():
#             try:
#                 if not file_path.is_file():
#                     continue

#                 file_age = current_time - file_path.stat().st_mtime
#                 print(f"[CHECK] {file_path} - age: {int(file_age)}s")

#                 if file_age > FILE_AGE_LIMIT_SECONDS:
#                     try:
#                         os.chmod(file_path, stat.S_IWRITE)  # for Windows readonly files
#                     except Exception as chmod_err:
#                         errors.append(f"[Chmod Failed] {file_path}: {chmod_err}")

#                     file_path.unlink()
#                     print(f"[DELETED] {file_path}")
#                     deleted_files.append(str(file_path))

#             except Exception as e:
#                 errors.append(f"[Error] {file_path}: {e}")

#     return {
#         "status": "completed",
#         "deleted_files": deleted_files,
#         "errors": errors
#     }

# @clean_bp.route('/clean', methods=['POST'])
# def clean_old_files_route():
#     result = clean_old_files()
#     return jsonify(result)
