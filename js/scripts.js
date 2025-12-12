// 解答を格納するオブジェクト
const answers = {};
const scores = {};

// DOM要素の取得
const numQuestionsInput = document.getElementById('numQuestions');
const generateButton = document.getElementById('generate-btn');
const clearButton = document.getElementById('reset-btn');
const questionsArea = document.getElementById('questions-area');
const resultsText = document.getElementById('results-text');
const scoreText = document.getElementById('score-text');

// ====================
// イベントリスナーの設定
// ====================
document.addEventListener('DOMContentLoaded', () => {
    generateQuestions(); // ページ読み込み時に初期の問題を生成 (デフォルト10問)
    
    // ボタンにイベントリスナーを追加
    generateButton.addEventListener('click', generateQuestions);
    clearButton.addEventListener('click', resetAll);
});

/**
 * 指定された問題数に基づいて4択の選択肢エリアを生成する
 */
function generateQuestions() {
    const num = parseInt(numQuestionsInput.value);
    questionsArea.innerHTML = ''; // 既存のコンテンツをクリア

    if (isNaN(num) || num <= 0) {
        alert('有効な問題数を入力してください (1以上)。');
        return;
    }

    // answersオブジェクトを再初期化
    for (let i = 1; i <= num; i++) {
        answers[i] = ''; // 初期値は空
    }
    // scoresオブジェクトを再初期化
    for (let i = 1; i <= num; i++) {
        scores[i] = ''; // 初期値は空
    }
    
    updateResults(); // 結果表示を初期化
    updateScorings(); // 採点表示を初期化

    for (let i = 1; i <= num; i++) {
        const qDiv = document.createElement('div');
        qDiv.classList.add('question');
        qDiv.innerHTML = `
            <div class="question-number">No. ${i}</div>
            <div class="options-container">
                <span class="option" data-question="${i}" data-answer="A">A</span>
                <span class="option" data-question="${i}" data-answer="B">B</span>
                <span class="option" data-question="${i}" data-answer="C">C</span>
                <span class="option" data-question="${i}" data-answer="D">D</span>
            </div>
            <div class="scorings-container">
                <span class="scoring ok" data-question="${i}" data-scoring="OK">O</span>
                <span class="scoring ng" data-question="${i}" data-scoring="NG">X</span>
            </div>
        `;
        questionsArea.appendChild(qDiv);
    }

    // イベントリスナーを新しく生成された選択肢に追加
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', handleOptionClick);
    });

    document.querySelectorAll('.scoring').forEach(scoring => {
        scoring.addEventListener('click', handleScoringClick);
    });
}

/**
 * 選択肢がクリックされたときの処理
 * @param {Event} event - クリックイベント
 */
function handleOptionClick(event) {
    const clickedOption = event.target;
    const qNum = clickedOption.dataset.question;
    const answer = clickedOption.dataset.answer;
    const optionsContainer = clickedOption.closest('.options-container');

    // 既存の選択を解除
    optionsContainer.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });

    // 新しい選択をハイライト
    clickedOption.classList.add('selected');

    // 解答を記録
    answers[qNum] = answer;

    // 結果表示を更新
    updateResults();
    updateScorings();
}

/**
 * 採点がクリックされたときの処理
 * @param {Event} event - クリックイベント
 */
function handleScoringClick(event) {
    const clickedScoring = event.target;
    const qNum = clickedScoring.dataset.question;
    const scoring = clickedScoring.dataset.scoring;
    const scoringsContainer = clickedScoring.closest('.scorings-container');

    // 現在選択中の回答と同じならば選択を解除する
    if (scores[qNum] === scoring) {
        clickedScoring.classList.remove('selected');
        scores[qNum] = ''; // 解答を空にする
        updateResults();
        updateScorings();
        return;
    }

    // 既存の選択を解除
    scoringsContainer.querySelectorAll('.scoring').forEach(scor => {
        scor.classList.remove('selected');
    });

    // 新しい選択をハイライト
    clickedScoring.classList.add('selected');

    // 解答を記録
    scores[qNum] = scoring;

    // 結果表示を更新
    updateResults();
    updateScorings();
}

/**
 * 採点結果を更新して表示する
 */
function updateScorings() {
    let scoringString = '';
    const questionNumbers = Object.keys(scores).map(Number).sort((a, b) => a - b);

    // 正解の問題数 / 総問題数 の形式で表示
    let correctCount = 0;
    questionNumbers.forEach(qNum => {
        if (scores[qNum] === 'OK') {
            correctCount++;
        }
    });

    if (questionNumbers.length > 0) {
        scoringString = `採点結果: ${correctCount} / ${questionNumbers.length}`;
        scoringString += `（${((correctCount / questionNumbers.length) * 100).toFixed(2)}%）`;
        scoringString += `、採点されていない問題数：${questionNumbers.length - correctCount - Object.values(scores).filter(ans => ans === 'NG').length}`;
    }

    // TOEICスコア換算
    if (questionNumbers.length == 100) { // 495点満点
        const toeicScore = Math.round((correctCount / 100) * 495);
        scoringString += `\nTOEICスコア換算: ${toeicScore}点 / 495点`;
    } else if (questionNumbers.length == 200) { // 990点満点
        const toeicScore = Math.round((correctCount / 200) * 990);
        scoringString += `\nTOEICスコア換算: ${toeicScore}点 / 990点`;
    }
    
    scoreText.textContent = scoringString || '採点結果がありません。';
}

/**
 * 解答一覧を更新して表示する
 */
function updateResults() {
    let resultString = '';
    const questionNumbers = Object.keys(answers).map(Number).sort((a, b) => a - b);
    
    // 1行に最大10問表示する
    for (let i = 0; i < questionNumbers.length; i++) {
        const qNum = questionNumbers[i];
        const ans = answers[qNum] || '_'; // 未選択の場合は '_' を表示
        resultString += `${qNum}: ${ans}`;
        
        // 10問ごとに改行
        if ((i + 1) % 10 === 0 && (i + 1) !== questionNumbers.length) {
            resultString += ',\n'; // カンマと改行
        } else if ((i + 1) !== questionNumbers.length) {
            resultString += ', '; // カンマとスペース
        }
    }
    
    resultsText.textContent = resultString || '問題数を設定して「生成」ボタンを押してください。';
}

/**
 * 全ての選択とデータをリセットする
 */
function resetAll() {
    // answersオブジェクトをリセット (現在の問題数に基づいて再初期化)
    const num = parseInt(numQuestionsInput.value);
    for (let i = 1; i <= num; i++) {
        answers[i] = ''; 
    }
    
    // 選択のハイライトを全て解除
    document.querySelectorAll('.option.selected').forEach(opt => {
        opt.classList.remove('selected');
    });

    // 結果表示を更新
    updateResults();
    alert('解答をリセットしました。');
}