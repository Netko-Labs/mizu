import type { ServiceTemplate } from './types'

/**
 * Service templates for common utility and tool services
 */
export const serviceTemplates: ServiceTemplate[] = [
  {
    id: 'adminer',
    name: 'Adminer',
    description: 'Database management in a single PHP file',
    category: 'tool',
    sourceType: 'image',
    sourceConfig: { image: 'adminer', tag: 'latest' },
    defaultPorts: [{ container: 8080 }],
    defaultEnvVars: {
      ADMINER_DEFAULT_SERVER: '',
    },
  },
  {
    id: 'cliproxyapi',
    name: 'CLI Proxy API',
    description:
      'Expose Claude Code, Codex, Gemini & Grok CLIs as an OpenAI/Gemini/Claude-compatible API',
    category: 'tool',
    sourceType: 'image',
    sourceConfig: { image: 'eceasy/cli-proxy-api', tag: 'latest' },
    // 8317 is the API (routed by ingress as port[0]); the rest are the OAuth
    // callback ports for the provider logins (Gemini/Claude/Codex/Qwen/iFlow).
    defaultPorts: [
      { container: 8317 },
      { container: 8085 },
      { container: 1455 },
      { container: 54545 },
      { container: 51121 },
      { container: 11451 },
    ],
  },
]
