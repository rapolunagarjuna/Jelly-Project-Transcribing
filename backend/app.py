# app.py
from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return 'No video file part', 400

    video = request.files['video']
    if video.filename == '':
        return 'No selected video file', 400

    video.save(f'uploaded_{video.filename}')
    return 'Video uploaded successfully', 200

if __name__ == '__main__':
    app.run(debug=True)
