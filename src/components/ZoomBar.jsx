export function ZoomBar({ scale, setScale }) {
  const zoomMarks = [10, 20, 33, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500];

  function zoomOut(scale) {
    const percentScale = scale * 100;
    for (let i = 1; i < zoomMarks.length; i++) {
      if (percentScale <= zoomMarks[i] && percentScale > zoomMarks[i - 1]) {
        return zoomMarks[i - 1];
      }
    }
    return zoomMarks[0];
  }

  function zoomIn(scale) {
    const percentScale = scale * 100;
    for (let i = 0; i < zoomMarks.length - 1; i++) {
      if (percentScale >= zoomMarks[i] && percentScale < zoomMarks[i + 1]) {
        return zoomMarks[i + 1];
      }
    }
    return zoomMarks[zoomMarks.length - 1];
  }

  return (
    <div className="zoom-bar-container">
      <div className="zoom-bar">
        <button
          className="zoom-out-button tool-input tool-bar-option"
          onClick={() => {
            const newScale = zoomOut(scale) / 100;
            setScale(newScale);
          }}
        />
        <div className="zoom-preview">{`${Math.floor(scale * 100)}%`}</div>
        <button
          className="zoom-in-button tool-input tool-bar-option"
          onClick={() => {
            let newScale = zoomIn(scale) / 100;
            setScale(newScale);
          }}
        />
      </div>
    </div>
  );
}
