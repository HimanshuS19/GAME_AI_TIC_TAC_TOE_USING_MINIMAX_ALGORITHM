# gui.py - High-Performance Pygame GUI for Tic-Tac-Toe AI

import sys
import os
import pygame
from game import Game
from minimax import MinimaxAI
from player import RandomAI, HumanPlayer

# Color Constants
BG_DARK = (10, 12, 22)
CARD_BG = (18, 22, 41)
BORDER_COLOR = (45, 55, 80)
TEXT_WHITE = (240, 244, 248)
TEXT_MUTED = (138, 153, 173)

COLOR_X = (0, 242, 254)      # Neon Cyan
COLOR_O = (255, 0, 127)     # Neon Magenta
COLOR_GOLD = (255, 183, 3)   # Warm Amber / Tie
COLOR_GREEN = (0, 230, 118)  # Win Line

class Button:
    def __init__(self, x, y, width, height, text, action_id):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.action_id = action_id
        self.is_active = False

    def draw(self, surface, font, is_hovered):
        if self.is_active:
            bg_col = (0, 242, 254, 40)
            border_col = COLOR_X
        elif is_hovered:
            bg_col = (35, 45, 75)
            border_col = (100, 120, 160)
        else:
            bg_col = (25, 30, 50)
            border_col = BORDER_COLOR

        pygame.draw.rect(surface, bg_col, self.rect, border_radius=8)
        pygame.draw.rect(surface, border_col, self.rect, 2, border_radius=8)

        text_surf = font.render(self.text, True, COLOR_X if self.is_active else TEXT_WHITE)
        text_rect = text_surf.get_rect(center=self.rect.center)
        surface.blit(text_surf, text_rect)

