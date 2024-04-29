import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { AudioServiceService } from '../audio-service.service';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.css']
})
export class AudioComponent implements OnInit {
  isRecording = false;
  recordedAudioBlob: Blob | null = null;
  recordedAudioUrl: string | null = null;
  transcriptionResponse: JSON | null = null;
  str : string | null = null;
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  constructor(private audioServiceService: AudioServiceService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.audioServiceService.audioBlob$.subscribe(blob => {
      this.recordedAudioBlob = blob;
      this.recordedAudioUrl = window.URL.createObjectURL(blob);
      this.audioPlayer.nativeElement.src = this.recordedAudioUrl;
      this.cd.detectChanges();

      if (this.recordedAudioBlob) {
        // Do something with the recorded audio blob
        console.log("Recorded audio blob:", this.recordedAudioBlob);
        this.transcribeAudio(this.recordedAudioBlob);

      } else {
        console.error("No recorded audio available.");
      }
      //this.playRecordedAudio();
    });
  }

  startRecording() {
    this.isRecording = true;
    this.audioServiceService.startRecording();
  }

  stopRecording() {
    this.isRecording = false;
    this.audioServiceService.stopRecording();
  }
  playRecordedAudio() {
    if (this.recordedAudioBlob) {
      const audioUrl = window.URL.createObjectURL(this.recordedAudioBlob);
      this.audioPlayer.nativeElement.src = audioUrl;
      this.audioPlayer.nativeElement.play();
    } else {
      console.error("No recorded audio available.");
    }
  }

  private clickCount: number = 0;

  handleButtonClick(event: MouseEvent) {
    // Increment click count
    this.clickCount++;

    // Check if it's a double click
    if (this.clickCount === 2) {
      this.str='Deceptive';
      // Reset click count after double click
      this.clickCount = 0;
    }
  }

  // HostListener to detect single click
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    setTimeout(() => {
      // If click count is still 1 after timeout, it's a single click
      if (this.clickCount === 1) {
        this.showResult('Truth');
        // Reset click count after single click
        this.clickCount = 0;
      }
    }, 250); // Adjust timeout duration as needed
  }

  // Method to display the result
  showResult(result: string) {
    this.str="Truth";
  }

  transcribeAudio(audioBlob: Blob) {
  // Convert Blob to File
  const audioFile = new File([audioBlob], 'recorded_audio.wav');
  
  // Log the audio file data
  console.log('Audio file:', audioFile);

  // Call the transcribeAudio service method
  // this.audioServiceService.transcribeAudio(audioFile)
  //   .then(transcript => {
  //     console.log('Transcription:', transcript);
  //     // Do something with the transcription if needed
  //   })
  //   .catch(error => {
  //     console.error('Error transcribing audio:', error);
  //   });

  this.audioServiceService.transcribeAudio(audioFile)
      .then(transcript => {
        this.transcriptionResponse = transcript; 
        console.log('Transcription:', this.transcriptionResponse);// Store the transcription response
        this.str= JSON.stringify(this.transcriptionResponse );
      })
      .catch(error => {
        console.error('Error transcribing audio:', error);
      });
}

}
