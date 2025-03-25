// Define the Tetromino shapes and their colors
const TETROMINOS = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#00ffff' // Neon Cyan
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#ffff00' // Neon Yellow
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#ff00ff' // Neon Magenta
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#ff9900' // Neon Orange
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#00ffff' // Neon Blue
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#39ff14' // Neon Green
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#ff0066' // Neon Pink
    }
};

// Function to get a random Tetromino
function getRandomTetromino() {
    const tetrominos = 'IOTLJSZ';
    const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
    return TETROMINOS[randTetromino];
}

// Function to rotate a Tetromino matrix
function rotateTetromino(matrix) {
    // Create a new matrix of the same size
    const N = matrix.length;
    const result = Array(N).fill().map(() => Array(N).fill(0));
    
    // Rotate 90 degrees clockwise
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            result[j][N - 1 - i] = matrix[i][j];
        }
    }
    
    return result;
}