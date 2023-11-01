

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
    x_origin;
    y_origin;

    row_height;
    col_width;

    keylog;

    constructor( top_left, width, height, num_rows, num_cols, keylog )
    {
        this.num_cols = num_cols;

        this.width = width;
        this.height = height;

        this.row_height = height/num_rows - 1;
        this.col_width  = width/num_cols - 1;

        this.x_origin = top_left + this.col_width/2 + 1;
        this.y_origin = 0 + this.row_height/2 + 1;

        this.left   = this.x_origin - this.col_width/2;
        this.right  = this.left + this.width;

        this.top    = this.y_origin - this.row_height/2;
        this.bottom = this.top + this.height;

        this.keylog = keylog;
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


    background( grey )
    {
        rectMode(CORNER);
        fill(2);
        rect(this.x_origin-this.col_width/2, this.y_origin, this.width, this.height);
    };


    menuButton( row, col, string, callback )
    {
        const x = this.x_origin + col*this.col_width;
        const y = this.y_origin + row*this.row_height;

        let rectfill = 100;
        let textfill = 255;

        if (point_in_AABB(mouseX, mouseY, x, y, this.col_width, this.row_height))
        {
            rectfill = 255;
            textfill = 100;
            
            if (this.keylog.mouseClicked() && callback != undefined)
            {
                callback();
            }
        }

        rectMode(CENTER);
        stroke(0);
        fill(rectfill);
        rect(x, y, this.col_width, this.row_height);

        textAlign(CENTER, CENTER);
        fill(textfill);
        textSize(32);
        text(string, x, y);
    };

};


