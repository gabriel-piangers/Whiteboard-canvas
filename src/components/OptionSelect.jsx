export function OptionSelect({ name, values, textOptions, setTextOptions }) {
  return (
    <select
      name={`${name}`}
      defaultValue={textOptions[name]}
      className={`${name}-select text-options-select`}
      onChange={(event) => {
        const newTextOptions = { ...textOptions, [name]: event.target.value };
        setTextOptions(newTextOptions);
      }}
    >
      {values.map((value) => (
        <option key={`${value}`} value={`${value}`}>{`${value}`}</option>
      ))}
      ;
    </select>
  );
}
