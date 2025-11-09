# Node.js Upgrade Guide

## Current Issue
- **Current Node.js Version**: 18.19.1
- **Required Version**: 20.19+ or 22.12+ (for Vite 7.0.4)
- **Recommended Version**: 20.19.0 (LTS)

## Upgrade Methods

### Method 1: Using NVM (Node Version Manager) - Recommended

NVM allows you to easily switch between Node.js versions.

#### Install NVM:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

Or using wget:
```bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

After installation, reload your shell:
```bash
source ~/.bashrc
# or
source ~/.zshrc
```

#### Install Node.js 20.19.0:
```bash
nvm install 20.19.0
nvm use 20.19.0
nvm alias default 20.19.0  # Set as default version
```

#### Verify installation:
```bash
node --version  # Should show v20.19.0
npm --version
```

#### Using .nvmrc file:
The project now includes an `.nvmrc` file. When you're in the project directory, simply run:
```bash
nvm use
```
This will automatically use the version specified in `.nvmrc`.

---

### Method 2: Using NodeSource Repository (Ubuntu/Debian)

#### Add NodeSource repository:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

#### Install Node.js 20:
```bash
sudo apt-get install -y nodejs
```

#### Verify installation:
```bash
node --version
npm --version
```

---

### Method 3: Using Snap (Ubuntu)

```bash
sudo snap install node --classic --channel=20
```

---

### Method 4: Download from Official Website

1. Visit: https://nodejs.org/
2. Download Node.js 20.x LTS for Linux
3. Extract and install:
   ```bash
   tar -xzf node-v20.19.0-linux-x64.tar.gz
   sudo mv node-v20.19.0-linux-x64 /opt/nodejs
   sudo ln -s /opt/nodejs/bin/node /usr/local/bin/node
   sudo ln -s /opt/nodejs/bin/npm /usr/local/bin/npm
   ```

---

## After Upgrading

1. **Verify Node.js version:**
   ```bash
   node --version
   ```
   Should show: `v20.19.0` or higher

2. **Reinstall dependencies:**
   ```bash
   cd /media/muller-king/New\ Volume/tcs
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## Troubleshooting

### If you have multiple Node.js installations:

Check which Node.js is being used:
```bash
which node
```

### If npm packages are missing:

After upgrading, you may need to reinstall global packages:
```bash
npm install -g npm@latest
```

### If you encounter permission issues:

Use `sudo` for system-wide installation, or better yet, use NVM which doesn't require sudo.

---

## Alternative: Downgrade Vite (Not Recommended)

If you cannot upgrade Node.js immediately, you could downgrade Vite to a version compatible with Node.js 18:

```bash
npm install vite@^5.4.0 --save-dev
```

However, this is **not recommended** as you'll miss out on Vite 7 features and improvements.

---

## Recommended Approach

**Use NVM (Method 1)** - It's the easiest way to manage Node.js versions and allows you to:
- Switch between versions easily
- Use different versions for different projects
- Avoid permission issues
- Automatically use the version specified in `.nvmrc`

