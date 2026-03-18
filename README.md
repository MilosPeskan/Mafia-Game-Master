# 🎭 Mafia Game Master

> A comprehensive web-based moderator tool for playing the classic Mafia (Werewolf) party game with custom roles and night phase automation.

## 📖 About

**Mafia Game Master** is a browser-based application that streamlines the traditional Mafia party game by acting as an automated moderator. The app manages complex night phases, tracks player statuses, handles role-specific actions, and determines win conditions — all while maintaining the mystery and social deduction elements that make Mafia exciting.

Perfect for groups of 8-20 players who want to focus on strategy and deduction without the burden of manual game tracking.

---

## ✨ Features

### 🎮 Game Management
- **Dynamic Player Setup** (8-20 players)
  - Name sanitization and validation
  - Automatic role assignment with shuffling
  - Unique player icons

- **32 Unique Roles** with diverse abilities
  - Town roles (Detective, Doctor, Sheriff, etc.)
  - Mafia roles (Godfather, Consigliere, etc.)
  - Neutral roles (Jester, Executioner, Serial Killer, etc.)

### 🌙 Advanced Night Phase System
- **Automated Wake Order** based on role priority
- **Status Tracking** (protected, attacked, blocked, silenced, etc.)
- **Multi-layered Interactions**
  - Bodyguard protection vs. Mafia attacks
  - Reporter recording attacks
  - Escort blocking actions

### 🗳️ Lynch Phase
- **Vote Tracking System**
- **Tie Resolution**
- **Win Condition Checks** (Jester, Executioner)

---

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)
- No installation required!

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/MilosPeskan/mafia-game-master.git
   cd mafia-game-master
   ```

2. Open `index.html` in your browser:
   ```bash
   # Option 1: Double-click index.html
   
   # Option 2: Use a local server (recommended)
   python -m http.server 8000
   # Then navigate to http://localhost:8000
   ```

3. Start playing!

---

## 🎯 How to Play

### Setup Phase
1. **Add Players** - Enter 8-20 player names
2. **Select Roles** - Choose roles to include in the game
3. **Reveal Roles** - Each player privately views their role

### Game Phase
1. **Night Phase**
   - Moderator wakes each role in order
   - Players perform their night actions
   - Actions are automatically calculated

2. **Day Phase**
   - Players discuss and vote
   - Moderator tracks votes
   - Results are automatically processed

3. **Win Condition**
   - Town wins when all Mafia are eliminated
   - Mafia wins when they equal or outnumber Town
   - Neutrals have unique win conditions

---

### Technologies
- **Vanilla JavaScript (ES6+)** - No frameworks, pure JS
- **CSS Grid & Flexbox** - Responsive layouts
- **CSS Custom Properties** - Dynamic theming
- **Module System** - ES6 imports/exports

---

## 🎭 Supported Roles (32)

### 🏘️ Town Roles
- **Detective** - Investigate a player's alignment
- **Doctor** - Protect a player from attacks
- **Bodyguard** - Die in place of your target
- **Sheriff** - Kill a player you suspect is evil
- **Escort** - Block a player's action
- **Tracker** - See who a player visited
- **Reporter** - Record attacks on camera
- **Prosecutor** - Extra lynch vote
- **Judge** - Save one player from lynch
- **Mayor** - Revealed town leader
- **Townsperson** - No special ability

### 🔫 Mafia Roles
- **Godfather** - Mafia leader, immune to detection
- **Consigliere** - Investigate target's exact role
- **Janitor** - Hide victim's role
- **Blackmailer** - Silence a player
- **Forger** - Falsify a will
- **Poisoner** - Delayed kill
- **Sniper** - Day-kill ability
- **Regular Mafia** - Standard mafia member

### ⚡ Neutral Roles
- **Serial Killer** - Kill each night, win alone
- **Arsonist** - Douse and ignite players
- **Jester** - Win by getting lynched
- **Executioner** - Get specific target lynched
- **Witch** - Hex and kill a player
- **Amnesiac** - Remember a dead player's role
- **Survivor** - Survive to the end
- **Visitor** - Mark players, special win condition
- **Parasite** - Steal another player's role
- **Jailor** - Lock up and interrogate players

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Reporting Bugs
1. Check existing [Issues](https://github.com/MilosPeskan/mafia-game-master/issues)
2. Create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)

### Suggesting Features
- Open an issue with the `enhancement` label
- Describe the feature and use case
- Explain how it improves gameplay

---

## 🗺️ Roadmap

### Version 1.1 (Current)
- [x] 32 unique roles
- [x] Night phase automation
- [x] Lynch voting system
- [x] Mobile responsive design

### Version 1.2 (In Progress)
- [ ] Sound effects & background music
- [ ] Lynch and day discussion timer
- [ ] Game history & statistics

### Version 2.0 (Planned)
- [ ] Custom role creator


## 🙏 Acknowledgments

- Inspired by the classic Mafia/Werewolf party game
- Role mechanics adapted from Town of Salem
- Special thanks to all playtesters and contributors

---

## 🎮 Live Demo

Try it out: **[Play Now](https://milospeskan.github.io/Mafia-Game-Master/)** *(GitHub Pages)*

---

<div align="center">

**Made with ❤️ for party game enthusiasts**

⭐ Star this repo if you enjoy playing Mafia! ⭐

</div>
