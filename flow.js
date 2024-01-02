class Flow {
    constructor(rows, cols, left_bound, right_bound, top_bound, bottom_bound) {
      this.field = [];
      this.rows = rows;
      this.cols = cols;
      this.row_h = (bottom_bound - top_bound) / rows;
      this.col_w = (right_bound - left_bound) / cols;
      this.left_bound = left_bound;
      this.right_bound = right_bound;
      this.top_bound = top_bound;
      this.bottom_bound = bottom_bound;
      for (let i = 0; i < rows * cols; i++) {
        this.field[i] = createVector();
      }
      //only initializing
    }
  
    /**
     * Updates the field
     * @param {*} t
     */
    update_field(t, choice) {
      for (let i = 0; i < this.field.length; i++) {
        //create the field here
        let pos = this.index_to_coord(i);
        let bound, x, y;
        switch (choice) {
          case 1:
            bound = 5;
            x = map(pos.x, this.left_bound, this.right_bound, -bound, bound);
            y = map(pos.y, this.top_bound, this.bottom_bound, -bound, bound);
            this.field[i].set(
              x ** 2 - y ** 2 - 4,
              2 * x * y
            );
            break;
          case 2:
            bound = Math.PI;
            x = map(pos.x, this.left_bound, this.right_bound, -bound, bound);
            y = map(pos.y, this.top_bound, this.bottom_bound, -bound, bound);
            this.field[i].set(
              x - y - x * (x ** 2 + y ** 2),
              x + y - y * (x ** 2 + y ** 2)
            );
            break;
          case 3: 
            bound = Math.PI;
            x = map(pos.x, this.left_bound, this.right_bound, -bound, bound);
            y = map(pos.y, this.top_bound, this.bottom_bound, -bound, bound);
            this.field[i].set(
              Math.sin(x + y),
              Math.cos(x - y)
            );
            break;
          case 4:
            bound = 1;
            x = map(pos.x, this.left_bound, this.right_bound, -bound, bound);
            y = map(pos.y, this.top_bound, this.bottom_bound, -bound, bound);
            this.field[i].set(
              y ** 3 - 9 * y,
              x ** 3 - 9 * x
            );
            break;
          default:
            break;
        }
        this.field[i].limit(speed);
      }
    }
  
    display() {
      this.drawGrid();
      this.drawField();
    }
  
    drawField() {
        stroke(100);
      for (let i = 0; i < this.field.length; i++) {
        let ori = this.index_to_coord(i);
        let dir = ori.copy().add(this.field[i].copy().mult(1000).limit(10));
        line(ori.x, ori.y, dir.x, dir.y);
        circle(dir.x, dir.y, 3);
      }
    }
  
    drawGrid() {
        stroke(70);
      for (let i = 0; i < this.rows; i++) {
        line(this.left_bound, i * this.row_h, this.right_bound, i * this.row_h);
      }
  
      for (let j = 0; j < this.cols; j++) {
        line(j * this.col_w, this.top_bound, j * this.col_w, this.bottom_bound);
      }
    }

    get_flow(x, y) {
        return this.field[this.coord_to_index(x, y)];
    }
  
    /**
     * Converts index i to real coords
     * @param {*} i
     */
    index_to_coord(i) {
      let c = i % this.cols;
      let r = Math.floor(i / this.cols);
      let x = c * this.col_w + this.col_w / 2;
      let y = r * this.row_h + this.row_h / 2;
      return new p5.Vector(x, y);
    }
  
    /**
     * Returns an int array that contains the i and j indices of the array
     * @param {*} x
     * @param {*} y
     * @returns
     */
    coord_to_index(x, y) {
      let i = int(y / this.row_h);
      let j = int(x / this.col_w);
      return i * this.cols + j;
    }
  }