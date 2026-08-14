# player.py

import random


class Player:
    def __init__(self, letter):
        self.letter = letter

    def get_move(self, game):
        pass


class HumanPlayer(Player):

    def __init__(self, letter):
        super().__init__(letter)

    def get_move(self, game):

        valid_square = False
        value = None

        while not valid_square:

            square = input(f"{self.letter}'s turn. Enter move (0-8): ")

            try:
                value = int(square)

                if value not in game.available_moves():
                    raise ValueError

                valid_square = True

            except ValueError:
                print("Invalid move! Try again.")

        return value


class RandomAI(Player):

    def __init__(self, letter):
        super().__init__(letter)

    def get_move(self, game):

        move = random.choice(game.available_moves())

        print(f"Random AI ({self.letter}) chooses {move}")

        return move