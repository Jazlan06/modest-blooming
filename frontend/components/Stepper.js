import React from "react";

export default function Stepper({ steps = [], currentStep = 0 }) {
    return (
        <div className="flex justify-center my-8 w-full ml-[3rem] sm:ml-[6rem]">
            <div className="relative w-full max-w-3xl">
                <div className="flex justify-between items-center">
                    {steps.map((step, index) => (
                        <div key={step} className="flex items-center flex-1 relative">
                            {/* Step circle */}
                            <div className="flex flex-col items-center cursor-pointer z-10">
                                <div
                                    className={`w-12 h-12 flex items-center justify-center rounded-full font-semibold shadow-lg transition-all duration-300
                                    ${index < currentStep
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white hover:scale-105'
                                        : index === currentStep
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white scale-110 shadow-xl'
                                        : 'bg-gray-200 text-gray-400'
                                    }`}
                                >
                                    {index + 1}
                                </div>
                                <span
                                    className={`mt-2 text-sm font-medium transition-colors duration-300 ${
                                        index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                                    }`}
                                >
                                    {step}
                                </span>
                            </div>

                            {/* Step line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 flex items-center relative mx-2">
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 rounded-full transform -translate-y-1/2"></div>
                                    <div
                                        className="absolute top-1/2 left-0 h-1 rounded-full transform -translate-y-1/2 transition-all duration-500"
                                        style={{
                                            width: `${index < currentStep ? 100 : 0}%`,
                                            background: 'linear-gradient(90deg, #3B82F6, #60A5FA)'
                                        }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}