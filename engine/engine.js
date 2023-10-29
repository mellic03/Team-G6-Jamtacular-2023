
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

