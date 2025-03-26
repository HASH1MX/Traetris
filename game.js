// Game constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const BOARD_WIDTH = COLS * BLOCK_SIZE;
const BOARD_HEIGHT = ROWS * BLOCK_SIZE;
const NEXT_PIECE_SIZE = 4 * 25; // 4 blocks max, 25px per block

// Game variables
let canvas, ctx;
let nextPieceCanvas, nextPieceCtx;
let board = [];
let currentPiece, nextPiece;
let score = 0;
let highScore = parseInt(localStorage.getItem('tetrisHighScore')) || 0;
let lastScore = 0;
let gameOver = false;
let gameStarted = false;
let dropCounter = 0;
let dropInterval = 1000; // ms
let lastTime = 0;
let animationId;
let backgroundMusic;
let isMusicPlaying = false;

// Undo functionality variables
let undoCount = 3; // Number of undos available per game
let gameStateHistory = []; // Array to store previous game states
let maxHistoryLength = 10; // Maximum number of states to store

// DOM elements
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');
const gameOverElement = document.getElementById('game-over');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const playAgainButton = document.getElementById('play-again-button');
const musicToggleButton = document.getElementById('music-toggle');
const settingsButton = document.getElementById('settings-button');
const undoButton = document.getElementById('undo-button');
const backgroundMusicElement = document.getElementById('background-music');

// Initialize the game
function init() {
    // Set up the game board canvas
    canvas = document.getElementById('game-board');
    ctx = canvas.getContext('2d');
    
    // Set up the next piece canvas
    nextPieceCanvas = document.getElementById('next-piece');
    nextPieceCtx = nextPieceCanvas.getContext('2d');
    
    // Display high score
    highScoreElement.textContent = highScore;
    
    // Set up background music
    backgroundMusic = document.getElementById('background-music');
    musicToggleButton.addEventListener('click', toggleMusic);
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyPress);
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', resetGame);
    playAgainButton.addEventListener('click', resetGame);
    undoButton.addEventListener('click', undoLastMove);
    settingsButton.addEventListener('click', openSettings);
    
    // Draw the empty board
    createBoard();
    drawBoard();
}

// Create the game board
function createBoard() {
    board = [];
    for (let row = 0; row < ROWS; row++) {
        board[row] = [];
        for (let col = 0; col < COLS; col++) {
            board[row][col] = 0; // 0 means empty
        }
    }
}

// Draw the game board
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    // Draw vertical lines
    for (let col = 0; col <= COLS; col++) {
        ctx.beginPath();
        ctx.moveTo(col * BLOCK_SIZE, 0);
        ctx.lineTo(col * BLOCK_SIZE, BOARD_HEIGHT);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let row = 0; row <= ROWS; row++) {
        ctx.beginPath();
        ctx.moveTo(0, row * BLOCK_SIZE);
        ctx.lineTo(BOARD_WIDTH, row * BLOCK_SIZE);
        ctx.stroke();
    }
    
    // Draw the filled blocks
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                drawBlock(col, row, board[row][col]);
            }
        }
    }
    
    // Draw the current piece if game is active
    if (currentPiece && gameStarted && !gameOver) {
        drawPiece();
    }
}

// Draw a single block
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // Draw block border
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // Draw highlight (3D effect)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(x * BLOCK_SIZE, y * BLOCK_SIZE);
    ctx.lineTo((x + 1) * BLOCK_SIZE, y * BLOCK_SIZE);
    ctx.lineTo(x * BLOCK_SIZE, (y + 1) * BLOCK_SIZE);
    ctx.fill();
}

// Draw the current piece
function drawPiece() {
    const piece = currentPiece.shape;
    for (let row = 0; row < piece.length; row++) {
        for (let col = 0; col < piece[row].length; col++) {
            if (piece[row][col]) {
                drawBlock(currentPiece.x + col, currentPiece.y + row, currentPiece.color);
            }
        }
    }
}

// Draw the next piece preview
function drawNextPiece() {
    nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    
    const piece = nextPiece.shape;
    const blockSize = 25; // Smaller blocks for the preview
    
    // Center the piece in the preview canvas
    const offsetX = (nextPieceCanvas.width - piece[0].length * blockSize) / 2;
    const offsetY = (nextPieceCanvas.height - piece.length * blockSize) / 2;
    
    for (let row = 0; row < piece.length; row++) {
        for (let col = 0; col < piece[row].length; col++) {
            if (piece[row][col]) {
                // Draw the block
                nextPieceCtx.fillStyle = nextPiece.color;
                nextPieceCtx.fillRect(offsetX + col * blockSize, offsetY + row * blockSize, blockSize, blockSize);
                
                // Draw block border
                nextPieceCtx.strokeStyle = '#222';
                nextPieceCtx.lineWidth = 1;
                nextPieceCtx.strokeRect(offsetX + col * blockSize, offsetY + row * blockSize, blockSize, blockSize);
                
                // Draw highlight
                nextPieceCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                nextPieceCtx.beginPath();
                nextPieceCtx.moveTo(offsetX + col * blockSize, offsetY + row * blockSize);
                nextPieceCtx.lineTo(offsetX + (col + 1) * blockSize, offsetY + row * blockSize);
                nextPieceCtx.lineTo(offsetX + col * blockSize, offsetY + (row + 1) * blockSize);
                nextPieceCtx.fill();
            }
        }
    }
}

