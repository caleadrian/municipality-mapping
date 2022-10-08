import React, { useState, useId } from 'react'

function CustomCheckbox(
    {
        label,
        selectFilterCategory,
        category
    }) {
    const [checkState, setCheckState] = useState(false)
    const elementId = useId()

    const handleSelectFilterCategory = () => {
        selectFilterCategory(!checkState, category)
        setCheckState(!checkState)

    }

    return (
        <div className="form-check flex items-center">
            <input
                className="form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 align-top bg-no-repeat bg-center bg-contain mr-1.5 cursor-pointer"
                defaultChecked={checkState}
                onChange={() => handleSelectFilterCategory()}
                type="checkbox"
                id={elementId} />
            <label
                className="form-check-label inline-block text-gray-800 text-sm cursor-pointer"
                htmlFor={elementId}>
                {label}
            </label>
        </div>
    )
}

export default CustomCheckbox