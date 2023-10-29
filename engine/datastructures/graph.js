
class GraphNode
{
    neighbours = [  ];
};


class Graph
{
    nodes = new Allocator(GraphNode);
    adj_list = [  ];
    
    add( a, b, weight )
    {
        if (this.adj_list[a] == undefined)
        {
            this.adj_list[a] = [];
        }

        if (this.adj_list[b] == undefined)
        {
            this.adj_list[b] = [];
        }

        this.adj_list[a][b] = weight;
        this.adj_list[b][a] = weight;
    };


    draw()
    {
        for (let node of this.adj_list)
        {
            console.log(node);
        }
    };

    dijkstra( a, b )
    {

    };


    AStar( a, b )
    {

    };

};

