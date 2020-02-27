import React from 'react';
import { ThemeConsumer } from 'styled-components';
import Button from './Button';

export default function ToggleMode() {
  return (
    <ThemeConsumer>
      {theme => (
        <Button
          variant="primary"
          onClick={e =>
            theme.setTheme(
              theme.mode === 'dark'
                ? { ...theme, mode: 'light' }
                : { ...theme, mode: 'dark' }
            )
          }
        >
          Change Theme
        </Button>
      )}
    </ThemeConsumer>
  );
}
