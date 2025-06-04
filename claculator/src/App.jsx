import { useState } from 'react';
import Calculator from './components/Calculator';
import './App.css';

function App() {
  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Advanced Calculator
      </h1>
      <Calculator />
      <footer className="text-center mt-8 text-sm text-gray-500">
        Built with React & Tailwind CSS
      </footer>
    </div>
  );
}

export default App;
