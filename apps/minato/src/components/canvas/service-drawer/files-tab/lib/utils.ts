import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { yaml } from '@codemirror/lang-yaml'
import type { Extension } from '@uiw/react-codemirror'

/** CodeMirror language extension chosen by file extension (empty = plain text). */
export function languageExtension(path: string): Extension[] {
  const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase()
  switch (ext) {
    case 'yaml':
    case 'yml':
      return [yaml()]
    case 'json':
      return [json()]
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
    case 'ts':
    case 'tsx':
      return [javascript({ typescript: ext.startsWith('ts'), jsx: ext.endsWith('x') })]
    default:
      return []
  }
}

/** Breadcrumb segments for a slash-joined dir path ('' = root only). */
export function breadcrumbSegments(dir: string): Array<{ label: string; path: string }> {
  if (!dir) return []
  const parts = dir.split('/').filter(Boolean)
  return parts.map((label, i) => ({ label, path: parts.slice(0, i + 1).join('/') }))
}
