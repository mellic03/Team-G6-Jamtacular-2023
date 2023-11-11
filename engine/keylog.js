
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

const MOUSE_UP       = 0;
const MOUSE_DOWN     = 1;
const MOUSE_CLICKED  = 2;
const MOUSE_CLICKED2 = 3;
const MOUSE_DRAGGED  = 4;

const CLICK_MS = 100;

let states      = [ false, false, false, false, false ];
let last_states = [ false, false, false, false, false ];
let time_down = 0;


class Keylog
{
    key_state    = [  ];
    drag_start_position = [0, 0];
    mouse_locked = false;
    clicked_flag = false;

    preload()
    {

    };

    setup()
    {

    };


    __check_down()
    {
        return mouseIsPressed;
    };

    __check_up()
    {
        if (mouseIsPressed == false)
        {
            this.clicked_flag = false;
            return true;
        }

        return false;
    };

    __check_clicked()
    {
        const c0 = last_states[MOUSE_DOWN] == true;
        const c1 = states[MOUSE_DOWN]      == false;

        const passes = c0 && c1;

        if (this.clicked_flag == false && states[MOUSE_DOWN] == true)
        {
            this.clicked_flag = true;
            return true;
        }

        else
        {
            return false;
        }
    };


    __check_clicked2()
    {
        const c0 = last_states[MOUSE_DOWN] == true;
        const c1 = states[MOUSE_DOWN]      == false;

        const passes = c0 && c1;

        if (last_states[MOUSE_UP] == false && states[MOUSE_UP] == true && time_down < CLICK_MS)
        {
            return true;
        }

        else
        {
            return false;
        }
    };


    __check_dragged()
    {
        if (states[MOUSE_DOWN] == false)
        {
            this.drag_start_position = [mouseX, mouseY];
            return false;
        }

        else
        {
            const delta = vec2_sub([mouseX, mouseY], this.drag_start_position);
            if (vec2_magSq(delta) > 16.0)
            {
                return true;
            }
        }
    };


    draw()
    {
        last_states[MOUSE_DOWN]    = valueof(states[MOUSE_DOWN]);
        last_states[MOUSE_UP]      = valueof(states[MOUSE_UP]);
        last_states[MOUSE_CLICKED] = valueof(states[MOUSE_CLICKED]);
        last_states[MOUSE_CLICKED2] = valueof(states[MOUSE_CLICKED2]);
        last_states[MOUSE_DRAGGED] = valueof(states[MOUSE_DRAGGED]);

        states[MOUSE_DOWN]    = this.__check_down();
        states[MOUSE_UP]      = this.__check_up();
        states[MOUSE_CLICKED] = this.__check_clicked();
        states[MOUSE_CLICKED2] = this.__check_clicked2();
        states[MOUSE_DRAGGED] = this.__check_dragged();


        if (states[MOUSE_DOWN] == true)
        {
            time_down += deltaTime;
        }

        else
        {
            time_down = 0;
        }


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

    mouseDown()
    {
        return states[MOUSE_DOWN];
    };

    mouseClicked()
    {
        return states[MOUSE_CLICKED];
    };

    mouseClicked2()
    {
        return states[MOUSE_CLICKED2];
    };

    mouseDragged()
    {
        return states[MOUSE_DRAGGED];
    };

    mouseUp()
    {
        return !states[MOUSE_DOWN];
    }

    lockMouse()
    {
        this.mouse_locked = true;
    };

    unlockMouse()
    {
        this.mouse_locked = false;
    };

    mouseLocked()
    {
        return this.mouse_locked == true;
    };

};

