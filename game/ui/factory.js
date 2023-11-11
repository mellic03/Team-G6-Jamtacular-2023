

class FactoryModal
{
    UIgrid;
    name    = "Factory";
    visible = false;
    factory = undefined;

    constructor( x, y, w, h )
    {
        this.UIgrid = new MenuGrid(x, y, w, h, 20, 20);
    };


    reposition( x, y, w, h )
    {
        this.UIgrid = new MenuGrid(x, y, w, h, 20, 20);
    };

    show( factory )
    {
        this.factory = factory;
        this.visible = true;
    };

    hide()
    {
        this.factory = undefined;
        this.visible = false;
    };

    draw( )
    {
        const terrain = engine.getSystem("terrain");
        const player = engine.getSystem("player");
        const factorySys = engine.getSystem("factory");
        const agentSys = engine.getSystem("agent");
        const playerFactory = factorySys.player_factory;
        
        if (this.visible == false)
        {
            return;
        }

        rectMode(CORNERS);

        const factory = this.factory;
        const ui = this.UIgrid;

        ui.reset(3);
        ui.background(100);
        ui.padding[0] = 50;
        ui.padding[1] = 50;



        ui.nextRow(3);
        ui.menuTitle("Build", 1);
        ui.nextRow(6);
        ui.nextRow(4);

        ui.menuLabel(0, 1, "$" + agentSys.costOf(AGENT_GATHERER), CENTER);
        ui.menuLabel(0, 2, "$" + agentSys.costOf(AGENT_SOLDIER),  CENTER);
        ui.menuLabel(0, 3, "$" + agentSys.costOf(AGENT_SECURITY), CENTER);
        ui.nextRow(4);

        ui.menuLabel(0, 0, "Units");

        ui.menuButton2(0, 1, "Gatherer", () => {
            factory.createAgent(AGENT_GATHERER);
        });

        ui.menuButton2(0, 2, "Soldier", () => {
            factory.createAgent(AGENT_SOLDIER);
        });

        ui.menuButton2(0, 3, "Security", () => {
            factory.createAgent(AGENT_SECURITY);
        });


        ui.nextRow(3);
        ui.nextRow(4);
        ui.menuLabel(0, 1, "$10",  CENTER);
        ui.menuLabel(0, 2, "$50",  CENTER);
        ui.menuLabel(0, 3, "$100", CENTER);
        ui.nextRow(4);

        ui.menuLabel(0, 0, "Ammo");

        ui.menuButton2(0, 1, "x10", () => {
            if (factory.monies >= 10)
            {
                factory.monies -= 10;
                player.ammo += 10;
            }
        });

        ui.menuButton2(0, 2, "x50", () => {
            if (factory.monies >= 50)
            {
                factory.monies -= 50;
                player.ammo += 50;
            }
        });

        ui.menuButton2(0, 3, "x100", () => {
            if (factory.monies >= 100)
            {
                factory.monies -= 100;
                player.ammo += 100;
            }
        });


        ui.nextRow(1);
        ui.nextRow(1);
        ui.menuButton2(0, 0, "Launch Attack", () => {

            if (factory == playerFactory)
            {
                let idx = floor(random(0, factorySys.factories.length-1)) + 1;
                let f   = factorySys.factories[idx];
                factory.launch_attack(f);
            }
            else
            {
                factory.launch_attack(playerFactory);
            }
        });

    
        ui.nextRow(4);
        ui.menuButton(-1, -1, "Close", () => { this.hide(); });
    };
    
};



