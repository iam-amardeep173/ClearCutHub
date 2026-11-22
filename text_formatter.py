from flask import Blueprint, render_template, request, jsonify
import autopep8  # Used for Python code formatting
from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters import HtmlFormatter

# Initialize the blueprint
text_formatter = Blueprint('text_formatter', __name__)

# Route for the text formatter page
@text_formatter.route('/text-formatter', methods=['GET', 'POST'])
def text_formatter_page():
    if request.method == 'POST':
        code_input = request.form.get('code_input')
        indentation = 'indentation' in request.form
        line_breaks = 'line_breaks' in request.form
        syntax_highlighting = 'syntax_highlighting' in request.form

        # Perform code formatting based on options
        formatted_code = format_code(code_input, indentation, line_breaks)

        if syntax_highlighting:
            formatted_code = apply_syntax_highlighting(formatted_code)

        return render_template('text_formatter.html', formatted_code=formatted_code)

    return render_template('text_formatter.html', formatted_code=None)

# Function to apply formatting based on user-selected options
def format_code(code_input, indentation=True, line_breaks=True):
    formatted_code = code_input

    # Apply indentation (using autopep8 for Python)
    if indentation:
        formatted_code = autopep8.fix_code(formatted_code)

    # Apply line breaks
    if line_breaks:
        formatted_code = formatted_code.replace(';', ';\n')

    return formatted_code

# Function to apply syntax highlighting using Pygments
def apply_syntax_highlighting(code):
    try:
        lexer = get_lexer_by_name('python')  # Change this as needed for different languages
        formatter = HtmlFormatter(style='monokai', linenos=True)
        highlighted_code = highlight(code, lexer, formatter)
        return highlighted_code
    except Exception as e:
        return f"Error in syntax highlighting: {str(e)}"
