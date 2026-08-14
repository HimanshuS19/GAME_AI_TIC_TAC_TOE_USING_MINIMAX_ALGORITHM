# Nexus Tic-Tac-Toe AI Suite ⚡

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.8+](https://img.shields.io/badge/Python-3.8+-brightgreen.svg)](https://www.python.org/)
[![UI: Cyberpunk Glassmorphism](https://img.shields.io/badge/UI-Cyberpunk%20Glassmorphism-cyan.svg)](#-web-interface-showcase)
[![Algorithm: Unbeatable Minimax](https://img.shields.io/badge/AI-Unbeatable%20Minimax-magenta.svg)](#-minimax-algorithm--mathematical-formulation)

An advanced Tic-Tac-Toe Artificial Intelligence project featuring an **unbeatable Minimax decision tree algorithm**, **real-time AI move heatmaps**, **autonomous AI vs AI simulations**, a **cyberpunk glassmorphism Web UI**, and a **desktop Pygame GUI**.
---

## 📸 Web Interface Showcase

![Nexus Tic-Tac-Toe AI Interface](assets\screenshot.png)

*The Nexus Tic-Tac-Toe Web App interface featuring real-time AI move heatmaps, dark glassmorphism design, move history logging, and live game mode switching.*

---

## 📜 Table of Contents

- [🌟 Core Features](#-core-features)
- [🕹️ Game Modes Breakdown](#️-game-modes-breakdown)
- [🧠 Minimax Algorithm & Mathematical Formulation](#-minimax-algorithm--mathematical-formulation)
- [🔮 Real-Time AI Heatmap Engine](#-real-time-ai-heatmap-engine)
- [🔊 Web Audio API Synthesizer](#-web-audio-api-synthesizer)
- [📁 Repository Architecture](#-repository-architecture)
- [🚀 Quick Start Guide](#-quick-start-guide)
  - [1. Web Interface (Browser)](#1-web-interface-browser)
  - [2. Desktop Pygame GUI](#2-desktop-pygame-gui)
  - [3. Terminal CLI](#3-terminal-cli)
- [🧪 Testing & Verification](#-testing--verification)
- [🤝 Contributing & License](#-contributing--license)
---

## 🌟 Core Features

- 🧠 **Unbeatable Minimax Decision Tree**: Evaluates every possible future state recursively. Guarantees optimal play—at best you can tie, but the AI will never lose.
- 🔮 **Real-Time AI Evaluation Heatmap**: Calculates and displays numerical evaluation badges (`+10`, `0`, `-10`) over empty board cells to reveal the AI's move rating before clicking.
- 🎨 **Futuristic Cyberpunk Glassmorphism UI**: Built with HTML5, CSS3 backdrop filters, neon glowing elements (`#00f2fe` Cyan for Player X, `#ff007f` Magenta for Player O), particle background animations, and an SVG win-line overlay.
- 🔊 **Synthesized Audio Engine**: Native Web Audio API sound synthesis providing move ticks, victory fanfares, and tie sound effects without external MP3 dependencies.
- 📊 **Dynamic Scoreboard & Streak Tracking**: Live tracking for Wins, Losses, Draws, and active win streaks.
- ↩️ **Undo & Replay Stack**: Jump back and re-evaluate moves at any stage in the game.
- 🖥️ **60 FPS Pygame Desktop GUI**: Alternative desktop GUI application built in Python (`gui.py`).

---

## 🕹️ Game Modes Breakdown

| Mode | Icon | Description | AI Engine | Difficulty |
| :--- | :---: | :--- | :--- | :--- |
| **Human vs Minimax** | 🤖 | Play against the optimal recursive Minimax algorithm. | Minimax (Full Depth) | 🔴 Unbeatable |
| **Human vs Random AI** | 🎲 | Casual mode playing against random valid moves. | Uniform Random | 🟢 Easy |
| **Human vs Smart AI** | 🧠 | Balanced match mixing optimal (75%) and heuristic moves (25%). | Hybrid Minimax | 🟡 Medium |
| **Human vs Human** | 👥 | Local 2-Player pass & play mode on the same device. | Manual Input | ⚪ N/A |
| **AI vs AI Simulation** | ⚔️ | Watch two AI engines battle autonomously with speed control (100ms–1500ms). | Minimax / Random | ⚙️ Automated |

---

## 🧠 Minimax Algorithm & Mathematical Formulation

### 1. Decision Tree Search Space
Tic-Tac-Toe has a total search space of $9! = 362,880$ states (reduced to $255,168$ reachable terminal boards). Because the tree depth is small ($\le 9$), Minimax evaluates the full game tree in milliseconds.

```
                  Root Board State (Turn 0)
                          /   |   \
                         /    |    \
                     Move 0 Move 1 Move 2
                      /       |       \
                   State 1  State 2  State 3
                    /   \     /   \    /   \
                  ...   ...  ...  ... ...  ...
                  /       \  /      \ /      \
               Terminal States (Win / Lose / Draw)
```

### 2. Mathematical Utility Function
Terminal states are evaluated using depth-weighted scoring to favor earlier wins and delayed losses:

$$V(s) = \begin{cases} +(N_{\text{empty}} + 1) & \text{if AI wins} \\ -(N_{\text{empty}} + 1) & \text{if Opponent wins} \\ 0 & \text{if Draw} \end{cases}$$

Where $N_{\text{empty}}$ represents the count of remaining empty squares on the board.

### 3. Minimax Value Function
For any state $s$ and player $p \in \{\text{AI}, \text{Human}\}$:

$$\text{Minimax}(s, p) = \begin{cases} 
V(s) & \text{if } s \text{ is terminal} \\ 
\max_{m \in A(s)} \text{Minimax}(\text{Result}(s, m), p_{\text{other}}) & \text{if } p = \text{AI (Maximizer)} \\ 
\min_{m \in A(s)} \text{Minimax}(\text{Result}(s, m), p_{\text{other}}) & \text{if } p = \text{Human (Minimizer)} 
\end{cases}$$

Where $A(s)$ is the set of available moves in state $s$, and $\text{Result}(s, m)$ is the resulting board state after executing move $m$.

---

## 🔮 Real-Time AI Heatmap Engine

When enabled, the UI executes `MinimaxAI.evaluateAllMoves()` prior to rendering. Each empty cell receives a score badge:

- **🟢 Best Move Badge (`+10` / `0`)**: Highest evaluated score among available moves (highlighted in glowing green).
- **🟡 Neutral / Draw Badge (`0`)**: Moves that guarantee a draw under optimal play.
- **🔴 Suboptimal Badge (`-10`)**: Moves that allow the opponent to force a win.

---

## 🔊 Web Audio API Synthesizer

The web app utilizes non-blocking browser AudioContext frequency generation:
- **Player X Move**: Sine wave frequency sweep from $440\text{Hz}$ to $880\text{Hz}$ over $80\text{ms}$.
- **Player O Move**: Sine wave frequency sweep from $330\text{Hz}$ to $220\text{Hz}$ over $80\text{ms}$.
- **Victory Fanfare**: Triangle wave C-Major arpeggio ($C_5 \rightarrow E_5 \rightarrow G_5 \rightarrow C_6$).
- **Draw Sound**: Descending sawtooth wave ($300\text{Hz} \rightarrow 150\text{Hz}$).

---

## 📁 Repository Architecture

```
Game_AI Project/
├── index.html        # Web Application Layout & DOM Structure
├── styles.css        # Cyberpunk Glassmorphism UI & Animations
├── app.js            # JavaScript Minimax Engine & Web Audio Controller
├── gui.py            # Desktop Pygame Graphical Interface
├── main.py           # Interactive Command Line (CLI) Menu
├── game.py           # Core Game Logic & Win Condition Checker
├── board.py          # Board State Data Model
├── minimax.py        # Python Minimax Algorithm Implementation
├── player.py         # Player Base Class, HumanPlayer, & RandomAI
├── test.py           # Unit Testing Script for AI Execution
├── assets/
│   ├── screenshot.png # Web App UI Screenshot
│   ├── bg.png        # Background Artwork
│   └── icon.ico      # Window Application Icon
├── requirements.txt  # Python Dependencies (Pygame)
└── README.md         # Full Project Documentation
```

---

## 🚀 Quick Start Guide

### 1. Web Interface (Browser)

#### Option A: Direct Open (Easiest)
Double-click `index.html` in your file explorer, or open it in your browser:
```text
file:///C:/Users/HP/OneDrive/Desktop/Game_AI%20Project/index.html
```

#### Option B: Local HTTP Server
Run Python's built-in HTTP server:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

> [!NOTE]
> *If using PowerShell, do not type `html index.html` as `html` is not a command. Use `Start-Process index.html` or double-click the file.*

---

### 2. Desktop Pygame GUI

Install dependencies and run `gui.py`:

```bash
# 1. Install required packages
pip install -r requirements.txt

# 2. Run Pygame GUI
python gui.py
```

---

### 3. Terminal CLI

Run the command-line interface:

```bash
python main.py
```

Follow the menu prompts:
```text
==============================
      TIC TAC TOE AI
==============================
1. Human vs Human
2. Human vs Random AI
3. Human vs Minimax AI
4. Random AI vs Minimax AI
5. Minimax AI vs Minimax AI
==============================
Enter your choice: 3
```

---

## 🧪 Testing & Verification

Run the Python unit test script to verify AI logic:

```bash
python test.py
```

Output:
```text
Available moves: [0, 1, 2, 3, 4, 5, 6, 7, 8]
Random AI (O) chooses 7
AI selected: 7
```

---

## 🤝 Contributing & License

Contributions, issues, and feature requests are welcome!
Distributed under the **MIT License**. Created for AI Pair Programming and Game Theory Demonstrations.