#!/bin/bash
USER=root
HOST=139.196.47.35

bun run build || exit 1

ssh $USER@$HOST << 'EOF'
  if pm2 list | grep -q "aurora-bot"; then
    pm2 stop aurora-bot;
  fi
EOF

scp -r ./build/* $USER@$HOST:/workspace/aurora-bot/
scp -r ./build/.env* $USER@$HOST:/workspace/aurora-bot/

ssh $USER@$HOST << 'EOF'
  cd /workspace/aurora-bot;
  bun i;
  if pm2 list | grep -q "aurora-bot"; then
    pm2 restart aurora-bot;
  else
    pm2 start --name aurora-bot "cd /workspace/aurora-bot; bun run start";
    pm2 save
  fi
EOF
