/**
 * Player class.
 * @type {PlayerManager}
 */

  class PlayerManager {
    constructor() {
      this.frames = null;
      this.frames_band = null;
      this.frames_death = null;
      this.frame = null;
      this.collisionBox = null;
      this.currentFrame = 0;
      this.clock = new THREE.Clock();
      this.anim_speed = 0.10; // lower is faster
      this.block_fall_fast = false;
      this.jump_frames = null;
      this.jump = {
          "is_active": false,
          "vel": 15,
          "gravity": -37,
          "boost": {
            "vel": 1.1, // mult
            "gravity": -30 // new g
          }
      }
      this.eject = {
          active: false,
          velY: 0,
          velX: 0,
          velZ: 0,
          rotVelY: 0,
          rotVelZ: 0,
          gravity: -22
      }
    }

    init() {
        // init position
        for(let i in this.frames) {
            this.frames[i].position.y = nature.cache.ground.box.max.y + 0.05;
            this.frames[i].position.z = 15;
            this.frames[i].rotation.y = Math.PI / 2;

            this.frames[i].init_y = this.frames[i].position.y;
        }

        for(let i in this.frames_band) {
            this.frames_band[i].position.y = nature.cache.ground.box.max.y + 0.05;
            this.frames_band[i].position.z = 15;
            this.frames_band[i].rotation.y = Math.PI / 2;

            this.frames_band[i].init_y = this.frames_band[i].position.y;
        }

        for(let i in this.frames_death) {
            this.frames_death[i].position.y = nature.cache.ground.box.max.y + 0.05;
            this.frames_death[i].position.z = 15;
            this.frames_death[i].rotation.y = Math.PI / 2;
        }
    }

    getVelocity(boost = false) {
        if(boost) {return this.jump.boost.vel;}
        else {return this.jump.vel;}
    }

    setVelocity(v = 15, boost = false) {
        if(boost) {this.jump.boost.vel = v;}
        else {this.jump.vel = v;}
    }

    getGravity(boost = false) {
        if(boost) {return -(this.jump.boost.gravity);}
        else {return -(this.jump.gravity);}
    }

    setGravity(g = 37, boost = false) {
        if(boost) {this.jump.boost.gravity = -g;}
        else {this.jump.gravity = -g;}
    }

    setPlayerDeathFrames(frames) {
        this.frames_death = frames;
    }

    setPlayerFrames(frames, band_down = false) {
        if(!band_down)
        {
            // stance
            this.frames = frames;
            this.frame = this.frames[this.currentFrame];
            this.frame.init_y = this.frame.position.y;

            scene.add(this.frame);

            // set collision box (sized for Clawd the crab)
            let geometry = new THREE.BoxGeometry( .7, 1.2, .9 );
            let material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
            this.collisionBox = new THREE.Mesh( geometry, material );
            this.collisionBox.position.x = this.frame.position.x;
            this.collisionBox.position.y = this.frame.position.y + 0.9;
            this.collisionBox.position.z = this.frame.position.z;
            scene.add( this.collisionBox );

            this.collisionBox.visible = false;
        } else
        {
            // band down
            this.frames_band = frames;
        }
    }

    nextFrame(ignore_jump = false) {
        if(!ignore_jump && this.jump.is_active)
            return;

        this.currentFrame++;

        if( this.currentFrame > this.frames.length - 1 )
            this.currentFrame = 0;
        
        // console.log("FRAME: " + this.currentFrame);

        if(!input.keys.down.down) {
            // stance
            this.frame.geometry = this.frames[this.currentFrame].geometry;
            this.collisionBox.scale.y = 1;
            this.collisionBox.scale.z = 1;
            this.collisionBox.position.z = this.frame.position.z;
            this.collisionBox.position.y = this.frame.position.y + 0.9;
        } else {
            // band down
            this.frame.geometry = this.frames_band[this.currentFrame].geometry;
            this.collisionBox.scale.y = 0.5;
            this.collisionBox.scale.z = 2.0;
            this.collisionBox.position.z = this.frame.position.z - .3;
            this.collisionBox.position.y = this.frame.position.y + 0.45;
        }
    }

    startEject() {
        if(!this.frame) return;
        this.eject.active = true;
        this.eject.velY    = 7 + Math.random() * 4;
        this.eject.velX    = (Math.random() - 0.5) * 5;
        this.eject.velZ    = -(2 + Math.random() * 3); // fly backward
        this.eject.rotVelY = (Math.random() - 0.5) * 8;
        this.eject.rotVelZ = (Math.random() - 0.5) * 6;
        if(this.collisionBox) this.collisionBox.visible = false;
    }

    deathFrame() {
        if(!input.keys.down.down) {
            // stance
            this.frame.geometry = this.frames_death['wow'].geometry;
        } else {
            // band down
            this.frame.geometry = this.frames_death['wow-down'].geometry;
        }
    }

    getY() {
        return this.frame.position.y;
        // return this.frames[0].position.y;
    }

    setY(y) {
        this.frame.position.y = y;
        // this.frames.forEach(function(f) {
        //     f.position.y = y;
        // });
    }

    initJump(timeDelta) {
        this.jump.is_active = true;
        this.jump.falling = false;
        this.frame.vel = this.jump.vel;
        this.frame.gravity = this.jump.gravity;
        this.frame.boost = false;
        this.jump.spin_start = this.frame.rotation.y;
        this.jump.max_y = this.frame.position.y;
        this.nextFrame(true);

        audio.play('jump');

        if( !dynoDustEmitter.dead ) {
            dynoDustEmitter.stopEmit();
        }

        if(input.keys.down.down) {
            this.block_fall_fast = true;
        }
    }

    doJump(timeDelta) {

        if((input.keys.space.justPressed) && !this.jump.is_active && !input.keys.down.down) {
            this.initJump(timeDelta);
        }

        if(this.jump.is_active) {

            input.keys.space.clock.getElapsedTime();
            if( !this.frame.boost && input.keys.space.down && input.keys.space.clock.getElapsedTime() > 0.20 ) {
                // this.frame.vel = this.frame.vel + this.jump.vel / 8;
                // this.frame.gravity = this.jump.gravity / 1.5;

                this.frame.vel = this.frame.vel * this.jump.boost.vel;
                this.frame.gravity = this.jump.boost.gravity;
                this.frame.boost = true;
            }

            if(input.keys.down.justReleased) {
                this.block_fall_fast = false;
            }

            if(input.keys.down.down && !this.block_fall_fast) {
                // fall fast
                this.frame.gravity = this.frame.gravity * 1.1;
                this.frame.geometry = this.frames_band[this.currentFrame].geometry;
                this.collisionBox.scale.y = 0.5;
                this.collisionBox.scale.z = 2.0;
                this.collisionBox.position.z = this.frame.position.z - .3;
                this.collisionBox.position.y = this.frame.position.y - 1.5;
            }

            this.frame.position.y = this.frame.position.y + this.frame.vel * timeDelta;
            // Spin while jumping — tied to height for smooth easing
            if (this.frame.position.y > this.jump.max_y) {
                this.jump.max_y = this.frame.position.y;
            }
            var jumpHeight = this.jump.max_y - this.frame.init_y;
            if (jumpHeight > 0.01) {
                var currentHeight = this.frame.position.y - this.frame.init_y;
                var progress;
                if (this.frame.vel >= 0) {
                    progress = (currentHeight / jumpHeight) * 0.5;
                } else {
                    progress = 1 - (currentHeight / jumpHeight) * 0.5;
                }
                // Clamp progress to [0,1] to prevent partial rotations from boost
                progress = Math.max(0, Math.min(1, progress));
                this.frame.rotation.y = this.jump.spin_start + progress * Math.PI * 4;
            }
            // Swap arm geometry based on velocity
            if (this.jump_frames) {
                if (this.frame.vel >= 0) {
                    this.frame.geometry = this.jump_frames.armsDown;
                } else {
                    this.frame.geometry = this.jump_frames.armsUp;
                }
            }
            if(input.keys.down.down && !this.block_fall_fast) {
                // fall fast
                this.collisionBox.position.y = this.frame.position.y + .5;
            } else {
                this.collisionBox.position.y = this.frame.position.y + 0.9;
            }
            this.frame.vel = this.frame.vel + this.frame.gravity * timeDelta;

            if(this.frame.position.y <= this.frame.init_y) {
                if(!input.keys.space.down) {
                    // simple fall
                    this.jump.is_active = false;
                    if( !dynoDustEmitter.dead ) {
                        dynoDustEmitter.emit();
                    }
                } else if(!input.keys.down.down) {
                    // space is down, continue to jump
                    this.initJump(timeDelta);
                } else {
                    // simple fall
                    this.jump.is_active = false;
                    if( !dynoDustEmitter.dead ) {
                        dynoDustEmitter.emit();
                    }
                }

                this.frame.position.y = this.frame.init_y;
                this.frame.rotation.y = this.jump.spin_start; // Spin completes full rotations
                this.collisionBox.position.y = this.frame.position.y + 0.9;
                input.keys.space.clock.elapsedTime = 0;
            }
        }
    }

    reset() {
        this.eject.active = false;
        if(this.frame) {
            // restore position and rotation after death eject
            this.frame.position.y = this.frame.init_y;
            this.frame.position.x = this.frames[0].position.x;
            this.frame.position.z = this.frames[0].position.z;
            this.frame.rotation.y = Math.PI / 2;
            this.frame.rotation.z = 0;
            if(this.collisionBox) {
                this.collisionBox.position.x = this.frame.position.x;
                this.collisionBox.position.y = this.frame.position.y + 0.9;
                this.collisionBox.position.z = this.frame.position.z;
                this.collisionBox.visible = false;
            }
        }
        this.jump.is_active = false;
        this.currentFrame = 0;
        this.nextFrame();
    }

    update(timeDelta) {
        if(this.eject.active && this.frame) {
            this.eject.velY += this.eject.gravity * timeDelta;
            this.frame.position.y += this.eject.velY * timeDelta;
            this.frame.position.x += this.eject.velX * timeDelta;
            this.frame.position.z += this.eject.velZ * timeDelta;
            this.frame.rotation.y += this.eject.rotVelY * timeDelta;
            this.frame.rotation.z += this.eject.rotVelZ * timeDelta;
            return;
        }

        if( this.frames ) {
            this.anim_speed = 0.18 / (enemy.config.vel / 2);
            this.doJump(timeDelta);

            // draw frames
            if( this.clock.getElapsedTime() > this.anim_speed ) {
                this.clock.elapsedTime = 0;
                this.nextFrame();
            }
        }
    }
  }