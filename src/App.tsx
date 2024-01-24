import { useCompletion } from 'ai/react';
import { Github, Wand2 } from "lucide-react";
import { useState } from "react";
import { PromptSelect } from "./components/prompt-select.tsx";
import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Separator } from "./components/ui/separator";
import { Slider } from "./components/ui/slider";
import { Textarea } from "./components/ui/textarea";
import { VideoInputForm } from "./components/video-input-form.tsx";
export function App() {
  const [temperature, setTemperature] = useState(0.5)
  const [videoId, setVideoId] = useState<string | null>(null)

  const {
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    completion,
    isLoading,
  } = useCompletion({
    api: 'http://localhost:3333/ai/complete',
    body: {
      videoId,
      temperature,
    },
    headers:{
      'Content-type': 'application/json',
    }
  })

  return (
   <div className= "min-h-screen flex flex-col">
    <div className="px-6 py-3 flex items-center justify-between border-b">
      <h1 className="text-xl font-bold">upload.ai</h1>
      
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Developed with 💜 during Rocketseat's NLW
          </span>

          <Separator orientation="vertical" className="h-6"/>

        <Button variant="outline">
          <Github className="w-4 h-4 mr-2"/>
          GitHub
          </Button>
      </div>
    </div>
    <main className="flex-1 p-6 flex flex-row-reverse gap-6">
      <div className="flex flex-col flex-1 gap-4">
        <div className="grid grid-rows-2 gap-4 flex-1">
        <Textarea
        className="resize-none p-4 leading-relaxed"
        placeholder="Insert AI's prompt..."
        value={input}
        onChange={handleInputChange}
        />
        <Textarea
        className="resize-none p-4 leading-relaxed"
        placeholder="Result created by AI" 
        readOnly
        value={completion}
        />
        </div>

        <p className="text-sm text-muted-foreground">
          Remember: You can use the variable <code className="text-green-300">{'{transcription}'}</code> on your prompt to add the selected video transcription content.
        </p>
      </div>
      <aside className="w-80 space-y-6">

        <VideoInputForm onVideoUploaded={setVideoId}/>
        <Separator />

        <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
            <Label>Prompt</Label>
            <PromptSelect onPromptSelected={setInput}/>
          </div>

          <div className="space-y-2">
            <Label>Model</Label>
            <Select disabled defaultValue="gpt3.5">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt3.5">GPT 3.5-4 turbo 16k</SelectItem>
              </SelectContent>
            </Select>
            <span className="block text-xs text-muted-foreground italic">
             You will be able to customize this option soon
              </span>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Temperature</Label>
            <Slider 
              min={0}
              max={1}
              step={0.1}
              value={[temperature]}
              onValueChange={value =>setTemperature(value[0])}
            />
            <span className="block text-xs text-muted-foreground italic leading-relaxed">
            Higher values tend to make the result more creative and may introduce potential errors.
              </span>
          </div>
          <Separator />
          <Button disabled={isLoading} type="submit" className="w-full">
            Execute
            <Wand2 className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </aside>
    </main>
   </div>
  )
}
