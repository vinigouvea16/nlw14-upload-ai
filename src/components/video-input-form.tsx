import { api } from "@/lib/axios";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from '@ffmpeg/util';
import { Label } from "@radix-ui/react-label";
import { Separator } from "@radix-ui/react-separator";
import { FileVideo, Upload } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

type Status = 'waiting' | 'converting' | 'uploading' | 'generating' | 'success'
const statusMessages = {
  converting: 'Convertendo...',
  generating: 'Transcrevendo...',
  uploading: 'Carregando...',
  success: 'Sucesso!'
}

interface VideoInputFormProps{
  onVideoUploaded: (id:string) => void
}

export function VideoInputForm(props: VideoInputFormProps){
  const [videoFile, setVideoFile] = useState<File | null>(null)
  //<> generic -> aqui dentro desse estado será armazenado OU um File OU nulo (no primeiro momento será o nulo)
  const [status, setStatus] = useState<Status>('waiting')
  const promptInputRef = useRef<HTMLTextAreaElement>(null)
  
  function handleFileSelected(event: ChangeEvent<HTMLInputElement>){
    const {files} = event.currentTarget

    if(!files){
      return
    }

    const selectedFile = files[0]
    
    setVideoFile(selectedFile)
  }
  async function convertVideoToAudio(video: File){
    console.log('Conversion started.')

    const ffmpeg = await getFFmpeg()

    await ffmpeg?.writeFile('input.mp4', await fetchFile(video))
    ffmpeg.on('log', log=>{
      console.log(log)
    })
    ffmpeg?.on('progress', progress => {
      console.log('Convert progress: ' + Math.round(progress.progress * 100))
    })

    await ffmpeg.exec([
       '-i',
       'input.mp4',
       '-map',
       '0:a', 
       '-b:a',
       '20k',
       '-acodec',
       'libmp3lame',
       'output.mp3'
       //copy this array and ask chatGPT for this example explanation for further understanding 
    ])
    //further understanding also applies for the following variables, not even Diego knows how to explain it
    const data = await ffmpeg.readFile('output.mp3')
    const audioFileBlob = new Blob([data], {type: 'audio/mpeg'})
    const audioFile = new File([audioFileBlob], 'audio.mp3',{
      type: 'audio/mpeg',
    })

    console.log('Conversion finished')
    return audioFile
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const prompt = promptInputRef.current?.value

    if (!videoFile) {
      return
    }
    setStatus('converting')

    // Convert video into audio:
    const audioFile = await convertVideoToAudio(videoFile)
    const data = new FormData()
    data.append('file', audioFile)
    setStatus('uploading')
    const response = await api.post('/videos', data)
    const videoId = response.data.video.id
    setStatus('generating')
    await api.post(`/videos/${videoId}/transcription`,{
      prompt,
    })
    setStatus('success')

    props.onVideoUploaded(videoId)
  }

    //a fim de evitar a rerenderização de toda a pagina, o useMemo permite que essa variavel(previewURL) seja recarregada SOMENTE SE o videoFile mudar, e é aqui que ele entra no array de dependências -> em outras palavras: a variável que o useMemo vai ficar monitorando
    const previewURL = useMemo(() => {
      if(!videoFile) {
        return null
      }
      return URL.createObjectURL(videoFile)
    }, [videoFile])
  return(
    <form onSubmit={handleUploadVideo} className="space-y-6">
    <label 
      htmlFor="video" 
      className="relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/40"
      >
        {previewURL ? (
        <video src={previewURL} controls={false} className="pointer-events-none absolute inset-0"/>
      ) : (
        //usaremos um fragment para que a div nao comprometa o layout da pagina
        <>
        <FileVideo /> 
        Select a video
        </>
      )}
    </label>

    <input type="file" id="video" accept="video/mp4" className="sr-only" onChange={handleFileSelected}/>
    <Separator />
    <div className="space-y-2">
      <Label htmlFor="transcription prompt">Transcription prompt</Label>
      <Textarea 
      disabled={status !== 'waiting'}
      ref={promptInputRef}
      id="transcription_prompt" 
      className="h-20 leading-relaxed resize-none"
      placeholder="Include keywords mentioned in the video separated by commas (,)" />
    </div>
    <Button 
    data-success={status === 'success'}
    disabled={status !== 'waiting'}
    type="submit" 
    className="w-full data-[success=true]:bg-emerald-400"
    >
     {status === 'waiting'? (
      <>
      Upload video
      <Upload className="w-4 h-4 ml-2"/>
      </>
     ): statusMessages[status]}
    </Button>
  </form>
 )
}