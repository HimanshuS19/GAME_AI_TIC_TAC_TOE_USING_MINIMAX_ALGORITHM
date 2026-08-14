from game import Game
from player import HumanPlayer
from player import RandomAI

game = Game()

human = HumanPlayer("X")
ai = RandomAI("O")

print("Available moves:", game.available_moves())

move = ai.get_move(game)

print("AI selected:", move)