# Satoxcoin Stream Donation Overlay

A production-ready donation overlay system for Satoxcoin streams with real-time alerts and OBS integration.

## 🎯 Features

### Real-time Alerts
- **Instant notifications** when donations are received
- **Address privacy** - shows "S8f3**** donated 150.00 SATOX!"
- **Customizable minimum amounts**
- **Sound effects** with volume control

### OBS Integration
- **Browser Source compatible** with all streaming software
- **Responsive design** (600x300px)
- **Cross-platform** - works on Windows, Mac, Linux
- **No external dependencies** - pure HTML/CSS/JS

### Security & Privacy
- **Local RPC connection** - no external services
- **Address obfuscation** for donor privacy
- **Secure authentication** with RPC credentials
- **No data collection** - everything stays local

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Settings
Edit `wallet_monitor.py`:
```python
DONATION_ADDRESS = "YOUR_DONATION_ADDRESS"
MIN_DONATION = 1.0
```

### 3. Set Up Satox Core RPC
Create `satoxcoin.conf` in your Satox data directory:
```
server=1
rpcuser=your_username
rpcpassword=your_rpc_password
rpcallowip=127.0.0.1
rpcport=7777
```

### 4. Test the Setup
```bash
python3 -m http.server 8080
# Visit http://localhost:8080/demo.html
```

### 5. Start Monitoring
```bash
python3 wallet_monitor.py
```

### 6. Add to OBS
1. Add **Browser Source** in OBS
2. URL: `http://localhost:8080/alert.html`
3. Width: 600px, Height: 300px
4. Enable "Control audio via OBS" (optional)

## 🪟 Windows Setup

### Quick Windows Setup
1. **Extract files** to a folder
2. **Run setup**: Double-click `setup-windows.bat`
3. **Configure**: Edit `wallet_monitor.py` with your settings
4. **Test**: Double-click `start-demo.bat`
5. **Monitor**: Double-click `start-monitor.bat`

## 🎨 Customization

### Visual Customization
Edit CSS variables in `alert.html`:
```css
:root {
  --accent-color: #6366f1;    /* Primary color */
  --glow-color: #4a1a5f;      /* Glow effect */
  --logo-size: 80px;          /* Logo dimensions */
  --alert-duration: 5s;       /* Display time */
}
```

### Sound Customization
- Replace `coin.mp3` with your own sound file
- Adjust volume in the demo page
- Enable/disable audio in OBS settings

## 📁 File Structure

```
satoxcoin-stream-donation-overlay/
├── wallet_monitor.py          # Main monitoring script
├── alert.html                 # OBS overlay file
├── demo.html                  # Demo/test page
├── satox-logo.png            # Logo file
├── coin.mp3                  # Sound effect
├── requirements.txt           # Python dependencies
├── setup-windows.bat          # Windows setup script
├── start-monitor.bat          # Windows monitor script
├── start-demo.bat             # Windows demo script
└── README.md                  # This file
```

## 🔧 Configuration

### Monitor Settings
```python
# In wallet_monitor.py
MIN_DONATION = 1.0        # Minimum donation amount
DEBUG = False             # Enable debug logging
CHECK_INTERVAL = 30       # Check frequency (seconds)
```

## 🎮 Interactive Demo

The demo page provides a complete preview of how your donation alerts will look in OBS:

- **🎮 Trigger Demo Alert** - Simulates random donation alerts
- **📏 Change Logo Size** - Test different logo sizes
- **🎨 Change Accent Color** - Try different color themes
- **🖼️ Visual Preview** - See exactly how your OBS overlay will look
- **🎵 Sound Effects** - Test audio with coin.mp3 sound file

### Keyboard Shortcuts
- **Spacebar** - Trigger demo alert
- **S key** - Change logo size
- **C key** - Change accent color

## 🛠️ Troubleshooting

### Common Issues

**Python not found**
```bash
# Install Python with "Add to PATH" option
# Verify: python --version
```

**RPC connection failed**
```bash
# Check satoxcoin.conf settings
# Verify Satox Core is running
# Test: curl -u username:password http://127.0.0.1:7777
```

**Port already in use**
```bash
# Change port in wallet_monitor.py
# Or kill existing process using the port
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### 🐛 Reporting Issues
- Use the GitHub Issues page
- Include your operating system and Python version
- Provide error messages and logs

### 💡 Suggesting Features
- Open a Feature Request issue
- Describe the use case and benefits
- Include mockups if possible

### 🔧 Code Contributions
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Made with ❤️ for the Satoxcoin community**

- **GitHub**: https://github.com/satoverse/-satoxcoin-stream-donation-overlay
- **Documentation**: See the docs/ folder for detailed guides
- **Community**: Join our Discord for support and discussions 