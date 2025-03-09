export function FontStyle({ name, textOptions, setTextOptions }) {
  return (
    <input
      type="checkbox"
      className={`font-style-input ${name}-font-style`}
      onChange={() => {
        const value = textOptions[name]
        const newTextOptions = {
            ...textOptions,
            [name]: !value
        }
        setTextOptions(newTextOptions);
      }}
    />
  );
}
