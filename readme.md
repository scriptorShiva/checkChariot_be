# Real-time Chess Game

A web-based multiplayer chess application with real-time gameplay, using modern technologies for a seamless experience.

## Overview

This project is a chess game that allows players to compete in real-time. It features a responsive user interface and real-time synchronization of game state and moves.

## Key Features

- **Real-Time Gameplay**: Instant move updates and synchronization using `Socket.IO`.
- **Interactive Board**: Drag-and-drop functionality managed by `chess.js`.
- **Modern UI**: Styled with `Tailwind CSS`, and enhanced with `shadcn` components and `React Toastify` for notifications.
- **Efficient Routing**: Smooth navigation between the landing page and game board using `React Router DOM`.

## Technologies

- **Frontend**: 
  - React
  - Tailwind CSS
  - React Router DOM
  - React Toastify
  - chess.js

- **Backend**: 
  - Node.js
  - Express
  - Socket.IO
  - chess.js

## Project Structure

- **Frontend**: Components for the chess board, game status, and notifications.
- **Backend**: 
  - `GameHandler`: Manages game creation and tracking.
  - `Game` class: Handles game logic, moves, and state updates.

## Game Flow

1. **Start Game**: Players join and a new game is initialized.
2. **Make Moves**: Moves are validated and processed in real-time.
3. **End Game**: Players receive notifications when the game ends.
3. **Multiple Games**: Multiple instances of games can be run so that more than one games can be played.

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
