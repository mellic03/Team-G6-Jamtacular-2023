class Queue
{
    data = [ ];
    head = 0;
    tail = 0;

    constructor()
    {

    };


    enque( data )
    {
        this.data[this.tail] = data;
        this.tail += 1;
    };


    deque()
    {
        let data = this.data[this.head];
        this.head += 1;
        return data;
    };


    empty()
    {
        return this.head >= this.tail;
    };


    clear()
    {
        this.head = 0;
        this.tail = 0;
    };

};