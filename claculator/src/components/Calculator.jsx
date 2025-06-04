import { useState, useEffect } from 'react';

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

const Calculator = () => {
  // State for calculator display and operation
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState([]);

  // Handle number input
  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  // Handle decimal point
  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  // Clear the calculator
  const clearAll = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  // Handle backspace
  const handleBackspace = () => {
    if (waitingForOperand) return;
    
    const newValue = display.slice(0, -1);
    setDisplay(newValue === '' ? '0' : newValue);
  };

  // Toggle positive/negative
  const toggleSign = () => {
    if (waitingForOperand) return;
    setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
  };

  /**
   * Converts the current display value to a percentage
   */
  const inputPercent = useCallback(() => {
    if (waitingForOperand) return;
    const value = parseFloat(display);
    updateDisplay(String(value / 100));
  }, [display, updateDisplay, waitingForOperand]);

  // Perform calculation
  const performOperation = (nextOperation) => {
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
  };

  // Handle equals button
  const handleEquals = () => {
    if (operation && !waitingForOperand) {
      performOperation(null);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
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
          '*': '×',
          '/': '÷',
          '+': '+',
          '-': '-',
        };
        performOperation(opMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, previousValue, operation, waitingForOperand]);



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
