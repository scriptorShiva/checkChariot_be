import { Chess } from "chess.js";
import { Server, Socket } from "socket.io";

interface Player {
  id: string;
  color: "white" | "black";
}

interface Game {
  id: string;
  players: Player[];
  waiting: boolean;
  chess: Chess;
  // YOU CAN HAVE : MOVES OR START_TIME
}

export class ChessGame {
  private io: Server;
  private games: Game[] = [];
  private waitingGames: Game[] = [];
  private nextGameId = 1; // To generate unique game IDs

  constructor(io: Server) {
    this.io = io;
    this.setupListeners();
  }

  private setupListeners() {
    this.io.on("connection", (socket: Socket) => {
      console.log("A user connected:", socket.id);
      // 1st -- event : on click join
      socket.on("joinGame", () => this.joinGame(socket));
      // 2nd -- event : on chess move
      socket.on(
        "makeMove",
        ({ gameId, move }: { gameId: string; move: string }) =>
          this.makeMove(socket, gameId, move)
      );
      //last -- event : disconnect from game
      socket.on("disconnect", () => this.handleDisconnect(socket));
    });
  }

  private createNewGame() {
    const gameId = `game${this.nextGameId++}`;
    const newGame: Game = {
      id: gameId,
      players: [],
      waiting: true,
      chess: new Chess(), // Initialize a new chess instance
    };
    this.games.push(newGame);
    this.waitingGames.push(newGame);
    return newGame;
  }

  private joinGame(socket: Socket) {
    let game: Game | undefined;

    // Try to find an existing waiting game or create a new one
    if (this.waitingGames.length > 0) {
      game = this.waitingGames[0];
    } else {
      game = this.createNewGame();
    }

    if (game) {
      if (game.players.length < 2) {
        const color: "white" | "black" =
          game.players.length === 0 ? "white" : "black";
        const player: Player = { id: socket.id, color };
        game.players.push(player);
        socket.join(game.id);
        // screamer
        socket.emit("gameJoined", { gameId: game.id, color });
        console.log(`${socket.id} joined game ${game.id} as ${color}`);

        // Check if the game is now full
        if (game.players.length === 2) {
          game.waiting = false;
          this.waitingGames.shift(); // Remove the game from waiting games
          console.log(`Game ${game.id} is now full and started.`);
        }
      } else {
        // screamer
        socket.emit("gameFull", game.id);
      }
    }
  }

  private makeMove(socket: Socket, gameId: string, move: string) {
    console.log(socket, "SOCKE");
    console.log(gameId, "GAME");
    console.log(move, "MOOO");
    const game = this.games.find((game) => game.id === gameId);
    console.log(game);
    if (game) {
      try {
        // validate chess move
        const { chess } = game;
        const player = game.players.find((player) => player.id === socket.id);
        // Check if the player exists in the game
        if (!player) {
          socket.emit("gameNotFound", gameId);
          return;
        }

        const playerColor = player.color;
        const currentTurn = chess.turn() === "w" ? "white" : "black";
        // Check if the move is being made by the player whose turn it is
        if (playerColor !== currentTurn) {
          socket.emit("notYourTurn", move);
          return;
        }

        // Attempt to make the move on the chess board
        const isValidMove = chess.move(move);
        if (isValidMove) {
          // Check if the game is over after the move
          if (chess.isGameOver()) {
            let gameOverReason: string;

            if (chess.isCheckmate()) {
              gameOverReason = "checkmate";
            } else if (chess.isStalemate()) {
              gameOverReason = "stalemate";
            } else if (chess.isDraw()) {
              gameOverReason = "draw";
            } else {
              gameOverReason = "unknown";
            }

            // Notify all players that the game is over
            socket.to(gameId).emit("gameOver", { reason: gameOverReason });
            console.log(`Game ${gameId} is over due to ${gameOverReason}`);
          } else {
            // Emit the move to all players in the game
            socket.to(gameId).emit("moveMade", move);

            // Send the updated board state to all players
            const boardState = chess.fen(); // Get the FEN string of the current board state
            socket.to(gameId).emit("boardUpdate", boardState);

            // Log the successful move
            console.log(`Move made in game ${gameId}: ${move}`);
          }
        } else {
          socket.emit("invalidMove", move);
          console.log(`Invalid move attempt in game ${gameId}: ${move}`);
        }
      } catch (err) {
        // Log the error and inform the player
        console.error(`Error processing move in game ${gameId}:`, err);
        socket.emit(
          "error",
          "An error occurred while processing your move. Please try again."
        );
      }
    } else {
      socket.emit("gameNotFound", gameId);
    }
  }

  private handleDisconnect(socket: Socket) {
    console.log("User disconnected:", socket.id);
    this.games.forEach((game) => {
      game.players = game.players.filter((player) => player.id !== socket.id);
      if (game.players.length === 0) {
        this.games = this.games.filter((g) => g.id !== game.id); // Remove empty games
        // If the game was waiting, remove it from the waiting games list
        if (game.waiting) {
          this.waitingGames = this.waitingGames.filter((g) => g.id !== game.id);
        }
      }
    });
  }
}
