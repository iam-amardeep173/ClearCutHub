# # tools/text_summarizer.py

# from flask import Blueprint, render_template, request, jsonify
# from transformers import pipeline

# text_summarizer = Blueprint('text_summarizer', __name__)

# # Load summarization model once when blueprint is initialized
# summarizer = pipeline("summarization")

# @text_summarizer.route('/text-summarizer', methods=['GET', 'POST'])
# def summarize_text():
#     summary = ""
#     if request.method == 'POST':
#         input_text = request.form.get('input_text', '')
#         if input_text:
#             try:
#                 result = summarizer(input_text, max_length=150, min_length=30, do_sample=False)
#                 summary = result[0]['summary_text']
#             except Exception as e:
#                 summary = f"Error during summarization: {str(e)}"

#     return render_template('text_summarizer.html', summary=summary)
