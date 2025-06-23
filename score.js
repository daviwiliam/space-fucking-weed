// game.js (atualizado)
import { Planta } from './planta.js';
import { ObjetoManager } from './objeto.js';
import { carregarImagens } from './utils.js';
import { salvarScore, obterTopScores, ehTopScore, validarEmail } from './score.js';

// ... (carregamento de imagens, canvas, estados)

let mostrarPopupTopScore = false;

function desenharGameOver() {
  desenharScore(true);
  ctx.fillStyle = "white";
  ctx.font = "30px 'Press Start 2P', cursive";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);

  // Mostrar aviso de novo recorde
  if (mostrarPopupTopScore) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(30, canvas.height / 2 - 150, canvas.width - 60, 80);
    ctx.strokeStyle = "white";
    ctx.strokeRect(30, canvas.height / 2 - 150, canvas.width - 60, 80);
    ctx.fillStyle = "white";
    ctx.font = "12px 'Press Start 2P', cursive";
    ctx.fillText(`\u{1F3C6} Novo Recorde!`, canvas.width / 2, canvas.height / 2 - 120);
    ctx.fillText(`${playerName} fez ${score} pontos!`, canvas.width / 2, canvas.height / 2 - 100);
  }

  desenharBotao(canvas.width / 2 - 80, canvas.height / 2 + 20, 160, 30, "Restart");
  desenharBotao(canvas.width / 2 - 80, canvas.height / 2 + 60, 160, 30, "Menu");
}

function desenharTelaInicial() {
  // ... (restante igual)
  inputElement.placeholder = "Seu e-mail";
  inputElement.type = "email";
  inputElement.addEventListener("input", () => {
    playerName = inputElement.value;
  });

  desenharBotao(canvas.width / 2 - 80, canvas.height / 2, 160, 30, "Start", () => {
    if (!validarEmail(playerName)) {
      alert("Digite um e-mail válido para jogar!");
      return;
    }
    estadoJogo = 'jogando';
    atualizar();
  });
}

function reiniciarJogo() {
  // ... (igual)
  mostrarPopupTopScore = false;
}

function checarColisao() {
  for (let obj of objetos) {
    if (
      planta.x + 10 < obj.x + obj.width - 10 &&
      planta.x + planta.width - 10 > obj.x + 10 &&
      planta.y + 10 < obj.y + obj.height - 10 &&
      planta.y + planta.height - 10 > obj.y + 10
    ) {
      if (obj.type === 'pizza') {
        acelerarPlanta();
        objetos.splice(objetos.indexOf(obj), 1);
      } else {
        // Game Over
        if (validarEmail(playerName)) {
          if (ehTopScore(score)) {
            salvarScore(score, playerName);
            mostrarPopupTopScore = true;
          }
        }
        isGameOver = true;
        estadoJogo = 'gameOver';
      }
    }
  }
}

function desenharTopScores() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  desenharFundo();
  ctx.fillStyle = "white";
  ctx.font = "16px 'Press Start 2P', cursive";
  ctx.textAlign = "center";
  ctx.fillText("Top Scores", canvas.width / 2, 100);

  const topScores = obterTopScores();
  let startY = 150;
  let lineHeight = 30;

  topScores.forEach((score, index) => {
    let numero = index + 1;
    if (numero < 10) numero = `0${numero}`;
    ctx.fillText(`${numero}. ${score.email} - ${score.score}`, canvas.width / 2, startY + index * lineHeight);
  });

  desenharBotao(canvas.width / 2 - 80, canvas.height - 100, 160, 30, "Menu");
}

// Restante do jogo continua igual
