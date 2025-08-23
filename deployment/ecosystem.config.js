module.exports = {
  apps: [{
    name: 'elt-arena',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/elt-arena',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/elt-arena/error.log',
    out_file: '/var/log/elt-arena/out.log',
    log_file: '/var/log/elt-arena/combined.log',
    time: true,
    watch: false,
    ignore_watch: [
      'node_modules',
      '.git',
      'logs',
      'public/uploads'
    ],
    max_memory_restart: '1G',
    merge_logs: true,
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s'
  }]
}
