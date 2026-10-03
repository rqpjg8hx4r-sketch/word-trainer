/**
 * 3D Rubik's Cube Engine (Three.js based)
 * Supports 3x3 and 2x2, standard WCA notation, layer rotations,
 * step-by-step stepping, reverse stepping, strip masking, and camera controls.
 */

(function (global) {
  // WCA Standard Colors
  const COLORS = {
    U: 0xFFD500, // Yellow (Top)
    D: 0xFFFFFF, // White (Bottom)
    F: 0x0051BA, // Blue (Front)
    B: 0x009E60, // Green (Back)
    R: 0xC41E3A, // Red (Right)
    L: 0xFF5800, // Orange (Left)
    CORE: 0x18181B, // Dark Slate / Carbon Black Core
    STRIP: 0x334155 // Dimmed gray for masked stickers
  };

  class CubeEngine {
    constructor(container, options = {}) {
      this.container = container;
      this.order = options.order || 3; // 2 or 3
      this.onStepChange = options.onStepChange || null;
      this.onFinish = options.onFinish || null;
      this.onPlayStateChange = options.onPlayStateChange || null;
      this.speedMultiplier = options.speed || 1.0;

      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.controls = null;
      this.cubeGroup = null;
      this.cubelets = [];
      this.animating = false;
      this.queue = [];
      this.actions = [];
      this.currentStep = 0;
      this.loop = false;
      this.loopTimer = null;
      this.currentSetupFormula = null;
      this.stripMode = null; // 'OLL', 'PLL', 'F2L' or custom
      this.fullColor = options.fullColor !== undefined ? options.fullColor : true; // 默认全彩实战显示所有面
      this.isPlaying = false;
      this.baseDuration = 220; // ms per 90 degree turn at 1.0x
      this.loopEndDelay = options.loopEndDelay || 800; // 终态停留时间（复原态确认）
      this.loopStartDelay = options.loopStartDelay || 2000; // 起始态停留时间（题目打乱态就位准备）

      this._initScene();
      this._buildCube(this.order);
      this._startRenderLoop();
    }

    _initScene() {
      const width = this.container.clientWidth || 360;
      const height = this.container.clientHeight || 360;

      this.scene = new THREE.Scene();

      this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      this.setCameraView('default');

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      if (this.renderer.shadowMap) this.renderer.shadowMap.enabled = false;
      this.container.appendChild(this.renderer.domElement);

      if (THREE.OrbitControls) {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 20;
        this.controls.enablePan = false;
      }

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
      this.scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.45);
      dirLight1.position.set(10, 18, 12);
      this.scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.25);
      dirLight2.position.set(-10, -12, -10);
      this.scene.add(dirLight2);

      this._onResize = () => {
        if (!this.container) return;
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        if (w && h) {
          this.camera.aspect = w / h;
          // Keep the cube comfortably inside narrow portrait viewports.
          const fit = Math.min(1, this.camera.aspect / 0.8);
          this.camera.fov = Math.atan(Math.tan(19 * Math.PI / 180) / fit) * 360 / Math.PI;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(w, h);
        }
      };
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('resize', this._onResize);
      }
      if (typeof ResizeObserver !== 'undefined') {
        this._resizeObserver = new ResizeObserver(this._onResize);
        this._resizeObserver.observe(this.container);
      }
    }

    setCameraView(type) {
      if (type === 'top') {
        this.camera.position.set(0, 9.5, 0.01);
      } else if (type === 'front') {
        this.camera.position.set(0, 0, 9.5);
      } else {
        // default 3D isometric CFOP view: see U (Yellow), F (Blue), R (Red) clearly
        this.camera.position.set(5.2, 5.8, 6.8);
      }
      this.camera.lookAt(0, 0, 0);
      if (this.controls) this.controls.target.set(0, 0, 0);
    }

    _createFaceTexture(colorHex, isDimmed = false) {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      // Base black frame
      ctx.fillStyle = '#18181B';
      ctx.fillRect(0, 0, 128, 128);

      // Inner rounded sticker
      const pad = 9;
      const r = 16;
      ctx.fillStyle = isDimmed ? '#334155' : '#' + colorHex.toString(16).padStart(6, '0');
      ctx.beginPath();
      ctx.moveTo(pad + r, pad);
      ctx.lineTo(128 - pad - r, pad);
      ctx.quadraticCurveTo(128 - pad, pad, 128 - pad, pad + r);
      ctx.lineTo(128 - pad, 128 - pad - r);
      ctx.quadraticCurveTo(128 - pad, 128 - pad, 128 - pad - r, 128 - pad);
      ctx.lineTo(pad + r, 128 - pad);
      ctx.quadraticCurveTo(pad, 128 - pad, pad, 128 - pad - r);
      ctx.lineTo(pad, pad + r);
      ctx.quadraticCurveTo(pad, pad, pad + r, pad);
      ctx.closePath();
      ctx.fill();

      // Subtle gloss reflection
      if (!isDimmed) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.fillRect(pad + 4, pad + 4, 128 - (pad + 4) * 2, (128 - (pad + 4) * 2) * 0.45);
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.anisotropy = 4;
      return tex;
    }

    _buildCube(order) {
      this.order = order;
      if (this.cubeGroup) {
        this.scene.remove(this.cubeGroup);
      }
      this.cubeGroup = new THREE.Group();
      this.scene.add(this.cubeGroup);
      this.cubelets = [];

      const size = 1.0;
      const gap = 0.03;
      const step = size + gap;

      const indices = [];
      if (order === 3) {
        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
              if (x === 0 && y === 0 && z === 0) continue; // skip core
              indices.push({ x, y, z, ix: x, iy: y, iz: z });
            }
          }
        }
      } else {
        // 2x2
        for (let x of [-0.5, 0.5]) {
          for (let y of [-0.5, 0.5]) {
            for (let z of [-0.5, 0.5]) {
              indices.push({ x, y, z, ix: x * 2, iy: y * 2, iz: z * 2 });
            }
          }
        }
      }

      const geometry = new THREE.BoxGeometry(size, size, size);

      indices.forEach(item => {
        const materials = this._getCubeletMaterials(item, this.stripMode);
        const mesh = new THREE.Mesh(geometry, materials);
        mesh.position.set(item.x * step, item.y * step, item.z * step);
        mesh.userData = {
          initial: { ...item },
          currentPos: new THREE.Vector3(item.x * step, item.y * step, item.z * step),
          order: order
        };
        this.cubelets.push(mesh);
        this.cubeGroup.add(mesh);
      });
    }

    _getCubeletMaterials(item, stripMode) {
      // Materials order in Three.js BoxGeometry:
      // 0: +X (Right: Red)
      // 1: -X (Left: Orange)
      // 2: +Y (Up: Yellow)
      // 3: -Y (Down: White)
      // 4: +Z (Front: Blue)
      // 5: -Z (Back: Green)

      const isRight = item.ix > 0;
      const isLeft = item.ix < 0;
      const isUp = item.iy > 0;
      const isDown = item.iy < 0;
      const isFront = item.iz > 0;
      const isBack = item.iz < 0;

      let rDim = false, lDim = false, uDim = false, dDim = false, fDim = false, bDim = false;

      // 全彩实战模式（默认）：展示所有面的真实颜色（绿、红、蓝、橙、白、黄），全面训练空间感！
      // 只有在明确关闭 fullColor 时才将部分面置灰
      if (!this.fullColor) {
        if (stripMode === 'OLL') {
          rDim = true;
          lDim = true;
          dDim = true;
          fDim = true;
          bDim = true;
          uDim = false;
        } else if (stripMode === 'PLL') {
          if (!isUp) {
            rDim = true;
            lDim = true;
            dDim = true;
            fDim = true;
            bDim = true;
            uDim = true;
          }
        } else if (stripMode === 'F2L') {
          if (item.iy < 0 && (item.ix < 0 || item.iz < 0)) {
            rDim = true;
            lDim = true;
            dDim = true;
            fDim = true;
            bDim = true;
            uDim = true;
          }
        }
      }

      const mat = (isExternal, color, isDim) => {
        if (!isExternal) {
          return new THREE.MeshBasicMaterial({ color: COLORS.CORE });
        }
        return new THREE.MeshLambertMaterial({
          map: this._createFaceTexture(color, isDim)
        });
      };

      return [
        mat(isRight, COLORS.R, rDim),
        mat(isLeft, COLORS.L, lDim),
        mat(isUp, COLORS.U, uDim),
        mat(isDown, COLORS.D, dDim),
        mat(isFront, COLORS.F, fDim),
        mat(isBack, COLORS.B, bDim)
      ];
    }

    setStripMode(mode) {
      this.stripMode = mode;
      this.cubelets.forEach(mesh => {
        const item = mesh.userData.initial;
        mesh.material = this._getCubeletMaterials(item, this.stripMode);
      });
    }

    setFullColor(enabled) {
      this.fullColor = !!enabled;
      this.cubelets.forEach(mesh => {
        const item = mesh.userData.initial;
        mesh.material = this._getCubeletMaterials(item, this.stripMode);
      });
    }

    setOrder(order) {
      if (this.order !== order) {
        this.reset();
        this._buildCube(order);
      }
    }

    reset() {
      this.pause();
      this.animating = false;
      this.queue = [];
      this.currentStep = 0;
      this._buildCube(this.order);
      if (this.onStepChange) this.onStepChange(0);
    }

    parseFormula(formula) {
      if (!formula) return [];
      const clean = formula.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
      if (!clean) return [];

      const matches = clean.match(/([UDFBLRxyzMESudfrlb](?:'2|2'|2|'3|3'|3|')?)/g);
      if (!matches) return [];

      const actions = [];
      for (let token of matches) {
        const parsed = this._parseToken(token);
        if (parsed) {
          actions.push(parsed);
        }
      }
      return actions;
    }

    _parseToken(token) {
      const match = token.match(/^([UDFBLRxyzMESudfrlb])('2|2'|2|'3|3'|3|')?$/);
      if (!match) return null;

      const base = match[1];
      const mod = match[2] || '';

      let times = 1;
      let reverse = false;

      if (mod === "2") {
        times = 2;
        reverse = false;
      } else if (mod === "2'" || mod === "'2") {
        times = 2;
        reverse = true;
      } else if (mod === "3") {
        times = 3;
        reverse = false;
      } else if (mod === "3'" || mod === "'3") {
        times = 3;
        reverse = true;
      } else if (mod === "'") {
        times = 1;
        reverse = true;
      }

      return {
        raw: token,
        base: base,
        times: times,
        reverse: reverse
      };
    }

    setAlgorithm(formula, setupFormula = null) {
      this.reset();
      this.currentSetupFormula = setupFormula;
      this.actions = this.parseFormula(formula);
      this.currentStep = 0;

      if (setupFormula) {
        this.executeInstant(setupFormula);
      } else if (formula) {
        const inv = this.invertFormula(formula);
        this.executeInstant(inv);
      }

      if (this.onStepChange) {
        this.onStepChange(0);
      }
    }

    invertFormula(formula) {
      const actions = this.parseFormula(formula);
      const inverted = [];
      for (let i = actions.length - 1; i >= 0; i--) {
        const act = actions[i];
        let mod = "'";
        if (act.times === 2) {
          mod = act.reverse ? "2" : "'2";
        } else if (act.times === 3) {
          mod = act.reverse ? "3" : "'3";
        } else if (act.reverse) {
          mod = "";
        }
        inverted.push(act.base + mod);
      }
      return inverted.join(' ');
    }

    executeInstant(formula) {
      const actions = this.parseFormula(formula);
      for (let act of actions) {
        this._applyTurnInstantly(act);
      }
    }

    _getLayerCubelets(action) {
      const base = action.base;
      const order = this.order;
      const list = [];
      const threshold = order === 3 ? 0.4 : 0.1;

      this.cubelets.forEach(c => {
        const p = c.position;
        let match = false;

        switch (base) {
          case 'R':
            match = p.x > threshold;
            break;
          case 'L':
            match = p.x < -threshold;
            break;
          case 'U':
            match = p.y > threshold;
            break;
          case 'D':
            match = p.y < -threshold;
            break;
          case 'F':
            match = p.z > threshold;
            break;
          case 'B':
            match = p.z < -threshold;
            break;
          case 'M':
            match = Math.abs(p.x) <= threshold;
            break;
          case 'E':
            match = Math.abs(p.y) <= threshold;
            break;
          case 'S':
            match = Math.abs(p.z) <= threshold;
            break;
          case 'r':
            match = p.x >= -threshold;
            break;
          case 'l':
            match = p.x <= threshold;
            break;
          case 'u':
            match = p.y >= -threshold;
            break;
          case 'd':
            match = p.y <= threshold;
            break;
          case 'f':
            match = p.z >= -threshold;
            break;
          case 'b':
            match = p.z <= threshold;
            break;
          case 'x':
          case 'y':
          case 'z':
            match = true;
            break;
        }

        if (match) list.push(c);
      });

      return list;
    }

    _getTurnAxisAngle(action) {
      const base = action.base;
      const times = action.times;
      const reverse = action.reverse;

      let axis = new THREE.Vector3(0, 1, 0);
      let baseAngle = -Math.PI / 2;

      switch (base) {
        case 'U':
        case 'u':
        case 'y':
          axis.set(0, 1, 0);
          baseAngle = -Math.PI / 2;
          break;
        case 'D':
        case 'd':
          axis.set(0, 1, 0);
          baseAngle = Math.PI / 2;
          break;
        case 'E':
          axis.set(0, 1, 0);
          baseAngle = Math.PI / 2;
          break;
        case 'R':
        case 'r':
        case 'x':
          axis.set(1, 0, 0);
          baseAngle = -Math.PI / 2;
          break;
        case 'L':
        case 'l':
          axis.set(1, 0, 0);
          baseAngle = Math.PI / 2;
          break;
        case 'M':
          axis.set(1, 0, 0);
          baseAngle = Math.PI / 2;
          break;
        case 'F':
        case 'f':
        case 'z':
          axis.set(0, 0, 1);
          baseAngle = -Math.PI / 2;
          break;
        case 'B':
        case 'b':
          axis.set(0, 0, 1);
          baseAngle = Math.PI / 2;
          break;
        case 'S':
          axis.set(0, 0, 1);
          baseAngle = -Math.PI / 2;
          break;
      }

      let totalAngle = baseAngle * times;
      if (reverse) totalAngle = -totalAngle;

      return { axis, angle: totalAngle };
    }

    _applyTurnInstantly(action) {
      const { axis, angle } = this._getTurnAxisAngle(action);
      const targets = this._getLayerCubelets(action);

      const rotMatrix = new THREE.Matrix4().makeRotationAxis(axis, angle);

      targets.forEach(c => {
        c.applyMatrix4(rotMatrix);
        c.position.set(
          this._snapCoord(c.position.x),
          this._snapCoord(c.position.y),
          this._snapCoord(c.position.z)
        );
        c.updateMatrixWorld(true);
      });
    }

    _animateTurn(action, onDone) {
      if (this.animating) return;
      this.animating = true;

      const { axis, angle } = this._getTurnAxisAngle(action);
      const targets = this._getLayerCubelets(action);

      const pivot = new THREE.Group();
      this.scene.add(pivot);

      targets.forEach(c => {
        this.cubeGroup.remove(c);
        pivot.add(c);
      });

      const duration = (this.baseDuration / this.speedMultiplier) * (action.times === 3 ? 1.5 : (action.times === 2 ? 1.35 : 1.0));
      const startTime = performance.now();

      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1.0);
        const ease = 1 - Math.pow(1 - progress, 2.5);

        const currentAngle = angle * ease;
        pivot.rotation.set(0, 0, 0);
        pivot.rotateOnAxis(axis, currentAngle);

        if (progress < 1.0) {
          requestAnimationFrame(animate);
        } else {
          pivot.rotation.set(0, 0, 0);
          pivot.rotateOnAxis(axis, angle);
          pivot.updateMatrixWorld(true);

          targets.forEach(c => {
            c.applyMatrix4(pivot.matrixWorld);
            c.position.set(
              this._snapCoord(c.position.x),
              this._snapCoord(c.position.y),
              this._snapCoord(c.position.z)
            );
            pivot.remove(c);
            this.cubeGroup.add(c);
          });

          this.scene.remove(pivot);
          this.animating = false;
          if (onDone) onDone();
        }
      };

      requestAnimationFrame(animate);
    }

    _snapCoord(val) {
      if (this.order === 3) {
        if (Math.abs(val) < 0.25) return 0;
        return val > 0 ? 1.03 : -1.03;
      } else {
        return val > 0 ? 0.515 : -0.515;
      }
    }

    stepForward() {
      if (this.animating || this.currentStep >= this.actions.length) return false;
      const act = this.actions[this.currentStep];
      this._animateTurn(act, () => {
        this.currentStep++;
        if (this.onStepChange) this.onStepChange(this.currentStep);
        if (this.currentStep === this.actions.length) {
          if (this.onFinish) this.onFinish();
        }
      });
      return true;
    }

    stepBackward() {
      if (this.animating || this.currentStep <= 0) return false;
      this.currentStep--;
      const act = this.actions[this.currentStep];
      const invAct = {
        ...act,
        reverse: !act.reverse
      };

      this._animateTurn(invAct, () => {
        if (this.onStepChange) this.onStepChange(this.currentStep);
      });
      return true;
    }

    play() {
      if (this.isPlaying) return;
      this.isPlaying = true;
      if (this.loopTimer) {
        clearTimeout(this.loopTimer);
        this.loopTimer = null;
      }
      if (this.onPlayStateChange) this.onPlayStateChange(true);

      const runNext = () => {
        if (!this.isPlaying) return;

        if (this.currentStep >= this.actions.length) {
          if (this.loop) {
            // 完成一轮复原后，终态（复原态）确认停留
            this.loopTimer = setTimeout(() => {
              if (!this.isPlaying) return;
              // 跳到起始态（题目形态），keepPlaying = true 保持播放状态
              this.reInitCase(true);
              // 跳到起始态后再停留 2000ms（整整2秒），供双手就位、看清形态，再开跑下一轮
              this.loopTimer = setTimeout(() => {
                if (this.isPlaying) runNext();
              }, this.loopStartDelay);
            }, this.loopEndDelay);
          } else {
            this.isPlaying = false;
            if (this.onPlayStateChange) this.onPlayStateChange(false);
            if (this.onFinish) this.onFinish();
          }
          return;
        }

        const act = this.actions[this.currentStep];
        this._animateTurn(act, () => {
          this.currentStep++;
          if (this.onStepChange) this.onStepChange(this.currentStep);
          const delay = Math.max(50, 110 / this.speedMultiplier);
          setTimeout(runNext, delay);
        });
      };

      runNext();
    }

    pause() {
      if (!this.isPlaying && !this.loopTimer) return;
      this.isPlaying = false;
      if (this.loopTimer) {
        clearTimeout(this.loopTimer);
        this.loopTimer = null;
      }
      if (this.onPlayStateChange) this.onPlayStateChange(false);
    }

    togglePlay() {
      if (this.isPlaying || this.loopTimer) {
        this.pause();
      } else {
        if (this.currentStep >= this.actions.length) {
          this.reInitCase(false);
        }
        this.play();
      }
    }

    reInitCase(keepPlaying = false) {
      if (!keepPlaying) {
        this.pause();
      }
      if (this.loopTimer) {
        clearTimeout(this.loopTimer);
        this.loopTimer = null;
      }
      this.animating = false;
      this.currentStep = 0;
      this._buildCube(this.order);

      if (this.currentSetupFormula) {
        this.executeInstant(this.currentSetupFormula);
      } else {
        const fullExp = this.actions.map(a => a.raw).join(' ');
        if (fullExp) {
          const inv = this.invertFormula(fullExp);
          this.executeInstant(inv);
        }
      }
      if (this.onStepChange) this.onStepChange(0);
    }

    setSpeed(speed) {
      this.speedMultiplier = speed;
    }

    setLoop(enabled) {
      this.loop = !!enabled;
    }

    _startRenderLoop() {
      const render = () => {
        requestAnimationFrame(render);
        if (this.controls) this.controls.update();
        if (this.renderer && this.scene && this.camera) {
          this.renderer.render(this.scene, this.camera);
        }
      };
      render();
    }

    destroy() {
      this.pause();
      if (this.loopTimer) {
        clearTimeout(this.loopTimer);
        this.loopTimer = null;
      }
      window.removeEventListener('resize', this._onResize);
      this._resizeObserver?.disconnect();
      if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }

  global.CubeEngine = CubeEngine;
})(window);
