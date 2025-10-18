// components/Modal.js
import React, { useState } from 'react';

export default function Modal({ show, onClose, title, message, type = 'info', showInput = false, onSubmit }) {
    const [inputValue, setInputValue] = useState('');

    if (!show) return null;

    const typeStyles = {
        success: 'text-green-600 border-green-200 bg-green-50',
        error: 'text-red-600 border-red-200 bg-red-50',
        info: 'text-blue-600 border-blue-200 bg-blue-50',
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
            <div className={`max-w-sm w-full p-6 rounded-lg shadow-xl border ${typeStyles[type]} transition-all bg-white`}>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm mb-4">{message}</p>

                {showInput && (
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-3 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D48C8C]"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                )}

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="text-gray-600 border px-4 py-2 rounded hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>

                    {showInput ? (
                        <button
                            onClick={() => onSubmit(inputValue)}
                            className="bg-[#D48C8C] text-white px-4 py-2 rounded hover:bg-[#c27878] transition"
                        >
                            Send
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="bg-[#D48C8C] text-white px-4 py-2 rounded hover:bg-[#c27878] transition"
                        >
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
