#!/bin/bash
if [ -d ./build ]; then
  echo "Existing build folder found. Deleting..."
  rm -rf ./build
fi

mkdir build

# bun build ./src/index.ts --target=bun-linux-x64 --compile --outfile ./build/bot

# 设定 .env 的 build time
BUILD_TIME=$(date '+%Y-%m-%d %H:%M:%S')
echo "$BUILD_TIME" > ./build/build-info.txt

 # 将 .env 的VERSION小版本号+1
if [[ "$(uname)" == "Darwin" ]]; then
  VERSION=$(awk -F= '/^VERSION=/{print $2}' ./.env)
else
  VERSION=$(grep -oP '(?<=VERSION=)\d+\.\d+\.\d+' ./.env)
fi
VERSION_MAJOR=$(echo "$VERSION" | cut -d '.' -f 1)
VERSION_MINOR=$(echo "$VERSION" | cut -d '.' -f 2)
VERSION_PATCH=$(echo "$VERSION"  | cut -d '.' -f 3)
VERSION_PATCH=$((VERSION_PATCH + 1))
VERSION="$VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH"
if [[ "$(uname)" == "Darwin" ]]; then
  sed -i '' "s/VERSION=.*/VERSION=$VERSION/" ./.env
else
  sed -i "s/VERSION=.*/VERSION=$VERSION/" ./.env
fi
echo "New version: $VERSION"

ssh root@139.196.47.35 << 'EOF'
  if pm2 list | grep -q "aurora-bot"; then
    pm2 stop aurora-bot;
  fi
EOF

cp -r ./src ./build/src
cp -r ./package.json ./build/package.json
cp -r ./bun.lock ./build/bun.lock
cp -r ./tsconfig.json ./build/tsconfig.json
cp -r ./.env ./build/.env

echo -e "\nBUILD_TIME=$BUILD_TIME" >> ./build/.env

scp -r ./build/* root@139.196.47.35:/workspace/aurora-bot/
scp -r ./build/.env* root@139.196.47.35:/workspace/aurora-bot/

ssh root@139.196.47.35 << 'EOF'
  cd /workspace/aurora-bot;
  bun i;
  if pm2 list | grep -q "aurora-bot"; then
    pm2 restart aurora-bot;
  else
    pm2 start --name aurora-bot "cd /workspace/aurora-bot; bun src/index.ts";
    pm2 save
  fi
EOF
