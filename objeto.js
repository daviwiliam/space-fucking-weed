// objeto.js
export class ObjetoManager {
  constructor(canvas, imagens) {
    this.canvas = canvas;
    this.imagens = imagens;
    this.objetos = [];
    this.explosoes = [];
    this.imagensExplosao = imagens.explosao;
  }

  criar(tipo = 'asteroid', plantaX = null, score) {
    let obj;
    if (tipo === 'asteroid') {
      const size = [30, 40, 50, 70][Math.floor(Math.random() * 4)];

      const speed = 3 + Math.floor(score / 100);

      obj = {
        type: 'asteroid',
        x: Math.random() * (this.canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: speed,
        hitbox: {
          offsetX: 5,
          offsetY: 5,
          width: size - 15,
          height: size - 10
        }
      };
    } else if (tipo === 'car') {
      const width = 130;
      const height = 270;
      const centerX = plantaX - width / 2;
      obj = {
        type: 'car',
        x: Math.max(0, Math.min(this.canvas.width - width, centerX)),
        y: -height,
        width,
        height,
        speed: 6,
        frameIndex: 0,
        lastFrameTime: performance.now(),
        hitbox: {
          offsetX: 25,
          offsetY: 40,
          width: width - 50,
          height: height - 80
        }
      };
    } else if (tipo === 'pizza') {
      obj = {
        type: 'pizza',
        x: Math.random() * (this.canvas.width - 50),
        y: -50,
        width: 50,
        height: 50,
        speed: 2
      };
    }

    this.objetos.push(obj);
  }

  atualizarObjetos() {
    this.objetos.forEach((obj, i) => {
      obj.y += obj.speed;
      if (obj.y > this.canvas.height) this.objetos.splice(i, 1);
    });
  }

  desenharObjetos(ctx) {
    const now = performance.now();

    // Desenha os objetos (asteroides, carros, pizzas)
    for (let obj of this.objetos) {
      let img;

      if (obj.type === 'pizza') {
        img = this.imagens.pizza;
      } else if (obj.type === 'car') {
        if (now - obj.lastFrameTime > 100) {
          obj.frameIndex = (obj.frameIndex + 1) % this.imagens.carro.length;
          obj.lastFrameTime = now;
        }
        img = this.imagens.carro[obj.frameIndex];
      } else {
        img = this.imagens.asteroide;
      }

      ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
    }

    // Desenha explosões (e avança o frame da animação)
    this.explosoes.forEach(explosao => {
      if (now - explosao.lastFrameTime > 100) {
        explosao.frame++;
        explosao.lastFrameTime = now;
      }

      if (explosao.frame < this.imagensExplosao.length) {
        const img = this.imagensExplosao[explosao.frame];
        const largura = 140;
        const altura = 130;
        ctx.drawImage(img, explosao.x - largura / 4, explosao.y - altura / 4, largura, altura);
      }
    });

    // Remove explosões que terminaram a animação
    this.explosoes = this.explosoes.filter(e => e.frame < this.imagensExplosao.length);
  }

  checarColisoes(planta, onGameOver, onPizza) {
    const plantaBox = {
      x: planta.x + (planta.hitbox?.offsetX || 0),
      y: planta.y + (planta.hitbox?.offsetY || 0),
      width: planta.hitbox?.width || planta.width,
      height: planta.hitbox?.height || planta.height
    };

    this.objetos = this.objetos.filter(obj => {
      const objBox = {
        x: obj.x + (obj.hitbox?.offsetX || 0),
        y: obj.y + (obj.hitbox?.offsetY || 0),
        width: obj.hitbox?.width || obj.width,
        height: obj.hitbox?.height || obj.height
      };

      const colidiu = plantaBox.x < objBox.x + objBox.width &&
                      plantaBox.x + plantaBox.width > objBox.x &&
                      plantaBox.y < objBox.y + objBox.height &&
                      plantaBox.y + plantaBox.height > objBox.y;

      if (colidiu) {
        if (obj.type === 'pizza') {
          onPizza();
          return false;
        } else {
          const centroX = planta.x + planta.width / 2 - 35;
          const centroY = planta.y + planta.height / 2 - 35;
          this.adicionarExplosao(centroX, centroY);
          setTimeout(() => onGameOver(), 500);
          return false;
        }
      }
      return true;
    });
  }

  pausarObjetos(tempo) {
    this.objetos.forEach(obj => {
      if (obj.type !== 'pizza') obj.speed = 0;
    });
    setTimeout(() => {
      this.objetos.forEach(obj => {
        obj.speed = obj.type === 'car' ? 5 : 3;
      });
    }, tempo);
  }

  resetar() {
    this.objetos.splice(0, this.objetos.length)
    this.explosoes.splice(0, this.explosoes.length)
  }

  adicionarExplosao(x, y) {
    this.explosoes.push({
      x,
      y,
      frame: 0,
      lastFrameTime: performance.now()
    });
  }

}
