

function valueof( n )
{
    return 0.5*n + 0.5*n;
}



class Engine
{
    system_instances = [  ];
    system_IDs       = [  ];
    system_events    = [  ];


    /** Add a system to the system manager.
     * If the object passed is not a valid system an error will explain why.
     * 
     * @param {*} system Object instance.
     * @param {*} name Name of system. Used to access it from other systems. 
     */
    addSystem( system, name )
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

        const ID = this.system_instances.length;
        this.system_instances.push(system);
        this.system_IDs[name] = ID;
        this.system_events[ID] = [];
    };


    getSystem( name )
    {
        const ID = this.system_IDs[name];
        return this.system_instances[ID];
    };


    setEvent( system_name, event_name, event_data )
    {
        const id = this.system_IDs[system_name];
        this.system_events[id][event_name] = event_data;
    }

    getEvent( system_name, event_name )
    {
        const id = this.system_IDs[system_name];
        return this.system_events[id][event_name];
    };


    preload()
    {
        for (let i=0; i<this.system_instances.length; i++)
        {
            this.system_instances[i].preload(this);
        }
    };


    setup()
    {
        for (let i=0; i<this.system_instances.length; i++)
        {
            this.system_instances[i].setup(this);
        }
    };


    draw()
    {
        for (let i=0; i<this.system_instances.length; i++)
        {
            this.system_instances[i].draw(this);
        }
    };

};

