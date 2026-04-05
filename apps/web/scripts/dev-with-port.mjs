import net from 'node:net'
import { spawn } from 'node:child_process'

const parsePort = (value) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 65535 ? parsed : null
}

const isPortAvailable = (port) =>
  new Promise((resolve) => {
    const server = net.createServer()
    server.unref()
    server.on('error', () => resolve(false))
    server.listen({ port, host: '::' }, () => {
      server.close(() => resolve(true))
    })
  })

const pickPort = async () => {
  const requested = parsePort(process.env.WEB_PORT)
  if (requested) {
    return requested
  }

  const candidates = [3000, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010]

  for (const port of candidates) {
    if (await isPortAvailable(port)) {
      return port
    }
  }

  return 3011
}

const port = await pickPort()
console.log(`[web] starting dev server on port ${port}`)

const child = spawn('next', ['dev', '-p', String(port)], {
  stdio: 'inherit',
  env: { ...process.env }
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})
