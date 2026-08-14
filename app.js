/* app.js - Full Minimax AI, Audio Synthesizer, AI Heatmap & Game Loop */

class TicTacToeEngine {
    constructor() {
        this.board = Array(9).fill(' ');
        this.currentWinner = null;
    }

    reset() {
        this.board = Array(9).fill(' ');
        this.currentWinner = null;
    }

    availableMoves() {
        const moves = [];
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === ' ') moves.push(i);
        }
        return moves;
    }

    emptySquares() {
        return this.board.includes(' ');
    }

    numEmptySquares() {
        return this.board.filter(spot => spot === ' ').length;
    }

    makeMove(square, letter) {
        if (this.board[square] === ' ') {
            this.board[square] = letter;
            if (this.checkWinner(square, letter)) {
                this.currentWinner = letter;
            }
            return true;
        }
        return false;
    }

    undoMove(square) {
        this.board[square] = ' ';
        this.currentWinner = null;
    }

    checkWinner(square, letter) {
        // Row check
        const rowInd = Math.floor(square / 3);
        const row = this.board.slice(rowInd * 3, (rowInd + 1) * 3);
        if (row.every(spot => spot === letter)) return true;

        // Column check
        const colInd = square % 3;
        const column = [this.board[colInd], this.board[colInd + 3], this.board[colInd + 6]];
        if (column.every(spot => spot === letter)) return true;

        // Diagonal checks
        if (square % 2 === 0) {
            const diag1 = [this.board[0], this.board[4], this.board[8]];
            if (diag1.every(spot => spot === letter)) return true;

            const diag2 = [this.board[2], this.board[4], this.board[6]];
            if (diag2.every(spot => spot === letter)) return true;
        }

        return false;
    }

    getWinningCombination() {
        const combos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (const combo of combos) {
            const [a, b, c] = combo;
            if (this.board[a] !== ' ' && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return combo;
            }
        }
        return null;
    }
}

/* Minimax Algorithm Engine (Exact match to Python implementation) */
class MinimaxAI {
    constructor(letter) {
        this.letter = letter;
        this.evaluatedNodes = 0;
    }

    getMove(engine) {
        this.evaluatedNodes = 0;
        const moves = engine.availableMoves();
        if (moves.length === 9) return 4; // Center square opening optimal strategy
        
        const result = this.minimax(engine, this.letter);
        return result.position;
    }

    // Evaluate all available moves and return scores for Heatmap visualization
    evaluateAllMoves(engine, playerLetter) {
        const moves = engine.availableMoves();
        const evaluations = {};
        
        for (const move of moves) {
            engine.makeMove(move, playerLetter);
            const otherPlayer = playerLetter === 'X' ? 'O' : 'X';
            
            // Analyze tree recursively
            const sim = this.minimaxHelper(engine, otherPlayer, playerLetter);
            evaluations[move] = sim.score;
            
            // Backtrack
            engine.undoMove(move);
        }
        return evaluations;
    }

    minimax(engine, player) {
        return this.minimaxHelper(engine, player, this.letter);
    }

    minimaxHelper(engine, player, maxPlayer) {
        this.evaluatedNodes++;
        const otherPlayer = player === 'X' ? 'O' : 'X';

        // Terminal state checks
        if (engine.currentWinner === otherPlayer) {
            return {
                position: null,
                score: otherPlayer === maxPlayer ? 1 * (engine.numEmptySquares() + 1) : -1 * (engine.numEmptySquares() + 1)
            };
        }

        if (!engine.emptySquares()) {
            return { position: null, score: 0 };
        }

        let best = player === maxPlayer 
            ? { position: null, score: -Infinity } 
            : { position: null, score: Infinity };

        for (const move of engine.availableMoves()) {
            engine.makeMove(move, player);
            const simScore = this.minimaxHelper(engine, otherPlayer, maxPlayer);
            engine.undoMove(move);

            simScore.position = move;

            if (player === maxPlayer) {
                if (simScore.score > best.score) best = simScore;
            } else {
                if (simScore.score < best.score) best = simScore;
            }
        }

        return best;
    }
}

