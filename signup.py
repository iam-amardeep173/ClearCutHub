# from flask import Blueprint, render_template, request, redirect, url_for, flash
# import sqlite3
# from werkzeug.security import generate_password_hash

# signup_bp = Blueprint('signup', __name__)

# # Route for the Signup Page
# @signup_bp.route('/signup', methods=['GET', 'POST'])
# def signup():
#     if request.method == 'POST':
#         name = request.form['name']
#         email = request.form['email']
#         password = request.form['password']

#         # Basic validation
#         if len(name) < 2:
#             flash("Name must be at least 2 characters.", 'error')
#             return redirect(url_for('signup.signup'))
#         if len(password) < 6:
#             flash("Password must be at least 6 characters.", 'error')
#             return redirect(url_for('signup.signup'))
        
#         # Check if email exists
#         conn = sqlite3.connect('users.db')
#         cursor = conn.cursor()
#         cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
#         existing_user = cursor.fetchone()
#         conn.close()

#         if existing_user:
#             flash("Email is already registered.", 'error')
#             return redirect(url_for('signup.signup'))

#         # Hash password and store the user in the database
#         hashed_password = generate_password_hash(password)
#         conn = sqlite3.connect('users.db')
#         cursor = conn.cursor()
#         cursor.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
#                        (name, email, hashed_password))
#         conn.commit()
#         conn.close()

#         flash("Signup successful! Please login.", 'success')
#         return redirect(url_for('signup.login'))

#     return render_template('signup.html')

# @signup_bp.route('/login')
# def login():
#     return render_template('login.html')
