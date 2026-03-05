/**
 * Enemy class v4.
 * This enemy manager gererates N number of mesh groups(!) and puts them to pool.
 * And only N of them will be randomly rendered within the buffer.
 * Also, materials & geometry is cached.
 * @type {EnemyManager}
 */

class EnemyPool {

	constructor() {
		this.items = [];
		this.keys = [];
	}

	addItem(item) {
		this.items.push(item);
		this.keys.push(this.items.length-1);
	}

	getItem(k) {
		return this.items[k];
	}

	getRandomKey() {
		if(!this.keys.length) {
			return false;
		}

		let i = Math.floor(Math.random() * this.keys.length);
		let k = this.keys.splice(i, 1)[0];
		return k;
	}

	returnKey(k) {
		this.keys.push(k);
	}

	reset() {
		this.items = [];
		this.keys = [];
	}
}

class EnemyManager {
	constructor() {
		this.pool = new EnemyPool();
		this.buffer = [];
		this.clock = new THREE.Clock();
		this.config = {
			"enable_collisions": true,
			"max_amount": {
				"pool": {
					"cactus": 60,
					"ptero": 18
				},
				"buffer": 15
			}, // max ammount of enemy groups
			"vel": 0, // overall speed of all enemies and other moving elements in-game
			"initial_z": -50,
			"remove_z": 25, // z offset when enemy will be removed
			"z_distance": {
				"cactus": 20,
				"ptero": 40
			}, // z distance between enemies
			"z_distance_rand": {
				"cactus": [.9, 2.5],
				"ptero": [.7, 1.5]
			}, // z distance random rescale range
			"rescale_rand": {
				"cactus": [.6, 1.2]
			}, // random rescale range
			"y_random_rotate": {
				"cactus": [-60, 60]
			},
			"x_random_range": {
				"cactus": [-.5, .5]
			},
			"elevated_chance": 25, // % chance for cactus text to spawn elevated (duckable)
			"elevated_y_offsets": [1.3, 2.0], // Y offsets for elevated text obstacles
			"chance_to_spawn_tail": [0, 0], // tails spawn chances (disabled: one word per group)
			"tail_rescale_rand": [[.6, .9], [.4, .7]], // tails rescale rand

			"ptero_anim_speed": 0.10, // lower is faster
			"ptero_y_rand": [0, 1.3, 3.5], // random ptero y positions

			"ptero_z_speedup": -35
		}

		this.cache = {
			"cactus": {
				"material": [],
				"geometry": []
			},
			"ptero": {
				"material": [],
				"geometry": []
			},
		}

		this.compactMesh = null;
		this.compactActive = false;
	}

	hasDuplicates(array) {
	    return (new Set(array)).size !== array.length;
	}

	async init() {
		// set cache
		this.cache.cactus = {
			"geometry": await load_manager.get_mesh_geometry('cactus'),
			"material": await load_manager.get_mesh_material('cactus')
		};

		this.cache.ptero = {
			"geometry": await load_manager.get_mesh_geometry('ptero'),
			"material": await load_manager.get_mesh_material('ptero')
		};

		// fill the pool
		if(!this.pool.items.length) {
			for(let i = 0; i < this.config.max_amount.pool.cactus; i++) {
				this.pool.addItem(this.createEnemy('cactus'));
			}
		}

		// initial buffer fill
		for(let i = 0; i < this.config.max_amount.buffer; i++) {
			this.buffer.push(this.spawn());
		}

		// init the /compact final boss mesh (separate from pool)
		this.initCompact();
	}

