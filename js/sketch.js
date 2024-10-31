// 定数
const WHITE = "#ffffff";
const BLACK = "#000000";
const SCREEN = 80;
const R_WIDTH = 780;
const R_DEPTH = 10;
const PLAYER_SIZE = 30;
const MAX_HP = 5; // 最大HP
const JUMP_DURATION = 20; // ジャンプの持続時間
const GRAVITY = 4; // 重力

// 変数
let lines = [];
let obstacles = []; // 障害物を格納する配列
let eyeX = 0;
let eyeY = 400;
let eyeZ = 0;
let playerX = 0;
let playerY = 0; // プレイヤーのY位置（ジャンプ対応）
let playerHP = MAX_HP; // プレイヤーのHP
let isJumping = false; // ジャンプ状態のフラグ
let jumpTimer = 0; // ジャンプタイマー
let gameTimer = 3; // ゲームの制限時間（秒）
let lastFrameTime; // 前フレームの時刻
let isGameStarted = false; // ゲームが開始されているかどうかのフラグ
let isPaused = false; // ポーズ状態を管理するフラグ
let isGameOver = false; // ゲームオーバー状態を管理する変数
let isGameClear = false; // ゲームクリア状態を管理する変数
let initialPlayerX = 100; // プレイヤーの初期X座標を設定
let initialPlayerY = 200; // プレイヤーの初期Y座標を設定（必要に応じて）


// キーの状態を管理するオブジェクト
const keys = {
    left: false,
    right: false
};

let player = {
    x: 723, // プレイヤーの初期X座標
    y: 790, // プレイヤーの初期Y座標
    // 必要な他のプロパティも追加できます
};
/// setup
function setup() {
    createCanvas(1435, 800);
    angleMode(DEGREES);
    frameRate(60);
    noFill();
    stroke(WHITE);
    strokeWeight(1);

    // 障害物の生成
    for (let i = 0; i < 300; i++) {
        const line = new MyLine();
        line.curve = 0;
        line.bank = 0;
        line.project(eyeX, eyeY, R_DEPTH * i - eyeZ);
        lines.push(line);

        // 20%の確率で障害物を追加
        if (i > 5 && i % 5 === 0 && random() < 0.2) {
            obstacles.push(new Obstacle());
        }
    }

    lastFrameTime = millis();
}

function resetGame() {
	console.log("resetGameが呼ばれました"); // 関数が呼ばれたか確認
	// ゲームの状態を初期化
	isPaused = false;
    isGameOver = false;
    isGameClear = false;
	playerHP = 3;
	player.x = initialPlayerX; // プレイヤーの初期位置（X座標）
	player.y = initialPlayerY; // プレイヤーの初期位置（Y座標）
	eyeZ = 0;
	obstacles.length = 0; // 障害物をリセット
	gameTimer = 30; // タイマーを初期化（30秒）
	lastFrameTime = millis(); // タイマー初期化
	isGameStarted = false; // ゲームをスタートしていない状態に戻す
   		showStartScreen(); // スタート画面を表示
    	noLoop(); // 描画ループを停止
	  // ジャンプの状態をリセット
	  isJumping = false; // ジャンプ中フラグをリセット
	  jumpTimer = 0; // ジャンプタイマーをリセット

	  
}


