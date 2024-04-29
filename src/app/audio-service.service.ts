import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { bufferToWave } from '../app/audio/audio-helper';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AudioServiceService {

  private chunks: any[] = [];
  private mediaRecorder: any;
  private audioContext: AudioContext = new AudioContext();
  private audioBlobSubject = new Subject<Blob>();

  audioBlob$ = this.audioBlobSubject.asObservable();
  constructor(private http: HttpClient) { }
  async startRecording() {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.ondataavailable = (event: any) => this.chunks.push(event.data);
    this.mediaRecorder.start();
  }

  async stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.onstop = async () => {
        const audioData = await new Blob(this.chunks).arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(audioData);
        const wavBlob = bufferToWave(audioBuffer, audioBuffer.length);
        this.audioBlobSubject.next(wavBlob);
        this.chunks = [];
        
      };
    
  
      this.mediaRecorder.stop();
    }
  }

  
   transcribeAudio(audioFile: File): Promise<any> {
    const formData = new FormData();
    formData.append('audio', audioFile);

    return this.http.post<any>('http://localhost:5000/test1', formData)
      .toPromise()
      .then(response => {
        return response;
      })
      .catch(error => {
        console.error('Error transcribing audio:', error);
        throw error;
      });
  }
}