class TicTacToeGUI:
    def __init__(self):
        pygame.init()
        pygame.font.init()

        self.WIDTH = 850
        self.HEIGHT = 650
        self.screen = pygame.display.set_mode((self.WIDTH, self.HEIGHT))
        pygame.display.set_caption("Nexus Tic-Tac-Toe AI | Pygame GUI")
        self.clock = pygame.time.Clock()

        # Fonts
        self.title_font = pygame.font.SysFont("Segoe UI", 32, bold=True)
        self.sub_font = pygame.font.SysFont("Segoe UI", 20, bold=True)
        self.cell_font = pygame.font.SysFont("Segoe UI", 64, bold=True)
        self.ui_font = pygame.font.SysFont("Segoe UI", 16)
        self.status_font = pygame.font.SysFont("Segoe UI", 22, bold=True)

        # Game State
        self.game = Game()
        self.mode = "hv-minimax"  # hv-minimax, hv-random, hvh, ai-vs-ai
        self.human_letter = "X"
        self.ai_letter = "O"
        self.current_turn = "X"
        self.is_game_over = False
        self.winning_combo = None

        self.scores = {"X": 0, "O": 0, "Ties": 0}

        # Board grid geometry (Center stage)
        self.grid_size = 360
        self.grid_x = 350
        self.grid_y = 150
        self.cell_size = self.grid_size // 3
        self.cells = []
        this_y = self.grid_y
        for r in range(3):
            this_x = self.grid_x
            for c in range(3):
                idx = r * 3 + c
                rect = pygame.Rect(this_x, this_y, self.cell_size, self.cell_size)
                self.cells.append((idx, rect))
                this_x += self.cell_size
            this_y += self.cell_size

        # Buttons
        self.mode_buttons = [
            Button(30, 150, 260, 45, "Human vs Minimax (Hard)", "hv-minimax"),
            Button(30, 205, 260, 45, "Human vs Random (Easy)", "hv-random"),
            Button(30, 260, 260, 45, "Human vs Human (2P)", "hvh"),
            Button(30, 315, 260, 45, "AI vs AI Simulation", "ai-vs-ai")
        ]
        self.mode_buttons[0].is_active = True

        self.reset_btn = Button(30, 560, 120, 45, "New Game", "reset")
        self.clear_stats_btn = Button(160, 560, 130, 45, "Clear Stats", "clear-stats")

    def run(self):
        running = True
        ai_timer = 0

        while running:
            dt = self.clock.tick(60)
            mouse_pos = pygame.mouse.get_pos()

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False

                elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                    self.handle_click(mouse_pos)

            # AI move trigger in simulation or AI turn
            if not self.is_game_over:
                is_ai_turn = False
                if self.mode.startswith("hv-") and self.current_turn == self.ai_letter:
                    is_ai_turn = True
                elif self.mode == "ai-vs-ai":
                    is_ai_turn = True

                if is_ai_turn:
                    ai_timer += dt
                    if ai_timer >= 500:  # Delay 500ms for natural feel
                        ai_timer = 0
                        self.execute_ai_move()

            self.draw(mouse_pos)
            pygame.display.flip()

        pygame.quit()
        sys.exit()

    def handle_click(self, mouse_pos):
        # Mode buttons
        for btn in self.mode_buttons:
            if btn.rect.collidepoint(mouse_pos):
                for b in self.mode_buttons:
                    b.is_active = False
                btn.is_active = True
                self.mode = btn.action_id
                self.reset_game()
                return

        # Action buttons
        if self.reset_btn.rect.collidepoint(mouse_pos):
            self.reset_game()
            return
        if self.clear_stats_btn.rect.collidepoint(mouse_pos):
            self.scores = {"X": 0, "O": 0, "Ties": 0}
            return

        # Board clicks
        if not self.is_game_over:
            if self.mode.startswith("hv-") and self.current_turn != self.human_letter:
                return  # Wait for AI
            if self.mode == "ai-vs-ai":
                return

            for idx, rect in self.cells:
                if rect.collidepoint(mouse_pos):
                    if self.game.make_move(idx, self.current_turn):
                        self.check_game_status(idx, self.current_turn)
                        if not self.is_game_over:
                            self.current_turn = "O" if self.current_turn == "X" else "X"
                        return

    def execute_ai_move(self):
        if self.is_game_over:
            return

        minimax = MinimaxAI(self.current_turn)
        if self.mode == "hv-random":
            random_ai = RandomAI(self.current_turn)
            move = random_ai.get_move(self.game)
        else:
            move = minimax.get_move(self.game)

        if move is not None and self.game.make_move(move, self.current_turn):
            self.check_game_status(move, self.current_turn)
            if not self.is_game_over:
                self.current_turn = "O" if self.current_turn == "X" else "X"

    def check_game_status(self, last_square, letter):
        if self.game.current_winner == letter:
            self.is_game_over = True
            self.scores[letter] += 1
            self.winning_combo = self.get_winning_combo()
        elif not self.game.empty_squares():
            self.is_game_over = True
            self.scores["Ties"] += 1

    def get_winning_combo(self):
        combos = [
            (0, 1, 2), (3, 4, 5), (6, 7, 8),
            (0, 3, 6), (1, 4, 7), (2, 5, 8),
            (0, 4, 8), (2, 4, 6)
        ]
        b = self.game.board
        for c in combos:
            if b[c[0]] != ' ' and b[c[0]] == b[c[1]] == b[c[2]]:
                return c
        return None

    def reset_game(self):
        self.game = Game()
        self.current_turn = "X"
        self.is_game_over = False
        self.winning_combo = None

    def draw(self, mouse_pos):
        self.screen.fill(BG_DARK)

        # Header Title
        title_surf = self.title_font.render("NEXUS TIC-TAC-TOE AI", True, COLOR_X)
        self.screen.blit(title_surf, (30, 30))

        sub_surf = self.ui_font.render("Unbeatable Minimax & Simulation Engine", True, TEXT_MUTED)
        self.screen.blit(sub_surf, (30, 75))

        # Mode Buttons
        mode_header = self.sub_font.render("Select Mode:", True, TEXT_WHITE)
        self.screen.blit(mode_header, (30, 115))
        for btn in self.mode_buttons:
            btn.draw(self.screen, self.ui_font, btn.rect.collidepoint(mouse_pos))

        # Stats Card
        stats_rect = pygame.Rect(30, 380, 260, 160)
        pygame.draw.rect(self.screen, CARD_BG, stats_rect, border_radius=12)
        pygame.draw.rect(self.screen, BORDER_COLOR, stats_rect, 1, border_radius=12)

        stats_title = self.sub_font.render("Scoreboard", True, TEXT_WHITE)
        self.screen.blit(stats_title, (45, 395))

        sx = self.ui_font.render(f"Player X: {self.scores['X']}", True, COLOR_X)
        so = self.ui_font.render(f"Player O: {self.scores['O']}", True, COLOR_O)
        st = self.ui_font.render(f"Draws:    {self.scores['Ties']}", True, COLOR_GOLD)
        self.screen.blit(sx, (45, 435))
        self.screen.blit(so, (45, 465))
        self.screen.blit(st, (45, 495))

        # Action Buttons
        self.reset_btn.draw(self.screen, self.ui_font, self.reset_btn.rect.collidepoint(mouse_pos))
        self.clear_stats_btn.draw(self.screen, self.ui_font, self.clear_stats_btn.rect.collidepoint(mouse_pos))

        # Status Banner
        if self.is_game_over:
            if self.game.current_winner:
                status_msg = f"🎉 Winner: Player {self.game.current_winner}!"
                col = COLOR_X if self.game.current_winner == 'X' else COLOR_O
            else:
                status_msg = "🤝 Game Draw!"
                col = COLOR_GOLD
        else:
            status_msg = f"Turn: Player {self.current_turn}"
            col = COLOR_X if self.current_turn == 'X' else COLOR_O

        status_surf = self.status_font.render(status_msg, True, col)
        self.screen.blit(status_surf, (self.grid_x, 100))

        # Draw Grid Board
        grid_bg_rect = pygame.Rect(self.grid_x - 10, self.grid_y - 10, self.grid_size + 20, self.grid_size + 20)
        pygame.draw.rect(self.screen, CARD_BG, grid_bg_rect, border_radius=16)
        pygame.draw.rect(self.screen, BORDER_COLOR, grid_bg_rect, 1, border_radius=16)

        for idx, rect in self.cells:
            is_hovered = rect.collidepoint(mouse_pos) and not self.is_game_over and self.game.board[idx] == ' '
            cell_bg = (30, 40, 65) if is_hovered else (22, 28, 48)
            
            pygame.draw.rect(self.screen, cell_bg, rect, border_radius=10)
            pygame.draw.rect(self.screen, BORDER_COLOR, rect, 1, border_radius=10)

            val = self.game.board[idx]
            if val != ' ':
                val_col = COLOR_X if val == 'X' else COLOR_O
                mark_surf = self.cell_font.render(val, True, val_col)
                mark_rect = mark_surf.get_rect(center=rect.center)
                self.screen.blit(mark_surf, mark_rect)

        # Draw Winning Line
        if self.winning_combo:
            c1 = self.cells[self.winning_combo[0]][1].center
            c2 = self.cells[self.winning_combo[2]][1].center
            pygame.draw.line(self.screen, COLOR_GREEN, c1, c2, 8)

if __name__ == "__main__":
    gui = TicTacToeGUI()
    gui.run()
