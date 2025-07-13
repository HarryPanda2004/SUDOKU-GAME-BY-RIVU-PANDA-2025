/**
 * Basic Sudoku game logic with timer and reset functionality
 */

// A sample Sudoku puzzle (0 means empty cell)
const puzzle = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

const grid = document.getElementById('sudoku-grid');
const resultMessage = document.getElementById('result-message');
const checkBtn = document.getElementById('check-btn');
const resetBtn = document.getElementById('reset-btn');
const timerDisplay = document.getElementById('timer');

let timer = null;
let secondsElapsed = 0;

// Start the timer and update every second
function startTimer() {
  clearInterval(timer);
  secondsElapsed = 0;
  timerDisplay.textContent = `Time: 0s`;
  timer = setInterval(() => {
    secondsElapsed++;
    timerDisplay.textContent = `Time: ${secondsElapsed}s`;
  }, 1000);
}

// Stop the timer
function stopTimer() {
  clearInterval(timer);
}

// Create the Sudoku grid inputs
function createGrid() {
  grid.innerHTML = ''; // Clear existing grid if any
  for (let row = 0; row < 9; row++) {
    const tr = document.createElement('tr');
    for (let col = 0; col < 9; col++) {
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.dataset.row = row;
      input.dataset.col = col;

      if (puzzle[row][col] !== 0) {
        input.value = puzzle[row][col];
        input.disabled = true;
        input.classList.add('fixed');
      }

      // Allow only digits 1-9 and validate input immediately
      // Capture row and col in local constants to fix closure issue
      const currentRow = row;
      const currentCol = col;
      input.addEventListener('input', (e) => {
        const val = e.target.value;
        if (!/^[1-9]$/.test(val)) {
          e.target.value = '';
          clearError(e.target);
          return;
        }
        // Validate the input for Sudoku rules
        if (!isValidInput(parseInt(val, 10), currentRow, currentCol)) {
          showError(e.target);
          resultMessage.textContent = 'Error: Invalid number entered!';
          resultMessage.style.color = 'red';
        } else {
          clearError(e.target);
          // Check if any other inputs have errors
          if (!anyErrors()) {
            resultMessage.textContent = '';
          }
        }
      });

      td.appendChild(input);
      tr.appendChild(td);
    }
    grid.appendChild(tr);
  }
  startTimer();
}

// Show error styling on invalid input
function showError(input) {
  input.style.borderColor = 'red';
  input.style.backgroundColor = '#fdd'; // light red background
  input.title = 'This number conflicts with Sudoku rules';
}

// Clear error styling
function clearError(input) {
  input.style.borderColor = '';
  input.style.backgroundColor = '';
  input.title = '';
}

// Check if any inputs have errors
function anyErrors() {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const input = grid.rows[row].cells[col].firstChild;
      if (input.style.borderColor === 'red') {
        return true;
      }
    }
  }
  return false;
}

// Check if placing val at (row, col) is valid according to Sudoku rules
function isValidInput(val, row, col) {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col) {
      const cellVal = parseInt(grid.rows[row].cells[c].firstChild.value, 10);
      if (cellVal === val) return false;
    }
  }
  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row) {
      const cellVal = parseInt(grid.rows[r].cells[col].firstChild.value, 10);
      if (cellVal === val) return false;
    }
  }
  // Check 3x3 box
  const boxRowStart = Math.floor(row / 3) * 3;
  const boxColStart = Math.floor(col / 3) * 3;
  for (let r = boxRowStart; r < boxRowStart + 3; r++) {
    for (let c = boxColStart; c < boxColStart + 3; c++) {
      if (r !== row || c !== col) {
        const cellVal = parseInt(grid.rows[r].cells[c].firstChild.value, 10);
        if (cellVal === val) return false;
      }
    }
  }
  return true;
}

// Check if the current board is a valid Sudoku solution
function checkSolution() {
  const board = [];

  for (let row = 0; row < 9; row++) {
    board[row] = [];
    for (let col = 0; col < 9; col++) {
      const input = grid.rows[row].cells[col].firstChild;
      const val = parseInt(input.value, 10);
      if (isNaN(val)) {
        resultMessage.textContent = 'Please fill all cells.';
        resultMessage.style.color = 'red';
        return false;
      }
      board[row][col] = val;
    }
  }

  if (isValidSudoku(board)) {
    resultMessage.textContent = 'Congratulations! You solved the puzzle!';
    resultMessage.style.color = 'green';
    stopTimer();
  } else {
    resultMessage.textContent = 'There are errors in your solution.';
    resultMessage.style.color = 'red';
  }
}

// Validate Sudoku board rules
function isValidSudoku(board) {
  // Check rows and columns
  for (let i = 0; i < 9; i++) {
    const rowSet = new Set();
    const colSet = new Set();
    for (let j = 0; j < 9; j++) {
      if (rowSet.has(board[i][j])) return false;
      if (colSet.has(board[j][i])) return false;
      rowSet.add(board[i][j]);
      colSet.add(board[j][i]);
    }
  }

  // Check 3x3 subgrids
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const boxSet = new Set();
      for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
        for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
          if (boxSet.has(board[row][col])) return false;
          boxSet.add(board[row][col]);
        }
      }
    }
  }

  return true;
}

// Reset the grid inputs and timer
function resetGrid() {
  // Clear all user inputs and errors
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const input = grid.rows[row].cells[col].firstChild;
      if (!input.classList.contains('fixed')) {
        input.value = '';
        clearError(input);
      }
    }
  }
  resultMessage.textContent = '';
  stopTimer();
  startTimer();
}

checkBtn.addEventListener('click', checkSolution);
resetBtn.addEventListener('click', resetGrid);

createGrid();

// Check if the current board is a valid Sudoku solution
function checkSolution() {
  const board = [];

  for (let row = 0; row < 9; row++) {
    board[row] = [];
    for (let col = 0; col < 9; col++) {
      const input = grid.rows[row].cells[col].firstChild;
      const val = parseInt(input.value, 10);
      if (isNaN(val)) {
        resultMessage.textContent = 'Please fill all cells.';
        resultMessage.style.color = 'red';
        return false;
      }
      board[row][col] = val;
    }
  }

  if (isValidSudoku(board)) {
    resultMessage.textContent = 'Congratulations! You solved the puzzle!';
    resultMessage.style.color = 'green';
  } else {
    resultMessage.textContent = 'There are errors in your solution.';
    resultMessage.style.color = 'red';
  }
}

// Validate Sudoku board rules
function isValidSudoku(board) {
  // Check rows and columns
  for (let i = 0; i < 9; i++) {
    const rowSet = new Set();
    const colSet = new Set();
    for (let j = 0; j < 9; j++) {
      if (rowSet.has(board[i][j])) return false;
      if (colSet.has(board[j][i])) return false;
      rowSet.add(board[i][j]);
      colSet.add(board[j][i]);
    }
  }

  // Check 3x3 subgrids
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const boxSet = new Set();
      for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
        for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
          if (boxSet.has(board[row][col])) return false;
          boxSet.add(board[row][col]);
        }
      }
    }
  }

  return true;
}

checkBtn.addEventListener('click', checkSolution);
resetBtn.addEventListener('click', resetGrid);

createGrid();
