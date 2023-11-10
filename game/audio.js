const TRACK_1 = 0;
const TRACK_2 = 1;

class AudioSystem
{
    bgm = [  ];

    constructor()
    {

    };

    preload( engine )
    {
        this.bgm[TRACK_1] = loadSound("game/assets/bgm.mp3");
        this.bgm[TRACK_2] = loadSound("game/assets/bgm3.mp3");


    };

    setup( engine )
    {
        this.bgm[TRACK_2].loop();
        //this.bgm[TRACK_2].play();

    };

    draw( engine )
    {

    };

};



