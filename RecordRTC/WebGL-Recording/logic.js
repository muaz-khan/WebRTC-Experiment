/*!
 * Copyright (c) 2012 Ian Langworth
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * Models for the Ducks game.
 *
 * Requires: Backbone, Underscore.js.
 *
 * I'm using Backbone because it's got a simple, useful way to subscribe to
 * data events. I'm not sure how well it would scale to a full game, though,
 * with hundreds of events to closures being called every frame.
 */

/* Handy trig functions. */
var Trig = {
    deg2rad: function(deg) {
      return deg * Math.PI / 180;
    },
    rad2deg: function(rad) {
      return rad * 180 / Math.PI;
    },
    distance: function(x1, y1, x2, y2) {
      return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    },
    angle: function(x1, y1, x2, y2) {
      return Math.atan2(y2 - y1, x2 - x1);
    },
    angleDeg: function(x1, y1, x2, y2) {
      return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    }
};

var Ship = Backbone.Model.extend({

  RADIUS: 1,
  MIN_SPEED: 0.3,
  MAX_SPEED: 0.6,
  ACCELERATION: 0.005,
  MAX_TURN_SPEED: 3,

  defaults: {
    x: -20,
    y: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    dir: 0,
    targetX: 0,
    targetY: 0
  },

  tick: function() {
    var old = this.attributes;

    // Calculate the new heading. Don't let the ship turn faster than
    // TURN_SPEED.
    //
    // There are smarter solutions for turrent rotation involving dot products
    // and cross products, but I'm going to go with the simple solution:
    // http://stackoverflow.com/questions/1048945
    var M = this.MAX_TURN_SPEED;
    var dir = old.dir;
    var target = Trig.angleDeg(old.x, old.y, old.targetX, old.targetY);
    var delta = (dir - target) % 360;
    var change;
    if (Math.abs(delta) > M) {
      change = (delta < 0) ? 1 : -1;
      if (Math.abs(delta) > 180) change = 0 - change;
      dir += change * M;
    } else {
      dir = target;
    }

    // Slow down for turns but speed up for straightaways. Again, there's
    // probably a smarter way to do this using fake physics forces, but this
    // "feels" good.
    change = this.ACCELERATION * (dir === target ? 1 : -1);
    var speed = Math.max(Math.min(old.speed + change, this.MAX_SPEED), this.MIN_SPEED);
    var vx = Math.cos(Trig.deg2rad(dir)) * speed;
    var vy = Math.sin(Trig.deg2rad(dir)) * speed;

    this.set({
      speed: speed,
      delta: delta,
      dir: dir % 360,
      vx: vx,
      vy: vy,
      x: old.x + vx,
      y: old.y + vy
    });
  }

});

var Duck = Backbone.Model.extend({

  RADIUS: 1,

  defaults: {
    x: 0,
    y: 0
  }

});

var DuckCollection = Backbone.Collection.extend({
  model: Duck
});

var GameController = Backbone.View.extend({

  FRAME_RATE: 40,
  NUM_DUCKS: 12,

  LEFT: -15,
  RIGHT: 10,
  TOP: 5,
  BOTTOM: -5,

  DEMO_MODE: 0,
  PLAY_MODE: 1,

  initialize: function() {
    this.ship = new Ship();
    this.ducks = new DuckCollection();
    this.mode = this.DEMO_MODE;
    this.isRunning = false;
  },

  start: function(mode) {
    var _this = this;

    if (typeof mode !== 'undefined') {
      this.mode = mode;
    }

    this.isRunning = true;
    this.startTime = new Date().getTime();
    this.ducks.reset();
    this.ship.set(this.ship.defaults);

    var x, y;
    var MIN_DISTANCE = Duck.prototype.RADIUS * 3;
    var isTooClose = function(other) {
      var o = other.attributes;
      var distance = Trig.distance(x, y, o.x, o.y);
      return distance < MIN_DISTANCE;
    };
    _.each(_.range(this.NUM_DUCKS), function() {
      var tries = 0;
      while (tries < 30) {
        x = Math.random() * (this.RIGHT + -this.LEFT) + this.LEFT;
        y = Math.random() * (this.TOP + -this.BOTTOM) + this.BOTTOM;
        if (!this.ducks.any(isTooClose)) break;
        tries++;
      }
      this.ducks.add({ x: x, y: y });
    }, this);

    clearInterval(this.interval);
    this.interval = setInterval(function() {
      _this.tick();
    }, 1000 / this.FRAME_RATE);

    this.trigger('start');
  },

  setTarget: function(x, y) {
    this.ship.set({
      targetX: x,
      targetY: y
    });
  },

  tick: function() {
    this.ship.tick();

    var sa = this.ship.attributes;
    var max = Ship.prototype.RADIUS + Duck.prototype.RADIUS;
    if (this.mode === this.PLAY_MODE) {

      this.ducks.each(function(duck) {
        var da = duck.attributes;
        var distance = Trig.distance(sa.x, sa.y, da.x, da.y);
        if (distance < max) {
          this.ducks.remove(duck);
        }
      }, this);

      if (this.ducks.isEmpty()) {
        var seconds = Math.floor((new Date().getTime() - this.startTime) / 1000);
        if (this.isRunning) {
          this.trigger('gameover', seconds);
          this.isRunning = false;
        }
      }
    }
  },

  getRank: function(seconds) {
    if (seconds <= 10) {
      return ["Emperor Goose", "(Time to join the pros!)"];
    } else if (seconds <= 15) {
      return ["Trumpeter Swan", "(That's pretty good!)"];
    } else if (seconds <= 20) {
      return ["Mallard", "(Not too shabby!)"];
    } else if (seconds <= 25) {
      return ["Northern Shoveler", "(The ducks are patient!)"];
    } else {
      return ["Bufflehead", "(The ducks fell asleep!)"];
    }
  }

});