	createEnemy(type = 'cactus', tail = false, tail_number = 0) {
		// get random mesh (within given type)
		// cactus: exclude last index (21 = /compact, spawned separately)
		let meshCount = load_manager.assets[type].mesh.length;
		if(type === 'cactus') meshCount--;
		let rand = Math.floor(Math.random() * meshCount);
		let mesh = new THREE.Mesh(
			this.cache[type].geometry[rand],
			this.cache[type].material[rand]
		);
		// tag cactus meshes with their index for obstacle effect lookup
		if(type === 'cactus') {
			mesh.userData.cactusIndex = rand;
		}

		// xbox
		// mesh.xbox = new THREE.BoxHelper( mesh, 0xffff00 );
		// scene.add(mesh.xbox);

		// basic mesh setup
		mesh.enemy_type = type;
		mesh.is_text_obstacle = (mesh.geometry.type === 'TextBufferGeometry' || mesh.geometry.isTextObstacle === true);
		mesh.castShadow = true;
		if(type == 'cactus' && !mesh.is_text_obstacle) {
			mesh.rotation.y = -(Math.PI / 2);
		} else if(type != 'cactus') {
			// ptero
			mesh.current_frame = rand;
		}
		let enemiesGroup = [mesh];

		if(type == 'cactus') {
			// randomly generate cactus tails
			if(tail) {
				// return tail
				return enemiesGroup[0];
			} else {
				if(Math.floor(Math.random() * 100) < this.config.chance_to_spawn_tail[0])
				{
					// first tail
					enemiesGroup.push(this.createEnemy('cactus', true, 0));

					if(Math.floor(Math.random() * 100) < this.config.chance_to_spawn_tail[1])
					{
						// second tail
						enemiesGroup.push(this.createEnemy('cactus', true, 1));
					}
				}
			}
		}

		// render to scene
		for(let e = 0; e < enemiesGroup.length; e++) {
			enemiesGroup[e].visible = false;
			scene.add(enemiesGroup[e]);
		}

		// return
		return enemiesGroup;
	}

	spawn() {
		let rand = this.getEligibleKey();

		if(rand !== false) {
			let enemiesGroup = this.pool.getItem(rand);

			for(let i = 0; i < enemiesGroup.length; i++) {
				
				// position Y
				enemiesGroup[i].position.y = nature.cache.ground.box.max.y + -nature.cache.ground.box.min.y - 2.5;

				if(enemiesGroup[i].enemy_type == 'cactus') {

					// chance to elevate text obstacle so player can duck under
					if(enemiesGroup[i].is_text_obstacle && i == 0 && Math.floor(Math.random() * 100) < this.config.elevated_chance) {
						let yIdx = this.random(0, this.config.elevated_y_offsets.length, false);
						enemiesGroup[i].position.y += this.config.elevated_y_offsets[yIdx];
					}

					// random scale
					let rescaleRand = 1;
					if(i > 0) {
						// tail
						rescaleRand = this.random(this.config.tail_rescale_rand[i-1][0], this.config.tail_rescale_rand[i-1][1]);
					} else {
						rescaleRand = this.get_rr('cactus');
					}
					enemiesGroup[i].scale.set(rescaleRand, rescaleRand, rescaleRand);

					// random x position
		            enemiesGroup[i].position.x = this.random(
		              this.config.x_random_range.cactus[1],
		              this.config.x_random_range.cactus[0]
		            );

		            // random y rotation (skip for text obstacles so they face the player)
					if(!enemiesGroup[i].is_text_obstacle) {
						let yRandomRotate = this.random(this.config.y_random_rotate.cactus[0], this.config.y_random_rotate.cactus[1]);
						enemiesGroup[i].rotateY(THREE.Math.degToRad(yRandomRotate));
					}

					// position Z
					let zRand = this.get_z('cactus');
					if(i > 0) {
						// tail
						if(i == 1) {
							enemiesGroup[i].position.z = -(-enemiesGroup[i-1].position.z + (rescaleRand * 1.7));
						} else {
							enemiesGroup[i].position.z = -(-enemiesGroup[i-1].position.z + (rescaleRand * 1.9));
						}
					} else {
						// head
						if(!this.buffer.length) {
							// first
							enemiesGroup[i].position.z = this.config.initial_z;
						} else {
							// chain
							if(this.pool.getItem( this.buffer[ this.buffer.indexOf(this.buffer.leader) ] )[0].enemy_type == 'ptero') {
								// after ptero
								let last = this.pool.getItem(this.buffer.leader);
								zRand = this.get_z('ptero');
								enemiesGroup[i].position.z = -(-last[last.length - 1].position.z + zRand);
							} else {
								// after cactus
								let last = this.pool.getItem(this.buffer.leader);
								enemiesGroup[i].position.z = -(-last[last.length - 1].position.z + zRand);
							}
						}
					}

				} else {
					
					// ptero
					enemiesGroup[0].position.x = 0;
					enemiesGroup[0].position.y = this.get_ptero_y();

					let zRand = this.get_z('ptero');
					if(this.buffer.length) {
						// chain
						let last = this.pool.getItem(this.buffer.leader);
						enemiesGroup[i].position.z = -(-last[last.length - 1].position.z + zRand);
					} else {
						// first
						enemiesGroup[0].position.z = -(zRand * 2);
					}

				}

				// make visible
				enemiesGroup[i].visible = true;
			}

			// push to buffer
			this.buffer.leader = rand;
			return rand;
		}
	}

