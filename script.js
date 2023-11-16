class Tetris {
    constructor() {
        this.grid = document.getElementById('grid');
        this.shape = null;
        this.currentPiecePosition = null;
        this.pieces = new Pieces();
        this.collisions = new Collisions(this);
        this.init();
    }

    init() {
        this.drawGrid();
        this.currentPiecePosition = { x: 4, y: 0}
        this.drawPiece();
        this.gameLoop();
    }

    drawGrid() {
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                this.grid.appendChild(cell);
            }
        }
    }

    gameLoop() {
        const interval = 500; //ms
        const intervalID = setInterval(() => {
            /*this.checkLines();
            if(this.checkGameOver()) {
                console.log('Game Over');
                clearInterval(intervalID);
            }*
            this.moveDown();*/
        }, interval);
    }

    clearPiece(){
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('piece');
        });
    }

    drawPiece() {
      this.pieces.shape.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
          if (col === 1) {
            const cellIndex = (this.currentPiecePosition.x + colIndex) + (this.currentPiecePosition.y + rowIndex) * 10;
            document.querySelectorAll(".cell")[cellIndex].classList.add("piece");
          }
        });
      });
    }
    
    stopPiece() {
        // Si collision avec autre piece ou bas du grid
        this.score.incrementScore();
        
        // Marquer les cases de la piece comme fixes, pour pouvoir vérifier les lignes complètes
        document.querySelectorAll('.cell').forEach(cell => {
          cell.classList.remove('piece');
          cell.classList.add('fixed-piece');
        });
        this.updateScore();
    }

    updateScore() {
        const scoreElement = document.getElementById('score-value');
        scoreElement.textContent = this.score.getScore();
    }

    moveLeft() {
        if (this.collisions.canMoveLeft()) {
            this.clearPiece();
            this.currentPiecePosition.x--;
            this.drawPiece();
        }
    }

    moveRight() {
        if (this.collisions.canMoveRight()) {
            this.clearPiece();
            this.currentPiecePosition.x++;
            this.drawPiece();
        }
    }

    moveDown() {
        if (this.collisions.canMoveDown()) {
            this.clearPiece();
            this.currentPiecePosition.y++;
            this.drawPiece();
        } else {
            this.stopPiece();
            this.spawnPiece();
        }
    }
}

class Pieces {
    constructor() {
        this.piecesList = [
            [[1, 1], [1, 1]], // O
            [[1], [1], [1], [1]], // I
            [[1, 0], [1, 0], [1, 1]], // L
            [[0, 1], [0, 1], [1, 1]], // J
            [[0, 1, 1], [0, 1, 1]], // S
            [[1, 1, 0], [0, 1, 1]], // Z
            [[0, 1, 0], [1, 1, 1]], // T
        ]
        this.shape = this.piecesList[Math.floor(Math.random()* this.piecesList.length)];
    }
    
}

class Collisions {
    constructor(tetris) {
        this.tetris = tetris;
    }
    
    canMoveLeft() {
        return this.checkCollision(-1, 0);
    }

    canMoveRight() {
        return this.checkCollision(1, 0);
    }

    canMoveDown(){
        return this.checkCollision(0, 1);
    }

    checkCollision(X, Y) {
        const shape = this.tetris.pieces.shape;
        const nextPosition = {
            x: this.tetris.currentPiecePosition.x + X,
            y: this.tetris.currentPiecePosition.y + Y
        };

        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (
                    shape[row][col] === 1 &&
                    (nextPosition.x + col < 0 ||
                        nextPosition.x + col >= 10 ||
                        nextPosition.y + row >= 20)
                ) {
                    return false;
                }

                const cellIndex = (nextPosition.x + col) + (nextPosition.y + row) * 10;
                const cell = document.querySelectorAll('.cell')[cellIndex];
                if (cell & cell.classList.contains('fixed-piece')) {
                    return false;
                }
            }
        }

        return true;
    }
    
}

class Score {
    constructor() {
        this.score = 0;
    }

    incrementScore() {
        this.score += 10;
    }

    getScore() {
        return this.score;
    }
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            tetris.moveLeft();
            break;
        case 'ArrowRight':
            tetris.moveRight();
            break;
        case 'ArrowDown':
            tetris.moveDown();
            break;
        default:
            break;
    }
})

const tetris = new Tetris();