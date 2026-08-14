import math

class MinimaxAI:
    def __init__(self, letter):
        self.letter = letter

    def get_move(self, game):

        # First move
        if len(game.available_moves()) == 9:
            return 4

        return self.minimax(game, self.letter)["position"]

    def minimax(self, state, player):

        max_player = self.letter
        other_player = "O" if player == "X" else "X"

        # Check if previous move won
        if state.current_winner == other_player:

            if other_player == max_player:

                return {
                    "position": None,
                    "score": 1 * (state.num_empty_squares() + 1)
                }

            else:

                return {
                    "position": None,
                    "score": -1 * (state.num_empty_squares() + 1)
                }

        # Draw
        if not state.empty_squares():

            return {
                "position": None,
                "score": 0
            }

        if player == max_player:

            best = {
                "position": None,
                "score": -math.inf
            }

        else:

            best = {
                "position": None,
                "score": math.inf
            }

        for move in state.available_moves():

            # Make move
            state.make_move(move, player)

            # Recursive search
            sim_score = self.minimax(state, other_player)

            # Undo move
            state.board[move] = " "
            state.current_winner = None

            sim_score["position"] = move

            if player == max_player:

                if sim_score["score"] > best["score"]:
                    best = sim_score

            else:

                if sim_score["score"] < best["score"]:
                    best = sim_score

        return best