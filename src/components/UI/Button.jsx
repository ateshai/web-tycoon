import React from 'react'

const Button = ({ onClick, disabled, variant = 'primary', children, className = '' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`button ${variant} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button