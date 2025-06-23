// Arquivo principal: game.js

import { Planta } from './planta.js';
import { ObjetoManager } from './objeto.js';
import { carregarImagens } from './utils.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 384;
canvas.height = 670;

class Game {
  constructor() {
    this.estado = 'inicial';
    this.nomeDigitado = '';
    this.cursorVisivel = true;
    this.ultimoPiscar = 0;
    this.digitandoNome = false;
    this.botoes = [
      { texto: 'Start', x: 100, y: 400, w: 180, h: 40, acao: () => this.iniciarJogo(this.nomeDigitado || 'Player') },
      { texto: 'Top Score', x: 100, y: 460, w: 180, h: 40, acao: () => this.carregarTopScores() }
    ];
    this.score = 0;
    this.scoreInterval = null;
    this.playerName = '';
    this.planta = null;
    this.objManager = null;
    this.imagens = {};
    this.keys = {};
    this.velocidadeAsteroide = 3;
    this.velocidadeCarro = 5;
    this.carroAtivo = false;
    this.poderEspecialAtivo = false;
    this.inputElement = null;
    this.bgFrame = 0;
    this.bgLastTime = 0;
    this.bgInterval = 150;
    this.botoesGameOver = [
      { texto: 'Restart', x: 100, y: 400, w: 180, h: 40, acao: () => this.iniciarJogo(this.playerName) },
      { texto: 'Menu', x: 100, y: 460, w: 180, h: 40, acao: () => this.mostrarTelaInicial() }
    ];
    this.topScores = [];
    this.imagens.bandeiras = {};

  }

