# MISZU Workflow - Local Development Setup Script
# Powered by PowerShell Core 7+

param(
    [switch]$SkipInstall,
    [switch]$DevMode,
    [switch]$CleanInstall
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# ===== CONFIG =====
$ProjectName = "MISZU Workflow"
$NodeVersion = "20"
$RequiredTools = @("node", "npm", "git")

# ===== COLORS =====
function Write-Cyan { param($Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Green { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Yellow { param($Message) Write-Host $Message -ForegroundColor Yellow }
function Write-Red { param($Message) Write-Host $Message -ForegroundColor Red }
function Write-Magenta { param($Message) Write-Host $Message -ForegroundColor Magenta }

# ===== BANNER =====
function Show-Banner {
    Write-Host ""
    Write-Cyan    "  ███╗   ███╗██╗███████╗███████╗██╗   ██╗"
    Write-Magenta "  ████╗ ████║██║██╔════╝╚══███╔╝██║   ██║"
    Write-Cyan    "  ██╔████╔██║██║███████╗  ███╔╝ ██║   ██║"
    Write-Magenta "  ██║╚██╔╝██║██║╚════██║ ███╔╝  ██║   ██║"
    Write-Cyan    "  ██║ ╚═╝ ██║██║███████║███████╗╚██████╔╝"
    Write-Magenta "  ╚═╝     ╚═╝╚═╝╚══════╝╚══════╝ ╚═════╝ "
    Write-Host ""
    Write-Cyan "  🚀 WORKFLOW BUILDER - Local Development Setup"
    Write-Yellow "  ⚡ LAN-first · Agent-driven · Node-based"
    Write-Host ""
}

# ===== CHECKS =====
function Test-Command {
    param($Command)
    return $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Test-Requirements {
    Write-Cyan "🔍 Checking requirements..."
    
    $missing = @()
    foreach ($tool in $RequiredTools) {
        if (Test-Command $tool) {
            Write-Green "  ✓ $tool found"
        } else {
            Write-Red "  ✗ $tool not found"
            $missing += $tool
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Red ""
        Write-Red "❌ Missing required tools: $($missing -join ', ')"
        Write-Yellow ""
        Write-Yellow "Please install:"
        Write-Yellow "  - Node.js $NodeVersion+ : https://nodejs.org/"
        Write-Yellow "  - Git                  : https://git-scm.com/"
        exit 1
    }
    
    # Check Node version
    $nodeVersion = node --version
    Write-Green "  ✓ Node.js version: $nodeVersion"
    
    Write-Green ""
    Write-Green "✅ All requirements satisfied!"
    Write-Host ""
}

# ===== CLEAN =====
function Clear-Installation {
    Write-Yellow "🧹 Cleaning previous installation..."
    
    $foldersToRemove = @("node_modules", ".next", "dist", "build")
    foreach ($folder in $foldersToRemove) {
        if (Test-Path $folder) {
            Write-Yellow "  Removing $folder..."
            Remove-Item -Recurse -Force $folder
        }
    }
    
    $filesToRemove = @("package-lock.json", "yarn.lock", "pnpm-lock.yaml")
    foreach ($file in $filesToRemove) {
        if (Test-Path $file) {
            Write-Yellow "  Removing $file..."
            Remove-Item -Force $file
        }
    }
    
    Write-Green "✓ Clean completed"
    Write-Host ""
}

# ===== INSTALL =====
function Install-Dependencies {
    Write-Cyan "📦 Installing dependencies..."
    Write-Yellow "  This may take a few minutes..."
    Write-Host ""
    
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Red ""
        Write-Red "❌ npm install failed!"
        exit 1
    }
    
    Write-Green ""
    Write-Green "✅ Dependencies installed successfully!"
    Write-Host ""
}

# ===== INSTALL MISSING PACKAGES =====
function Install-MissingPackages {
    Write-Cyan "📦 Checking for missing packages..."
    
    $requiredPackages = @(
        "@radix-ui/react-toast",
        "@radix-ui/react-tooltip",
        "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-tabs",
        "lucide-react",
        "class-variance-authority",
        "clsx",
        "tailwind-merge",
        "tailwindcss-animate"
    )
    
    $devPackages = @(
        "tailwindcss",
        "postcss",
        "autoprefixer",
        "typescript",
        "@types/node",
        "@types/react",
        "@types/react-dom"
    )
    
    Write-Yellow "  Installing production packages..."
    npm install @radix-ui/react-toast @radix-ui/react-tooltip @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs lucide-react class-variance-authority clsx tailwind-merge tailwindcss-animate
    
    Write-Yellow "  Installing dev packages..."
    npm install -D tailwindcss postcss autoprefixer typescript @types/node @types/react @types/react-dom
    
    Write-Green "✓ Packages installed"
    Write-Host ""
}

# ===== ENV SETUP =====
function Setup-Environment {
    Write-Cyan "⚙️  Setting up environment..."
    
    if (!(Test-Path ".env.local")) {
        Write-Yellow "  Creating .env.local..."
        @"
# MISZU Workflow - Local Environment
# Auto-generated by setup script

# App Config
NEXT_PUBLIC_APP_NAME=MISZU Workflow
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_VOICE=true
NEXT_PUBLIC_ENABLE_LOCAL_STORAGE=true
NEXT_PUBLIC_ENABLE_CLOUD_SYNC=false

# Development
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# AI/Genkit (Optional - for AI features)
# GOOGLE_API_KEY=your_api_key_here
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
        Write-Green "  ✓ .env.local created"
    } else {
        Write-Yellow "  .env.local already exists, skipping..."
    }
    
    Write-Host ""
}

# ===== ASSETS =====
function Initialize-Assets {
    Write-Cyan "🎨 Initializing assets..."
    
    # Create public directory if it doesn't exist
    if (!(Test-Path "public")) {
        New-Item -ItemType Directory -Path "public" | Out-Null
    }
    
    # Create placeholder for workflow templates
    $templatesDir = "public/templates"
    if (!(Test-Path $templatesDir)) {
        New-Item -ItemType Directory -Path $templatesDir | Out-Null
        Write-Yellow "  Created templates directory"
    }
    
    # Create README in templates
    @"
# Workflow Templates

Place workflow template JSON files here.

Example structure:
```json
{
  "id": "template-1",
  "name": "Simple HTTP Workflow",
  "description": "Basic HTTP trigger with response",
  "nodes": [...],
  "edges": [...]
}
```
"@ | Out-File -FilePath "$templatesDir/README.md" -Encoding UTF8
    
    Write-Green "✓ Assets initialized"
    Write-Host ""
}

# ===== BUILD CHECK =====
function Test-Build {
    Write-Cyan "🔨 Testing build..."
    
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Red ""
        Write-Red "❌ Build failed!"
        Write-Yellow "Check the error messages above and fix any issues."
        exit 1
    }
    
    Write-Green ""
    Write-Green "✅ Build successful!"
    Write-Host ""
}

# ===== NETWORK INFO =====
function Show-NetworkInfo {
    Write-Cyan "🌐 Network Information:"
    Write-Host ""
    
    # Get local IP
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet*","Wi-Fi*" | 
                Where-Object { $_.IPAddress -notlike "169.254.*" } | 
                Select-Object -First 1).IPAddress
    
    if ($localIP) {
        Write-Yellow "  Local IP: $localIP"
        Write-Cyan "  LAN URL:  http://${localIP}:3000"
    } else {
        Write-Yellow "  Could not detect local IP"
    }
    
    Write-Cyan "  Local:    http://localhost:3000"
    Write-Host ""
}

# ===== START DEV SERVER =====
function Start-DevServer {
    Write-Green "🚀 Starting development server..."
    Write-Host ""
    Write-Cyan "  Press Ctrl+C to stop the server"
    Write-Host ""
    
    Show-NetworkInfo
    
    # Use LAN mode for network access
    npm run dev:lan
}

# ===== INFO =====
function Show-Info {
    Write-Host ""
    Write-Cyan "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Green "  📚 MISZU Workflow - Quick Start Guide"
    Write-Cyan "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host ""
    Write-Yellow "  Available Commands:"
    Write-Host   "    npm run dev          - Start dev server (localhost only)"
    Write-Host   "    npm run dev:lan      - Start dev server (LAN accessible)"
    Write-Host   "    npm run build        - Build for production"
    Write-Host   "    npm run start        - Start production server"
    Write-Host ""
    Write-Yellow "  Features:"
    Write-Host   "    ✨ Voice Agent       - Speak or type to create workflows"
    Write-Host   "    💾 Local Storage     - All data saved in browser"
    Write-Host   "    🎨 Cyber Theme       - Futuristic neon design"
    Write-Host   "    🔧 Node Canvas       - Visual workflow builder"
    Write-Host ""
    Write-Yellow "  Local URLs:"
    Write-Host   "    http://localhost:3000"
    
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet*","Wi-Fi*" | 
                Where-Object { $_.IPAddress -notlike "169.254.*" } | 
                Select-Object -First 1).IPAddress
    if ($localIP) {
        Write-Host "    http://${localIP}:3000 (LAN)"
    }
    
    Write-Host ""
    Write-Cyan "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host ""
}

# ===== MAIN =====
function Main {
    Show-Banner
    
    # Check requirements
    Test-Requirements
    
    # Clean install
    if ($CleanInstall) {
        Clear-Installation
    }
    
    # Install dependencies
    if (!$SkipInstall) {
        Install-Dependencies
        Install-MissingPackages
    }
    
    # Setup environment
    Setup-Environment
    
    # Initialize assets
    Initialize-Assets
    
    # Show info
    Show-Info
    
    # Start dev server if in dev mode
    if ($DevMode) {
        Start-DevServer
    } else {
        Write-Green "✅ Setup complete!"
        Write-Host ""
        Write-Yellow "To start the development server, run:"
        Write-Cyan "  npm run dev:lan"
        Write-Host ""
    }
}

# ===== RUN =====
try {
    Main
} catch {
    Write-Red ""
    Write-Red "❌ Setup failed with error:"
    Write-Red $_.Exception.Message
    Write-Host ""
    exit 1
}
