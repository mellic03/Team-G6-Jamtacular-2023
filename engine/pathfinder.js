"use strict";

const PATHFINDER_SECTOR_W = 32;
const PATHFINDER_SECTORS  = 128;
const PATHFINDER_SECTORS_SQ  = PATHFINDER_SECTORS**2;


class PathFinder
{
    queue = new Queue();
    blocked  = [  ];

    constructor()
    {
        for (let row=0; row<PATHFINDER_SECTORS; row++)
        {
            this.blocked.push([]);

            for (let col=0; col<PATHFINDER_SECTORS; col++)
            {
                this.blocked[row].push(false);
            }
        }
    };


    in_bounds( row, col )
    {
        if (row < 0 || row >= PATHFINDER_SECTORS)
        {
            return false;
        }

        if (col < 0 || col >= PATHFINDER_SECTORS)
        {
            return false;
        }

        return true;
    }


    block( x, y )
    {
        const cell = this.world_to_node(x, y);
        const row = cell[0];
        const col = cell[1];
        if (this.in_bounds(row, col) == false)
        {
            return;
        }

        this.blocked[row][col] = true;
    };


    unblock( x, y )
    {
        const cell = this.world_to_node(x, y);
        const row = cell[0];
        const col = cell[1];
        if (this.in_bounds(row, col) == false)
        {
            return;
        }

        this.blocked[row][col] = false;
    };


    isBlocked( row, col )
    {
        if (this.in_bounds(row, col) == false)
        {
            return false;
        }

        return this.blocked[row][col] == true;
    };


    nodeIndex( row, col )
    {
        return PATHFINDER_SECTORS*row + col;
    };


    /**
     * @param {*} x 
     * @param {*} y 
     * @returns [row, col] 
     */
    world_to_node( x, y )
    {
        let row = round((y + 512 - PATHFINDER_SECTOR_W/2) / PATHFINDER_SECTOR_W);
        let col = round((x + 512 - PATHFINDER_SECTOR_W/2) / PATHFINDER_SECTOR_W);

        return [row, col];
    };


    node_to_world( node )
    {
        let x = ((node[1]) * PATHFINDER_SECTOR_W) - 512 + PATHFINDER_SECTOR_W/2;
        let y = ((node[0]) * PATHFINDER_SECTOR_W) - 512 + PATHFINDER_SECTOR_W/2;

        return [x, y];
    };


    getNode( x, y )
    {
        const nodespace = this.world_to_node(x, y);

        let row = nodespace[0];
        let col = nodespace[1];

        if (row < 0) { row = 0; }
        if (col < 0) { col = 0; }

        let node = [row, col, -1, -1];
        let idx  = PATHFINDER_SECTORS*node[0] + node[1];

        node[2] = idx;

        return node;
    };



    getNeighbours( row, col, dx, dy )
    {
        let neighbours = [
            [row,   col+1], [row-1, col+1], [row+1, col+1],
            [row-1, col],   [row-1, col-1], [row,   col-1],
            [row+1, col],   [row+1, col-1]
        ];
        // const neighbours = [
        //                     [row-1, col],
        //     [row,   col-1],               [row,   col+1],
        //                     [row+1, col]
        // ];


        // Randomly swap two neighbours for variation
        const idx1 = floor(random(0, 7));
        const idx2 = floor(random(0, 7));

        const temp = neighbours[idx1];
        neighbours[idx2] = neighbours[idx1];
        neighbours[idx1] = temp;


        let filtered = [  ];

        for (let cell of neighbours)
        {
            if (cell[0] < 0 || cell[0] >= PATHFINDER_SECTORS)
            {
                continue;
            }

            if (cell[1] < 0 || cell[1] >= PATHFINDER_SECTORS)
            {
                continue;
            }

            cell[2] = PATHFINDER_SECTORS*cell[0] + cell[1];

            filtered.push(cell);
        }

        return filtered;
    };


