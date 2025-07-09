# Satoxcoin Showcase

Welcome to the **Satoxcoin Showcase** – the official community project gallery! 🚀

## 🎯 What is Satoxcoin Showcase?

Satoxcoin Showcase is a **community project gallery** that displays community projects. When you submit your project here, it will be reviewed and added to our showcase page with:

- 📸 **Screenshots** and previews
- 🏷️ **Categorization** based on your project type
- 🔍 **Quality validation** and security scanning
- 🌟 **Community features** like starring and comments
- 📊 **Analytics** and usage tracking

---

## 🚀 How to Submit Your Project

1. **Fork this repository**  
   ```bash
   git clone https://github.com/satoverse/satoxcoin-showcase.git
   cd satoxcoin-showcase
   ```

2. **Create your project directory**  
   ```bash
   mkdir -p projects/YOUR_GITHUB_USERNAME/YOUR_PROJECT_NAME
   cd projects/YOUR_GITHUB_USERNAME/YOUR_PROJECT_NAME
   ```

3. **Add your project files**  
   - Your project code (or a link to an external repository)
   - `README.md` – Project description and documentation
   - `project.json` – Project metadata (see template below)
   - Screenshots (optional, recommended)
   - Demo video (optional)

4. **Fill out your `project.json`**  
   Copy the template below and edit all fields to match your project.  
   - The `repository` field is **optional** (leave empty or omit if you don't have a public repo).
   - The `satox_sdks` field is **optional** (leave empty array if not using Satox SDKs).
   - Use the `preview.live_demo` field for a live site/demo.

   ```json
   {
     "id": "your-github-username/your-project",
     "name": "SATOX Project",
     "description": "Something cool",
     "author": {
       "username": "user-github-username",
       "name": "Satox Team",
       "avatar": "",
       "homepage": "https://link-to-live-demo-if-you-have.com"
     },
     "category": "game",
     "tags": ["fps", "ntf"],
     "satox_sdks": [],
     "repository": "",
     "license": "MIT",
     "version": "1.0.0",
     "last_updated": "2024-07-09T10:00:00Z",
     "preview": {
       "screenshot": "",
       "video": "",
       "live_demo": ""
     },
     "featured": false,
     "verified": false,
     "status": "active",
     "language": "JavaScript"
   }
   ```

5. **Submit your project**  
   ```bash
   git add .
   git commit -m "Add project: Your Project Name"
   git push origin main
   ```
   Then open a pull request to this repository.

6. **Review Process**  
   Your project will be manually reviewed by the community maintainers. This includes:
   - Quality and security checks
   - Documentation review
   - Screenshot generation (if needed)
   - Categorization and tagging

---

## 📝 Project Requirements

- **Open Source or Live Demo:** Either a public repo or a live demo is required
- **README:** Must include usage instructions
- **License:** Must have an open source license
- **No Malware:** Projects will be scanned for security issues
- **Size Limit:** Project size under 100MB
- **Satox SDK Usage:** Optional - projects can use Satox SDKs or other technologies

---

## 🌟 Community Features

- ⭐ Star projects
- 💬 Comments and feedback
- 🔄 Fork tracking
- 📊 Usage analytics
- 👤 GitHub avatar integration (auto-fetched if not provided)

---

## 📚 Resources

- [Templates](./project.json.template)
- [Example projects](./projects/)
- [API Reference](./docs/api/)
- [Discord](https://discord.com/invite/GFZYFuuHVq)

---

## 🚀 Ready to Showcase Your Project?

Start building amazing projects and share them with the world!

- **GitHub:** https://github.com/satoverse/
- **Discord:** https://discord.com/invite/GFZYFuuHVq
- **X(Twitter):** https://x.com/Satoverse_io
- **Website:** https://www.satoverse.io

---

*Built with ❤️ by the Satoxcoin community* 
