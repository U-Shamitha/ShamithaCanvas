import React, { useState, useRef, useEffect } from 'react';
import { MDBBtn, MDBIcon, MDBInput, MDBTextArea } from 'mdb-react-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faDeleteLeft, faTrash, faUndo, faRedo, faAdd, faDownload } from '@fortawesome/free-solid-svg-icons';

import styles from './canvas.module.css'
import { Autocomplete, Box, CardHeader, Menu, MenuItem, TextField, Tooltip, Typography } from '@mui/material';
import AutocompleteChild from '../searchDropdown/SearchDropdown';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const DraggableEditableText = () => {
  const [textsHistory, setTextsHistory] = useState([
    [
      { id: 1, content: 'Edit me!', position: { x: 50, y: 50 }, style: { color: 'black', fontSize: 16, fontFamily: 'Arial', fontWeight: 400 }},
    ],
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const texts = textsHistory[currentStep];
  const [nextId, setNextId] = useState(2);
  const initialPositionForNewText = { x: 250, y: 50 };
  const [selectedText, setSelectedText] = useState(null);
  const [isDragging, setDragging] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [fontColor, setFontColor] = useState('black');
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontWeight, setFontWeight] = useState(400);
  const [colorChanged, setColorChanged] = useState(false);
  const downloadOptions = ['As Image', 'As PDF'];
  const [anchorElDownload, setAnchorElDownload] = useState(null);
  const mouseDownPostion =  useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const canvasPostionTop = 65;
  const canvasPostionLeft = 10;
  const canvasDivMargin = 20;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = container.querySelector('canvas');
    const input = container.querySelector('input');
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);
    texts.map((text)=>{
      // console.log(text)
      // console.log(text.position)
      if ( (selectedText && selectedText.id!==text.id) || !isEditing) {
        // Draw text on the canvas only if not editing or just dropped
        context.font = `${text.style.fontSize}px ${text.style.fontFamily}`;
        context.fillStyle = text.style.color;
        context.fillText(text.content, text.position.x, text.position.y);
      }else if(selectedText && selectedText.id===text.id && !isEditing){
        context.font = `${text.style.fontSize}px ${text.style.fontFamily}`;
        context.fillStyle = text.style.color;
        context.fillText(text.content, selectedText.position.x, selectedText.position.y);
      }
    })

    if(selectedText){
      // console.log(selectedText)
      input.style.left = `${selectedText.position.x - canvasDivMargin + canvasPostionLeft}px`; // Adjusted for margin
      input.style.top = `${selectedText.position.y -canvasDivMargin + canvasPostionTop}px`; // Adjusted for margin +canvas top
    }else{
      console.log("selectedText",selectedText)
    }

    if (isEditing) {
      input.style.display = 'block';
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      input.style.display = 'none';
    }
   
  }, [texts, isDragging, isEditing, selectedText]);

  useEffect(()=>{
    if(selectedText){
      setSelectedText(texts.find(({id})=>id===selectedText.id));
    }
  })

  useEffect(()=>{
    console.log(selectedText)
    if(selectedText){
    setFontColor(selectedText.style.color);
    setFontSize(selectedText.style.fontSize);
    setFontFamily(selectedText.style.fontFamily);
    setFontWeight(selectedText.style.fontWeight);
    }
  },[selectedText])

  const handleMouseDown = (e) => {
    if (colorChanged) {
      // Ignore the first mouse down after setting the color
      setColorChanged(false);
      return;
    }
    console.log("handleMouseDown")
    setEditing(false)
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if the click is within the boundaries of the text element
    //Show input feild when clicked on text
    texts.map(({id, position}) =>{
        if (
          x >= position.x + canvasPostionLeft &&
          x <= position.x + 100 + canvasPostionLeft && // Adjust this value based on the text width
          y >= position.y - 25 + canvasPostionTop&&
          y <= position.y + canvasPostionTop
        ) {
          // console.log(texts.find(({id: textId})=> textId===id))
          mouseDownPostion.current = { x: x-5, y: y-10 }
          setSelectedText(texts.find(({id: textId})=> textId===id))
        }
    })

    if (!isEditing) {
      setDragging(true);
    }
  };

  const handleMouseUp = () => {
    console.log("handleMouseUp")
    setDragging(false);
    setEditing(false);
    console.log(mouseDownPostion.current)
    if(mouseDownPostion.current){
      // setCurrentStep((prevCurrentStep)=> prevCurrentStep+1)
      const newHistory = textsHistory.slice(0, currentStep)
      const newTexts = textsHistory[currentStep].map((text) =>
        text.id === selectedText.id ? { ...text, position: mouseDownPostion.current } : text
      );
      newHistory.push(newTexts);
      newHistory.push(textsHistory[currentStep])
      console.log(newHistory)
      setTextsHistory(newHistory)
      setCurrentStep(newHistory.length-1)
    }
    mouseDownPostion.current=null;
  };

  const handleMouseMove = (e) => {
    if (selectedText && isDragging) {
      console.log("handleMouseMove")
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;


      setTextsHistory((prevHistory) => {
        const newHistory = [...prevHistory.slice(0, currentStep + 1)];
        const newTexts = newHistory[currentStep].map((text) =>
          text.id === selectedText.id ? { ...text, position: { x: x-5, y: y-10 } } : text
        );
        newHistory.pop()
        newHistory.push(newTexts);
        setCurrentStep(newHistory.length - 1);
        return newHistory;
      });
    }
  };

  const handleTextClick = (e) => {
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if the click is within the boundaries of the text element
    //Show input feild when clicked on text
    let isClickedOnText = false;
    texts.map(({id, content, position, style}) =>{
      const width = getTextWidth(content, style.fontSize, style.fontFamily);
      if (
        x >= position.x + canvasPostionLeft&&
        x <= position.x + width + canvasPostionLeft && // Adjust this value based on the text width
        y >= position.y - 25 + canvasPostionTop &&
        y <= position.y + canvasPostionTop
      ) {
        console.log(texts.find(({id: textId})=> textId===id))
        setSelectedText(texts.find(({id: textId})=> textId===id))
        setEditing(true);
        isClickedOnText=true;
      }
    })
    if(!isClickedOnText){
      setEditing(false);
    }
  };

  const handleTextChange = (e) => {
    if(selectedText){
    setTextsHistory((prevHistory) => {
      const newHistory = [...prevHistory.slice(0, currentStep + 1)];
      const newTexts = newHistory[currentStep].map((text) =>
        text.id === selectedText.id
          ? { ...text, content: e.target.value }
          : text
      );
      newHistory.push(newTexts);
      setCurrentStep(newHistory.length - 1);
      return newHistory;
    });
  }
  };

  const handleInputBlur = () => {
    setEditing(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      inputRef.current.blur();
    }
  };

  const handleAddTextClick = () => {
    console.log("add text clicked")
    const newText = {
      id: nextId,
      content: 'New Text',
      position: initialPositionForNewText,
      style: { color: 'black', fontSize: 16, fontFamily: 'Arial' },
    };

    setTextsHistory((prevHistory) => {
      const newHistory = [...prevHistory.slice(0, currentStep + 1)];
      newHistory.push([...newHistory[currentStep], newText]);
      setCurrentStep(newHistory.length - 1);
      setNextId((prevId) => prevId + 1);
      return newHistory;
    });
  };

  const handleFontColorChange = (e) => {
    const newColor = e.target.value;
    setFontColor(newColor);
    setColorChanged(true);

    if(selectedText){
      setTextsHistory((prevHistory) => {
        const newHistory = [...prevHistory.slice(0, currentStep + 1)];
        const newTexts = newHistory[currentStep].map((text) =>
          text.id === selectedText.id
            ? { ...text, style: { ...text.style, color: newColor } }
            : text
        );
        newHistory.push(newTexts);
        setCurrentStep(newHistory.length - 1);
        return newHistory;
      });
    }
  };

  const handleFontSizeChange = (e) => {
    const newSize = e.target.value;
    setFontSize(newSize);

    if(selectedText){
      setTextsHistory((prevHistory) => {
        const newHistory = [...prevHistory.slice(0, currentStep + 1)];
        const newTexts = newHistory[currentStep].map((text) =>
          text.id === selectedText.id
            ? { ...text, style: { ...text.style, fontSize: newSize } }
            : text
        );
        newHistory.push(newTexts);
        setCurrentStep(newHistory.length - 1);
        return newHistory;
      });
    }
  
  };

  const handleFontFamilyChange = (e, value) => {

    setFontFamily(value)

    if(selectedText){
      setTextsHistory((prevHistory) => {
        const newHistory = [...prevHistory.slice(0, currentStep + 1)];
        const newTexts = newHistory[currentStep].map((text) =>
          text.id === selectedText.id
            ? { ...text, style: { ...text.style, fontFamily: value } }
            : text
        );
        newHistory.push(newTexts);
        setCurrentStep(newHistory.length - 1);
        return newHistory;
      });
  
    }

  }

  const handleFontWeightChange = (e) => {
    // Parse the value to a number
    const newFontWeight = e.target.value;
    setFontWeight(newFontWeight);

    if(selectedText){
      setTextsHistory((prevHistory) => {
        const newHistory = [...prevHistory.slice(0, currentStep + 1)];
        const newTexts = newHistory[currentStep].map((text) =>
          text.id === selectedText.id
            ? { ...text, style: { ...text.style, fontWeight: newFontWeight } }
            : text
        );
        newHistory.push(newTexts);
        setCurrentStep(newHistory.length - 1);
        return newHistory;
      });
    }

  };

