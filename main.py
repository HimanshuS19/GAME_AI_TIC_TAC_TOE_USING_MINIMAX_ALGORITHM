# main.py

from game import Game
from player import HumanPlayer, RandomAI
from minimax import MinimaxAI


def play(game, x_player, o_player):

    # Show board positions before the game starts
    game.print_board_nums()

    letter = "X"

    while game.empty_squares():

        # Decide whose turn it is
        if letter == "X":
            square = x_player.get_move(game)
        else:
            square = o_player.get_move(game)

        # Make the move
        if game.make_move(square, letter):

            print(f"\n{letter} moves to square {square}")

            game.print_board()

            # Check winner
            if game.current_winner:
                print(f"\n🎉 {letter} wins!")
                return

            # Switch player
            letter = "O" if letter == "X" else "X"

    print("\n🤝 It's a Draw!")


def menu():

    print("\n==============================")
    print("      TIC TAC TOE AI")
    print("==============================")
    print("1. Human vs Human")
    print("2. Human vs Random AI")
    print("3. Human vs Minimax AI")
    print("4. Random AI vs Minimax AI")
    print("5. Minimax AI vs Minimax AI")
    print("==============================")

    choice = input("Enter your choice: ")

    game = Game()

    if choice == "1":
        x_player = HumanPlayer("X")
        o_player = HumanPlayer("O")

    elif choice == "2":
        x_player = HumanPlayer("X")
        o_player = RandomAI("O")

    elif choice == "3":
        x_player = HumanPlayer("X")
        o_player = MinimaxAI("O")

    elif choice == "4":
        x_player = RandomAI("X")
        o_player = MinimaxAI("O")

    elif choice == "5":
        x_player = MinimaxAI("X")
        o_player = MinimaxAI("O")

    else:
        print("Invalid choice!")
        return

    play(game, x_player, o_player)


if __name__ == "__main__":
    menu()