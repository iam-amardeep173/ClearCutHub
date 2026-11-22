# from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
# import sqlite3
# from werkzeug.security import check_password_hash

# # Create a Blueprint for the login functionality
# login_bp = Blueprint('login', __name__)

# # Login Route
# @login_bp.route('/login', methods=['GET', 'POST'])
# def login():
#     if request.method == 'POST':
#         email = request.form.get('email')
#         password = request.form.get('password')

#         try:
#             # Connect to the database securely
#             with sqlite3.connect('users.db') as conn:
#                 cursor = conn.cursor()
#                 cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
#                 user = cursor.fetchone()

#             # Check if user exists and password is correct
#             if user and check_password_hash(user[3], password):  # user[3] is the hashed password
#                 session['user'] = user[1]  # Store the username or email in session

#                 # ✅ Handle AJAX request
#                 if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
#                     return jsonify({'success': True})

#                 flash("Logged in successfully!", "success")
#                 return redirect(url_for('home'))

#             else:
#                 if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
#                     return jsonify({
#                         'success': False,
#                         'errors': [{'field': 'password', 'message': 'Invalid email or password'}]
#                     })

#                 flash("Invalid email or password", "danger")
#                 return redirect(url_for('login.login'))

#         except sqlite3.Error as e:
#             if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
#                 return jsonify({
#                     'success': False,
#                     'errors': [{'field': 'email', 'message': f'Database error: {e}'}]
#                 })

#             flash(f"Database error: {e}", "danger")
#             return redirect(url_for('login.login'))

#     # For GET request
#     return render_template('login.html')

# # Logout Route
# @login_bp.route('/logout')
# def logout():
#     if 'user' in session:
#         session.pop('user', None)
#         flash("Logged out successfully!", "success")
#     else:
#         flash("You are not logged in.", "warning")
#     return redirect(url_for('home'))
    
# @login_bp.route('/forgot-password', methods=['GET', 'POST'])
# def forgot_password():
#     if request.method == 'POST':
#         email = request.form.get('email')
#         # Add logic to handle password reset (e.g. send email with token)
#         flash("If this email is registered, a password reset link has been sent.", "info")
#         return redirect(url_for('login.login'))
    
#     return render_template('forgot_password.html')