const getTextWidth=(content, fontSize, fontFamily)=> {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = `${fontSize}px ${fontFamily}`;
  const textMetrics = context.measureText(content);
  return textMetrics.width;
}

const handleUndo = () => {
  if (currentStep > 0) {
    setCurrentStep((prevStep) => prevStep - 1);
  }
};

const handleRedo = () => {
  if (currentStep < textsHistory.length - 1) {
    setCurrentStep((prevStep) => prevStep + 1);
  }
};

const handleClearHistory = () => {
  setTextsHistory([textsHistory[textsHistory.length - 1]]);
    setCurrentStep(0);
}

const handleOpenDownloadMenu = (e) => {
  setAnchorElDownload(e.currentTarget);
};

const handleCloseDownloadMenu = () => {
  setAnchorElDownload(null);
};

const handleDownloadOptionSelect = (option) => {
  downloadCanvas(option)
  handleCloseDownloadMenu();
};

const downloadCanvas = async (option) => {
  const canvas = canvasRef.current;
  const context = canvas.getContext('2d');

  // Clear the canvas with a white background
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Render the text on the cleared canvas
  texts.map((text) => {
    context.font = `${text.style.fontSize}px ${text.style.fontFamily}`;
    context.fillStyle = text.style.color;
    context.fillText(text.content, text.position.x, text.position.y);
  });

  // Trigger the download
  const link = document.createElement('a');

  if(option==="As Image"){
    link.href = canvas.toDataURL('image/png');
    link.download = 'canvas_image.png';
    link.click();
  }

  if(option==="As PDF"){
    const canvasImage = await html2canvas(canvas);
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Calculate the aspect ratio to fit the image into the PDF
    const imgWidth = 210; // A4 page width in mm
    const imgHeight = (canvasImage.height * imgWidth) / canvasImage.width;

    pdf.addImage(canvasImage.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('canvas_document.pdf');
  }

};

  return (
    <div  className={styles.mainContainer} style={{marginTop:'80px'}}>
    <div
    className={styles.canvasDiv}
      ref={containerRef}
      style={{ position: 'relative', width: '800px', height: '515px' }}
      onMouseUp={handleMouseUp}
      // onMouseDown={(e)=>handleMouseDown(e)}
      onMouseMove={handleMouseMove}
    >
      <div style={{ display: 'flex', justifyContent:'space-between', alignContent:'center', marginTop:'10px', marginLeft:'10px', gap:'20px'}}>
        <div style={{ display: 'flex', marginLeft:'10px', gap:'20px', marginBottom:'0px'}}>
        <MDBBtn rounded id="undo" onClick={handleUndo} disabled={currentStep === 0}>
          <FontAwesomeIcon icon={faUndo} size='lg'/>
        </MDBBtn>
        <MDBBtn rounded  id="redo" onClick={handleRedo} disabled={currentStep === textsHistory.length - 1} >
          <FontAwesomeIcon icon={faRedo} size='lg'/>
        </MDBBtn>
        <MDBBtn rounded id="clearHistory" onClick={handleClearHistory} disabled={textsHistory.length<1} style={{ backgroundColor: '#D22B2B' }} href='#'>
        <FontAwesomeIcon icon={faTrash}/> &nbsp; Clear History
        </MDBBtn>
        </div>
        <Box sx={{ flexGrow: 0 }}>
            <Tooltip 
            // title="Download As"
            >
              <MDBBtn rounded id="download" style={{width:'36px', height:'36px', padding:'0px', marginRight:'20px'}} onClick={handleOpenDownloadMenu}>
               <FontAwesomeIcon icon={faDownload} size='lg'/>
              </MDBBtn>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElDownload}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElDownload)}
              onClose={handleCloseDownloadMenu}
            >
              {downloadOptions.map((option) => (
                <MenuItem key={option} onClick={handleCloseDownloadMenu}>
                  <Typography textAlign="center" onClick={() => handleDownloadOptionSelect(option)}>{option}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
      </div>
      <hr style={{margin:'10px 0px'}}/>
      <canvas
        ref={canvasRef}
        width={780}
        height={442}
        style={{ position: 'absolute', top: canvasPostionTop, left: canvasPostionLeft, backgroundColor: 'white'}}
        onClick={handleTextClick}
        onMouseDown={(e)=>handleMouseDown(e)}
      />
      <input
        ref={inputRef}
        type="text"
        value={selectedText ? selectedText.content : ''}
        onChange={handleTextChange}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        style={{
          position: 'absolute',
          zIndex: 1,
          display: (selectedText  && selectedText.isEditing) ? 'block' : 'none',
          height: '30px'
        }}
      />
    </div>
    <div className={styles.editorContainer}>
    <div className={styles.editorDiv}>

      <div style={{width:'110%', height:'40px'}}>
        <Typography variant='h5'>Editor</Typography>
        <hr style={{ marginLeft:-20, marginTop:8}}/>
      </div>
      <AutocompleteChild onSelect={handleFontFamilyChange} value={fontFamily} />
      <div style={{display:'flex', gap:'10px', justifyContent:'space-around'}}>
        <MDBInput label='Size' id='typeNumber' type='number' value={fontSize} onChange={handleFontSizeChange} style={{height:'50px'}}/>
        <input type="color" value={fontColor} onChange={handleFontColorChange} style={{width:'70px',height:'50px'}}/>
      </div>
      <MDBTextArea label='Content' id='textArea-ec' rows={6} value={selectedText ? selectedText.content : ''}
        onChange={handleTextChange}/>
      <MDBBtn onClick={handleAddTextClick} style={{width:'100%', height:'50px'}}><FontAwesomeIcon icon={faAdd}/> &nbsp; Add Text</MDBBtn>
    </div>
    </div>
    </div>
  );
};

export default DraggableEditableText;