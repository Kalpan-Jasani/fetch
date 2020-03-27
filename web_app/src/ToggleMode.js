import React from 'react';
import { ThemeConsumer } from 'styled-components';
import Button from './Button';
import { Brightness3, WbSunny } from '@material-ui/icons';
import { IconButton } from '@material-ui/core';

export default function ToggleMode() {
  return (
    <ThemeConsumer>
      {theme => (
        <IconButton style={{margin: 0}}
          variant="primary"
          onClick={e =>
            theme.setTheme(
              theme.mode === 'dark'
                ? { ...theme, mode: 'light' }
                : { ...theme, mode: 'dark' }
            )
          }
        >
          {theme.mode === "light" ? 
          <Brightness3 style={{height: 35, width: 35}}></Brightness3> 
          : 
          <WbSunny style={{height: 35, width: 35}}></WbSunny>
          }
        </IconButton>
      )}
    </ThemeConsumer>
  );
}