function draw() {
    background(BLACK);
    // ゲームが開始されていない場合、スタート画面を表示
	if (!isGameStarted) {
        showStartScreen();
        return; // ゲームが開始していない場合は、開始画面のみを表示
    }

    if (isPaused) {
        showPauseScreen(); // ポーズ状態の場合、ポーズ画面を表示
		
        return; // それ以降の描画を行わない
    }
	if (isGameOver) {
        showGameOver(); // ゲームオーバー画面を表示
        noLoop(); // ゲームを停止
        return; // これ以上の描画を行わない
    }

    if (isGameClear) {
        showGameClear(); // ゲームクリア画面を表示
        noLoop(); // ゲームを停止
        return; // これ以上の描画を行わない
    }

	eyeZ += 2;
	

	
	

	// プレイヤーの位置を更新
    updatePlayerPosition();


	
	
	

	

    const start = floor(eyeZ / R_DEPTH) + 1;
    for (let i = start; i < start + 40; i++) {
        const iA = i % lines.length;
        const iB = (iA > 0) ? iA - 1 : lines.length - 1;
        const lA = lines[iA];
        const lB = lines[iB];

        lA.project(eyeX, eyeY, R_DEPTH * i - eyeZ);

        if (lB.y < lA.y) continue;

        let cGrass = (i % 2 == 0) ? "#33dd33" : "#33aa33";
        let cSide  = (i % 2 == 0) ? "#333333" : "#ffffff";
        let cRoad  = (i % 2 == 0) ? "#bbbbbb" : "#eeeeee";

        drawShape(lA.x, lA.y, width * 4,  lB.x, lB.y, width * 4,  cGrass);
        drawShape(lA.x, lA.y, lA.w * 1.2, lB.x, lB.y, lB.w * 1.2, cSide);
        drawShape(lA.x, lA.y, lA.w,       lB.x, lB.y, lB.w,       cRoad);

		 // HPバーを描画
		 drawHPBar();

		 // HPと残り時間の表示
		 fill(WHITE);
		 textSize(16);
		 text(`Time: ${floor(gameTimer)}`, width - 100, 30);
    }
	

	

	function drawHPBar() {
		const barWidth = 200; // HPバーの幅
		const barHeight = 20; // HPバーの高さ
		const barX = 20; // HPバーのX位置
		const barY = 50; // HPバーのY位置
	
		// HPバーの背景を描画
		fill(150); // 背景色
		rect(barX, barY, barWidth, barHeight);
	
		// HPに基づいてバーの長さを計算
		const currentHPWidth = (barWidth / MAX_HP) * playerHP;
	
		// 現在のHPを示すバーを描画
		fill("#00ff00"); // HPバーの色
		rect(barX, barY, currentHPWidth, barHeight);
	}

    // 障害物の描画と当たり判定
    drawObstacles();

    // プレイヤーの描画
    drawPlayer();

    // ジャンプの処理
    if (isJumping) {
        jumpTimer++;
        if (jumpTimer > JUMP_DURATION) {
            isJumping = false;
            jumpTimer = 0;
        }
    }

    // Y座標の更新
    if (isJumping) {
		playerY = -100 + (jumpTimer * (50 / JUMP_DURATION)); // ジャンプの高さを調整
	} else {
		if (playerY < 0) {
			playerY += GRAVITY; // 重力をかける
			if (playerY > 0) {
				playerY = 0; // 地面に戻る
			}
		}
	}

    // HPと残り時間の表示
    fill(WHITE);
    textSize(16);
   
    text(`Time: ${floor(gameTimer)}`, width - 100, 30);

     // 時間制限の処理
	 const currentTime = millis();
	 if (!isPaused) { // ポーズ中でなければタイマーを更新
        if (playerHP > 0 && gameTimer > 0) { // ゲームが進行中のときのみタイマーを更新
            gameTimer -= (currentTime - lastFrameTime) / 1000;
        }
    }
	 lastFrameTime = currentTime;

   // ゲームクリアとゲームオーバーの判定
   if (playerHP <= 0) {
	   showGameOver();
	   isGameOver = true;
	   noLoop(); // ゲームオーバー時に描画を停止
   } else if (gameTimer <= 0) {
	   showGameClear();
	   noLoop(); // ゲームクリア時に描画を停止
	   isGameCleared = true;
   }
   
}
function drawPauseScreen() {
	fill(0, 0, 255, 150); // 半透明の黒
	rect(0, 0, width, height); // 背景
	fill(255); // 白
	textSize(48);
	textAlign(CENTER, CENTER);
	text("PAUSED", width / 2, height / 2);
	textSize(24);
	text("Press 'S' to resume", width / 3, height / 2 + 50);
}

