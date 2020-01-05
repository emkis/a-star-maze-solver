function setStatus(text) {
  const $status = document.querySelector(".status");
  $status.textContent = text;
}

function removeFromArray(array, element) {
  for (let i = array.length - 1; i >= 0; i--) {
    if (array[i] == element) {
      array.splice(i, 1);
    }
  }
}

function heuristic(pointA, pointB) {
  // quao longo é a distancia entre esses pontos?
  // manhattan distance
  const distance = abs(pointA.i - pointB.i) + abs(pointA.j - pointB.j);

  return distance;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const COLORS = {
  grid: "#001924",
  path: "#f21ebe",
  openSet: "#998a61",
  closedSet: "#6a5783",
  background: "#00ffff",
  wall: "#00ffff",
  startPoint: "#31D843",
  endPoint: "#FF4B3E"
};

const cols = 40;
const rows = 40;

// openSet »»» lista dos nodos a serem avaliados
// closedSet »»» lista dos nodos que ja foram avaliados
const openSet = [];
const closedSet = [];

let startPoint;
let endPoint;

const path = [];
const grid = [];

/*
VARIAVEIS DO CANVAS

w »» width / cols;
h »» height / rows;
*/
let w, h;

function Square(col, row) {
  this.f = 0;
  this.g = 0;
  this.h = 0;
  this.neighbors = [];
  this.previous = null;

  this.wall = false;
  this.i = col;
  this.j = row;

  if (random(1) < 0.2) {
    this.wall = true;
  }

  this.show = function(col) {
    fill(col);

    if (this.wall) {
      fill(COLORS.wall);
    }
    noStroke();
    rect(this.i * w, this.j * h, w - 1, h - 1);
  };

  this.addNeighbors = function(grid) {
    /**
     * essas verificações servem para que sejam adicionados apenas itens que
     * realmente sejam vizinhos, ignorando os itens que estejam na ponta
     */

    if (this.i < cols - 1) {
      this.neighbors.push(grid[this.i + 1][this.j]);
    }

    if (this.i > 0) {
      this.neighbors.push(grid[this.i - 1][this.j]);
    }

    if (this.j < rows - 1) {
      this.neighbors.push(grid[this.i][this.j + 1]);
    }

    if (this.j > 0) {
      this.neighbors.push(grid[this.i][this.j - 1]);
    }
  };
}

function setup() {
  createCanvas(550, 550);

  w = width / cols;
  h = height / rows;

  // definindo o array
  for (let i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
  }

  // definindo que cada nodo é um objeto
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = new Square(i, j);
    }
  }

  // adicionando os vizinhos
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }

  // definição de onde começa
  startPoint = grid[getRandomInt(0, cols)][getRandomInt(0, cols)];
  endPoint = grid[getRandomInt(0, cols)][getRandomInt(0, cols)];

  // garante que o começo e o final nunca sejam um obstaculo
  startPoint.wall = false;
  endPoint.wall = false;

  openSet.push(startPoint);
}

function draw() {
  /* funcão draw é um loop infinito, utilizado pra desenhar o canvas
    então nao é necessário implementar o loop do algoritmo
  */

  /*
    Uma das verificacoes pra saber se já finalizou o algoritmo
    se nao existir mais nenhum nodo pra ser verificado é porque nao tem solucao
  */
  if (openSet.length > 0) {
    // ve qual dos itens do openSet tem o menor F
    let lowestIndex = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIndex].f) {
        lowestIndex = i;
      }
    }

    // current vira o item com menor custo F
    let current = openSet[lowestIndex];

    // verifica se esse menor item do openSet é o objetivo
    if (openSet[lowestIndex] === endPoint) {
      /*
          path começa com o final
          o final ta conectado com o que veio antes dele
          e o outro antes do final também tava conectado com outro
          e assim vai indo, mostrando o caminho
      */

      /**
       * variavel temp é auxiliar utilizada para fazer a troca
       * dos elementos sem afetar o original
       */
      let temp = current;

      // adiciona no array path o item que encontrou o caminho
      path.push(temp);
      /*
        todos os objetos Square tem uma proriedade chamada previous
        essa propriedade referencia ao objeto que veio antes dele
      */

      /*
        veficia a variavel previous desse item
        enquanto tiver um que veio antes
        adiciona no path o que veio antes
        e agora o que eu checando, é o que veio antes do que veio antes
      */
      while (temp.previous) {
        path.push(temp.previous);
        temp = temp.previous;
      }

      noLoop();
      setStatus("founded! ⚡⚡⚡");
      console.log(grid);
    }

    removeFromArray(openSet, current);
    closedSet.push(current);

    let neighbors = current.neighbors;

    for (let i = 0; i < neighbors.length; i++) {
      let neighbor = neighbors[i];

      // se esse vizinho ainda nao foi visitado ou não é uma parede
      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        let auxG = current.g++;

        /**
         * ve se esse vizinho existe dentro da openSet
         * se existe, ele verifica se o novo valor G é menor do que
         * o que já existe, se for então define como novo valor G,
         *
         * ou seja, se achou um valor G menor do que o que tinha
         * então achou um caminho mais otimizado
         *
         *
         * se esse item nao existe na lista do openSet então
         * coloca esse lista na lista e já adiciona todos os valores dele
         * (F, G e H)
         */
        if (openSet.includes(neighbor)) {
          if (auxG < neighbor.g) {
            neighbor.g = auxG;
          }
        } else {
          neighbor.g = auxG;
          openSet.push(neighbor);
        }

        neighbor.h = heuristic(neighbor, endPoint);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.previous = current;
      }
    }
  } else {
    noLoop();
    setStatus("unsolvable maze 😶");
  }

  background(COLORS.background);

  // desenha o grid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].show(color(COLORS.grid));
    }
  }

  // todos que ja foram visitados
  for (let i = 0; i < closedSet.length; i++) {
    closedSet[i].show(color(COLORS.closedSet));
  }

  // todos que precisam ser visitados
  for (let i = 0; i < openSet.length; i++) {
    openSet[i].show(color(COLORS.openSet));
  }

  // caminho percorrido
  for (let i = 0; i < path.length; i++) {
    path[i].show(color(COLORS.path));
  }

  // pinta o Square do ponto inicial e final
  startPoint.show(COLORS.startPoint);
  endPoint.show(COLORS.endPoint);
}