	despawn(k = false) {

		// identify key
		let key = null;

		if(k !== false) {
			// key = this.buffer.splice(this.buffer.indexOf(k), 1)[0];
			key = this.buffer[this.buffer.indexOf(k)];
		} else {
			// key = this.buffer.splice(0, 1)[0];
			key = this.buffer[0];
		}

		// hide mesh
		let enemiesGroup = this.pool.getItem(key);

		for(let e = 0; e < enemiesGroup.length; e++ ) {
			enemiesGroup[e].position.z = this.config.remove_z * 2;
			enemiesGroup[e].visible = false;
		}

		// push key back
		this.pool.returnKey(key);
	}

	move(timeDelta) {
		// now do the check
		for(let i = 0; i < this.buffer.length; i++) {
			let e = this.pool.getItem(this.buffer[i]);

			// respawn, if required
			if(e[0].position.z > this.config.remove_z) {
				let newEnemy = this.spawn();
				this.despawn(this.buffer[i]);
				this.buffer[i] = newEnemy; // just replace the key

				continue;
			}

			let hitResult = null;

			// move by Z & detect collisions
			for(let j = 0; j < e.length; j++) {
				if(e[j].enemy_type == 'ptero') {
					// ptero
					if(e[j].position.z > this.config.ptero_z_speedup) {
						e[j].position.z += (this.config.vel * 1.7) * timeDelta;
					} else {
						e[j].position.z += this.config.vel * timeDelta;
					}
				} else {
					// cactus
					e[j].position.z += this.config.vel * timeDelta;
				}

				/**
				 * @TODO
				 * Optimization can be done.
				 */
				if(this.config.enable_collisions) {
					// check collision with player
					let eBox = this.box3 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
					eBox.setFromObject(e[j]);

					let pBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
					pBox.setFromObject(player.collisionBox);

					if(eBox.intersectsBox(pBox) && e[j].visible) {
						hitResult = this.applyObstacleEffect(e[j]);
						break;
					}
				}
			}

			if(hitResult && hitResult.startsWith('gameover')) {
				game.stop(hitResult.replace('gameover_', ''));
				return;
			} else if(hitResult === 'despawn') {
				let newEnemy = this.spawn();
				this.despawn(this.buffer[i]);
				this.buffer[i] = newEnemy;
			}
		}

		// move /compact final boss separately
		if(this.compactActive && this.compactMesh && this.compactMesh.visible) {
			this.compactMesh.position.z += this.config.vel * timeDelta;

			if(this.compactMesh.position.z > this.config.remove_z) {
				// player dodged it
				this.compactMesh.visible = false;
				this.compactActive = false;
			} else if(this.config.enable_collisions) {
				let eBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
				eBox.setFromObject(this.compactMesh);
				let pBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
				pBox.setFromObject(player.collisionBox);
				if(eBox.intersectsBox(pBox)) {
					game.stop('compact');
					return;
				}
			}
		}
	}

