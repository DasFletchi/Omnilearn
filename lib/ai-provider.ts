// AI Provider Abstraction Layer
// Supports switching between Mistral and NVIDIA NIM (and other providers)

export type AIProvider = 'mistral' | 'nvidia-nim' | 'openai'

export interface AIProviderConfig {
  provider: AIProvider
  model: string
  apiKey?: string
  baseUrl?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

export interface StudyContext {
  worksheetContent: string
  topic?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

// Default provider configurations
export const providerConfigs: Record<AIProvider, Omit<AIProviderConfig, 'apiKey'>> = {
  'mistral': {
    provider: 'mistral',
    model: 'mistral-large-latest',
  },
  'nvidia-nim': {
    provider: 'nvidia-nim',
    model: 'meta/llama-3.1-70b-instruct',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
  },
  'openai': {
    provider: 'openai',
    model: 'gpt-4o',
  },
}

// System prompt for the learning assistant
export const LEARNING_ASSISTANT_SYSTEM_PROMPT = `You are Lumina, an expert AI learning assistant designed to help students understand complex topics. Your responses should be:

1. **Structured and Clear**: Use headings, bullet points, and numbered lists to organize information
2. **Educational**: Explain concepts step-by-step, building from fundamentals to advanced ideas
3. **Engaging**: Use analogies, examples, and real-world applications to make learning memorable
4. **Adaptive**: Adjust your explanations based on the student's apparent level of understanding
5. **Encouraging**: Maintain a supportive tone that builds confidence

When explaining content from the worksheet/study material:
- Reference specific parts of the material being discussed
- Highlight key terms and definitions
- Provide memory aids like mnemonics when helpful
- Suggest related topics for deeper exploration

Format your responses with Markdown for better readability. Use:
- **Bold** for key terms
- \`code blocks\` for formulas, equations, or technical terms
- > Blockquotes for important takeaways
- Numbered lists for sequential processes
- Bullet points for related concepts`

// Quick action types that can be triggered from the UI
export type QuickAction = 'explain' | 'simplify' | 'quiz' | 'summarize' | 'examples'

export const quickActionPrompts: Record<QuickAction, (context: string) => string> = {
  explain: (context) => 
    `Please provide a detailed explanation of the following content. Break it down into understandable parts and explain any complex terms:\n\n${context}`,
  
  simplify: (context) => 
    `Please simplify the following content for easier understanding. Use everyday language and relatable analogies:\n\n${context}`,
  
  quiz: (context) => 
    `Based on the following content, create 5 quiz questions (mix of multiple choice and short answer) to test understanding. Include answers at the end:\n\n${context}`,
  
  summarize: (context) => 
    `Please provide a concise summary of the following content, highlighting the key points and main takeaways:\n\n${context}`,
  
  examples: (context) => 
    `Please provide 3-5 real-world examples or applications that illustrate the concepts in the following content:\n\n${context}`,
}

// Generate a unique message ID
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