  async iniciar() {
    await this.carregarTudo();
    this.configurarEventos();
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Clique no campo de nome
      if (mouseX >= 100 && mouseX <= 280 && mouseY >= 330 && mouseY <= 370) {
        this.digitandoNome = true;
      } else {
        this.digitandoNome = false;
      }

      // Clique nos botões
      if (this.estado === 'inicial') {
        this.botoes.forEach(botao => {
          if (
            mouseX >= botao.x && mouseX <= botao.x + botao.w &&
            mouseY >= botao.y && mouseY <= botao.y + botao.h &&
            this.estado === 'inicial'
          ) {
            botao.acao();
          }
        });
      }

      if (this.estado === 'gameOver') {
        this.botoesGameOver.forEach(botao => {
          if (
            mouseX >= botao.x && mouseX <= botao.x + botao.w &&
            mouseY >= botao.y && mouseY <= botao.y + botao.h
          ) {
            botao.acao();
          }
        }); 
      }

      if (this.estado === 'topScores') {
        if (mouseX >= 100 && mouseX <= 280 && mouseY >= 600 && mouseY <= 640) {
          this.mostrarTelaInicial();
        }
      }
    });
    this.mostrarTelaInicial();
    requestAnimationFrame(this.loop.bind(this));
  }

  async carregarTudo() {
    this.imagens.planta = await carregarImagens(['assets/weed1.png','assets/weed2.png','assets/weed3.png','assets/weed4.png','assets/weed5.png','assets/weed6.png']);
    this.imagens.background = await carregarImagens(Array.from({length: 36}, (_, i) => `background/back${i+1}.jpeg`));
    this.imagens.carro = await carregarImagens(['assets/firecar1.png','assets/firecar2.png','assets/firecar3.png']);
    this.imagens.asteroide = (await carregarImagens(['assets/asteroid.png']))[0];
    this.imagens.pizza = (await carregarImagens(['assets/pizza.png']))[0];
    this.imagens.explosao = await carregarImagens(['assets/explosion/explosion1.png','assets/explosion/explosion2.png','assets/explosion/explosion3.png','assets/explosion/explosion4.png','assets/explosion/explosion5.png']);
    this.planta = new Planta(this.imagens.planta);
    this.objManager = new ObjetoManager(canvas, this.imagens);
  }

  configurarEventos() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (e.key === 'x' || e.key === 'X') {
        this.usarPoderEspecial();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
    window.addEventListener('keydown', (e) => {
      if (this.estado === 'inicial' && this.digitandoNome) {
        if (e.key === 'Backspace') {
          this.nomeDigitado = this.nomeDigitado.slice(0, -1);
        } else if (e.key.length === 1 && this.nomeDigitado.length < 7) {
          this.nomeDigitado += e.key;
        } else if (e.key === 'Enter') {
          this.iniciarJogo(this.nomeDigitado || 'Player');
        }
      }
    });
  }

  usarPoderEspecial() {
    if (this.planta.acelerada && !this.poderEspecialAtivo && this.estado === 'jogando') {
      this.poderEspecialAtivo = true;
      this.objManager.pausarObjetos(2000);
      setTimeout(() => this.poderEspecialAtivo = false, 2000);
    }
  }

  mostrarTelaInicial() {
    this.estado = 'inicial';
    this.nomeDigitado = '';
    this.digitandoNome = false;
  }

  async carregarTopScores() {
    try {
      //const resposta = await fetch('https://sua-api.com/top-scores');
      const dados = [
        { "nome": "Ciclano", "score": 99999, "pais": "br" },
        { "nome": "Fulano", "score": 8500, "pais": "us" },
        { "nome": "Carai", "score": 5200, "pais": "jp" }
      ];
      //const dados = await resposta.json();
      this.topScores = dados.slice(0, 10);

      const codigosUnicos = [...new Set(this.topScores.map(p => p.pais))];
      for (const codigo of codigosUnicos) {
        if (!this.imagens.bandeiras[codigo]) {
          const bandeira = await carregarImagens([`assets/flags/${codigo}.jpg`]);
          this.imagens.bandeiras[codigo] = bandeira[0];
        }
      }

      this.estado = 'topScores';
    } catch (erro) {
      console.error("Erro ao carregar top scores:", erro);
      this.topScores = [];
    }
  }

  iniciarJogo(nome) {
    this.planta.resetar();
    this.playerName = nome;
    this.estado = 'jogando';
    this.score = 0

    // Criar pedras
    this.asteroideInterval = setInterval(() => {
      if (this.estado === 'jogando' && !this.poderEspecialAtivo) {
        this.objManager.criar('asteroid', null, this.score);
      }
    }, 700);

    // Criar carro a cada 10s
    this.carroInterval = setInterval(() => {
      if (this.estado === 'jogando' && !this.poderEspecialAtivo) {
        const plantaX = this.planta.x + this.planta.width / 2;
        this.objManager.criar('car', plantaX);
      }
    }, 10000);

    // Criar pizza a cada 20s
    this.pizzaInterval = setInterval(() => {
      if (this.estado === 'jogando' && !this.poderEspecialAtivo) {
        this.objManager.criar('pizza');
      }
    }, 20000);

    // aumentar score
    this.scoreInterval = setInterval(() => {
      if (this.estado === 'jogando') {
        this.score += 1;
      }
    }, 500);

  }

  loop(timestamp) {
    this.atualizar(timestamp);
    this.desenhar();
    requestAnimationFrame(this.loop.bind(this));
  }

  atualizar(timestamp) {
    if (this.estado === 'inicial') {
      if (timestamp - this.ultimoPiscar > 500) {
        this.cursorVisivel = !this.cursorVisivel;
        this.ultimoPiscar = timestamp;
      }
    }

    if (this.estado == 'gameOver') {
      this.objManager.resetar()
    }

    if (this.estado === 'jogando') {
      if (this.keys['ArrowLeft']) this.planta.mover(-1);
      if (this.keys['ArrowRight']) this.planta.mover(1);

      this.objManager.atualizarObjetos();
      this.objManager.checarColisoes(this.planta, () => this.fimDeJogo(), () => this.planta.acelerar());
    }

    if (timestamp - this.bgLastTime > this.bgInterval) {
      this.bgFrame = (this.bgFrame + 1) % this.imagens.background.length;
      this.bgLastTime = timestamp;
    }
  }

