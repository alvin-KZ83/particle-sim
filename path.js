class Path {
  constructor(node, dist) {
    this.head = node;
    this.length = 1;
    this.tail = this.head;
    this.maxDist = dist;
  }

  append(node) {
    this.tail.next = node;
    node.prev = this.tail;
    this.tail = node;
    this.length++;
  }

  prepend(node) {
    this.head.prev = node;
    node.next = this.head;
    this.head = node;
    this.length++;
  }

  insert(index, node) {
    if (index == 0) {
      this.prepend(node);
      return this;
    }

    if (index == this.length) {
      this.append(node);
      return this;
    }

    if (index > 0 && index < this.length) {
      let list = this.head;

      for (let k = 0; k < index; k++) {
        list = list.next;
      }

      let prev = list.prev;
      prev.next = node;
      node.prev = prev;
      node.next = list;
      list.prev = node;

      this.length++;
      return this;
    }
    return this;
  }

  remove(index) {
    if (index == 0) {
      this.head = this.head.next;
      this.length--;
      return this;
    }

    if (index == this.length - 1) {
      this.tail = this.tail.prev;
      this.length--;
      return this;
    }

    if (index > 0 && index < this.length) {
      let list = this.head;

      for (let k = 0; k < index; k++) {
        list = list.next;
      }

      list.next.prev = list.prev;
      list.prev.next = list.next;
      this.length--;
      return this;
    }
    return this;
  }

  grow(closed, render_line, flow_field, brute) {
    //reset tree
    let list = this.head;
    let index = 0;
    while (list) {
      //attract
      if (list.prev) {
        list.attract(list.prev);
        list.prev.attract(list);
      }

      if (list.next) {
        list.attract(list.next);
        list.next.attract(list);
      }

      if (!brute) {
        // repel
        let local_set = get_locality(
          list.quad_prefix,
          1
        );
        for (let prefixes of local_set) {
          let points_to_repel = directory[prefixes];
          // console.log(points_to_repel)
          if (points_to_repel) {
            for (let other of points_to_repel) {
              if (other !== list) {
                list.repel(other);
              }
            }
          }
        }
      } else {
        // Repel from other nodes
        let other = this.head;
        while (other) {
          if (other !== list) {
            list.repel(other);
          }
          other = other.next;
        }
      }
      list.update(flow_field);
      list.acc.mult(list.age);
      list.vel.add(list.acc);
      list.vel.mult(list.age);
      list.pos.add(list.vel);
      list.acc.mult(0.0);

      //if it is outside the window remove it
      if (!qtree.bounds.contains(list.pos)) {
        this.remove(index);
        index--;
      }

      list = list.next;
      index++;
    }

    this.update(closed);

    qtree.destroy();

    list = this.head;
    while (list) {
      qtree.insert(list);
      list = list.next;
    }

    this.display(closed, render_line);
  }

  update(closed) {
    let list = this.head;
    let index = 0;
    while (list.next != null) {
      let distance = p5.Vector.dist(list.pos, list.next.pos);
      if (distance > this.maxDist) {
        let normal = p5.Vector.sub(list.next.pos, list.pos).limit(
          this.maxDist / 2
        );

        let inject = p5.Vector.add(list.pos, normal);

        let injectedGrowth = normal.rotate(HALF_PI).limit(speed);
        let injectedNode = new Point(
          inject,
          point_mass,
          this.distortion(injectedGrowth, inject, normal)
        );

        this.insert(index + 1, injectedNode);
        list.reset_p();
        list.next.next.reset_p();
      }
      list = list.next;
      index++;
    }

    if (closed) {
      let distance = p5.Vector.dist(this.head.pos, this.tail.pos);
      if (distance > this.maxDist) {
        let normal = p5.Vector.sub(this.head.pos, this.tail.pos).limit(
          this.maxDist / 2
        );

        let inject = p5.Vector.add(this.tail.pos, normal);

        let injectedGrowth = normal.rotate(HALF_PI).limit(speed);
        let injectedNode = new Point(
          inject,
          point_mass,
          this.distortion(injectedGrowth, inject, normal)
        );

        this.append(injectedNode);
      }
    }

    return this;
  }

  distortion(growth, inject, normal) {
    // //Using nothing
    // return growth;

    //Using perlin noise coordinates
    let rotation = map(
      noise(inject.x, inject.y),
      0,
      1,
      -Math.PI / 2,
      Math.PI / 2
    );
    let distortedBasedOnCoords = growth.rotate(rotation);
    return distortedBasedOnCoords;
  }

  display(closed, render_line) {
    let list = this.head;
    stroke(255);
    strokeWeight(1);
    if (!render_line) {
      while (list != null) {
        list.display();
        list = list.next;
      }
      return this;
    }

    while (list.next != null) {
      line(list.pos.x, list.pos.y, list.next.pos.x, list.next.pos.y);
      list = list.next;
    }

    if (closed) {
      line(this.tail.pos.x, this.tail.pos.y, this.head.pos.x, this.head.pos.y);
    }
    return this;
  }
}
