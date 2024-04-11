"use client"

import { useState, useRef, useEffect } from "react";
import type { IMediaRecorder } from 'extendable-media-recorder';
import { UgScriptConverter } from "./util/ugScriptConverter";

export default function Home() {
  const [recording, setRecording] = useState(false);
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const mediaRecorder = useRef<IMediaRecorder>();
  const chunks = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const init = async () => {
    const { MediaRecorder, register } = await import('extendable-media-recorder');
    const { connect } = await import('extendable-media-recorder-wav-encoder');
    await register(await connect());
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/wav' });
    
    mediaRecorder.current.addEventListener('dataavailable', event => {
      chunks.current.push(event.data);
    });
    mediaRecorder.current.addEventListener('stop', async () => {
      const blob = new Blob(chunks.current, { type: 'audio/wav' });
      setAudioUrl(URL.createObjectURL(blob));
      const formData = new FormData();
      formData.append('sound', blob, 'recording.wav');
      try {
        const response = await fetch('/api/s2t', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        setText(data);
      } catch (error) {
        console.error(error);
      }
      setRecording(false);
    });
  };

  useEffect(()=> {
    init();
  }, []);

  const startRecording = async () => {
    mediaRecorder.current?.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Submit the text to the API and receive the WAV file
    const response = await fetch('/api/t2s', {
      method: 'POST',
      body: JSON.stringify(UgScriptConverter(text)),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    setAudioUrl(audioUrl);
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-2xl font-bold mb-4">Uyghur Text Speech Converter</h1>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Speech to Text</h2>
        {recording ? (
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={stopRecording}
          >
            Stop Recording
          </button>
        ) : (
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={startRecording}
          >
            Start Recording
          </button>
        )}
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">Text to Speech</h2>
        <div className="flex">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text"
            className="p-2 border border-gray-300 rounded-l text-gray-800"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Audio Player</h2>
        <audio ref={audioRef} src={audioUrl} controls className="mt-2" />
      </div>
    </main>
  );
}