fimDeJogo() {
  this.estado = 'gameOver';
  clearInterval(this.scoreInterval);
  clearInterval(this.asteroideInterval);
  clearInterval(this.carroInterval);
  clearInterval(this.pizzaInterval);
  this.scoreInterval = null;
}

  reiniciar() {
    this.estado = 'inicial';
    this.score = 0;
    this.objManager.resetar();
    this.planta.resetar();
  }

  desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.imagens.background[this.bgFrame], 0, 0, canvas.width, canvas.height);

    if (this.estado === 'jogando') {
      this.planta.desenhar(ctx);
      this.objManager.desenharObjetos(ctx);
      ctx.fillStyle = 'white';
      ctx.font = "13px 'Press Start 2P', cursive";
      ctx.fillText(`Score: ${this.score}`, 20, 50);
    } else if (this.estado === 'inicial') {
      let textoSpace = "SPACE";
      let textoWeed = "WEED";
      ctx.font = "40px 'Press Start 2P', cursive";
      ctx.fillStyle = "white";
      ctx.fillText(textoSpace, (canvas.width - ctx.measureText(textoSpace).width) / 2, 180);

      ctx.font = "50px 'Press Start 2P', cursive";
      ctx.fillStyle = "green";
      ctx.fillText(textoWeed, (canvas.width - ctx.measureText(textoWeed).width) / 2, 230);

      // Input desenhado
      ctx.fillStyle = 'white';
      ctx.fillRect(100, 330, 180, 40);
      ctx.strokeStyle = 'green';
      ctx.strokeRect(100, 330, 180, 40);

      ctx.fillStyle = 'black';
      ctx.font = "14px 'Press Start 2P', cursive";
      if (this.nomeDigitado) {
        ctx.fillText(this.nomeDigitado, 110, 355);
      } else {
        ctx.fillStyle = 'gray';
        ctx.fillText("Player Name", 110, 355);
      }

      // Cursor piscando
      if (this.digitandoNome && this.cursorVisivel) {
        const textWidth = ctx.measureText(this.nomeDigitado).width;
        ctx.fillRect(110 + textWidth + 2, 340, 10, 18);
      }

      // Botões
      this.botoes.forEach(botao => {
        ctx.fillStyle = 'green';
        ctx.fillRect(botao.x, botao.y, botao.w, botao.h);
        ctx.fillStyle = 'white';
        ctx.font = "14px 'Press Start 2P', cursive";
        const textWidth = ctx.measureText(botao.texto).width;
        ctx.fillText(botao.texto, botao.x + (botao.w - textWidth) / 2, botao.y + 25);
      });

      // Rodapé
      let rodape = "© SPACE WEED 2024";
      ctx.font = "10px 'Press Start 2P', cursive";
      ctx.fillStyle = "white";
      ctx.fillText(rodape, (canvas.width - ctx.measureText(rodape).width) / 2, canvas.height - 10);

    } else if (this.estado === 'gameOver') {

        ctx.drawImage(this.imagens.background[this.bgFrame], 0, 0, canvas.width, canvas.height);

        // Texto Game Over
        ctx.fillStyle = 'white';
        ctx.font = "28px 'Press Start 2P', cursive";
        ctx.fillText("Game Over", (canvas.width - ctx.measureText("Game Over").width) / 2, 250);

        // Score e Player
        ctx.font = "13px 'Press Start 2P', cursive";
        ctx.fillText(`Score: ${this.score}`, 20, 50);
        ctx.fillText(`Player: ${this.playerName}`, canvas.width - ctx.measureText(`Player: ${this.playerName}`).width - 20, 50);

        // Botões Game Over
        this.botoesGameOver.forEach(botao => {
          ctx.fillStyle = 'green';
          ctx.fillRect(botao.x, botao.y, botao.w, botao.h);
          ctx.fillStyle = 'white';
          ctx.font = "14px 'Press Start 2P', cursive";
          const textWidth = ctx.measureText(botao.texto).width;
          ctx.fillText(botao.texto, botao.x + (botao.w - textWidth) / 2, botao.y + 23);
        });
    } else if (this.estado === 'topScores') {
        ctx.font = "20px 'Press Start 2P'";
        ctx.fillStyle = "white";
        ctx.fillText("Top Scores", (canvas.width - ctx.measureText("Top Scores").width) / 2, 50);

        this.topScores.forEach((p, i) => {
          const y = 100 + i * 40;
          const pos = `${String(i + 1).padStart(2, '0')}.`;
          const nome = p.nome.padEnd(8);
          const score = String(p.score).padStart(5, '0');
          const texto = `${pos} ${nome} - ${score}`;

          ctx.fillStyle = 'white';
          ctx.font = "14px 'Press Start 2P'";
          ctx.fillText(texto, 40, y);

          const bandeira = this.imagens.bandeiras[p.pais];
          if (bandeira) ctx.drawImage(bandeira, 335, y - 18, 25, 18);
        });

        // Botão Menu
        ctx.fillStyle = 'green';
        ctx.fillRect(100, 600, 180, 40);
        ctx.fillStyle = 'white';
        ctx.font = "14px 'Press Start 2P'";
        const txt = "Menu";
        ctx.fillText(txt, 100 + (180 - ctx.measureText(txt).width) / 2, 625);
    }
  }
}

const jogo = new Game();
jogo.iniciar();
