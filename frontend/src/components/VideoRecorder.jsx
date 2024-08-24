import React, { useRef, useState, useEffect } from 'react';

const VideoRecorder = () => {
    const videoRef = useRef(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [previewURL, setPreviewURL] = useState('');
    const [recordingDuration, setRecordingDuration] = useState(10); // Default to 10 seconds
    const [isRecordingComplete, setIsRecordingComplete] = useState(true); // Flag to track recording status

    useEffect(() => {
        return () => {
            // Cleanup blob URL on component unmount
            if (previewURL) {
                URL.revokeObjectURL(previewURL);
            }
        };
    }, [previewURL]);

    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 360, height: 640 }, audio: true })
            .then(stream => {
                console.log('MediaStream:', stream); // Debugging: Check if stream is available
                videoRef.current.srcObject = stream;
                videoRef.current.play(); // Ensure video starts playing

                const recorder = new MediaRecorder(stream);
                recorder.ondataavailable = event => {
                    if (event.data.size > 0) {
                        setRecordedChunks(prevChunks => [...prevChunks, event.data]);
                    }
                };
                recorder.onstop = () => {
                    if (isRecordingComplete) { // Only save if recording was completed normally
                        const blob = new Blob(recordedChunks, { type: 'video/webm' });
                        setPreviewURL(URL.createObjectURL(blob));
                    }
                };
                recorder.start();
                setMediaRecorder(recorder);
                setIsRecording(true);
                setIsRecordingComplete(true); // Assume recording will complete normally

                // Automatically stop recording after the specified duration
                setTimeout(() => {
                    if (recorder.state !== 'inactive') {
                        recorder.stop();
                        setIsRecording(false);
                    }
                }, recordingDuration * 1000); // Convert seconds to milliseconds
            })
            .catch(error => {
                console.error('Error accessing media devices.', error);
            });
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
            setIsRecordingComplete(false); // Indicate that recording was stopped forcibly
        }
    };

    const uploadVideo = () => {
        if (recordedChunks.length === 0) return; // No video to upload

        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const formData = new FormData();
        formData.append('video', blob, 'recorded-video.webm');

        fetch('http://localhost:8080/upload', { // Update with your Flask server URL
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(result => {
            console.log('Success:', result);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <video ref={videoRef} width="360" height="640" autoPlay style={{ borderRadius: '10px', marginBottom: '10px', backgroundColor: '#000' }}></video>
            <div>
                <button 
                    onClick={() => { setRecordingDuration(10); startRecording(); }} 
                    disabled={isRecording}
                    style={{ margin: '5px', padding: '10px 20px', fontSize: '16px' }}
                >
                    Record 10s
                </button>
                <button 
                    onClick={() => { setRecordingDuration(20); startRecording(); }} 
                    disabled={isRecording}
                    style={{ margin: '5px', padding: '10px 20px', fontSize: '16px' }}
                >
                    Record 20s
                </button>
                <button 
                    onClick={() => { setRecordingDuration(30); startRecording(); }} 
                    disabled={isRecording}
                    style={{ margin: '5px', padding: '10px 20px', fontSize: '16px' }}
                >
                    Record 30s
                </button>
                <button 
                    onClick={() => { setRecordingDuration(40); startRecording(); }} 
                    disabled={isRecording}
                    style={{ margin: '5px', padding: '10px 20px', fontSize: '16px' }}
                >
                    Record 40s
                </button>
                <button 
                    onClick={() => { setRecordingDuration(50); startRecording(); }} 
                    disabled={isRecording}
                    style={{ margin: '5px', padding: '10px 20px', fontSize: '16px' }}
                >
                    Record 50s
                </button>
                <button 
                    onClick={() => { setRecordingDuration(60); startRecording(); }} 
                    disabled={isRecording}
                    style={{ margin: '5px', padding: '10px 20px', fontSize: '16px' }}
                >
                    Record 60s
                </button>
                <button 
                    onClick={stopRecording} 
                    disabled={!isRecording}
                    style={{ margin: '5px', padding: '10px 20px', fontSize: '16px' }}
                >
                    Stop Recording
                </button>
                <button 
                    onClick={uploadVideo} 
                    disabled={recordedChunks.length === 0}
                    style={{ margin: '5px', padding: '10px 20px', fontSize: '16px' }}
                >
                    Upload Video
                </button>
            </div>
            {previewURL && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Preview</h2>
                    <video src={previewURL} width="360" height="640" controls style={{ borderRadius: '10px' }}></video>
                </div>
            )}
        </div>
    );
};

export default VideoRecorder;
