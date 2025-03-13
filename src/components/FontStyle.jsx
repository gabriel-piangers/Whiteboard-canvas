export function FontStyle({ name, textOptions, setTextOptions }) {
  return (
    <input
      type="checkbox"
      className={`font-style-input ${name}-font-style`}
      checked={(textOptions[name] ? true : false)}
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
