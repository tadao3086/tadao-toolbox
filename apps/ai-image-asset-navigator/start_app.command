#!/bin/bash

# スクリプトの配置ディレクトリに移動
cd "$(dirname "$0")"

echo "=================================================="
echo "  AI Image Asset Navigator - Mac 起動スクリプト  "
echo "=================================================="

PORT=8082

# すでに8082ポートが使われているか確認し、使われている場合は古いプロセスをキルします
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
  echo "ポート $PORT で古いプロセスが動作しています。クリーンアップ（再起動）します..."
  # 動作中の古いサーバープロセスを終了
  kill -9 $(lsof -t -i:$PORT) > /dev/null 2>&1
  sleep 1
fi

# Python3が利用可能かチェック
if command -v python3 >/dev/null 2>&1; then
  echo "新しいサーバーをポート $PORT で起動します..."
  # バックグラウンドでサーバーを起動
  python3 -m http.server $PORT > /dev/null 2>&1 &
  SERVER_PID=$!
  
  # サーバーの起動を少し待つ
  sleep 1
  
  # ブラウザで自動オープン
  open "http://localhost:$PORT"
  
  echo "--------------------------------------------------"
  echo "  サーバー起動成功！"
  echo "  URL: http://localhost:$PORT"
  echo "  ※ このウィンドウを閉じるとサーバーが停止します。"
  echo "--------------------------------------------------"
  
  # スクリプト終了時にバックグラウンドプロセスを終了するトラップを設定
  trap "kill $SERVER_PID" EXIT
  
  # プロセスの生存を待機
  wait $SERVER_PID
else
  # Python3がない場合のフォールバック（直接ファイルをブラウザで開く）
  echo "Python3 が見つかりません。index.html を直接ブラウザで開きます..."
  open "index.html"
fi
