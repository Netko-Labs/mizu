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
    // CLIProxyAPI won't boot without a config file. Seed a minimal one so the
    // API comes up on 8317; add provider logins from the running service.
    configFiles: [
      {
        path: '/CLIProxyAPI/config.yaml',
        content: [
          '# Managed by Mizu — CLIProxyAPI base config.',
          '# Add providers via the CLIProxyAPI login flows once running.',
          'port: 8317',
          '',
        ].join('\n'),
      },
    ],
    // Persist provider auth + plugins across redeploys — otherwise every deploy
    // wipes the CLI logins (per the image's run guide: `-v …:/root/.cli-proxy-api`
    // and `-v …:/CLIProxyAPI/plugins`).
    volumes: ['/root/.cli-proxy-api', '/CLIProxyAPI/plugins'],
  },
]
