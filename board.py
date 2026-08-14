class Board:

    def __init__(self):
        self.board = [' ' for _ in range(9)]

    def print_board(self):
        print()
        print(self.board[0] + " | " + self.board[1] + " | " + self.board[2])
        print("--+---+--")
        print(self.board[3] + " | " + self.board[4] + " | " + self.board[5])
        print("--+---+--")
        print(self.board[6] + " | " + self.board[7] + " | " + self.board[8])
        print()

    def print_positions(self):
        print()
        print("0 | 1 | 2")
        print("--+---+--")
        print("3 | 4 | 5")
        print("--+---+--")
        print("6 | 7 | 8")
        print()

    def available_moves(self):
        moves = []
        for i in range(9):
            if self.board[i] == ' ':
                moves.append(i)
        return moves

    def empty_square(self):
        return ' ' in self.board

    def num_empty_squares(self):
        return self.board.count(' ')

    def make_move(self, square, letter):
        if self.board[square] == ' ':
            self.board[square] = letter
            return True
        return False

    def winner(self, square, letter):

        row = square // 3

        row_start = row * 3

        if all([spot == letter for spot in self.board[row_start:row_start + 3]]):
            return True

        col = square % 3

        column = [self.board[col + i * 3] for i in range(3)]

        if all([spot == letter for spot in column]):
            return True

        if square % 2 == 0:

            diagonal1 = [self.board[i] for i in [0,4,8]]

            if all([spot == letter for spot in diagonal1]):
                return True

            diagonal2 = [self.board[i] for i in [2,4,6]]

            if all([spot == letter for spot in diagonal2]):
                return True

        return False