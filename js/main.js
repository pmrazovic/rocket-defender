window.onload = function() {
  // Set the name of the hidden property and the change event for visibility
  var hidden, visibilityChange; 
  if (typeof document.hidden !== "undefined") {
    hidden = "hidden";
    visibilityChange = "visibilitychange";
  } else if (typeof document.mozHidden !== "undefined") {
    hidden = "mozHidden";
    visibilityChange = "mozvisibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }
  
  // Back key event listener
  document.addEventListener('tizenhwkey', function(e) {
    if (e.keyName === "back") {
        try {
            tizen.application.getCurrentApplication().exit();
        } catch (ignore) {}
    }
  });
  
  // Visibility change event listener
  document.addEventListener(visibilityChange, function () {
	  if (document[hidden]){
		  console.log("hidden");
	  	pause = true;
        document.removeEventListener('click', action);
        document.removeEventListener('rotarydetent', move);
	  } else {
		  console.log("not hidden");
	    pause = false;
	    countP = 0;
	    document.addEventListener('click', action);
	    document.addEventListener('rotarydetent', move);
	  }
  }, false);
  // tap event
  document.addEventListener('click', action);

  // Sprites
  var spriteExplosion = new Image();
  spriteExplosion.src = 'images/explosion.png';
  var imgRocket = new Image();
  imgRocket.src = 'images/rocket.png';
  var imgStart = new Image();
  imgStart.src = 'images/start.png';
  var imgRefresh = new Image();
  imgRefresh.src = 'images/refresh.png';
  var imgRock = new Image();
  imgRock.src = 'images/rock_1.png';
  var imgBullet = new Image();
  imgBullet.src = 'images/bullet.png';

  //Canvas
  var canvas = document.getElementById('canvas'),
      ctx    = canvas.getContext('2d'),
      cH     = ctx.canvas.height = 360,
      cW     = ctx.canvas.width  = 360;

  //Game
  var bullets    = [],
      asteroids  = [],
      explosions = [],
      destroyed  = 0,
      record     = 0,
      count      = 0,
      countP     = 0,
      pause 	 = false,
      playing    = false,
      gameOver   = false;

  //Player
  var player = {
      posX   : -24,
      posY   : -24,
      spriteWidth  : 48,
      spriteHeight : 48,
      sizeX : 48,
      sizeY : 48,
      deg    : 0
  };

  function move(e) {
	  if (e.detail.direction === "CW") {
		  player.deg += 0.261799388;
		  player.deg %= 2*Math.PI;
	  } else {
		  player.deg -= 0.261799388;
		  player.deg %= 2*Math.PI;
	  }
      //player.deg = Math.atan2(e.offsetX - (cW/2), -(e.offsetY - (cH/2)));
  }

  function action(e) {
      e.preventDefault();
      if(playing) {
          var bullet = {
              x: -8,
              y: -55,
              sizeX : 2,
              sizeY : 10,
              realX : e.offsetX,
              realY : e.offsetY,
              dirX  : e.offsetX,
              dirY  : e.offsetY,
              deg   : player.deg,
              destroyed: false
          };

          bullets.push(bullet);
      } else {
          if(gameOver) {
              if(e.type === 'click') {
                  gameOver   = false;
                  count      = 0;
                  bullets    = [];
                  asteroids  = [];
                  explosions = [];
                  destroyed  = 0;
                  player.deg = 0;
                  document.removeEventListener('rotarydetent', move);
              } 
          } else {
              if(e.type === 'click') {
                  playing = true;
                  document.removeEventListener("rotarydetent", action);
                  document.addEventListener('rotarydetent', move);
              }
          }
      }
  }

  function fire() {
      var distance;

      for(var i = 0; i < bullets.length; i++) {
          if(!bullets[i].destroyed) {
              ctx.save();
              ctx.translate(cW/2,cH/2);
              ctx.rotate(bullets[i].deg);

              ctx.drawImage(
                  imgBullet,
                  bullets[i].x,
                  bullets[i].y -= 20,
                  19,
                  30
              );

              ctx.restore();

              //Real coords
              bullets[i].realX = (0) - (bullets[i].y + 10) * Math.sin(bullets[i].deg);
              bullets[i].realY = (0) + (bullets[i].y + 10) * Math.cos(bullets[i].deg);

              bullets[i].realX += cW/2;
              bullets[i].realY += cH/2;

              //Collision
              for(var j = 0; j < asteroids.length; j++) {
                  if(!asteroids[j].destroyed) {
                      distance = Math.sqrt(Math.pow(
                              asteroids[j].realX - bullets[i].realX, 2) +
                          Math.pow(asteroids[j].realY - bullets[i].realY, 2)
                      );

                      if (distance < (((asteroids[j].width/asteroids[j].size) / 2) - 4) + ((19 / 2) - 4)) {
                          destroyed += 1;
                          asteroids[j].destroyed = true;
                          bullets[i].destroyed   = true;
                          explosions.push(asteroids[j]);
                      }
                  }
              }
          }
      }
  }

  function _player() {

      ctx.save();
      ctx.translate(cW/2,cH/2);

      ctx.rotate(player.deg);
      ctx.drawImage(
          imgRocket,
          0,
          0,
          player.spriteWidth,
          player.spriteHeight,
          player.posX,
          player.posY,
          player.sizeX,
          player.sizeY
      );

      ctx.restore();

      if(bullets.length - destroyed && playing) {
          fire();
      }
  }

  function newAsteroid() {

      var type = random(1,4),
          coordsX,
          coordsY;

      switch(type){
          case 1:
              coordsX = random(0, cW);
              coordsY = 0 - 150;
              break;
          case 2:
              coordsX = cW + 150;
              coordsY = random(0, cH);
              break;
          case 3:
              coordsX = random(0, cW);
              coordsY = cH + 150;
              break;
          case 4:
              coordsX = 0 - 150;
              coordsY = random(0, cH);
              break;
      }

      var asteroid = {
          x: 278,
          y: 0,
          state: 0,
          stateX: 0,
          width: 134,
          height: 123,
          realX: coordsX,
          realY: coordsY,
          moveY: 0,
          coordsX: coordsX,
          coordsY: coordsY,
          size: random(1, 3),
          deg: Math.atan2(coordsX  - (cW/2), -(coordsY - (cH/2))),
          destroyed: false
      };
      asteroids.push(asteroid);
  }

  function _asteroids() {
      var distance;

      for(var i = 0; i < asteroids.length; i++) {
          if (!asteroids[i].destroyed) {
              ctx.save();
              ctx.translate(asteroids[i].coordsX, asteroids[i].coordsY);
              ctx.rotate(asteroids[i].deg);

              ctx.drawImage(
            	  imgRock,
                  -(asteroids[i].width / asteroids[i].size) / 2,
                  asteroids[i].moveY += 1/(asteroids[i].size),
                  asteroids[i].width / asteroids[i].size,
                  asteroids[i].height / asteroids[i].size
              );

              ctx.restore();

              //Real Coords
              asteroids[i].realX = (0) - (asteroids[i].moveY + ((asteroids[i].height / asteroids[i].size)/2)) * Math.sin(asteroids[i].deg);
              asteroids[i].realY = (0) + (asteroids[i].moveY + ((asteroids[i].height / asteroids[i].size)/2)) * Math.cos(asteroids[i].deg);

              asteroids[i].realX += asteroids[i].coordsX;
              asteroids[i].realY += asteroids[i].coordsY;

              //Game over
              distance = Math.sqrt(Math.pow(asteroids[i].realX -  cW/2, 2) + Math.pow(asteroids[i].realY - cH/2, 2));
              if (distance < (((asteroids[i].width/asteroids[i].size) / 2) - 4) + 20) {
                  gameOver = true;
                  playing  = false;
              }
          } else if(!asteroids[i].extinct) {
              explosion(asteroids[i]);
          }
      }

      if(asteroids.length - destroyed < 10 + (Math.floor(destroyed/6))) {
          newAsteroid();
      }
  }

  function explosion(asteroid) {
      ctx.save();
      ctx.translate(asteroid.realX, asteroid.realY);
      ctx.rotate(asteroid.deg);

      var spriteY,
          spriteX = 256;
      if(asteroid.state === 0) {
          spriteY = 0;
          spriteX = 0;
      } else if (asteroid.state < 8) {
          spriteY = 0;
      } else if(asteroid.state < 16) {
          spriteY = 256;
      } else if(asteroid.state < 24) {
          spriteY = 512;
      } else {
          spriteY = 768;
      }

      if(asteroid.state === 8 || asteroid.state === 16 || asteroid.state === 24) {
          asteroid.stateX = 0;
      }

      ctx.drawImage(
          spriteExplosion,
          asteroid.stateX += spriteX,
          spriteY,
          256,
          256,
          - (asteroid.width / asteroid.size)/2,
          -(asteroid.height / asteroid.size)/2,
          asteroid.width / asteroid.size,
          asteroid.height / asteroid.size
      );
      asteroid.state += 1;

      if(asteroid.state === 31) {
          asteroid.extinct = true;
      }

      ctx.restore();
  }

  function start() {
	  if (pause) {
          if (countP < 1) {
              countP = 1;
          }
      } else if(!gameOver) {
          //Clear
          ctx.clearRect(0, 0, cW, cH);
          ctx.beginPath();
          

          //Player
          _player();

          if(playing) {
              _asteroids();

              ctx.font = "10px Helvetica";
              ctx.fillStyle = "white";
              ctx.textBaseline = 'middle';
              ctx.textAlign = "center";
              ctx.fillText(TIZEN_L10N["record"] + ': '+record+'', cW/2,cH/2 - 150);

              ctx.font = "18px Helvetica";
              ctx.fillStyle = "white";
              ctx.textAlign = "center";
              ctx.textBaseline = 'middle';
              ctx.fillText(''+destroyed+'', cW/2,cH/2 + 150);

          } else {
              ctx.font = "bold 25px Helvetica";
              ctx.fillStyle = "white";
              ctx.textAlign = "center";
              ctx.fillText("Rocket Defender", cW/2,cH/2 - 100);  	  
        	  
              ctx.font = "bold 18px Helvetica";
              ctx.fillStyle = "white";
              ctx.textAlign = "center";
              ctx.fillText(TIZEN_L10N["instructions"], cW/2,cH/2 + 100);
              
              ctx.font = "14px Helvetica";
              ctx.fillStyle = "white";
              ctx.textAlign = "center";
              ctx.fillText(TIZEN_L10N["tap_to_shoot"], cW/2,cH/2 + 125);
              ctx.fillText(TIZEN_L10N["use_bezel"], cW/2,cH/2 + 145);
              ctx.drawImage(imgStart, cW/2 - 50, cH/2 - 50);
          }
      } else if(count < 1) {
          count = 1;
          ctx.fillStyle = 'rgba(0,0,0,0.75)';
          ctx.rect(0,0, cW,cH);
          ctx.fill();

          ctx.font = "25px Helvetica";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText(TIZEN_L10N["game_over"],cW/2,cH/2 - 100);

          ctx.font = "18px Helvetica";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText(TIZEN_L10N["destroyed"] + ": "+ destroyed, cW/2,cH/2 + 100);

          record = destroyed > record ? destroyed : record;

          ctx.font = "18px Helvetica";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText(TIZEN_L10N["record"] + ": "+ record, cW/2,cH/2 + 125);

          ctx.drawImage(imgRefresh, cW/2 - 23, cH/2 - 23);

          canvas.removeAttribute('class');
      }
  }

  function init() {
      window.requestAnimationFrame(init);
      start();
  }

  init();

  //Utils
  function random(from, to) {
      return Math.floor(Math.random() * (to - from + 1)) + from;
  }

}