// プレイヤーの描画
function drawPlayer() {
	const PLAYER_SIZE = 30;
    // プレイヤーのX位置を制限
    if (playerX < -width / 2 + PLAYER_SIZE / 2) {
        playerX = -width / 2 + PLAYER_SIZE / 2; // 左端を超えないように
    } else if (playerX > width / 2 - PLAYER_SIZE / 2) {
        playerX = width / 2 - PLAYER_SIZE / 2; // 右端を超えないように
    }

	fill("#ff0000");
    noStroke();
    ellipse(width / 2 + playerX, height - 50 + playerY, PLAYER_SIZE, PLAYER_SIZE); // 自機のサイズを使用
}

// 障害物の描画と当たり判定
function drawObstacles() {
    for (let obstacle of obstacles) {
        obstacle.update(); // 障害物の更新
        obstacle.draw(); // 障害物の描画

        // 当たり判定
        if (dist(width / 2 + playerX, height - 50 + playerY, obstacle.x, obstacle.y) < (PLAYER_SIZE / 2 + obstacle.size / 2)) {
            if (!isJumping || !obstacle.isJumpable) { // ジャンプしていないか、ジャンプで避けられない障害物に衝突
                playerHP--;
                obstacles.splice(obstacles.indexOf(obstacle), 1);
            }
        }
    }
}

// スタート画面を描画する関数
function showStartScreen() {
    fill(WHITE);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("ゲームを開始するにはクリック", width / 2, height / 2);
	text("矢印キーで左右移動　スペースキーでジャンプ", width / 2, height /3);
}


// マウスをクリックしてゲーム開始
function mousePressed() {
	console.log("Mouse Pressed!"); // デバッグ用
	if (!isGameStarted) {
		isGameStarted = true; // ゲームを開始する
		gameTimer = 30; // タイマーを初期化
		playerHP = 5; // HPを初期化
		lastFrameTime = millis(); // タイマーの開始時間を設定
		loop(); // 描画を再開
	}
	
}

// 2つのラインオブジェクトを使って台形を描く
function drawShape(x1, y1, w1, x2, y2, w2, c) {
    fill(c);
    noStroke();
    beginShape();
    vertex(x1 - w1 / 2, y1);
    vertex(x1 + w1 / 2, y1);
    vertex(x2 + w2 / 2, y2);
    vertex(x2 - w2 / 2, y2);
    endShape();
}

class Obstacle {
    constructor() {
        this.type = random() < 0.5 ? 'side' : 'top'; // 'side'または'top'のどちらかをランダムに選択
        if (this.type === 'side') {
            this.isComingFromLeft = random() < 0.5; // 左右どちらから出現するかを決定
            this.x = this.isComingFromLeft ? 0 : width; // 左から出る場合は0、右から出る場合は画面の幅
            this.y = random(400,450); // Y位置はランダム
            this.size = random(15, 30); // サイズをランダムに設定
            this.speed = random(3, 7); // 移動速度をランダムに設定
        } else {
            this.x = random(width); // X位置はランダム
            this.y = 0; // 上から降ってくるためY位置は0
            this.size = random(15, 30); // サイズをランダムに設定
            this.speed = random(2, 5); // 降下速度を設定
        }
        this.color = "#0000ff"; // 障害物の色を青に設定
    }

    update() {
        if (this.type === 'side') {
            // 左から来る場合、右に移動、右から来る場合は左に移動
            this.x += this.isComingFromLeft ? this.speed : -this.speed;

            // 画面外に出たら再生成
            if (this.isComingFromLeft && this.x > width) {
                this.reset();
            } else if (!this.isComingFromLeft && this.x < 0) {
                this.reset();
            }
        } else {
            // 上から降ってくる場合
            this.y += this.speed; // Y位置を下に移動

            // 画面外に出たら再生成
            if (this.y > height) {
                this.reset();
            }
        }
    }

