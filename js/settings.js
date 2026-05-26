// 設定画面の挙動
const numQuestionsInput = document.getElementById('numQuestions');
const openSettingsButton = document.getElementById('open-settings-btn');
const closeSettingsButton = document.getElementById('close-settings-btn');
const applySettingsButton = document.getElementById('apply-settings-btn');
const resetAnswersButton = document.getElementById('reset-answers-btn');
const presetButtons = document.querySelectorAll('.preset-button');
const settingsScreen = document.getElementById('settings-screen');
const currentQuestionCountText = document.getElementById('current-question-count');
const confirmModal = document.getElementById('confirm-modal');
const confirmMessage = document.getElementById('confirm-message');
const confirmApplyButton = document.getElementById('confirm-apply-btn');
const confirmCancelButton = document.getElementById('confirm-cancel-btn');
const toast = document.getElementById('toast');

let currentQuestionCount = parseInt(numQuestionsInput.value, 10) || 10;
let pendingQuestionCount = null;
let confirmAction = null;
let toastTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    applyQuestionCount(currentQuestionCount);

    openSettingsButton.addEventListener('click', openSettingsScreen);
    closeSettingsButton.addEventListener('click', closeSettingsScreen);
    applySettingsButton.addEventListener('click', handleApplySettings);
    resetAnswersButton.addEventListener('click', handleResetAnswers);

    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const presetValue = parseInt(button.dataset.value, 10);
            if (!isNaN(presetValue)) {
                numQuestionsInput.value = presetValue;
                syncPresetSelection(presetValue);
            }
        });
    });

    numQuestionsInput.addEventListener('input', () => {
        const inputValue = parseInt(numQuestionsInput.value, 10);
        syncPresetSelection(inputValue);
    });

    confirmApplyButton.addEventListener('click', confirmQuestionCountChange);
    confirmCancelButton.addEventListener('click', cancelQuestionCountChange);
});

function openSettingsScreen() {
    settingsScreen.classList.remove('is-hidden');
    document.body.classList.add('no-scroll');
    numQuestionsInput.value = currentQuestionCount;
    syncPresetSelection(currentQuestionCount);
}

function closeSettingsScreen() {
    settingsScreen.classList.add('is-hidden');
    document.body.classList.remove('no-scroll');
}

function handleApplySettings() {
    const requestedCount = parseInt(numQuestionsInput.value, 10);
    if (isNaN(requestedCount) || requestedCount <= 0) {
        alert('有効な問題数を入力してください (1以上)。');
        return;
    }

    if (requestedCount === currentQuestionCount) {
        closeSettingsScreen();
        return;
    }

    pendingQuestionCount = requestedCount;
    confirmAction = 'change-count';
    openConfirmModal('既存の選択肢は解除されます。よろしいですか？', '変更する');
}

function confirmQuestionCountChange() {
    if (confirmAction === 'change-count') {
        if (pendingQuestionCount !== null) {
            const applied = applyQuestionCount(pendingQuestionCount);
            if (applied) {
                showToast('問題数を反映しました。');
            }
        }
        pendingQuestionCount = null;
        closeConfirmModal();
        closeSettingsScreen();
        return;
    }

    if (confirmAction === 'reset-answers') {
        closeConfirmModal();
        resetAll();
        return;
    }

    closeConfirmModal();
}

function cancelQuestionCountChange() {
    const wasChangeCount = confirmAction === 'change-count';
    pendingQuestionCount = null;
    closeConfirmModal();
    if (wasChangeCount) {
        numQuestionsInput.value = currentQuestionCount;
        syncPresetSelection(currentQuestionCount);
    }
}

function openConfirmModal(message, confirmLabel) {
    if (message) {
        confirmMessage.textContent = message;
    }
    if (confirmLabel) {
        confirmApplyButton.textContent = confirmLabel;
    }
    confirmModal.classList.remove('is-hidden');
}

function closeConfirmModal() {
    confirmModal.classList.add('is-hidden');
    confirmMessage.textContent = '既存の選択肢は解除されます。よろしいですか？';
    confirmApplyButton.textContent = '変更する';
    confirmAction = null;
}

function handleResetAnswers() {
    confirmAction = 'reset-answers';
    openConfirmModal('回答をリセットします。よろしいですか？', 'リセットする');
}

function showToast(message) {
    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add('show');

    if (toastTimer) {
        clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function syncPresetSelection(value) {
    presetButtons.forEach(button => {
        const presetValue = parseInt(button.dataset.value, 10);
        button.classList.toggle('selected', presetValue === value);
    });
}

function applyQuestionCount(count) {
    const num = parseInt(count, 10);
    if (isNaN(num) || num <= 0) {
        alert('有効な問題数を入力してください (1以上)。');
        return false;
    }

    currentQuestionCount = num;
    numQuestionsInput.value = num;
    syncPresetSelection(num);
    currentQuestionCountText.textContent = String(num);
    generateQuestions(num);
    return true;
}

function resetAll() {
    const num = currentQuestionCount;
    for (let i = 1; i <= num; i++) {
        answers[i] = '';
        scores[i] = '';
    }

    document.querySelectorAll('.option.selected').forEach(opt => {
        opt.classList.remove('selected');
    });

    document.querySelectorAll('.scoring.selected').forEach(scor => {
        scor.classList.remove('selected');
    });

    updateResults();
    updateScorings();
    showToast('回答をリセットしました。');
}
