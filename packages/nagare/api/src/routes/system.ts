import {
  getCpuStats,
  getDashboardStats,
  getDockerInfo,
  getMemoryStats,
  getMizuStatus,
  getSystemInfo,
  initializeMizu,
} from '@mizu/nagare-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const systemRoutes = new Elysia({ name: 'system', prefix: '/system' })
  .use(authPlugin)
  // 🐳 docker daemon details
  .get('/docker-info', { auth: true }, () => getDockerInfo())
  // 🖥 host system info
  .get('/info', { auth: true }, () => getSystemInfo())
  // 🧠 memory stats
  .get('/memory', { auth: true }, () => getMemoryStats())
  // ⚙ cpu stats
  .get('/cpu', { auth: true }, () => getCpuStats())
  // 🌊 mizu's own status
  .get('/mizu-status', { auth: true }, () => getMizuStatus())
  // 📊 aggregated dashboard numbers
  .get('/dashboard-stats', { auth: true }, () => getDashboardStats())
  // 🏗 create the ~/.mizu directory tree (side effect → POST)
  .post('/initialize', { auth: true }, () => initializeMizu())
