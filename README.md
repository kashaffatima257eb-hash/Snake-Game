# 🐍 SnakeX

A modern take on the classic Snake game — built with vanilla HTML, CSS, and JavaScript (no frameworks, no libraries). Smooth canvas rendering, buffered controls, sound effects, and mobile support.

## 🎮 Play

Just open `index.html` in your browser — no build step, no dependencies.

For the best experience (especially for sound), run it through a local server instead of opening the file directly:

```bash
# Using VS Code
# Right-click index.html → "Open with Live Server"
```

## ✨ Features

- **Smooth canvas rendering** with a glowing snake and pulsing food animation
- **Buffered input queue** — quick key presses register correctly instead of causing accidental self-collisions
- **Pause / Resume** — via the on-screen button or the `Space` key, with a pause overlay drawn on the canvas
- **3 difficulty levels** — Easy, Medium, Hard (each with its own game speed)
- **Sound effects** — an eat sound and a retro 8-bit "death jingle" on game over, built with the Web Audio API (no audio files)
- **Sound toggle** — mute/unmute, saved across sessions
- **High score tracking** — persisted with `localStorage`, with a "New High Score" badge on game over
- **Touch controls** — swipe to play on mobile
- **Keyboard controls** — Arrow keys or WASD

## 🎯 Controls

| Action | Key |
|---|---|
| Move | `↑` `↓` `←` `→` or `W` `A` `S` `D` |
| Pause / Resume | `Space` |
| Move (mobile) | Swipe on the canvas |

## 🛠️ Tech Stack

- HTML5 Canvas for rendering
- Vanilla JavaScript (ES6+)
- CSS3 (custom properties, animations)
- Web Audio API for sound effects
- `localStorage` for high score and sound preference persistence

## 📁 Project Structure

```
Snake Game/
├── index.html      # Markup and game layout
├── style.css       # Styling and animations
├── script.js       # Game logic, rendering, controls, sound
└── README.md
```

## 🚀 Possible Future Additions

- Wrap-around walls mode
- Multiple food types with different point values
- Leaderboard / online high scores
- Themes (color palettes)

## 👤 Author

**Kashaf Fatima**
GitHub: [@kashaffatima257eb-hash](https://github.com/kashaffatima257eb-hash)
LinkedIn: [Kashaf Fatima](https://www.linkedin.com/in/kashaf-fatima-275442359)

## 📄 License

This project is open source and available for personal and educational use.
