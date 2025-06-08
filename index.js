//complete

function wholeProject() {
  const pages = document.getElementsByClassName('page');
  const links = document.getElementsByClassName('link');
  // page work
  function showpage(e) {
    for (let i = 0; i < pages.length; i++) {
      pages[i].style.display = 'none';
    }
    pages[e].style.display = 'block';
  }
  showpage(1);

  // make it so that it can move to another pages
  for (let i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function() {
      showpage(i);
    });
  }

  // p1

  // Functions to get html elements
  function id(e) {
    return document.getElementById(String(e));
  }
  function cl(e) {
    return document.getElementsByClassName(String(e));
  }

  // 1. display and stylize html elements

  // Get key elements
  const shape_container = id('shape_container');
  const sample_brush = id('shape_canvas').getContext('2d');
  const using_brush = id('using_shape').getContext('2d');
  const board_brush = id('board').getContext('2d');
  const resulting_brush = id('resulting_shape').getContext('2d');
  var shape_count = 0;

  // Get key variables
  const shape_width = 350;
  const shape_height = 350;

  // shape will be in form of: [line, circle, circle...] line: [1, px1, py1, px2, py2] circle: [2, cx, cy, radius] prop: [x, y, dir, scale] type: 0 or positive int (-1 is sample shape and pos int is shape of that number)
  let sample_shape = []; // [line, circle, cirlce...]
  let selected_shape = []; // [line, circle, circle...]
  let shapes = []; // [[prop, [line, circle, circle...]], [prop, [line, circle, circle...]]...]
  let changed_shapes = []; // [[[type, prop, [line, circle...]], [type, prop, [line, circle...]]...], [[type, prop, [line, circle...]], [type, prop, [line, circle...]]]...]
  let changed_shapes_list = []; // [(string that has many types in a row)...] it is totally for display, and sample shape = 'S', shapeN = n;
  let using_shape_type = -2;

  let board_shapes = []; // [[type, prop, shape], [type, prop, shape]..] shape: [line, circle]..
  let resulting_shape = []; // [boardshape, (second board shape), (third board shape)...]
  let current_generation = 0;

  let shape_x = 0;
  let shape_y = 0;
  let shape_direction = 0;
  let shape_scale = 1;

  // The function to initially set up the elements
  function setup() {
    shape_count = 0;
    shape_container.style.display = 'none';

    // wh stands for width and height. canvas that belong to this class will have certain width and height
    let whs = cl('wh');
    for (let i = 0; i < whs.length; i++) {
      whs[i].width = shape_width;
      whs[i].height = shape_height;
    }

    shapes = [];

    id('shape_container_containers').style.height = shape_height + 200 + 'px';

    label_canvas(sample_brush, 'Sample Shape');
  }

  // The function to add a new clone.
  function add_clone() {
    const new_container = shape_container.cloneNode(true);
    new_container.id = 'i' + String(shape_count);

    shape_count += 1;

    new_container.style.display = 'block';

    // Set width and height of the canvas'
    new_container.children[0].children[0].width = shape_width;
    new_container.children[1].children[0].width = shape_width;
    new_container.children[0].children[0].height = shape_height;
    new_container.children[1].children[0].height = shape_height;

    shapes.push([[0, 0, 0, 1], []]);
    changed_shapes.push([]);
    changed_shapes_list.push([]);

    label_canvas(
      new_container.children[0].children[0].getContext('2d'),
      'Shape' + String(shape_count)
    );

    id('shape_container_containers').children[0].appendChild(new_container);

    let index = Number(new_container.id[1]);

    // Make it interactable
    new_container.children[0].children[1].addEventListener('click', function() {
      // install the selected shape into shapeN
      shapes[index] = [[shape_x, shape_y, shape_direction, shape_scale], [...selected_shape]];

      let brush = new_container.children[0].children[0].getContext('2d');
      brush.clearRect(0, 0, brush.canvas.width, brush.canvas.height);
      label_canvas(brush, 'Shape' + String(index + 1));
      draw_shape(
        brush,
        shapes[index][1],
        shapes[index][0][0],
        shapes[index][0][1],
        shapes[index][0][2],
        shapes[index][0][3]
      );
    });

    new_container.children[0].children[2].addEventListener('click', function() {
      // install this shapeN to the selected shape

      // Change the shape and props
      selected_shape = shapes[index][1];
      shape_x = shapes[index][0][0];
      shape_y = shapes[index][0][1];
      shape_direction = shapes[index][0][2];
      shape_scale = shapes[index][0][3];

      // Draw it
      let brush = id('using_shape').getContext('2d');
      brush.clearRect(0, 0, brush.canvas.width, brush.canvas.height);
      using_shape_type = index + 1;
      label_canvas(brush, 'Shape' + String(index + 1));
      draw_shape(brush, selected_shape, shape_x, shape_y, shape_direction, shape_scale);
    });

    let AC_brush = new_container.children[1].children[0].getContext('2d'); // changed brush
    new_container.children[1].children[1].addEventListener('click', function() {
      // Add a shape to after-changed shape
      if (using_shape_type == -1) {
        changed_shapes_list[index] += 'S';
      } else if (using_shape_type >= 0) {
        changed_shapes_list[index] += String(using_shape_type);
      }
      changed_shapes[index].push([
        using_shape_type,
        [shape_x, shape_y, shape_direction, shape_scale],
        [...selected_shape]
      ]);

      // draw it
      AC_brush.clearRect(0, 0, AC_brush.canvas.width, AC_brush.canvas.height);
      AC_brush.globalAlpha = 0.5;
      label_canvas(AC_brush, changed_shapes_list[index]);

      AC_brush.globalAlpha = 1;
      for (let i = 0; i < changed_shapes[index].length; i++) {
        let props = changed_shapes[index][i][1];
        let the_shape = changed_shapes[index][i][2];

        draw_shape(AC_brush, the_shape, props[0], props[1], props[2], props[3]);
      }
    });

    // Delete last shape of after-changed shape
    new_container.children[1].children[2].addEventListener('click', function() {
      changed_shapes[index].pop();
      changed_shapes_list[index] = changed_shapes_list[index].slice(0, -1);

      // draw it
      AC_brush.clearRect(0, 0, AC_brush.canvas.width, AC_brush.canvas.height);
      AC_brush.globalAlpha = 0.5;
      label_canvas(AC_brush, changed_shapes_list[index]);

      AC_brush.globalAlpha = 1;
      for (let i = 0; i < changed_shapes[index].length; i++) {
        let props = changed_shapes[index][i][1];
        let the_shape = changed_shapes[index][i][2];

        draw_shape(AC_brush, the_shape, props[0], props[1], props[2], props[3]);
      }
    });

    // Clear the after-changed shape
    new_container.children[1].children[3].addEventListener('click', function() {
      changed_shapes[index] = [];
      changed_shapes_list[index] = '';

      AC_brush.clearRect(0, 0, AC_brush.canvas.width, AC_brush.canvas.height);
    });
  }

  // The function to delete the last clone
  function del_clone() {
    if (cl('shape_containers').length > 0) {
      shapes.pop();
      changed_shapes.pop();
      changed_shapes_list.pop();
      shape_count -= 1;
      cl('shape_containers')[cl('shape_containers').length - 1].remove();
    }
  }

  // 2. The functions to generate and draw fractal images

  // The functions for drawing
  function cx(width, x) {
    return width / 2 + x;
  }
  function cy(height, y) {
    return height / 2 - y;
  }
  function rd(angle) {
    return (angle * Math.PI) / 180;
  }

  function draw_line(brush_type, x1, y1, x2, y2) {
    brush_type.beginPath();

    brush_type.moveTo(cx(brush_type.canvas.width, x1), cy(brush_type.canvas.height, y1));
    brush_type.lineTo(cx(brush_type.canvas.width, x2), cy(brush_type.canvas.height, y2));
    brush_type.stroke();

    brush_type.closePath();
  }

  function draw_circle(brush_type, x, y, radius) {
    brush_type.beginPath();

    brush_type.arc(
      cx(brush_type.canvas.width, x),
      cy(brush_type.canvas.height, y),
      radius,
      0,
      Math.PI * 2
    );
    brush_type.stroke();

    brush_type.closePath();
  }

  function label_canvas(brush_type, string) {
    brush_type.fillText(string, 5, 12.5);
  }

  // The function to draw a shape under the four factors
  function draw_shape(brush_type, shape_to_draw, x, y, direction, scale) {
    for (let i = 0; i < shape_to_draw.length; i++) {
      let currentElement = shape_to_draw[i];
      // see if it is line, or circle
      if (currentElement[0] == 1) {
        // line
        let point1_x =
          currentElement[1] * Math.cos(rd(direction)) +
          currentElement[2] * Math.cos(rd(direction + 90));
        let point1_y =
          currentElement[1] * Math.sin(rd(direction)) +
          currentElement[2] * Math.sin(rd(direction + 90));
        let point2_x =
          currentElement[3] * Math.cos(rd(direction)) +
          currentElement[4] * Math.cos(rd(direction + 90));
        let point2_y =
          currentElement[3] * Math.sin(rd(direction)) +
          currentElement[4] * Math.sin(rd(direction + 90));
        point1_x = point1_x * scale + x;
        point1_y = point1_y * scale + y;
        point2_x = point2_x * scale + x;
        point2_y = point2_y * scale + y;

        draw_line(brush_type, point1_x, point1_y, point2_x, point2_y);
      } else if (currentElement[0] == 2) {
        // circle
        let pointx =
          currentElement[1] * Math.cos(rd(direction)) +
          currentElement[2] * Math.cos(rd(direction + 90));
        let pointy =
          currentElement[1] * Math.sin(rd(direction)) +
          currentElement[2] * Math.sin(rd(direction + 90));
        pointx = pointx * scale + x;
        pointy = pointy * scale + y;

        draw_circle(brush_type, pointx, pointy, currentElement[3] * scale);
      }
    }
  }

  // The function to add a line to a shape
  function shape_add_line(current_list, p1x, p1y, p2x, p2y) {
    current_list.push([1, p1x, p1y, p2x, p2y]);

    return [...current_list];
  }

  // The function to add a circle to a shape
  function shape_add_circle(current_list, x, y, radius) {
    current_list.push([2, x, y, radius]);

    return [...current_list];
  }

  // The function to add a shape to the board
  function board_add_shape(list) {
    // It will return the 'list' that has the value added
    list.push([
      using_shape_type,
      [shape_x, shape_y, shape_direction, shape_scale],
      [...selected_shape]
    ]);

    return [...list];
  }

  // The function to change the list to the next generation
  function next_generation(inputlist) {
    // 'list' must be in the correct form. It must be an array of [type, props, shape]
    let patterns = []; // [[props, props...], [props, props...]], patterns[i] is matched to shapes[i]
    let next_generation_list = [];
    // Find each patterns
    for (let i = 0; i < changed_shapes.length; i++) {
      patterns.push([]);
      let main_props = shapes[i][0];
      for (let i2 = 0; i2 < changed_shapes[i].length; i2++) {
        let current_props = changed_shapes[i][i2][1];
        // The difference in x axis and y axis
        let pdx = current_props[0] - main_props[0];
        let pdy = current_props[1] - main_props[1];
        let turn = 90 - main_props[2];

        // The difference in x axis and y axis when rotation of the shape is 90
        let dx = Math.cos(rd(turn)) * pdx + Math.cos(rd(turn + 90)) * pdy;
        let dy = Math.sin(rd(turn)) * pdx + Math.sin(rd(turn + 90)) * pdy;
        let drotation = current_props[2] - main_props[2];
        let dscale = current_props[3] / main_props[3];
        dx /= main_props[3];
        dy /= main_props[3];

        patterns[i].push([dx, dy, drotation, dscale]);
      }
    }

    // Search through each shapes on the board and change each of them into changed-shape
    for (let i = 0; i < inputlist.length; i++) {
      if (inputlist[i][0] > 0) {
        // If it is changing shape
        let index = inputlist[i][0] - 1;
        let props = inputlist[i][1];

        // Add each changed shapes to the next generation
        for (let i2 = 0; i2 < changed_shapes[index].length; i2++) {
          let pattern = patterns[index][i2];

          console.log(pattern[0]);
          console.log(pattern[1]);
          let new_x =
            Math.cos(rd(props[2] - 90)) * pattern[0] + Math.cos(rd(props[2])) * pattern[1];
          let new_y =
            Math.sin(rd(props[2] - 90)) * pattern[0] + Math.sin(rd(props[2])) * pattern[1];
          new_x *= props[3];
          new_y *= props[3];

          let new_type = changed_shapes[index][i2][0];
          let new_props = [
            props[0] + new_x,
            props[1] + new_y,
            props[2] + pattern[2],
            props[3] * pattern[3]
          ];
          let new_shape = changed_shapes[index][i2][2];

          next_generation_list.push([new_type, new_props, new_shape]);
        }
      } else {
        next_generation_list.push(inputlist[i]);
      }
    }

    return [...next_generation_list];
  }

  // Now start the functions
  setup();

  id('add_shape_container').addEventListener('click', add_clone);
  id('del_shape_container').addEventListener('click', del_clone);

  // Interactions with html elements

  // When a new shape is added or deleted in a canvas, it will delete all and re-draw the new list

  // Add line to sample shape
  id('add_line').addEventListener('click', function() {
    sample_shape = shape_add_line(
      sample_shape,
      id('first_point_x').value,
      id('first_point_y').value,
      id('second_point_x').value,
      id('second_point_y').value
OA    );
    sample_brush.clearRect(0, 0, sample_brush.canvas.width, sample_brush.canvas.height);
    label_canvas(sample_brush, 'Sample Shape');
    draw_shape(sample_brush, sample_shape, 0, 0, 0, 1);
  });

  // add circle to sample shape
  id('add_circle').addEventListener('click', function() {
    sample_shape = shape_add_circle(
      sample_shape,
      id('center_x').value,
      id('center_y').value,
      id('circle_radius').value
    );
    sample_brush.clearRect(0, 0, sample_brush.canvas.width, sample_brush.canvas.height);
    label_canvas(sample_brush, 'Sample Shape');
    draw_shape(sample_brush, sample_shape, 0, 0, 0, 1);
  });

  // changed using shape into sample shape
  id('use_sample_shape').addEventListener('click', function() {
    selected_shape = [...sample_shape];
    using_brush.clearRect(0, 0, using_brush.canvas.width, using_brush.canvas.height);
    using_shape_type = -1;
    label_canvas(using_brush, 'Sample Shape');
    draw_shape(using_brush, selected_shape, shape_x, shape_y, shape_direction, shape_scale);
  });

  // delete last shape of sample shape
  id('del_last').addEventListener('click', function() {
    sample_shape.pop();
    sample_brush.clearRect(0, 0, sample_brush.canvas.width, sample_brush.canvas.height);
    label_canvas(sample_brush, 'Sample Shape');

    draw_shape(sample_brush, sample_shape, 0, 0, 0, 1);
  });

  // clear the sample shape
  id('clear_sample_shape').addEventListener('click', function() {
    sample_shape = [];

    sample_brush.clearRect(0, 0, sample_brush.canvas.width, sample_brush.canvas.height);
    label_canvas(sample_brush, 'Sample Shape');
  });

  // apply x, y, direction, scale
  id('apply_properties').addEventListener('click', function() {
    let inputs_container = id('editor_container').children[1];
    let v1 = inputs_container.children[0].value;
    let v2 = inputs_container.children[1].value;
    let v3 = inputs_container.children[2].value;
    let v4 = inputs_container.children[3].value;

    if (!isNaN(v1) && v1.trim() !== '') shape_x = parseFloat(inputs_container.children[0].value);
    if (!isNaN(v2) && v2.trim() !== '') shape_y = parseFloat(inputs_container.children[1].value);
    if (!isNaN(v3) && v3.trim() !== '')
      shape_direction = parseFloat(inputs_container.children[2].value);
    if (!isNaN(v4) && v4.trim() !== '')
      shape_scale = parseFloat(inputs_container.children[3].value);

    using_brush.clearRect(0, 0, using_brush.canvas.width, using_brush.canvas.height);
    if (using_shape_type == -1) {
      label_canvas(using_brush, 'Sample Shape');
    } else if (using_shape_type >= 0) {
      label_canvas(using_brush, 'Shape' + String(using_shape_type));
    }

    draw_shape(using_brush, selected_shape, shape_x, shape_y, shape_direction, shape_scale);
  });

  // add the shape into the board
  id('board_add').addEventListener('click', function() {
    board_shapes = board_add_shape(board_shapes);
    resulting_shape = [[...board_shapes]];
    current_generation = 0;

    board_brush.clearRect(0, 0, board_brush.canvas.width, board_brush.canvas.height);

    for (let i = 0; i < board_shapes.length; i++) {
      // B is just to make sure that the name doesn't overlap with any other variables and it is cool!
      let Bprops = board_shapes[i][1];
      let Bshape = board_shapes[i][2];

      draw_shape(board_brush, Bshape, Bprops[0], Bprops[1], Bprops[2], Bprops[3]);
    }
  });

  // delete the last shape of the board
  id('board_del').addEventListener('click', function() {
    board_shapes.pop();

    resulting_shape = [[...board_shapes]];
    current_generation = 0;

    board_brush.clearRect(0, 0, board_brush.canvas.width, board_brush.canvas.height);
    for (let i = 0; i < board_shapes.length; i++) {
      // B is just to make sure that the name doesn't overlap with any other variables and it is cool!
      let Bprops = board_shapes[i][1];
      let Bshape = board_shapes[i][2];

      draw_shape(board_brush, Bshape, Bprops[0], Bprops[1], Bprops[2], Bprops[3]);
    }
OB  });

  // clear the board
