class Tetris {
    constructor() {
        this.grid = document.getElementById('grid');
        this.shape = null;
        this.currentPiecePosition = null;
        this.piecesList = [];
        this.pieces = new Pieces();
        this.collisions = new Collisions(this);
        this.score = null;
        this.intervalID = null;
        this.colors = ['#ffff00', '#0000ff','#ffa500', '#ffc0cb', '#ff0000', '#008000', '#800080'];
        this.init();
    }

    init() {
        this.drawGrid();
        this.currentPiecePosition = { x: 4, y: 0}
        this.score = new Score();
        for(let i =0; i<4; i++) {
            this.piecesList.push(new Pieces());
        }
        this.pieces = this.piecesList.shift(); // 1 pièce affichée, 3 en preview
        this.drawPiece();
        this.drawPreview();
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

    drawPreview() {
        
    }

    gameLoop() {
        const interval = 250; //ms
        this.intervalID = setInterval(() => {
            this.moveDown();
            this.checkLines();
            this.drawPreview();
        }, interval);
    }

    clearPiece(){
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('piece');
            if(!cell.classList.contains('fixed-piece')){
              cell.style.backgroundColor = '';
            }
        });
    }

    drawPiece() {
      this.pieces.shape.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
          if (col === 1) {
            const cellIndex = (this.currentPiecePosition.x + colIndex) + (this.currentPiecePosition.y + rowIndex) * 10;
            document.querySelectorAll(".cell")[cellIndex].classList.add("piece");
            document.querySelectorAll(".cell")[cellIndex].style.backgroundColor = this.colors[this.pieces.pieceShapeIndex];
          }
        });
      });
    }
    
    stopPiece() {
        // Si collision avec autre piece ou bas du grid
        this.score.incrementScore();
        
        // Marquer les cases de la piece comme fixes, pour pouvoir vérifier les lignes complètes
        document.querySelectorAll('.piece').forEach(cell => {
          cell.classList.remove('piece');
          cell.classList.add('fixed-piece');
          cell.style.backgroundColor = this.colors[this.pieces.pieceShapeIndex];
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
            if (this.currentPiecePosition.y <= 0) {
                this.gameOver();
            } else {
                this.stopPiece();
                this.pieces = this.piecesList.shift();
                this.piecesList.push(new Pieces());
                console.log(this.piecesList);
                this.currentPiecePosition = { x: 4, y: 0};
                this.drawPiece();
            }
        }
    }

    gameOver(){
        console.log('Game Over');
        clearInterval(this.intervalID);
        //window.alert('Game Over !');
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('piece', 'fixed-piece');
        })
        this.gameLoop();
        this.score.resetScore();
    }

    checkLines() {
      let completedLinesStartIndexes = [];
      let fixedCellsOnLineCount = 0;
      for(let i = 0; i < this.grid.children.length; i++) {
        let cell = this.grid.children[i];
        if (i % 10 === 0) {
          fixedCellsOnLineCount = 0;
        }
        if(cell.classList.contains('fixed-piece')) {
          fixedCellsOnLineCount++;
        }
        if (fixedCellsOnLineCount === 10) {
          completedLinesStartIndexes.push(i-9);
        }
      }

      for(let i = 0; i < completedLinesStartIndexes.length; i++) {
        for(let j = completedLinesStartIndexes[i]; j < completedLinesStartIndexes[i] + 10; j++) {
          this.grid.children[j].remove();
          this.grid.insertAdjacentHTML('afterbegin', '<div class="cell"></div>');
        }
      }
    }

    rotate() {
        const rotatedShape = this.pieces.rotate();
        const canRotateBottom = this.collisions.checkCollision(0, 0, rotatedShape);
        const canRotateLeft = this.collisions.checkCollision(-1, 0, rotatedShape);
        const canRotateRight = this.collisions.checkCollision(1, 0, rotatedShape);

        if (canRotateBottom && canRotateLeft && canRotateRight) {
            this.clearPiece();
            this.pieces.shape = rotatedShape;
            this.drawPiece();
        }
    }
}

class Pieces {
    constructor() {
        this.piecesList = [
            [[1, 1], [1, 1]],           // O
            [[1], [1], [1], [1]],       // I
            [[1, 0], [1, 0], [1, 1]],   // L
            [[0, 1], [0, 1], [1, 1]],   // J
            [[0, 1, 1], [1, 1, 0]],     // S
            [[1, 1, 0], [0, 1, 1]],     // Z
            [[0, 1, 0], [1, 1, 1]],     // T
        ]
        this.pieceShapeIndex = Math.floor(Math.random()* this.piecesList.length);
        this.shape = this.piecesList[this.pieceShapeIndex];
    }

    rotate() {
        const newShape = [];
        for (let col = 0; col < this.shape[0].length; col++) {
            const newRow = [];
            for (let row = this.shape.length - 1; row >= 0; row--) {
                newRow.push(this.shape[row][col]);
            }
            newShape.push(newRow);
        }
        return newShape;
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

    checkCollision(X, Y, customShape = null) {
        let shape = this.tetris.pieces.shape;
        if(customShape) {
            shape = customShape;
        }
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
                if (shape[row][col] === 1 && cell && cell.classList.contains('fixed-piece')) {
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

    resetScore() {
        this.score = 0;
        tetris.updateScore();
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
        case 'ArrowUp' :
            tetris.rotate();
            break;
        default:
            break;
    }
})

const tetris = new Tetris();