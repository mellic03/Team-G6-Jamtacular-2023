
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



class Engine
{
    system_instances = [  ];

    constructor()
    {

    };

    /** Add a system to the system manager.
     * If the object passed is not a valid system an error will explain why.
     * 
     * @param {*} system Object instance.
     */
    addSystem( system )
    {
        let valid = true;

        if (system.preload == undefined)
        {
            value = false;
        }

        if (system.setup == undefined)
        {
            value = false;
        }

        if (system.draw == undefined)
        {
            value = false;
        }

        if (valid == false)
        {
            console.log("\n\nINVALID SYSTEM OBJECT!!!\n");
        }

        this.system_instances.push(system);
    };


    preload()
    {
        for (let instance of this.system_instances)
        {
            instance.preload();
        }
    };


    setup()
    {
        for (let instance of this.system_instances)
        {
            instance.setup();
        }
    };


    draw()
    {
        for (let instance of this.system_instances)
        {
            instance.draw();
        }
    };
};

