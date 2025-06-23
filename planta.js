// planta.js
export class Planta {
  constructor(imagens) {
    this.imagens = imagens;
    this.x = 384 / 2 - 25;
    this.y = 670 - 100;
    this.width = 55;
    this.height = 55;
    this.velocidade = 4;
    this.indiceImagem = 0;
    this.acelerada = false;
    this.intervaloAnimacao = setInterval(() => this.animar(), 500);
    this.hitbox = {
      offsetX: 5,
      offsetY: 10,
      width: 40,
      height: 45
    };
  }

  mover(direcao) {
    this.x += direcao * this.velocidade;
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > 384) this.x = 384 - this.width;
  }

  desenhar(ctx) {
    ctx.drawImage(this.imagens[this.indiceImagem], this.x, this.y, this.width, this.height);
  }

  animar() {
    if (!this.acelerada) {
      this.indiceImagem = (this.indiceImagem + 1) % 3;
    }
  }

  acelerar() {
    if (this.acelerada) return;
    this.acelerada = true;
    this.velocidade *= 1.5;
    const animacoes = [3, 4, 5];
    let i = 0;
    this.animacaoEspecial = setInterval(() => {
      this.indiceImagem = animacoes[i];
      i = (i + 1) % animacoes.length;
    }, 300);

    setTimeout(() => {
      clearInterval(this.animacaoEspecial);
      this.indiceImagem = 0;
      this.velocidade = 4;
      this.acelerada = false;
    }, 10000);
  }

  resetar() {
    this.x = 384 / 2 - 25;
    this.y = 670 - 100;
    this.velocidade = 4;
    this.indiceImagem = 0;
    this.acelerada = false;
  }
}
