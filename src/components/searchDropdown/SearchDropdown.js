import React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const AutocompleteChild = ({ onSelect, value }) => {
 
    
  const fontFamilies = [
    'Arial',
    'Verdana',
    'Times New Roman',
    'Helvetica', 
    'Georgia', 
    'Courier New',
    'Impact',
    'Comic Sans MS', 
    'Trebuchet MS', 
    'Palatino',
    ];

  return (
    <Autocomplete
      options={fontFamilies}
      value={value}
      getOptionLabel={(option) => option}
      sx={{ width: '100%' }}
      renderInput={(params) => (
        <TextField {...params} label="Font" variant="outlined" />
      )}
      onChange={onSelect}
    />
  );
};

export default AutocompleteChild;
