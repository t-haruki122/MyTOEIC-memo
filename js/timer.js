const TOTAL_SECONDS = 60 * 60;     // タイマーの初期設定（60分を秒に変換）
let timeRemaining = TOTAL_SECONDS;
let timerInterval = null;
let isRunning = false;
let lastSetTime = TOTAL_SECONDS;

// HTML要素を取得
const timerDisplay = document.getElementById('timer-display');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');
const timerAlarm = document.getElementById('timer-alarm');

// 秒を MM:SS 形式にフォーマットする関数
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    // 常に2桁表示にする (例: 5 -> 05)
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// タイマー表示を更新する関数
function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(timeRemaining);
    // 10秒以下でクラスを追加して警告色にする
    if (timeRemaining <= 10 && timeRemaining > 0) {
        timerDisplay.classList.add('time-alert');
    } else {
        timerDisplay.classList.remove('time-alert');
    }
}

// 入力された文字列（MM:SS）を秒数に変換する関数
function parseTime(timeString) {
    const parts = timeString.split(':');
    if (parts.length === 2) {
        const minutes = parseInt(parts[0], 10);
        const seconds = parseInt(parts[1], 10);
        if (!isNaN(minutes) && !isNaN(seconds)) {
            return (minutes * 60) + seconds;
        }
    }
    return null; // 無効な形式
}

// アラーム音を再生する関数
function playAlarm() {
    // 再生位置を最初に戻してから再生 (続けて何度も鳴らす場合に備えて)
    timerAlarm.currentTime = 0;
    timerAlarm.play();
}

// アラーム音を停止する関数
function stopAlarm() {
    timerAlarm.pause();
    timerAlarm.currentTime = 0;
}

// カウントダウンを開始/一時停止する関数
function toggleTimer() {
    if (!isRunning && timeRemaining === 0) {
        // 表示されている時間を解析
        const displayedTime = timerDisplay.textContent;
        const initialSeconds = parseTime(displayedTime);

        if (initialSeconds === null || initialSeconds <= 0) {
            alert('有効な時間を設定してください。');
            return;
        }
        
        // 有効な時間であれば、それを timeRemaining に設定し、lastSetTime に保存
        timeRemaining = initialSeconds;
        lastSetTime = initialSeconds;
        updateTimerDisplay();
    }
    if (isRunning) {
        // 一時停止
        clearInterval(timerInterval);
        isRunning = false;
        startButton.textContent = '再開';
        timerDisplay.contentEditable = true; // 編集可能にする
    } else {
        // 開始または再開
        if (timeRemaining <= 0) return; // 時間切れなら何もしない

        isRunning = true;
        startButton.textContent = '一時停止';
        timerDisplay.contentEditable = false; // 編集不可にする

        // モバイル対策
        timerAlarm.volume = 0.01;
        timerAlarm.play().catch(e => {
            console.log('Autoplay blocked:', e);
            // エラーが発生しても処理を継続するために、ここでは何もしない
        }).finally(() => {
            // play()の成功・失敗に関わらず実行
            timerAlarm.pause(); // すぐに停止
            timerAlarm.volume = 1.0; // 音量を元に戻す (アラームに備える)
        });

        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();

            if (timeRemaining < 0) {
                clearInterval(timerInterval); // タイマーを停止
                isRunning = false;
                startButton.textContent = '開始';
                timerDisplay.contentEditable = true; // 編集可能にする

                playAlarm(); // アラーム音を再生

                alert('時間切れです！'); // 時間切れを通知

                stopAlarm(); // アラーム音を停止

                timeRemaining = lastSetTime;
                updateTimerDisplay();
            }
        }, 1000); // 1秒ごとに実行
    }
}

// タイマーをリセットする関数
function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    
    // リセット時は、最後に保存された時間 (lastSetTime) を使用する
    timeRemaining = lastSetTime;
    
    startButton.textContent = 'タイマー開始';
    timerDisplay.contentEditable = true; // 編集可能に戻す
    updateTimerDisplay(); // 表示を更新
}

// ページが完全に読み込まれてからイベントリスナーを設定
document.addEventListener('DOMContentLoaded', () => {
    // ページロード時の初期設定 (60分)
    timeRemaining = TOTAL_SECONDS;
    lastSetTime = TOTAL_SECONDS;
    updateTimerDisplay(); 
    
    // イベントリスナーの設定
    startButton.addEventListener('click', toggleTimer);
    resetButton.addEventListener('click', resetTimer);
    
    // Enterキーを押したときに編集を終了し、リセットをかける
    timerDisplay.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // 改行を防ぐ
            const editedSeconds = parseTime(timerDisplay.textContent);
            if (editedSeconds !== null && editedSeconds > 0) {
                lastSetTime = editedSeconds; // 新しい設定時間を確定
            }
            resetTimer();       // 新しい時間でリセット
        }
    });

    // フォーカスが外れたとき（タップ終了時）に時間を確定させる
    timerDisplay.addEventListener('blur', () =>{
        const editedSeconds = parseTime(timerDisplay.textContent);
        if (editedSeconds !== null && editedSeconds > 0) {
            lastSetTime = editedSeconds; // 新しい設定時間を確定
        }
        resetTimer();       // 新しい時間でリセット
    });
});