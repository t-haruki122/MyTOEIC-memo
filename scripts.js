// 解答を格納するオブジェクト
const answers = {};

// DOM要素の取得
const numQuestionsInput = document.getElementById('numQuestions');
const generateButton = document.getElementById('generate-btn');
const resetButton = document.getElementById('reset-btn');
const questionsArea = document.getElementById('questions-area');
const resultsText = document.getElementById('results-text');

// ====================
// イベントリスナーの設定
// ====================
document.addEventListener('DOMContentLoaded', () => {
    generateQuestions(); // ページ読み込み時に初期の問題を生成 (デフォルト10問)
    
    // ボタンにイベントリスナーを追加
    generateButton.addEventListener('click', generateQuestions);
    resetButton.addEventListener('click', resetAll);
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
    
    updateResults(); // 結果表示を初期化

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
        `;
        questionsArea.appendChild(qDiv);
    }

    // イベントリスナーを新しく生成された選択肢に追加
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', handleOptionClick);
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