/* Web Audio Synthesizer */
class SoundFx {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playMove(letter) {
        if (!this.enabled) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(letter === 'X' ? 440 : 330, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(letter === 'X' ? 880 : 220, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    playWin() {
        if (!this.enabled) return;
        this.init();
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.09);

            gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.09 + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime + idx * 0.09);
            osc.stop(this.ctx.currentTime + idx * 0.09 + 0.25);
        });
    }

    playTie() {
        if (!this.enabled) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.25);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }
}

/* UI Controller Application */
class App {
    constructor() {
        this.engine = new TicTacToeEngine();
        this.minimaxAI = new MinimaxAI('O');
        this.audio = new SoundFx();

        this.gameMode = 'hv-minimax'; // hv-minimax, hv-random, hv-medium, hvh, ai-vs-ai
        this.humanLetter = 'X';
        this.aiLetter = 'O';
        this.currentTurn = 'X';
        this.isGameOver = false;
        this.moveHistory = [];
        this.scores = { X: 0, O: 0, ties: 0 };
        this.streak = 0;
        this.showHeatmap = true;
        this.simSpeedMs = 600;
        this.simTimer = null;

        this.domCache();
        this.bindEvents();
        this.initParticles();
        this.updateUI();
    }

    domCache() {
        this.boardGrid = document.getElementById('boardGrid');
        this.cells = Array.from(document.querySelectorAll('.cell'));
        this.statusText = document.getElementById('statusText');
        this.statusBanner = document.getElementById('statusBanner');
        this.statusIndicator = this.statusBanner.querySelector('.status-indicator');
        
        this.scoreX = document.getElementById('scoreX');
        this.scoreO = document.getElementById('scoreO');
        this.scoreTies = document.getElementById('scoreTies');
        this.labelX = document.getElementById('labelX');
        this.labelO = document.getElementById('labelO');
        this.streakText = document.getElementById('streakText');

        this.undoBtn = document.getElementById('undoBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.resetStatsBtn = document.getElementById('resetStatsBtn');
        this.soundToggleBtn = document.getElementById('soundToggleBtn');
        this.soundIcon = document.getElementById('soundIcon');
        this.heatmapToggleBtn = document.getElementById('heatmapToggleBtn');

        this.playAsXBtn = document.getElementById('playAsX');
        this.playAsOBtn = document.getElementById('playAsO');
        this.simSpeedGroup = document.getElementById('simSpeedGroup');
        this.simSpeedSlider = document.getElementById('simSpeedSlider');
        this.speedValue = document.getElementById('speedValue');

        this.aiInsightText = document.getElementById('aiInsightText');
        this.treeDepthVal = document.getElementById('treeDepthVal');
        this.historyList = document.getElementById('historyList');

        this.winLineSvg = document.getElementById('winLineSvg');
        this.winLine = document.getElementById('winLine');
        this.winGradient = document.getElementById('winGradient');

        this.winModal = document.getElementById('winModal');
        this.modalIcon = document.getElementById('modalIcon');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalSub = document.getElementById('modalSub');
        this.modalPlayAgainBtn = document.getElementById('modalPlayAgainBtn');
    }

    bindEvents() {
        // Grid cell clicks
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const idx = parseInt(cell.dataset.index);
                this.handleCellClick(idx);
            });
        });

        // Mode Selectors
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                const target = e.currentTarget;
                target.classList.add('active');
                this.gameMode = target.dataset.mode;
                this.simSpeedGroup.classList.toggle('hidden', this.gameMode !== 'ai-vs-ai');
                this.resetGame();
            });
        });

        // Play As X or O
        this.playAsXBtn.addEventListener('click', () => {
            this.humanLetter = 'X';
            this.aiLetter = 'O';
            this.playAsXBtn.classList.add('active');
            this.playAsOBtn.classList.remove('active');
            this.resetGame();
        });

        this.playAsOBtn.addEventListener('click', () => {
            this.humanLetter = 'O';
            this.aiLetter = 'X';
            this.playAsOBtn.classList.add('active');
            this.playAsXBtn.classList.remove('active');
            this.resetGame();
        });

        // Sim Speed Slider
        this.simSpeedSlider.addEventListener('input', (e) => {
            this.simSpeedMs = parseInt(e.target.value);
            this.speedValue.textContent = `${this.simSpeedMs}ms`;
        });

        // Actions
        this.restartBtn.addEventListener('click', () => this.resetGame());
        this.modalPlayAgainBtn.addEventListener('click', () => {
            this.winModal.classList.remove('active');
            this.resetGame();
        });

        this.undoBtn.addEventListener('click', () => this.undoMove());
        this.resetStatsBtn.addEventListener('click', () => this.resetStats());

        // Toggles
        this.soundToggleBtn.addEventListener('click', () => {
            this.audio.enabled = !this.audio.enabled;
            this.soundIcon.textContent = this.audio.enabled ? '🔊' : '🔇';
            this.soundToggleBtn.classList.toggle('active', this.audio.enabled);
        });

        this.heatmapToggleBtn.addEventListener('click', () => {
            this.showHeatmap = !this.showHeatmap;
            this.heatmapToggleBtn.classList.toggle('active', this.showHeatmap);
            this.renderHeatmap();
        });
    }

    handleCellClick(index) {
        if (this.isGameOver) return;

        // Check turn permissions based on mode
        if (this.gameMode === 'hv-minimax' || this.gameMode === 'hv-random' || this.gameMode === 'hv-medium') {
            if (this.currentTurn !== this.humanLetter) return; // Wait for AI
        } else if (this.gameMode === 'ai-vs-ai') {
            return; // Managed by simulation loop
        }

        if (this.engine.makeMove(index, this.currentTurn)) {
            this.onMoveExecuted(index, this.currentTurn);

            if (!this.isGameOver && (this.gameMode.startsWith('hv-'))) {
                setTimeout(() => this.triggerAIMove(), 300);
            }
        }
    }

    onMoveExecuted(index, letter) {
        this.audio.playMove(letter);
        this.moveHistory.push({ square: index, letter });
        
        this.renderBoard();
        this.renderHistory();

        // Check Win/Tie
        if (this.engine.currentWinner) {
            this.handleGameEnd(this.engine.currentWinner);
        } else if (!this.engine.emptySquares()) {
            this.handleGameEnd('tie');
        } else {
            this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';
            this.updateStatusBanner();
            this.renderHeatmap();
        }

        this.undoBtn.disabled = this.moveHistory.length === 0 || this.isGameOver || this.gameMode === 'ai-vs-ai';
    }

    triggerAIMove() {
        if (this.isGameOver) return;

        let move;
        const currentAI = new MinimaxAI(this.currentTurn);

        if (this.gameMode === 'hv-random') {
            const moves = this.engine.availableMoves();
            move = moves[Math.floor(Math.random() * moves.length)];
        } else if (this.gameMode === 'hv-medium') {
            // 75% optimal, 25% random move
            if (Math.random() < 0.75) {
                move = currentAI.getMove(this.engine);
            } else {
                const moves = this.engine.availableMoves();
                move = moves[Math.floor(Math.random() * moves.length)];
            }
        } else {
            // Unbeatable Minimax
            move = currentAI.getMove(this.engine);
        }

        this.treeDepthVal.textContent = `${currentAI.evaluatedNodes} States Analyzed`;
        this.aiInsightText.textContent = `Minimax AI selected square ${move} after searching ${currentAI.evaluatedNodes} game tree branches.`;

        if (move !== undefined) {
            this.engine.makeMove(move, this.currentTurn);
            this.onMoveExecuted(move, this.currentTurn);

            if (this.gameMode === 'ai-vs-ai' && !this.isGameOver) {
                this.simTimer = setTimeout(() => this.triggerAIMove(), this.simSpeedMs);
            }
        }
    }

    handleGameEnd(result) {
        this.isGameOver = true;

        if (result === 'tie') {
            this.scores.ties++;
            this.streak = 0;
            this.audio.playTie();
            this.statusText.textContent = "🤝 Game Draw!";
            this.modalIcon.textContent = "🤝";
            this.modalTitle.textContent = "It's a Draw!";
            this.modalSub.textContent = "Neither player could find a winning tactic.";
        } else {
            this.scores[result]++;
            this.audio.playWin();

            if (result === this.humanLetter) {
                this.streak++;
                this.modalIcon.textContent = "🏆";
                this.modalTitle.textContent = "Victory!";
                this.modalSub.textContent = `Player ${result} defeated the opponent!`;
            } else if (this.gameMode.startsWith('hv-')) {
                this.streak = 0;
                this.modalIcon.textContent = "💀";
                this.modalTitle.textContent = "Defeat!";
                this.modalSub.textContent = `Minimax AI calculated an unbeatable path to victory.`;
            } else {
                this.modalIcon.textContent = "🎉";
                this.modalTitle.textContent = `Player ${result} Wins!`;
                this.modalSub.textContent = `Winning line established.`;
            }

            this.statusText.textContent = `🎉 Player ${result} Wins!`;
            this.drawWinLine();
        }

        this.updateScoreboard();
        this.renderHeatmap();

        setTimeout(() => {
            this.winModal.classList.add('active');
        }, 900);
    }

    drawWinLine() {
        const combo = this.engine.getWinningCombination();
        if (!combo) return;

        // Position coordinates for 300x300 SVG canvas
        const coords = [
            { x: 50, y: 50 },  { x: 150, y: 50 },  { x: 250, y: 50 },
            { x: 50, y: 150 }, { x: 150, y: 150 }, { x: 250, y: 150 },
            { x: 50, y: 250 }, { x: 150, y: 250 }, { x: 250, y: 250 }
        ];

        const start = coords[combo[0]];
        const end = coords[combo[2]];

        this.winLine.setAttribute('x1', start.x);
        this.winLine.setAttribute('y1', start.y);
        this.winLine.setAttribute('x2', end.x);
        this.winLine.setAttribute('y2', end.y);

        const winner = this.engine.board[combo[0]];
        if (winner === 'X') {
            this.winGradient.children[0].setAttribute('stop-color', '#00F2FE');
            this.winGradient.children[1].setAttribute('stop-color', '#4FACFE');
        } else {
            this.winGradient.children[0].setAttribute('stop-color', '#FF007F');
            this.winGradient.children[1].setAttribute('stop-color', '#7928CA');
        }

        this.winLineSvg.classList.add('active');
    }

    renderHeatmap() {
        this.boardGrid.classList.toggle('heatmap-active', this.showHeatmap && !this.isGameOver);

        if (!this.showHeatmap || this.isGameOver) {
            this.cells.forEach(c => {
                c.querySelector('.heatmap-score').textContent = '';
                c.querySelector('.heatmap-score').className = 'heatmap-score';
            });
            return;
        }

        const evals = this.minimaxAI.evaluateAllMoves(this.engine, this.currentTurn);
        let maxScore = -Infinity;
        for (const key in evals) {
            if (evals[key] > maxScore) maxScore = evals[key];
        }

        this.cells.forEach((cell, idx) => {
            const scoreBadge = cell.querySelector('.heatmap-score');
            if (this.engine.board[idx] === ' ' && evals[idx] !== undefined) {
                const s = evals[idx];
                let display = s > 0 ? `+${s}` : `${s}`;
                scoreBadge.textContent = display;
                scoreBadge.className = 'heatmap-score';

                if (s === maxScore) {
                    scoreBadge.classList.add('best-move');
                } else if (s === 0) {
                    scoreBadge.classList.add('tie-move');
                } else {
                    scoreBadge.classList.add('bad-move');
                }
            } else {
                scoreBadge.textContent = '';
                scoreBadge.className = 'heatmap-score';
            }
        });
    }

    renderBoard() {
        this.cells.forEach((cell, idx) => {
            const val = this.engine.board[idx];
            const contentSpan = cell.querySelector('.cell-content');
            contentSpan.textContent = val !== ' ' ? val : '';
            
            cell.className = 'cell';
            if (val === 'X') cell.classList.add('taken', 'cell-x');
            else if (val === 'O') cell.classList.add('taken', 'cell-o');
        });
    }

    renderHistory() {
        if (this.moveHistory.length === 0) {
            this.historyList.innerHTML = '<li class="history-empty">No moves yet. Start playing!</li>';
            return;
        }

        this.historyList.innerHTML = this.moveHistory.map((m, idx) => `
            <li class="history-item ${m.letter === 'X' ? 'player-x' : 'player-o'}">
                <span>Move ${idx + 1}: ${m.letter}</span>
                <span>Square ${m.square}</span>
            </li>
        `).reverse().join('');
    }

    updateStatusBanner() {
        this.statusIndicator.className = `status-indicator ${this.currentTurn === 'X' ? 'player-x-turn' : 'player-o-turn'}`;
        this.statusText.textContent = `Player ${this.currentTurn}'s Turn`;
    }

    updateScoreboard() {
        this.scoreX.textContent = this.scores.X;
        this.scoreO.textContent = this.scores.O;
        this.scoreTies.textContent = this.scores.ties;
        this.streakText.textContent = `Streak: ${this.streak}`;
    }

    undoMove() {
        if (this.moveHistory.length === 0 || this.isGameOver) return;

        // Undo 2 moves if in Human vs AI mode (undo human and AI move)
        const movesToUndo = (this.gameMode.startsWith('hv-') && this.moveHistory.length >= 2) ? 2 : 1;

        for (let i = 0; i < movesToUndo; i++) {
            const last = this.moveHistory.pop();
            if (last) {
                this.engine.undoMove(last.square);
            }
        }

        this.isGameOver = false;
        this.currentTurn = this.moveHistory.length % 2 === 0 ? 'X' : 'O';
        this.winLineSvg.classList.remove('active');
        this.winModal.classList.remove('active');
        
        this.renderBoard();
        this.renderHistory();
        this.updateStatusBanner();
        this.renderHeatmap();

        this.undoBtn.disabled = this.moveHistory.length === 0;
    }

    resetGame() {
        if (this.simTimer) clearTimeout(this.simTimer);
        this.engine.reset();
        this.isGameOver = false;
        this.moveHistory = [];
        this.currentTurn = 'X';

        this.winLineSvg.classList.remove('active');
        this.winModal.classList.remove('active');

        this.renderBoard();
        this.renderHistory();
        this.updateStatusBanner();
        this.renderHeatmap();
        this.undoBtn.disabled = true;

        this.aiInsightText.textContent = "Select a move. Minimax analyzes all potential game trees to ensure optimal defense and offense.";
        this.treeDepthVal.textContent = "N/A";

        // Check if AI plays first (e.g. Player O selected for Human, or AI vs AI mode)
        if (this.gameMode === 'ai-vs-ai') {
            this.simTimer = setTimeout(() => this.triggerAIMove(), this.simSpeedMs);
        } else if (this.gameMode.startsWith('hv-') && this.humanLetter === 'O') {
            setTimeout(() => this.triggerAIMove(), 400);
        }
    }

    resetStats() {
        this.scores = { X: 0, O: 0, ties: 0 };
        this.streak = 0;
        this.updateScoreboard();
    }

    updateUI() {
        this.labelX.textContent = this.gameMode.startsWith('hv-') && this.humanLetter === 'X' ? 'Human (X)' : 'Player X';
        this.labelO.textContent = this.gameMode.startsWith('hv-') && this.humanLetter === 'O' ? 'Human (O)' : 'AI (O)';
        this.resetGame();
    }

    initParticles() {
        const container = document.getElementById('particles');
        if (!container) return;
        for (let i = 0; i < 25; i++) {
            const p = document.createElement('div');
            p.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: ${Math.random() > 0.5 ? 'rgba(0, 242, 254, 0.4)' : 'rgba(255, 0, 127, 0.4)'};
                top: ${Math.random() * 100}vh;
                left: ${Math.random() * 100}vw;
                border-radius: 50%;
                pointer-events: none;
                animation: floatParticle ${Math.random() * 10 + 10}s infinite ease-in-out;
            `;
            container.appendChild(p);
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatParticle {
                0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
                50% { transform: translateY(-40px) translateX(20px); opacity: 0.7; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
