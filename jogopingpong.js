// Configuração do Canvas e Contexto
const canvas = document.getElementById("pong") || document.createElement("canvas");
if (!document.getElementById("pong")) {
    canvas.id = "pong";
    canvas.width = 800;
    canvas.height = 400;
    document.body.appendChild(canvas);
}
const ctx = canvas.getContext("2d");

// Estilização básica da página para centralizar o jogo
document.body.style.backgroundColor = "#111";
document.body.style.display = "flex";
document.body.style.justifyContent = "center";
document.body.style.alignItems = "center";
document.body.style.height = "100vh";
document.body.style.margin = "0";
canvas.style.border = "4px solid #fff";

// Objetos do Jogo
const player = {
    x: 20,
    y: canvas.height / 2 - 50,
    width: 12,
    height: 100,
    color: "#00FF66",
    score: 0,
    dy: 0,
    speed: 7
};

const ai = {
    x: canvas.width - 32,
    y: canvas.height / 2 - 50,
    width: 12,
    height: 100,
    color: "#FF3366",
    score: 0,
    speed: 4.5
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speed: 6,
    dx: 5,
    dy: 5,
    color: "#FFFFFF"
};

// Rede central
function drawNet() {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Desenhar Retângulos (Raquete)
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Desenhar Círculo (Bola)
function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

// Desenhar Placar
function drawText(text, x, y, color = "#FFF") {
    ctx.fillStyle = color;
    ctx.font = "32px monospace";
    ctx.fillText(text, x, y);
}

// Reiniciar a bola após um ponto
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = -ball.dx;
    ball.speed = 6;
}

// Verificação de Colisão entre Bola e Raquete
function collision(b, p) {
    return (
        b.x - b.radius < p.x + p.width &&
        b.x + b.radius > p.x &&
        b.y - b.radius < p.y + p.height &&
        b.y + b.radius > p.y
    );
}

// Atualização de Lógica do Jogo
function update() {
    // Movimento do Jogador
    player.y += player.dy;

    // Limites de tela do Jogador
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

    // Movimento do Bot (IA simples)
    const targetY = ball.y - ai.height / 2;
    ai.y += (targetY - ai.y) * 0.08; // Suavização de movimento

    // Limites de tela do Bot
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;

    // Movimento da Bola
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Colisão da Bola com Paredes Superior e Inferior
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
    }

    // Determina qual raquete está sendo atingida
    const activePlayer = ball.x < canvas.width / 2 ? player : ai;

    // Colisão com Raquetes
    if (collision(ball, activePlayer)) {
        // Ponto de impacto (de -1 a 1)
        let collidePoint = ball.y - (activePlayer.y + activePlayer.height / 2);
        collidePoint = collidePoint / (activePlayer.height / 2);

        // Ângulo de rebatida em radianos (máximo 45 graus)
        const angleRad = (Math.PI / 4) * collidePoint;

        // Direção X conforme o jogador que rebateu
        const direction = ball.x < canvas.width / 2 ? 1 : -1;

        // Atualizar velocidade e direção
        ball.dx = direction * ball.speed * Math.cos(angleRad);
        ball.dy = ball.speed * Math.sin(angleRad);

        // Aumentar levemente a velocidade a cada rebatida
        ball.speed += 0.3;
    }

    // Pontuação
    if (ball.x - ball.radius < 0) {
        ai.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        player.score++;
        resetBall();
    }
}

// Renderização dos Elementos na Tela
function render() {
    // Limpar tela
    drawRect(0, 0, canvas.width, canvas.height, "#000");

    // Desenhar elementos
    drawNet();
    drawText(player.score, canvas.width / 4, 50);
    drawText(ai.score, (3 * canvas.width) / 4, 50);
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// Controles Teclado
window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        player.dy = -player.speed;
    } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        player.dy = player.speed;
    }
});

window.addEventListener("keyup", (e) => {
    if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "w" ||
        e.key === "S" ||
        e.key === "W" ||
        e.key === "s"
    ) {
        player.dy = 0;
    }
});

// Loop Principal do Jogo
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Iniciar Jogo
gameLoop();
