import { FontStyle } from "./FontStyle";
import { OptionSelect } from "./OptionSelect";

export function TextOptions({ x, y, textOptions, setTextOptions }) {
  const fontValues = [
    "Arial",
    "Verdana",
    "Times New Roman",
    "Georgia",
    "Courier New",
    "Lucida Console",
    "cursive",
    "fantasy",
  ];
  const sizeValues = [10, 12, 14, 16, 18, 24, 36, 48, 64];

  return (
    <div
      tabIndex={0}
      className="text-option-container"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <OptionSelect
        name={"font"}
        values={fontValues}
        textOptions={textOptions}
        setTextOptions={setTextOptions}
      />
      <div className="vertical-line" />
      <OptionSelect
        name={"size"}
        values={sizeValues}
        textOptions={textOptions}
        setTextOptions={setTextOptions}
      />
      <div className="vertical-line" />
      <OptionSelect
        name={"align"}
        values={["left", "center", "right", "justify"]}
        textOptions={textOptions}
        setTextOptions={setTextOptions}
      />
      <div className="vertical-line" />
      <div className="font-styles-container">
        <FontStyle
          name={"bold"}
          textOptions={textOptions}
          setTextOptions={setTextOptions}
        />
        <FontStyle
          name={"italic"}
          textOptions={textOptions}
          setTextOptions={setTextOptions}
        />
        <FontStyle
          name={"underline"}
          textOptions={textOptions}
          setTextOptions={setTextOptions}
        />
      </div>
    </div>
  );
}