// Generate a new piece
function generatePiece() {
    if (!nextPiece) {
        nextPiece = getRandomTetromino();
    }
    
    currentPiece = {
        shape: nextPiece.shape,
        color: nextPiece.color,
        x: Math.floor(COLS / 2) - Math.floor(nextPiece.shape[0].length / 2),
        y: 0
    };
    
    nextPiece = getRandomTetromino();
    drawNextPiece();
    
    // Check if the new piece can be placed
    if (checkCollision()) {
        // Game over
        endGame();
    }
}

// Check for collision
function checkCollision(offsetX = 0, offsetY = 0, piece = currentPiece.shape) {
    for (let row = 0; row < piece.length; row++) {
        for (let col = 0; col < piece[row].length; col++) {
            if (piece[row][col]) {
                const newX = currentPiece.x + col + offsetX;
                const newY = currentPiece.y + row + offsetY;
                
                // Check boundaries
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                
                // Check if already filled
                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Move the piece down
function moveDown() {
    if (!checkCollision(0, 1)) {
        currentPiece.y++;
        // Play move sound
        soundManager.play('move');
        return true;
    }
    
    // If can't move down, lock the piece
    lockPiece();
    return false;
}

// Move the piece left
function moveLeft() {
    if (!checkCollision(-1, 0)) {
        currentPiece.x--;
        // Play move sound
        soundManager.play('move');
    }
}

// Move the piece right
function moveRight() {
    if (!checkCollision(1, 0)) {
        currentPiece.x++;
        // Play move sound
        soundManager.play('move');
    }
}

// Rotate the piece
function rotatePiece() {
    const rotated = rotateTetromino(currentPiece.shape);
    
    // Check if rotation is possible
    if (!checkCollision(0, 0, rotated)) {
        currentPiece.shape = rotated;
        // Play rotate sound
        soundManager.play('rotate');
    } else {
        // Try wall kick (move left or right to allow rotation)
        for (let offset of [-1, 1, -2, 2]) {
            if (!checkCollision(offset, 0, rotated)) {
                currentPiece.x += offset;
                currentPiece.shape = rotated;
                // Play rotate sound
                soundManager.play('rotate');
                break;
            }
        }
    }
}

// Hard drop the piece
function hardDrop() {
    while (moveDown()) {
        // Keep moving down until collision
    }
    // Play hard drop sound
    soundManager.play('hardDrop');
}

// Lock the piece in place
function lockPiece() {
    const piece = currentPiece.shape;
    let blocksPlaced = 0;
    
    for (let row = 0; row < piece.length; row++) {
        for (let col = 0; col < piece[row].length; col++) {
            if (piece[row][col]) {
                const boardRow = currentPiece.y + row;
                const boardCol = currentPiece.x + col;
                
                // Only place on the board if within bounds
                if (boardRow >= 0 && boardRow < ROWS && boardCol >= 0 && boardCol < COLS) {
                    board[boardRow][boardCol] = currentPiece.color;
                    blocksPlaced++;
                }
            }
        }
    }
    
    // Add points for placing blocks (100 points per block)
    if (blocksPlaced > 0) {
        score += blocksPlaced * 100;
        scoreElement.textContent = score.toString();
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore.toString();
            localStorage.setItem('tetrisHighScore', highScore.toString());
        }
    }
    
    // Check for completed lines
    checkLines();
    
    // Generate a new piece
    generatePiece();
    
    // Save the game state for undo functionality
    saveGameState();
}

// Check for completed lines
function checkLines() {
    let linesCleared = 0;
    let rowsToCheck = [];
    
    // First pass: identify complete lines
    for (let row = ROWS - 1; row >= 0; row--) {
        let isLineComplete = true;
        
        for (let col = 0; col < COLS; col++) {
            if (!board[row][col]) {
                isLineComplete = false;
                break;
            }
        }
        
        if (isLineComplete) {
            rowsToCheck.push(row);
            linesCleared++;
        }
    }
    
    // Second pass: remove all complete lines at once
    if (linesCleared > 0) {
        rowsToCheck.sort((a, b) => b - a); // Sort in descending order
        for (let row of rowsToCheck) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
        }
        // Play line clear sound
        soundManager.play('lineClear');
        // Update score based on total lines cleared
        updateScore(linesCleared);
    }
}

// Update the score
function updateScore(linesCleared) {
    let points = 0;
    
    // Award 1000 points for each line cleared
    points = linesCleared * 1000;
    
    score += points;
    console.log('Score updated:', score, 'Points added:', points, 'Lines cleared:', linesCleared);
    scoreElement.textContent = score.toString();
    
    // Update high score if needed
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore.toString();
        localStorage.setItem('tetrisHighScore', highScore.toString());
    }
    
    // Increase speed slightly with each line cleared
    dropInterval = Math.max(100, 1000 - (score / 100) * 50);
}

// Handle keyboard input
function handleKeyPress(event) {
    if (!gameStarted || gameOver) return;
    
    switch (event.keyCode) {
        case 37: // Left arrow
            moveLeft();
            break;
        case 39: // Right arrow
            moveRight();
            break;
        case 40: // Down arrow
            moveDown();
            break;
        case 38: // Up arrow
            rotatePiece();
            break;
        case 32: // Spacebar
            hardDrop();
            break;
    }
    
    drawBoard();
}

// Game loop
function gameLoop(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        moveDown();
        dropCounter = 0;
    }
    
    drawBoard();
    
    if (gameStarted && !gameOver) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Toggle background music and sound effects
function toggleMusic() {
    if (isMusicPlaying) {
        backgroundMusic.pause();
        musicToggleButton.textContent = '🔇';
        // Mute sound effects
        soundManager.mute();
    } else {
        backgroundMusic.play().catch(e => {
            console.log('Audio playback failed:', e);
        });
        musicToggleButton.textContent = '🔊';
        // Unmute sound effects
        soundManager.unmute();
    }
    isMusicPlaying = !isMusicPlaying;
}

// Save the current game state for undo functionality
function saveGameState() {
    // Create a deep copy of the current board
    const boardCopy = [];
    for (let row = 0; row < ROWS; row++) {
        boardCopy[row] = [...board[row]];
    }
    
    // Create a copy of the current piece
    const currentPieceCopy = currentPiece ? {
        shape: JSON.parse(JSON.stringify(currentPiece.shape)),
        color: currentPiece.color,
        x: currentPiece.x,
        y: currentPiece.y
    } : null;
    
    // Create a copy of the next piece
    const nextPieceCopy = nextPiece ? {
        shape: JSON.parse(JSON.stringify(nextPiece.shape)),
        color: nextPiece.color
    } : null;
    
    // Save the current state
    const gameState = {
        board: boardCopy,
        currentPiece: currentPieceCopy,
        nextPiece: nextPieceCopy,
        score: score
    };
    
    // Add to history, maintaining the maximum length
    gameStateHistory.push(gameState);
    if (gameStateHistory.length > maxHistoryLength) {
        gameStateHistory.shift(); // Remove oldest state
    }
    
    // Update undo button text
    updateUndoButton();
}

// Undo the last move
function undoLastMove() {
    // Check if undo is available
    if (undoCount <= 0 || !gameStarted || gameOver || gameStateHistory.length < 2) {
        return;
    }
    
    // Remove the current state
    gameStateHistory.pop();
    
    // Get the previous state
    const previousState = gameStateHistory[gameStateHistory.length - 1];
    
    // Restore the game state
    board = previousState.board;
    currentPiece = previousState.currentPiece;
    nextPiece = previousState.nextPiece;
    score = previousState.score;
    scoreElement.textContent = score.toString();
    
    // Decrement undo count
    undoCount--;
    
    // Update undo button
    updateUndoButton();
    
    // Play undo sound
    soundManager.play('undo');
    
    // Redraw the board
    drawBoard();
    drawNextPiece();
}

// Update the undo button state
function updateUndoButton() {
    // Disable the button if no undos are left
    if (undoCount <= 0) {
        undoButton.disabled = true;
    } else {
        undoButton.disabled = false;
    }
}

// Open settings menu (placeholder function)
function openSettings() {
    console.log('Settings button clicked');
    // This is just a placeholder for now
    alert('Settings functionality will be implemented in a future update!');
}

// Start the game
function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    gameOver = false;
    score = 0;
    scoreElement.textContent = '0';
    gameOverElement.style.display = 'none';
    startButton.style.display = 'none';
    restartButton.style.display = 'block';
    
    // Reset undo functionality
    undoCount = 3;
    gameStateHistory = [];
    updateUndoButton();
    
    // Start background music if not already playing
    if (!isMusicPlaying) {
        backgroundMusic.play().catch(e => {
            console.log('Audio playback failed:', e);
        });
        isMusicPlaying = true;
        musicToggleButton.textContent = '🔊';
    }
    
    createBoard();
    generatePiece();
    // Save initial game state
    saveGameState();
    gameLoop();
}

// Reset the game
function resetGame() {
    cancelAnimationFrame(animationId);
    gameStarted = false;
    gameOver = false;
    score = 0;
    scoreElement.textContent = '0';
    highScoreElement.textContent = highScore;
    gameOverElement.style.display = 'none';
    startButton.style.display = 'block';
    restartButton.style.display = 'none';
    
    // Reset undo functionality
    undoCount = 3;
    gameStateHistory = [];
    updateUndoButton();
    
    // Pause music when game is reset
    if (isMusicPlaying) {
        backgroundMusic.pause();
        isMusicPlaying = false;
        musicToggleButton.textContent = '🔇';
    }
    
    createBoard();
    drawBoard();
}

// End the game
function endGame() {
    gameOver = true;
    lastScore = score;
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'flex';
    cancelAnimationFrame(animationId);
    
    // Update high score at game end if needed
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('tetrisHighScore', highScore.toString());
    }
}

// Initialize the game when the page loads
window.addEventListener('load', init);