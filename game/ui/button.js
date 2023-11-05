

function point_in_AABB( px, py, bx, by, bw, bh )
{
    const half_w = bw/2;
    const half_h = bh/2;

    if (px < bx-half_w || px > bx+half_w)
    {
        return false;
    }

    if (py < by-half_h || py > by+half_h)
    {
        return false;
    }

    return true;
}



class ButtonGrid
{
    row_height;
    col_width;
    current_row = 0;
    padding = [0, 0, 0, 0];
    text_scale = 1.0;

    constructor( left, top, width, height, num_rows, num_cols )
    {
        this.left   = left;
        this.right  = this.left + width;

        this.top    = top;
        this.bottom = this.top + height;

        this.width  = width;
        this.height = height;

        this.num_rows = num_rows;
        this.num_cols = num_cols;

        this.row_height = height/num_rows;
        this.col_width  = width /num_cols;

    };


    mouseInBounds()
    {
        if (mouseX < this.left || mouseX > this.right)
        {
            return false;
        }

        if (mouseY < this.top || mouseY > this.bottom)
        {
            return false;
        }

        return true;
    };


    background( rgba = [0, 0, 0, 0] )
    {
        rectMode(CORNER);
        fill(rgba);
        rect(this.left, this.top, this.width, this.height);
    };


    originof( row, col )
    {
        let r = this.current_row + valueof(row);
        let c = valueof(col);

        if (row < 0)
        {
            r = this.num_rows + row;
        }

        if (col < 0)
        {
            c = this.num_cols + col;
        }

        const x = this.left + c*this.col_width  + this.col_width/2;
        const y = this.top  + r*this.row_height + this.row_height/2;

        return [x, y];
    };



    originof2( row, col )
    {
        return this.originof(this.current_row+row, col);
    };


    reset( num_cols=5 )
    {
        this.num_cols = num_cols;
        this.col_width  = this.width / num_cols;

        this.current_row = 0;
        this.padding = [0, 0, 0, 0];
    };


    padding( nx, ny, px, py )
    {
        this.padding = [ nx, ny, px, py ];
    };


    menuTitle( title, col, text_scale=1.0 )
    {
        const position = this.originof(this.current_row, col);

        fill(255);
        stroke(255);

        textAlign(CENTER, CENTER);
        textSize(text_scale*this.text_scale*0.85*this.row_height);

        text(title, ...position);
        line(this.left+this.col_width/2, position[1]+this.row_height/1.5, this.right-this.col_width/2, position[1]+this.row_height/1.5);
    };


    nextRow( num_cols=5 )
    {
        this.num_cols = num_cols;
        this.col_width  = this.width / num_cols;
        this.current_row += 1;
    };

    
    menuLabel( row, col, string )
    {
        const position = this.originof2(row, col);
        const width  = this.col_width;
        const height = this.row_height;

        let rectfill = 100;
        let textfill = 255;

        rectMode(CENTER);
        stroke(0);
        fill(rectfill);
        rect(...position, width, height);

        textAlign(CENTER, CENTER);
        fill(textfill);
        textSize(this.text_scale*0.85*this.row_height);
        text(string, ...position);
    };

    menuButton( row, col, string, callback, selected=false )
    {
        const keylog = engine.getSystem("keylog");
        const position = this.originof(row, col);
        const width  = this.col_width;
        const height = this.row_height;
        

        let rectfill = 100;
        let textfill = 255;

        if (selected || point_in_AABB(mouseX, mouseY, ...position, width, height))
        {
            rectfill = 255;
            textfill = 100;
            
            if (keylog.mouseClicked() && callback != undefined)
            {
                callback();
            }
        }

        rectMode(CENTER);
        stroke(0);
        fill(rectfill);
        rect(...position, width, height);

        textAlign(CENTER, CENTER);
        fill(textfill);
        textSize(this.text_scale*0.85*this.row_height);
        text(string, ...position);
    };


    menuButton2( row, col, string, callback, selected=false )
    {
        const keylog = engine.getSystem("keylog");
        const position = this.originof(this.current_row+row, col);
        const width  = this.col_width;
        const height = this.row_height;
        

        let rectfill = 100;
        let textfill = 255;

        if (selected || point_in_AABB(mouseX, mouseY, ...position, width, height))
        {
            rectfill = 255;
            textfill = 100;
            
            if (keylog.mouseClicked() && callback != undefined)
            {
                callback();
            }
        }

        rectMode(CENTER);
        stroke(0);
        fill(rectfill);
        rect(...position, width, height);

        textAlign(CENTER, CENTER);
        fill(textfill);
        textSize(this.text_scale*0.85*this.row_height);
        text(string, ...position);
    };
};


