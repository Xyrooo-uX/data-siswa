import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  minLength,
  required = false,
  hint
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-input-wrapper">
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          value={value}
          onChange={onChange}
          required={required}
        />
        <button
          type="button"
          className="password-visibility-toggle"
          aria-label={isVisible ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
          aria-pressed={isVisible}
          onClick={() => setIsVisible(visible => !visible)}
        >
          {isVisible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
        </button>
      </div>
      {hint && <small className="password-requirement">{hint}</small>}
    </div>
  );
}