    getValidNeighbours( row, col, dx, dy, visited )
    {
        let neighbours = this.getNeighbours(row, col, dx, dy);
        let filtered   = [  ];

        for (let cell of neighbours)
        {
            let row = cell[0];
            let col = cell[1];
            
            if (this.blocked[row] == undefined)
            {
                console.log("WOOP: ", row);
            }

            if (this.blocked[row][col] == true)
            {
                continue;
            }

            if (visited[PATHFINDER_SECTORS*row + col] != undefined)
            {
                continue;
            }

            filtered.push(cell);
        }

        return filtered;
    }


    node_from_idx( idx )
    {
        const row = idx / PATHFINDER_SECTORS;
        const col = idx % PATHFINDER_SECTORS;
    };


    BFS( x1, y1, x2, y2, dx, dy, visited )
    {
        let q = this.queue;
        q.clear();

        const start = this.getNode(x1, y1);
        q.enque(start);

        const end   = this.getNode(x2, y2);
        const end_idx = end[2];

        let cell;

        while (q.empty() == false)
        {
            cell = q.deque();
            const row = cell[0];
            const col = cell[1];
            const idx = cell[2];

            for (let neighbour of this.getValidNeighbours(row, col, dx, dy, visited))
            {
                const neighbour_idx = neighbour[2];
                neighbour[3] = idx;

                if (visited[neighbour_idx] != undefined)
                {
                    continue;
                }

    
                if (neighbour_idx == end_idx)
                {
                    return neighbour;
                }

                visited[neighbour_idx] = neighbour;

                q.enque(neighbour);
            }

            visited[idx] = cell;
        }
    };


    find( x1, y1, x2, y2 )
    {
        let path    = [  ];
        let visited = [  ];

        let dx = x2 - x1;
        let dy = y2 - y1;

        let cell = this.BFS(x1, y1, x2, y2, dx, dy, visited);

        if (cell == undefined)
        {
            console.log("No path");
            return path;
        }

        // Trace path back to start
        while (cell != undefined && cell[3] != -1)
        {
            path.push(this.node_to_world(cell));
            cell = visited[cell[3]];
        }

        path.push([x1, y1]);

        return path;
    };


    draw()
    {
        const render = engine.getSystem("render");

        for (let y=0; y<PATHFINDER_SECTORS/4; y++)
        {
            for (let x=0; x<PATHFINDER_SECTORS/4; x++)
            {
                const nodespace = this.node_to_world([y, x]);
                const worldspace = render.world_to_screen(...nodespace); 

                if (this.blocked[y][x])
                {
                    fill(255, 0, 0);
                }
                else
                {
                    fill(50, 255, 255);
                }
                circle(...worldspace, 10);
            }
        }
    };


    drawPath( path, stop_idx=0 )
    {
        const render = engine.getSystem("render");

        if (path.length < 2)
        {
            return;
        }

        strokeWeight(8);
        stroke(0, 0, 0, 100);

        for (let i=0; i<stop_idx; i++)
        {
            const xy0 = render.world_to_screen(path[i][0],   path[i][1]);
            const xy1 = render.world_to_screen(path[i+1][0], path[i+1][1]);
            line(...xy0, ...xy1);
        }

        strokeWeight(1);
    };


    count = 0;

    refine( terrain )
    {
        const quantity = (PATHFINDER_SECTORS_SQ) / 256;


        for (let i=this.count; i<this.count+quantity; i++)
        {
            let idx = i;

            let row = floor(idx / PATHFINDER_SECTORS);
            let col = floor(idx % PATHFINDER_SECTORS);

            const worldpos = this.node_to_world([row, col, 0, 0]);
            const data = terrain.getBlock(...worldpos);
            const blocktype = data[0];
            const span = data[1];

            if (span <= 16.0)
            {
                this.blocked[row][col] = true;
                continue;
            }

            if (this.blocked[row][col] == true && blocktype == 0)
            {
                this.blocked[row][col] = false;
            }

            else if (this.blocked[row][col] == false && blocktype > 0)
            {
                this.blocked[row][col] = true;
            }
        }
        
        this.count = (this.count + quantity) % PATHFINDER_SECTORS_SQ;
    };

};