	reset() {
		for(let i = 0; i < this.buffer.length; i++) {
			this.despawn();
		}

		for(let i = 0; i < this.pool.items.length; i++) {
			for(let j = 0; j < this.pool.items[i].length; j++) {
				scene.remove(this.pool.items[i][j]);
			}
		}

		this.pool.reset();
		this.buffer = [];
		delete this.buffer.leader;

		// reset compact state
		if(this.compactMesh) {
			this.compactMesh.visible = false;
		}
		this.compactActive = false;
	}

	getEligibleKey() {
		let pct = (typeof context !== 'undefined') ? context.getPercent() : 0;

		let eligible = this.pool.keys.filter(k => {
			let item = this.pool.getItem(k);
			let mesh = item[0];

			if(mesh.enemy_type === 'ptero') return true;

			let idx = mesh.userData.cactusIndex;
			if(idx === undefined || idx === null) return true;
			if(idx === 6 && pct < 0.80) return false;            // Context low: only at >=80%
			if(idx >= 15 && idx <= 19 && pct < 0.80) return false; // Yes, clear context: only at >=80%
			if(idx === 20 && pct < 0.50) return false;             // git commit and push: only at >=50%
			return true;
		});

		if(!eligible.length) return false;

		let i = Math.floor(Math.random() * eligible.length);
		let k = eligible[i];
		this.pool.keys.splice(this.pool.keys.indexOf(k), 1);
		return k;
	}

	applyObstacleEffect(mesh) {
		if(mesh.enemy_type === 'ptero') return 'gameover_overloaded';

		let idx = mesh.userData.cactusIndex;

		if(idx === 5) return 'gameover_limit'; // 5-hour limit reached

		let effectMap = {
			0:  () => context.add(9000),
			1:  () => context.add(9000),
			2:  () => context.add(9000),
			3:  () => context.add(9000),
			4:  () => context.add(60000),
			6:  () => {},                         // Context low: no impact
			7:  () => context.add(18000),
			8:  () => context.add(150000),
			9:  () => context.set(5000),
			10: () => context.multiply(2),
			11: () => this.increase_velocity(5),  // /fast: speed up, no context change
			12: () => context.add(-20000),
			13: () => context.add(24000),
			14: () => context.add(45000),
			15: () => context.set(5000),
			16: () => context.set(5000),
			17: () => context.set(5000),
			18: () => context.set(5000),
			19: () => context.set(5000),
			20: () => context.set(5000),
		};

		if(effectMap[idx]) effectMap[idx]();

		return 'despawn';
	}

	initCompact() {
		if(this.compactMesh) {
			this.compactMesh.visible = false;
			return;
		}
		// index 21 is /compact (last in cactus array)
		let lastIdx = load_manager.assets.cactus.mesh.length - 1;
		let mesh = new THREE.Mesh(
			this.cache.cactus.geometry[lastIdx],
			this.cache.cactus.material[lastIdx]
		);
		mesh.enemy_type = 'cactus';
		mesh.is_text_obstacle = true;
		mesh.userData.obstacleType = 'compact';
		mesh.userData.cactusIndex = lastIdx;
		mesh.visible = false;
		scene.add(mesh);
		this.compactMesh = mesh;
	}

	spawnCompact() {
		if(!this.compactMesh || this.compactActive) return;

		this.compactMesh.position.y = nature.cache.ground.box.max.y + -nature.cache.ground.box.min.y - 2.5;
		this.compactMesh.position.x = 0;

		if(this.buffer.length) {
			let last = this.pool.getItem(this.buffer.leader);
			this.compactMesh.position.z = -(-last[last.length - 1].position.z + this.config.z_distance.cactus * 2);
		} else {
			this.compactMesh.position.z = this.config.initial_z;
		}

		this.compactMesh.scale.set(1, 1, 1);
		this.compactMesh.visible = true;
		this.compactActive = true;
	}

