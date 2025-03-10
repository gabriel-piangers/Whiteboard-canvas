import { FontStyle } from "./FontStyle";
import { OptionSelect } from "./OptionSelect";
import { useEffect, useRef, useState } from "react";

export function TextOptions({ x, y, textOptions, setTextOptions }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0)
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

  let translateX = "";
  let translateY = "translateY(-50px)";

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth)
    }

  }, [containerRef])

  if (x > 75) translateX = "translateX(-25%)";
  if (x > window.innerWidth - containerWidth) translateX = `translateX(-${x-(window.innerWidth - containerWidth)}px)`;
  if (y < 50) translateY = "translateY(30px)";

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="text-option-container"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `${translateX} ${translateY}`,
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