OB  id('board_clear').addEventListener('click', function() {
    board_shapes = [];
    resulting_shape = [[]];
OB    current_generation = 0;

    board_brush.clearRect(0, 0, board_brush.canvas.width, board_brush.canvas.height);
  });

  // Generate the next generation
  id('resulting_shape_container').children[1].children[1].addEventListener('click', function() {
    current_generation += 1;
    if (current_generation > 8) {
      current_generation = 8;
    }
    if (current_generation >= resulting_shape.length) {
      resulting_shape.push(next_generation(resulting_shape[resulting_shape.length - 1]));
    }

    let the_shape = resulting_shape[current_generation];

    resulting_brush.clearRect(0, 0, resulting_brush.canvas.width, resulting_brush.canvas.height);
    // draw it
    for (let i = 0; i < the_shape.length; i++) {
      draw_shape(
        id('resulting_shape_container').children[1].children[0].getContext('2d'),
        the_shape[i][2],
        the_shape[i][1][0],
        the_shape[i][1][1],
        the_shape[i][1][2],
        the_shape[i][1][3]
      );
    }
  });

  // Go back the generation
  id('resulting_shape_container').children[1].children[2].addEventListener('click', function() {
    current_generation -= 1;
    if (current_generation < 0) {
      current_generation = 0;
OB    }

    let the_shape = resulting_shape[current_generation];

    resulting_brush.clearRect(0, 0, resulting_brush.canvas.width, resulting_brush.canvas.height);
    // draw it
    for (let i = 0; i < the_shape.length; i++) {
      draw_shape(
        id('resulting_shape_container').children[1].children[0].getContext('2d'),
        the_shape[i][2],
        the_shape[i][1][0],
        the_shape[i][1][1],
        the_shape[i][1][2],
        the_shape[i][1][3]
      );
    }
  });

  // p1
}

document.addEventListener('DOMContentLoaded', wholeProject);

