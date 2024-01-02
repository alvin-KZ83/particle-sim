let directory = {}

class Bounds {
  constructor(tl, br) {
    this.tl_v = tl
    this.br_v = br
  }

  contains(point) {
    if (point.x < this.tl_v.x || point.x > this.br_v.x ||
        point.y < this.tl_v.y || point.y > this.br_v.y ) return false
    return true
  }

  display() {
    strokeWeight(1);
    stroke(0,183,235,100);
    let LR_mid = this.tl_v.x + (this.br_v.x - this.tl_v.x) / 2
    let TB_mid = this.tl_v.y + (this.br_v.y - this.tl_v.y) / 2 
    line(this.tl_v.x, TB_mid, this.br_v.x, TB_mid)
    line(LR_mid, this.tl_v.y, LR_mid, this.br_v.y)
  }
}

class Quadtree {
  constructor(tl, br, parent, max_cap) {
    this.tl_v = tl
    this.br_v = br
    this.points = []
    this.cap = max_cap
    this.isLeaf = true
    this.size = 0

    this.prefix = ""

    this.bounds = new Bounds(this.tl_v, this.br_v)

    //morton curve access
    this.parent = parent
    this.BL = null
    this.TL = null
    this.BR = null
    this.TR = null
  }

  destroy() {
    directory = {}
    this.points = []
    this.isLeaf = true
    this.size = 0
    this.BL = null
    this.TL = null
    this.BR = null
    this.TR = null
    bounds = []
  }

  insert(point) {
    if (!this.bounds.contains(point.pos)) return
    if (this.isLeaf) {
      this.points.push(point)
      point.quad_prefix = this.prefix
      point.quad_prefix = pad_prefix(point, 
        this.tl_v, this.br_v, point.quad_prefix, 
        10);
      if (directory[point.quad_prefix] == null) directory[point.quad_prefix] = []
      directory[point.quad_prefix].push(this.points)
      this.size++
      if (this.size > this.cap) {
        this.subdivide(this.prefix)
      }
      return
    }

    let LR_mid = this.tl_v.x + (this.br_v.x - this.tl_v.x) / 2
    let TB_mid = this.tl_v.y + (this.br_v.y - this.tl_v.y) / 2 

    if (point.pos.x < LR_mid) {
      //Left
      if (point.pos.y >= TB_mid) {
        //Bottom
        this.BL.insert(point)
      } else {
        //Top
        this.TL.insert(point)
      }
    } else {
      //Right
      if (point.pos.y >= TB_mid) {
        //Bottom
        this.BR.insert(point)
      } else {
        //Top
        this.TR.insert(point)
      }
    }
  }

  subdivide(prefix) {
    for (let key in directory) {
      if (key.startsWith(prefix)) {
        delete directory[key];
      }
    }
    /**
     * [A][B][C]
     * [D][E][F]
     * [G][H][I]
     */
    let LR_mid = this.tl_v.x + (this.br_v.x - this.tl_v.x) / 2
    let TB_mid = this.tl_v.y + (this.br_v.y - this.tl_v.y) / 2 
    let a = createVector(this.tl_v.x, this.tl_v.y)
    let b = createVector(LR_mid,    this.tl_v.y)
    let c = createVector(this.br_v.x, this.tl_v.y)

    let d = createVector(this.tl_v.x, TB_mid)
    let e = createVector(LR_mid,    TB_mid)
    let f = createVector(this.br_v.x, TB_mid)
    
    let g = createVector(this.tl_v.x, this.br_v.y)
    let h = createVector(LR_mid,    this.br_v.y)
    let i = createVector(this.br_v.x, this.br_v.y)

    this.BL = new Quadtree(d, h, this, this.cap)
    this.BL.prefix = this.prefix + "00"

    this.TL = new Quadtree(a, e, this, this.cap)
    this.TL.prefix = this.prefix + "01"

    this.BR = new Quadtree(e, i, this, this.cap)
    this.BR.prefix = this.prefix + "10"

    this.TR = new Quadtree(b, f, this, this.cap)
    this.TR.prefix = this.prefix + "11"

    for (let point of this.points) {
      if (point.pos.x < LR_mid) {
        //Left
        if (point.pos.y >= TB_mid) {
          //Bottom
          this.BL.insert(point)
        } else {
          //Top
          this.TL.insert(point)
        }
      } else {
        //Right
        if (point.pos.y >= TB_mid) {
          //Bottom
          this.BR.insert(point)
        } else {
          //Top
          this.TR.insert(point)
        }
      }
    }
    this.points = null
    this.size = 0
    this.isLeaf = false
    bounds.push(this.bounds)
  }
}