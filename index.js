// script.js
// LIFF IDはあなたのLIFF IDに置き換えてください
const MY_LIFF_ID = '2007298177-JYelpW3d';
// GAS Web App URLはデプロイしたGASのURLに置き換えてください
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwi1GiCjL55Cjh0M61prjFEfu9_6vP4Xi_AcTTYtWCddS6FIzieBRLuYCaqtyCVleHlMA/exec';

let lineId = null;
let userDisplayName = '';
let latitude = null;
let longitude = null;

// LIFFの初期化
liff.init({
    liffId: MY_LIFF_ID
})
.then(() => {
    console.log('LIFF init success');
    if (liff.isLoggedIn()) {
        console.log('Logged in to LIFF');
        // LINE IDと氏名を取得
        liff.getProfile()
            .then(profile => {
                lineId = profile.userId;
                userDisplayName = profile.displayName;
                console.log('LINE ID:', lineId);
                console.log('Display Name:', userDisplayName);
                // 氏名フィールドに初期値を設定
                const nameInput = document.getElementById('name');
                if (nameInput && !nameInput.value) { // 入力済みの場合は上書きしない
                    nameInput.value = userDisplayName;
                }
            })
            .catch((err) => {
                console.error('Error getting profile', err);
                document.getElementById('statusMessage').textContent = 'LINEプロフィールの取得に失敗しました。';
            });

        // 位置情報を取得
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    latitude = position.coords.latitude;
                    longitude = position.coords.longitude;
                    console.log('Latitude:', latitude);
                    console.log('Longitude:', longitude);
                    // 緯度経度はユーザーには表示しないが、送信データに含める
                },
                (error) => {
                    console.error('Error getting location', error);
                    // 位置情報の取得に失敗してもフォーム送信は可能にする
                    document.getElementById('statusMessage').textContent += ' 位置情報の取得に失敗しました。';
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            console.log('Geolocation is not supported by this browser.');
             document.getElementById('statusMessage').textContent += ' お使いのブラウザは位置情報に対応していません。';
        }

    } else {
        console.log('Not logged in to LIFF. Redirecting to login...');
        // Mini Appでは通常不要ですが、念のため
        liff.login();
    }
})
.catch((err) => {
    console.error('LIFF init failed', err);
    document.getElementById('statusMessage').textContent = 'LIFFの初期化に失敗しました。';
});

// フォーム送信時の処理
const safetyForm = document.getElementById('safetyForm');
if (safetyForm) {
    safetyForm.addEventListener('submit', function(event) {
        event.preventDefault(); // デフォルトのフォーム送信を防止

        const statusMessage = document.getElementById('statusMessage');
        statusMessage.textContent = '送信中...';

        // フォームデータの収集
        const formData = new FormData(safetyForm);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // プログラムで取得したデータの追加
        if (lineId) {
            data.lineId = lineId;
        } else {
            statusMessage.textContent = 'LINE IDが取得できませんでした。';
            return; // 送信中止
        }

        if (latitude !== null && longitude !== null) {
             data.latitudeLongitude = `${latitude},${longitude}`; // 緯度経度をまとめて送信
        } else {
             data.latitudeLongitude = ''; // 位置情報が取得できなかった場合
        }

        // タイムスタンプはGAS側で生成するのでここでは含めない（GASコードによる）
        // data.timestamp = new Date().toISOString();

        console.log('Sending data:', data);

        // GAS Web AppへのPOSTリクエスト
        fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            mode: 'cors', // CORSを有効にする
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            console.log('GAS Response:', result);
            if (result.status === 'success') {
                statusMessage.textContent = '安否情報を送信しました。';
                // フォームをリセットすることも可能
                // safetyForm.reset();
                // LIFFウィンドウを閉じる
                liff.closeWindow();
            } else {
                statusMessage.textContent = `送信に失敗しました: ${result.message}`;
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            statusMessage.textContent = `送信中にエラーが発生しました: ${error}`;
        });
    });
} else {
    console.error('Form element not found.');
}
