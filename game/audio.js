

class AudioSystem
{
    bgm = [0];

    constructor()
    {

    };

    preload( engine )
    {
        this.bgm[0] = loadSound("game/assets/bgm.mp3");

    };

    setup( engine )
    {
        bgm[0].loop();

    };

    draw( engine )
    {

    };

};



