import React,{useState} from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPaintBrush } from '@fortawesome/free-solid-svg-icons';


function ResponsiveAppBar() {

  return (
    <AppBar position="fixed" style={{height:'60px'}}>
      <Container maxWidth="xl">
        <Toolbar disableGutters style={{margin:'0'}}>
          <FontAwesomeIcon icon={faPaintBrush} style={{marginRight:'10px'}}/>
          <Typography
            variant="h6"
            noWrap
            component="a"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Canvas
          </Typography>

        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
