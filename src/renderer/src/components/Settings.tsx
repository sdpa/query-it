import { useState } from 'react'
import { Button } from '@renderer/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { LlmProvider } from 'src/backend/services/llm/langchainService'

const openRouterModels = [
  'google/gemma-7b-it',
  'mistralai/mistral-7b-instruct',
  'anthropic/claude-3-haiku'
]

interface SettingsProps {
  onSave: (settings: { provider: LlmProvider; apiKey: string; model: string }) => void
}

export const Settings = ({ onSave }: SettingsProps) => {
  const [provider, setProvider] = useState<LlmProvider>('openrouter')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('google/gemma-7b-it')

  const handleSave = () => {
    onSave({ provider, apiKey, model })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Configure</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure LLM Provider</DialogTitle>
          <DialogDescription>
            Select your LLM provider and enter your API key.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="provider" className="text-right">
              Provider
            </Label>
            <Select value={provider} onValueChange={(value) => setProvider(value as LlmProvider)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="ollama">Ollama</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-key" className="text-right">
              API Key
            </Label>
            <Input
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              Model
            </Label>
            <Select value={model} onValueChange={(value) => setModel(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {provider === 'openrouter' &&
                  openRouterModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                {provider === 'openai' && <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>}
                {provider === 'ollama' && <SelectItem value="llama2">llama2</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
