// utils.js
export function carregarImagens(caminhos) {
  return Promise.all(
    caminhos.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => reject(`Erro ao carregar imagem: ${src}`);
      });
    })
  );
}