    reset() {
        this.type = random() < 0.5 ? 'side' : 'top'; // 障害物の種類を再設定
        if (this.type === 'side') {
            this.isComingFromLeft = random() < 0.5;
            this.x = this.isComingFromLeft ? 0 : width; // 左または右から再出現
            this.y = random(height - 50); // 新しいY位置を設定
            this.size = random(15, 30); // 新しいサイズを設定
            this.speed = random(3, 7); // 新しい速度を設定
        } else {
            this.x = random(width); // X位置はランダム
            this.y = 0; // 上から降ってくるためY位置は0
            this.size = random(15, 30); // 新しいサイズを設定
            this.speed = random(2, 5); // 降下速度を設定
        }
    }

    draw() {
        fill(this.color);
        noStroke();
        ellipse(this.x, this.y, this.size, this.size); // 現在は円形として描画
    }
}


// ポーズ画面を描画する関数
function showPauseScreen() {
    fill(255, 255, 0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("ポーズ中", width / 2, height / 2);
	
    
}


// ゲームオーバー画面
function showGameOver() {
    fill("#ff0000");
    textSize(32);
    text("Game Over", width / 2 - 80, height / 2);
    textSize(24);
   
    noLoop();
}

// ゲームクリア画面
function showGameClear() {
    fill("#00ff00");
    textSize(32);
    text("Game Clear", width / 2 - 80, height / 2);
    textSize(24);
  
    noLoop();
}



// ラインオブジェクト(台形の横線で使う)
class MyLine {
    constructor() {
        this._x = 0;
        this._y = 0;
        this._w = 0;
        this._c = 0;
        this._b = 0;
    }

    project(x, y, z) {
        const s = SCREEN / z;
        this._x = x * s + width / 2;
        this._y = y * s + height / 2;
        this._w = R_WIDTH * s;
    }

    get x() { return this._x; }
    get y() { return this._y; }
    get w() { return this._w; }

    set curve(n) { this._c = n; }
    get curve() { return this._c; }

    set bank(n) { this._b = n; }
    get bank() { return this._b; }
}

function keyPressed() {
    if (key === ' ' && !isJumping) {
        isJumping = true; // ジャンプ開始
        jumpTimer = 0; // ジャンプタイマーリセット
    }
    if (keyCode === LEFT_ARROW) {
        keys.left = true;
    }
    if (keyCode === RIGHT_ARROW) {
        keys.right = true;
    }
	// Pキーでポーズ/再開
    if (key === 'p') {
        isPaused = !isPaused; // ポーズ状態をトグル
        if (!isPaused) {
            loop(); // ゲームを再開
        } else {
            noLoop(); // ゲームを停止
        }
    }
	
	
    if (key === 'r' || key === 'R') { // Rキーでリスタート
		console.log('Rキーが押されました'); // デバッグ用メッセージ
		if (isGameOver || isGameClear) {
            resetGame();
        }
		
		
	}
}



// キーが離されたときにフラグを false にする
function keyReleased() {
    if (keyCode === LEFT_ARROW) {
        keys.left = false;
    }
    if (keyCode === RIGHT_ARROW) {
        keys.right = false;
    }
}


function updatePlayerPosition() {
    if (keys.left) {
        playerX -= 10; // 左に移動
    }
    if (keys.right) {
        playerX += 10; // 右に移動
    }
	

	// プレイヤーが画面外に行かないように制限
    const halfPlayerSize = PLAYER_SIZE / 2;
    playerX = constrain(playerX, -width / 2 + halfPlayerSize, width / 2 - halfPlayerSize);
}

function updateGameState() {
    if (playerHP <= 0) {
        isGameOver = true; // ゲームオーバー
    }

    // ゲームクリアの条件をチェック（例: タイマーが0になった場合など）
    if (gameTimer <= 0) {
        isGameClear = true; // ゲームクリア
    }
}
