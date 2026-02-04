"use client";

import { useRef, useState } from "react";

export default function Home(){
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [isRecording, setIsRecording]=useState(false);

  // start recording
  const startRecording = async() => {
    try{
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video:true
      });

      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

       const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(), // screen video
        ...audioStream.getAudioTracks()   // microphone audio
      ]);

      const mediaRecorder = new MediaRecorder(combinedStream,{
        mimeType: "video/webm"
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event)=>{
        if(event.data.size > 0){
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = ()=>{

        const blob = new Blob(recordedChunksRef.current, {
          type:"video/webm"
        });
        
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
        recordedChunksRef.current=[];
      };

      mediaRecorder.start();
      setIsRecording(true);

    }catch(error){
      console.error("Error starting recording:", error);
      alert("Permission denied or recording failed");
    }
  };

  const stopRecording = () => {
    if(mediaRecorderRef.current){
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return(
    <div style = {{padding: "40px", fontFamily:"Arial"}}>
      <h1>Screen + Audio Recorder</h1>
      <div style={{marginBottom:"20px"}}>
        <button 
        onClick={startRecording}
        disabled={isRecording}
        style={{marginRight:"10px"}}
        >
          Start Recording
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          >
            Stop Recording
        </button>
      </div>
      {videoURL && (
        <div>
          <h3>Preview:</h3>
          <video
          src={videoURL}
          controls
          style={{width:"600px",border:"1px solid black"}}
          />
        </div>
      )}
    </div>
  )

}

