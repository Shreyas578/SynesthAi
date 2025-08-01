# 🎨 SynesthAI

SynesthAI is a multimodal AI platform that simulates cross-sensory perception—like seeing sounds or hearing colors—by converting audio, text, or images into creative outputs in other formats. Inspired by synesthesia, it helps artists, neurodiverse users, and creatives interact with information in unique and immersive ways.

---

## 🧠 Inspiration

The human brain processes sounds, visuals, and emotions in complex, interconnected ways. Inspired by the phenomenon of *synesthesia*—where people naturally "see" sounds or "hear" colors—we imagined a future where AI could simulate such cross-sensory perception to enhance creativity, accessibility, and interaction.

SynesthAI was born out of our desire to create an immersive, assistive tool that reimagines how humans interact with information—by blending sound, visuals, and emotion using AI.

---

## 🚀 What it does

SynesthAI is a multimodal AI platform that takes an **input in one sensory format** (e.g., audio, text, or image) and converts it into a **creative or assistive output** in another. Example features include:

- 🎨 Converting speech or text into expressive generative art  
- 🎵 Translating images or mood descriptions into background music  
- 🧘 Emotion-aware interfaces for stress detection and ambient response

---

## 🛠️ How we built it

- **Frontend**: React.js  
- **Backend**: Node.js + Flask  
- **AI Models**:  
  - Whisper for speech-to-text  
  - DALL·E or Stable Diffusion for text-to-image  
  - MusicGen or Riffusion for text-to-music  
  - Transformer models for sentiment/emotion analysis  
- **Cloud**: Vercel/Render + Firebase  

---

## 😅 Challenges we ran into

- Synchronizing audio-visual mappings that felt human and creative.  
- Handling multiple AI models and latency issues.  
- Balancing emotion recognition with accuracy and bias concerns.  

---

## 🌟 Accomplishments that we're proud of

- A working demo in under 48 hours.  
- True cross-sensory transformation (audio → image/music).  
- A fluid UI/UX that made AI creativity feel accessible.  

---

## 📚 What we learned

- Multimodal AI pipeline architecture.  
- Performance optimization for heavy models.  
- How to design emotionally intelligent interfaces.  

---

## 🔮 What’s next for SynesthAI

- Real-time webcam+voice emotion detection.  
- Export generated creations as NFTs or downloads.  
- Community gallery & remixing features.  
- Open source release for creative and assistive development.  

---

## 📸 Screenshots

_(Add your screenshots or demo gifs here)_

---

## 🧪 Try it out

```bash
# Clone the repo
git clone https://github.com/your-username/synesthai

# Navigate and install dependencies
cd synesthai/frontend
npm install

cd ../backend
pip install -r requirements.txt

# Run servers (example)
npm run dev
python app.py
