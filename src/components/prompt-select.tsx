import { api } from "@/lib/axios";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface Prompt{
  id: string
  title: string
  template: string
}
interface PromptSelectProps{
  onPromptSelected: (template:string) => void
}
export function PromptSelect(props: PromptSelectProps){
  const [prompts, setPrompts] = useState<Prompt[] | null>(null)
  function handlePromptSelected(promptId: string){
    const selectedPrompt = prompts?.find(prompt => prompt.id === promptId)
    if(!selectedPrompt){
      return
    }
    props.onPromptSelected(selectedPrompt.template)
  }
  useEffect(() => {
    const getData = async () => {
     const response = await api.get('/prompts')
     setPrompts(response.data)
     console.log(response)
    }
    getData()
  }, [])
  return (
    <Select onValueChange={handlePromptSelected}>
    <SelectTrigger>
      <SelectValue placeholder="Select a prompt..."/>
    </SelectTrigger>
    <SelectContent>
    {prompts?.map(prompt =>{
      return (
        <SelectItem key={prompt.id} value={prompt.id}>
          {prompt.title}
          </SelectItem>
      )
    })}
    </SelectContent>
  </Select>
  )
}