	spawnPteros() {
		for(let i = 0; i < this.config.max_amount.pool.ptero; i++) {
			this.pool.addItem(this.createEnemy('ptero'));
		}
	}

	random(from, to, float = true) {
		if(float) {
			return (Math.random() * (to - from) + from).toFixed(4)
		} else {
			return Math.floor(Math.random() * to) + from;
		}
	}

	get_rr(type) {
		return this.random(this.config.rescale_rand[type][0], this.config.rescale_rand[type][1]);
	}

	get_z(type) {
		let zrr = this.random(this.config.z_distance_rand[type][0], this.config.z_distance_rand[type][1]);
		return this.config.z_distance[type] * zrr;
	}

	get_ptero_y() {
		return (nature.cache.ground.box.max.y + -nature.cache.ground.box.min.y - 2.5) + this.config.ptero_y_rand[this.random(0, this.config.ptero_y_rand.length, false)];
	}

    increase_velocity(add = 1, init = false) {
        if(this.config.vel >= 35 && !init)
            {return;}

        if(init) {
        	// set
        	this.config.vel = add;
        } else {
        	// add
        	this.config.vel += add;
        }

        if(this.config.vel < 10) {
            player.setVelocity(15);
                player.setVelocity(1.1, true);

            player.setGravity(37);
                player.setGravity(30, true);

            logs.log('Speed level 1');
        }
        else if(this.config.vel >= 10 && this.config.vel < 20 && (player.jump.vel == 15 || init)) {
            player.setVelocity(19);
                player.setVelocity(1.1, true);

            player.setGravity(60);
                player.setGravity(40, true);

            // speedup dust particles
            dynoDustEmitter.removeAllParticles();
            dynoDustEmitter.stopEmit();
            // nebulaSystem.removeEmitter(dynoDustEmitter);
            dynoDustEmitter = nebulaCreateDynoDustEmitter(7);
            nebulaSystem.addEmitter(dynoDustEmitter);

            logs.log('Speed level 2');
        }
        else if(this.config.vel >= 20 && this.config.vel < 30 && (player.jump.vel == 19 || init)) {
            player.setVelocity(25);
                player.setVelocity(1.3, true);

            player.setGravity(100);
                player.setGravity(70, true);

            // speedup dust particles
            dynoDustEmitter.removeAllParticles();
            dynoDustEmitter.stopEmit();
            // nebulaSystem.removeEmitter(dynoDustEmitter);
            dynoDustEmitter = nebulaCreateDynoDustEmitter(10);
            nebulaSystem.addEmitter(dynoDustEmitter);

            logs.log('Speed level 3');
        }
        else if(this.config.vel >= 30 && (player.jump.vel == 25 || init)) {
            player.setVelocity(30);
                player.setVelocity(1.5, true);

            player.setGravity(150);
                player.setGravity(70, true);

            // remove dust particles
            dynoDustEmitter.removeAllParticles();
            dynoDustEmitter.stopEmit();
            dynoDustEmitter.dead = true;

            logs.log('Speed level 4');
        }
    }

    pteroNextFrame() {
        for(let i = 0; i < this.buffer.length; i++) {
        	let e = this.pool.getItem(this.buffer[i])[0];

        	if(e.enemy_type == 'ptero') {
        		// animate
        		e.current_frame++;

        		if(e.current_frame > this.cache.ptero.geometry.length - 1) {
        			e.current_frame = 0;
        		}

        		e.geometry = this.cache.ptero.geometry[e.current_frame];
        	}
        }
    }

    update(timeDelta) {
    	this.move(timeDelta);

	    // draw ptero frames
	    if( this.clock.getElapsedTime() > this.config.ptero_anim_speed ) {
	        this.clock.elapsedTime = 0;
	        this.pteroNextFrame();
	    }
    }
}