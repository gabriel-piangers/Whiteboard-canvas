import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

export default function SliderSizes({selectedWidth, setWidth}) {
  
    const handleChange = (event, newValue) => {
        setWidth(newValue)
    }

    return (
    <Box sx={{width: '75%'}} >
      <Slider
        size="small"
        defaultValue={2}
        aria-label="Small"
        valueLabelDisplay="auto"
        disableSwap={true}
        value={selectedWidth}
        onChange={handleChange}
        min={1}
        max={30}
        sx={{
            color: '#ec9615',
            
        }}
      />
    </Box>
  );
}