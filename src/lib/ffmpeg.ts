import {FFmpeg} from '@ffmpeg/ffmpeg'
import coreURL from '../ffmpeg/ffmpeg-core.js?url'
import wasmURL from '../ffmpeg/ffmpeg-core.wasm?url'
import workerURL from '../ffmpeg/ffmpeg-worker.js?url'
//utilizando uma feature do Vite, o ? depois da extensão do arquivo impede que a importação seja feita quando o url for carregado. Ele vai importar via url, carregando somente quando for utilizado
let ffmpeg: FFmpeg | null

export async function getFFmpeg() {
  if(ffmpeg){
    return ffmpeg
  }
  ffmpeg = new FFmpeg()
  if (!ffmpeg.loaded){
    await ffmpeg.load({
      coreURL,
      wasmURL,
      workerURL,
    })
  }
  return ffmpeg
}