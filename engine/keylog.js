
const KEYCODES = {
  
    LEFT: 37, RIGHT: 39,
    UP: 38, DOWN: 40,
    SPACE: 32,
    ESC: 27, TAB: 9,
  
    A: 65, B: 66, C: 67, D: 68,
    E: 69, F: 70, G: 71, H: 72,
    I: 73, J: 74, K: 75, L: 76,
    M: 77, N: 78, O: 79, P: 80,
    Q: 81, R: 82, S: 83, T: 84,
    U: 85, V: 86, W: 87, X: 88,
    Y: 89, Z: 90,

};


const KEY_UP     = 0;
const KEY_DOWN   = 1;
const KEY_TAPPED = 2;

class Keylog
{
    key_state   = [  ];

    preload()
    {

    };

    setup()
    {

    };

    draw()
    {
        for (let i=8; i<=222; i++)
        {
            let state = KEY_UP;

            if (keyIsDown(i))
            {
                state = KEY_DOWN;
            }

            else if (this.key_state[i] == KEY_DOWN)
            {
                state = KEY_TAPPED;
            }

            else
            {
                state = KEY_UP;
            }

            this.key_state[i] = state;
        }
    };


    keyDown( keycode )
    {
        return this.key_state[keycode] == KEY_DOWN;
    };

    keyUp( keycode )
    {
        return this.key_state[keycode] == KEY_UP;
    };

    keyTapped( keycode )
    {
        return this.key_state[keycode] == KEY_TAPPED;
    };

};