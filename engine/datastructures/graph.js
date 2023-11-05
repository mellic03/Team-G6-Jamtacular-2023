
class GraphNode
{
    neighbours = [  ];
};


class Graph
{
    nodes = new Allocator(GraphNode);
    adj_list = [  ];


    safety( a, b )
    {
        if (this.adj_list[a] == undefined)
        {
            this.adj_list[a] = [];
        }

        if (this.adj_list[b] == undefined)
        {
            this.adj_list[b] = [];
        }
    };


    add( a, b, weight )
    {
        this.safety(a, b);

        this.adj_list[a][b] = weight;
        this.adj_list[b][a] = weight;
    };


    remove( a, b )
    {
        this.safety(a, b);

        this.adj_list[a][b] = Infinity;
        this.adj_list[b][a] = Infinity;
    };


    dijkstra( a, b )
    {
        let path = [ ];
        let q    = [ ];

        while (q.length > 0)
        {
            let u = q.pop();

            
        }

        return path;
    };


    AStar( a, b )
    {

    };

};

