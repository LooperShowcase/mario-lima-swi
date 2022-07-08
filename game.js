kaboom({
  global: true,
  fullscreen: true,
  clearColor: [0, 0.5, 1, 1],
  debug: true,
  scale: 2,
});
loadRoot("./sprites/");
loadSprite("block", "block.png");
loadSprite("mario", "mario.png");
loadSprite("coin", "coin.png");
loadSprite("goomba", "evil_mushroom.png");
loadSprite("pipe", "pipe_up.png");
loadSprite("box", "surprise.png");
loadSprite("openbox", "unboxed.png");
loadSprite("mushroom", "mushroom.png");
loadSprite("cloud", "cloud.png");
loadSprite("castle", "castle.png");
loadSprite("dino", "dino.png");
loadSprite("spongebob", "spongebob.png");

loadSound("gameSound", "gameSound.mp3");
loadSound("jumpSound", "jumpSound.mp3");
scene("over", (score) => {
  add([text("you lost", 30), origin("center"), pos(width() / 2, height() / 2)]);
  add([
    text("try again\n\nSCORE:" + score + "\n \npress r to restart", 10),
    origin("center"),
    pos(width() / 2, height() / 2 + 40),
  ]);
  keyDown("r", () => {
    go("game");
  });
});
scene("win", (score) => {
  add([
    text("level complete", 30),
    origin("center"),
    pos(width() / 2, height() / 2),
  ]);
  add([
    text("press g to restart game\n SCORE:" + score, 20),
    origin("center"),
    pos(width() / 2, height() / 2 + 100),
  ]);
  keyDown("g", () => {
    go("begin");
  });
});
scene("begin", () => {
  add([
    text("welcome", 50),
    origin("center"),
    pos(width() / 2, height() / 2 - 100),
  ]);
  const btn = add([
    rect(100, 60),
    origin("center"),
    pos(width() / 2, height() / 2),
  ]);
  add([
    text("start", 15),
    origin("center"),
    pos(width() / 2, height() / 2),
    color(0.1, 0.1, 0.1),
  ]);
  btn.action(() => {
    if (btn.isHovered()) {
      btn.color = rgb(0.5, 0.6, 0.5);
      if (mouseIsClicked()) {
        go("game");
      }
    } else {
      btn.color = rgb(1, 1, 1);
    }
  });
});
scene("game", () => {
  layers(["bg", "obj", "ui"], "obj");
  play("gameSound");
  const key = {
    width: 20,
    height: 20,
    $: [sprite("coin"), "coin"],
    "=": [sprite("block"), solid()],
    "&": [sprite("pipe"), solid()],
    "%": [sprite("box"), solid(), "box-coin"],
    "!": [sprite("box"), solid(), "box-mushroom"],
    x: [sprite("openbox"), solid()],
    y: [sprite("mushroom"), solid(), body(), "mushroom"],
    "^": [sprite("goomba"), solid(), body(), "goomba"],
    k: [sprite("cloud"), "cloud"],
    j: [sprite("castle"), "castle"],
    d: [sprite("dino"), "dino"],
    t: [sprite("spongebob"), body(), solid(), "spongebob"],
  };
  const map = [
    "                                                                                                                                               ",
    "                                                  k                                                        k                                   ",
    "       k               k                                           k                                                                           ",
    "                                  k              k                                       k                                      k              ",
    "                        k                               k                k                                                                     ",
    "             k                          k                                                         k            k                               ",
    "                                                   k           k                                                        k             k        ",
    "                             k                                         k                k                                                      ",
    "     k              $$$                 k     $$                                                    k                                    k     ",
    "               k    $$$                       $$ $                      =!%==    k   $$                                  k                     ",
    "                     =!= $$$               t     $     ===%= $$$$                                         k                        j           ",
    "               ==        $$   ==%=       %=!=                                $$$$$====           k                                             ",
    "                                                                                                                      k                        ",
    "           $$$$$$$$$          ^^^^     $        ^         ^                                                                      d      d     ",
    "==============================================================================================================================================",
    "==============================================================================================================================================",
    "==============================================================================================================================================",
  ];
  const gamelevel = addLevel(map, key);
  let score = 0;
  let isjumping = false;
  const jumpForce = 360;
  const speed = 120;
  const player = add([
    sprite("mario"),
    solid(),
    pos(30, 0),
    body(),
    big(jumpForce),
    origin("bot"),
  ]);
  const scoreLabel = add([
    text("SCORE\n" + score),
    origin("center"),
    pos(30, 150),
    layer("ui"),
    {
      value: score,
    },
  ]);
  keyDown("right", () => {
    player.move(speed, 0);
  });
  keyDown("left", () => {
    if (player.pos.x > 10) {
      player.move(-speed, 0);
    }
  });
  keyPress("space", () => {
    if (player.grounded()) {
      isjumping = true;
      player.jump(jumpForce);
      play("jumpSound");
    }
  });
  player.on("headbump", (obj) => {
    console.log("hello");
    if (obj.is("box-coin")) {
      gamelevel.spawn("$", obj.gridPos.sub(0, 1));
      destroy(obj);
      gamelevel.spawn("x", obj.gridPos);
    }
    if (obj.is("box-mushroom")) {
      gamelevel.spawn("y", obj.gridPos.sub(0, 1));
      destroy(obj);
      gamelevel.spawn("x", obj.gridPos);
    }
  });
  player.collides("coin", (x) => {
    destroy(x);
    scoreLabel.value += 100;
    scoreLabel.text = "SCORE\n" + scoreLabel.value;
  });
  player.collides("mushroom", (x) => {
    destroy(x);
    player.biggify(10);
    scoreLabel.value += 1000;
    scoreLabel.text = "SCORE\n" + scoreLabel.value;
  });
  player.collides("goomba", (x) => {
    if (isjumping) {
      destroy(x);
      scoreLabel.value += 200;
      scoreLabel.text = "SCORE\n" + scoreLabel.value;
    } else {
      destroy(player);
      go("over", scoreLabel.value);
    }
  });
  player.collides("spongebob", (x) => {
    if (isjumping) {
      destroy(x);
      scoreLabel.value += 2000;
      scoreLabel.text = "SCORE\n" + scoreLabel.value;
    } else {
      destroy(player);
      go("over", scoreLabel.value);
    }
  });
  action("mushroom", (x) => {
    // x can be any mushroom
    x.move(20, 0);
  });
  action("goomba", (x) => {
    x.move(-20, 0);
  });
  action("spongebob", (x) => {
    x.move(-20, 0);
  });
  player.action(() => {
    if (player.pos.x >= 2657.920559999998) {
      go("win", scoreLabel.value);
    }
    // 2657.920559999998
    camPos(player.pos);
    scoreLabel.pos.x = player.pos.x - 200;
    if (player.grounded()) {
      isjumping = false;
    } else {
      isjumping = true;
    }
    if (player.pos.y >= height() + 200) {
      go("over", scoreLabel.value);
    }
  });
  keyDown("r", () => {
    go("game");
  });
});

start("begin");
