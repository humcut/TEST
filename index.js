import './index.css';
import liff from '@line/liff'

const MY_LIFF_ID = 'YOUR_LIFF_ID'; // 例: '1655951099-AbCdEfG'

// メッセージを表示するHTML要素を更新する関数
function updateMessageDisplay(text) {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = text;
    }
}

// エラーを表示するHTML要素を更新する関数
function updateErrorDisplay(text) {
     const errorElement = document.getElementById('error');
     if (errorElement) {
         errorElement.textContent = text;
     }
}

// 名前を表示または入力フィールドに設定する関数
function updateNameDisplay(name) {
    const nameSpanElement = document.getElementById('userName'); // spanなどで表示する場合
    const nameInputElement = document.getElementById('name'); // inputフィールドの場合

    if (nameSpanElement) {
        nameSpanElement.textContent = name;
    }
    // 安否確認フォームの氏名入力欄がある場合、取得した名前で初期値を設定（ただし既に入力があれば上書きしない）
    if (nameInputElement && !nameInputElement.value) {
         nameInputElement.value = name;
    }
}


// ページのDOMが完全に読み込まれた後に実行されるようにします
// LIFF init自体はDOMContentLoadedを待つ必要はないですが、
// 取得した情報をDOM要素に反映させる場合は、要素が存在する状態を待つのが安全です。
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - Starting LIFF initialization');

    liff.init({
        liffId: MY_LIFF_ID
    })
    .then(() => {
        // 成功時の処理
        updateMessageDisplay("LIFF init succeeded."); // 画面にメッセージを表示
        updateErrorDisplay(""); // エラー表示をクリア
        console.log("LIFF initialization succeeded."); // コンソールログに出力

        // プロフィールの取得
        liff.getProfile()
            .then((profile) => {
                const userName = profile.displayName;
                updateNameDisplay(userName); // 画面に名前を表示/フォームに設定
                console.log("LINE Display Name:", userName); // コンソールログに出力
            })
            .catch((err) => {
                // プロフィール取得失敗時の処理
                console.error("Error getting profile", err); // コンソールログに出力
                updateErrorDisplay("LINEプロフィールの取得に失敗しました。"); // 画面にエラー表示
            });
    })
    .catch((e) => {
        // LIFF初期化失敗時の処理
        console.error("LIFF initialization failed", e); // コンソールログに出力
        updateMessageDisplay("LIFF init failed."); // 画面にメッセージを表示
        updateErrorDisplay(`エラー詳細: ${e.message || e}`); // 画面にエラー詳細を表示
    });
});
