import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

// Constants for better maintainability
const OPERATIONS = {
  ADD: '+',
  SUBTRACT: '-',
  MULTIPLY: '×',
  DIVIDE: '÷',
  EQUALS: '='
};

const BUTTON_TYPES = {
  NUMBER: 'number',
  OPERATOR: 'operator',
  EQUALS: 'equals',
  CLEAR: 'clear',
  BACKSPACE: 'backspace',
  FUNCTION: 'function'
};

/**
 * Button component for calculator keys
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.type='number'] - Button type (number, operator, etc.)
 * @param {string} [props.testId] - Test ID for testing
 */
const Button = ({ 
  children, 
  onClick, 
  className = '', 
  type = BUTTON_TYPES.NUMBER,
  testId 
}) => {
  // Base button styles
  const baseStyles = 'text-xl font-medium rounded-lg transition-all duration-200 flex items-center justify-center';
  
  // Style variants based on button type
  const typeStyles = {
    [BUTTON_TYPES.NUMBER]: 'bg-white hover:bg-gray-100 text-gray-800',
    [BUTTON_TYPES.OPERATOR]: 'bg-blue-600 hover:bg-blue-700 text-white',
    [BUTTON_TYPES.EQUALS]: 'bg-green-500 hover:bg-green-600 text-white',
    [BUTTON_TYPES.CLEAR]: 'bg-red-500 hover:bg-red-600 text-white',
    [BUTTON_TYPES.BACKSPACE]: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    [BUTTON_TYPES.FUNCTION]: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${typeStyles[type]} ${className} shadow-sm active:scale-95`}
      data-testid={testId}
      type="button"
      aria-label={typeof children === 'string' ? children : ''}
    >
      {children}
    </button>
  );
};

/**
 * Main Calculator component.
 * Manages calculator state, handles user input (clicks and keyboard),
 * performs calculations, and displays results and history.
 * It uses Tailwind CSS for styling and aims for accessibility.
 */
const Calculator = () => {
  // State for calculator display and operation
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState([]);

  /**
   * Updates the calculator display with a new value
   * @param {string} value - New display value
   */
  const updateDisplay = useCallback((value) => {
    setDisplay(value);
  }, []);

  /**
   * Handles input of a numerical digit.
   * Appends the digit to the current display or replaces it if waiting for a new operand.
   * @param {number} digit - The digit to input.
   */
  const inputDigit = useCallback((digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  }, [display, waitingForOperand, setDisplay, setWaitingForOperand]);

  /**
   * Handles input of a decimal point.
   * Adds a decimal point to the display if one doesn't already exist.
   * Handles cases where the calculator is waiting for a new operand.
   */
  const inputDot = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand, setDisplay, setWaitingForOperand]);

  /**
   * Clears all calculator state, resetting the display and operations.
   */
  const clearAll = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  }, [setDisplay, setPreviousValue, setOperation, setWaitingForOperand]);

  /**
   * Handles the backspace action.
   * Removes the last character from the display if not waiting for an operand.
   */
  const handleBackspace = useCallback(() => {
    if (waitingForOperand) return;
    
    const newValue = display.slice(0, -1);
    setDisplay(newValue === '' ? '0' : newValue);
  }, [display, waitingForOperand, setDisplay]);

  /**
   * Toggles the sign of the current display value (positive/negative).
   * Does nothing if waiting for an operand.
   */
  const toggleSign = useCallback(() => {
    if (waitingForOperand) return;
    setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
  }, [display, waitingForOperand, setDisplay]);

  /**
   * Converts the current display value to a percentage
   */
  const inputPercent = useCallback(() => {
    if (waitingForOperand) return;
    const value = parseFloat(display);
    updateDisplay(String(value / 100));
  }, [display, updateDisplay, waitingForOperand]);

  /**
   * Performs the calculation based on the current operation and input value.
   * Updates the display, previous value, and history.
   * Sets up for the next operation if one is provided.
   * @param {string | null} nextOperation - The next operation to perform, or null if equals was pressed.
   */
  const performOperation = useCallback((nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let newValue;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '×':
          newValue = currentValue * inputValue;
          break;
        case '÷':
          newValue = currentValue / inputValue;
          break;
        default:
          newValue = inputValue;
      }

      setPreviousValue(newValue);
      setDisplay(String(newValue));
      
      // Add to history
      setHistory(prev => [
        ...prev.slice(-4), // Keep only last 5 entries
        `${currentValue} ${operation} ${inputValue} = ${newValue}`
      ]);
    }


    setWaitingForOperand(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation, setDisplay, setPreviousValue, setOperation, setWaitingForOperand, setHistory]);

  /**
   * Handles the equals button action.
   * Triggers the final calculation if an operation is pending.
   */
  const handleEquals = useCallback(() => {
    if (operation && !waitingForOperand) {
      performOperation(null);
    }
  }, [operation, waitingForOperand, performOperation]);

  /**
   * Formats a number string with commas for thousands separators.
   * @param {string} numStr - The number string to format.
   * @returns {string} The formatted number string.
   */
  const formatNumber = (numStr) => {
    if (!numStr || numStr === 'Infinity' || numStr === '-Infinity' || isNaN(parseFloat(numStr))) {
      return numStr; // Return as is if not a valid number, or is Infinity
    }
    const [integerPart, decimalPart] = numStr.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  /**
   * Handles keyboard input for calculator operations.
   * @param {KeyboardEvent} e - The keyboard event.
   */
  const handleKeyDown = useCallback((e) => {
      if (e.key >= '0' && e.key <= '9') {
        inputDigit(parseInt(e.key, 10));
      } else if (e.key === '.') {
        inputDot();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Escape') {
        clearAll();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        e.preventDefault();
        const opMap = {
          '*': OPERATIONS.MULTIPLY,
          '/': OPERATIONS.DIVIDE,
          '+': OPERATIONS.ADD,
          '-': OPERATIONS.SUBTRACT,
        };
        performOperation(opMap[e.key]);
      }
    }, [inputDigit, inputDot, handleEquals, clearAll, handleBackspace, performOperation]);

  // Effect for attaching and cleaning up keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);




  return (
    <div 
      className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md mx-auto"
      role="application"
      aria-label="Calculator"
    >
      {/* Display Section */}
      <div className="p-4 bg-gray-800 text-right">
        {/* History */}
        <div 
          className="min-h-6 text-sm text-gray-400 mb-1 overflow-x-auto whitespace-nowrap"
          data-testid="history"
          aria-label="Calculation history"
        >
          {history.length > 0 && history.join('  |  ')}
        </div>
        
        {/* Current operation */}
        <div 
          className="text-gray-400 text-sm h-5 mb-1"
          data-testid="operation-display"
          aria-label="Current operation"
        >
          {previousValue !== null && `${formatNumber(previousValue.toString())} ${operation || ''}`}
        </div>
        
        {/* Main display */}
        <div 
          className="text-white text-4xl font-light overflow-x-auto whitespace-nowrap"
          data-testid="display"
          aria-live="polite"
          aria-atomic="true"
        >
          {formatNumber(display)}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-2 p-4" role="grid">
        {/* First row */}
        <Button type="clear" onClick={clearAll} className="col-span-2 h-14" aria-label="Clear all">
          AC
        </Button>
        <Button type="backspace" onClick={handleBackspace} className="h-14">
          ⌫
        </Button>
        <Button type="operator" onClick={() => performOperation('÷')} className="h-14">
          ÷
        </Button>

        {/* Number pad */}
        <Button onClick={() => inputDigit(7)}>7</Button>
        <Button onClick={() => inputDigit(8)}>8</Button>
        <Button onClick={() => inputDigit(9)}>9</Button>
        <Button type="operator" onClick={() => performOperation('×')}>
          ×
        </Button>

        <Button onClick={() => inputDigit(4)}>4</Button>
        <Button onClick={() => inputDigit(5)}>5</Button>
        <Button onClick={() => inputDigit(6)}>6</Button>
        <Button type="operator" onClick={() => performOperation('-')}>
          −
        </Button>

        <Button onClick={() => inputDigit(1)}>1</Button>
        <Button onClick={() => inputDigit(2)}>2</Button>
        <Button onClick={() => inputDigit(3)}>3</Button>
        <Button type="operator" onClick={() => performOperation('+')}>
          +
        </Button>

        {/* Bottom row */}
        <Button onClick={toggleSign} className="h-14">
          ±
        </Button>
        <Button onClick={() => inputDigit(0)} className="h-14">
          0
        </Button>
        <Button onClick={inputDot} className="h-14">
          .
        </Button>
        <Button type="equals" onClick={handleEquals} className="h-14">
          =
        </Button>
      </div>
    </div>
  );
};

// Add PropTypes for better type checking in development
Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  type: PropTypes.oneOf(Object.values(BUTTON_TYPES)),
  testId: PropTypes.string
};

export default Calculator;
