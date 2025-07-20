import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [overwrite, setOverwrite] = useState(true);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('calcHistory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('calcHistory', JSON.stringify(history));
  }, [history]);

  const compute = useCallback(() => {
    const current = parseFloat(display);
    let result;
    switch (operator) {
      case '+': result = prevValue + current; break;
      case '-': result = prevValue - current; break;
      case '×': result = prevValue * current; break;
      case '÷': result = current === 0 ? 'Error' : prevValue / current; break;
      default: result = current;
    }
    return result;
  }, [display, operator, prevValue]);

  const handleNumber = useCallback((num) => {
    if (overwrite || display === 'Error') {
      setDisplay(num);
      setOverwrite(false);
    } else {
      setDisplay(prev => (prev === '0' ? num : prev + num));
    }
  }, [display, overwrite]);

  const handleOperator = useCallback((op) => {
    if (operator !== null && !overwrite) {
      const result = compute();
      setPrevValue(typeof result === 'number' ? result : NaN);
      setDisplay(String(result));
    } else if (operator === null) {
      setPrevValue(parseFloat(display));
    }
    setOperator(op);
    setOverwrite(true);
  }, [compute, display, operator, overwrite]);

  const handleEquals = useCallback(() => {
    if (operator === null) return;
    const result = compute();
    setHistory(prev => [...prev, `${prevValue} ${operator} ${display} = ${result}`]);
    setDisplay(String(result));
    setPrevValue(null);
    setOperator(null);
    setOverwrite(true);
  }, [compute, operator, prevValue, display]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setOverwrite(true);
  }, []);

  const handleKeyDown = useCallback((e) => {
    const { key } = e;
    if (/^[0-9.]$/.test(key)) handleNumber(key);
    else if (['+', '-', '*', '/'].includes(key)) {
      const op = key === '*' ? '×' : key === '/' ? '÷' : key;
      handleOperator(op);
    } else if (key === 'Enter' || key === '=') handleEquals();
    else if (key === 'Backspace') handleClear();
  }, [handleClear, handleEquals, handleNumber, handleOperator]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const buttons = ['7','8','9','÷','4','5','6','×','1','2','3','-','0','.','=','+','C'];

  return (
    <div className="min-h-screen bg-lime-200 p-4">
      {/* Título */}
      <h1 className="text-black text-3xl font-bold text-center mb-6">Mi primer calculadora hecha con la IA</h1>
      <div className="flex space-x-6">
        {/* Aside de historial */}
        <aside className="w-1/4 bg-sky-400 rounded-2xl shadow-xl p-4 overflow-y-auto">
          <h2 className="text-white text-2xl font-semibold mb-4">Historial</h2>
          <ul className="text-white list-disc list-inside space-y-1">
            {history.length === 0
              ? <li className="italic text-gray-200">Sin operaciones aún</li>
              : history.map((item, idx) => <li key={idx}>{item}</li>)
            }
          </ul>
        </aside>

        {/* Calculadora */}
        <motion.div
          className="flex-1 max-w-xs bg-black rounded-2xl shadow-xl p-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white/30 rounded-xl p-4 text-right text-3xl font-mono text-white mb-6 min-h-[3rem]">
            {display}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {buttons.map(btn => (
              <motion.button
                key={btn}
                onClick={() => {
                  if (/^[0-9.]$/.test(btn)) handleNumber(btn);
                  else if (btn === 'C') handleClear();
                  else if (btn === '=') handleEquals();
                  else handleOperator(btn);
                }}
                whileTap={{ scale: 0.9 }}
                className={`py-4 rounded-xl text-xl font-semibold shadow-md focus:outline-none
                  ${['÷','×','-','+','=','C'].includes(btn)
                    ? 'bg-white text-indigo-600'
                    : 'bg-white/70 text-gray-800'}`}
              >{btn}</motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
