/**
 * 申し込みformのテンプレート（Googleフォーム）を作るスクリプト
 *
 * 使い方
 * 1. https://script.google.com/ を開き「新しいプロジェクト」を作る
 * 2. このファイルの中身をすべて貼り付けて保存する
 * 3. 上の関数の選択で createTemplateForm を選び「実行」を押す（初回は権限の確認が出るので許可する）
 * 4. 「実行ログ」に出た FORM_ID を frontend/.env.local の NEXT_PUBLIC_FORM_ID= に貼り、開発サーバーを再起動する
 *
 * 質問は frontend/lib/formTemplate.ts と同じ内容にそろえること。
 */

var FORM_TITLE = "スクールバス利用申込";

var FORM_DESCRIPTION =
  "新年度のスクールバスの停留所とルートを決めるために使います。ご記入いただいた住所は、停留所の場所を考えるためだけに使います。";

var FORM_QUESTIONS = [
  { title: "児童氏名", type: "text", required: true },
  { title: "学年", help: "例：3年", type: "text", required: true },
  { title: "ご住所", help: "番地まで入力してください", type: "text", required: true },
  { title: "登校時に利用する", type: "choice", choices: ["はい", "いいえ"], required: true },
  { title: "下校時に利用する", type: "choice", choices: ["はい", "いいえ"], required: true },
  { title: "希望する停留所", help: "希望があればご記入ください（例：○○公園の前）", type: "text", required: false },
  { title: "備考欄", help: "送迎について配慮が必要なことがあればご記入ください", type: "paragraph", required: false },
];

function createTemplateForm() {
  var form = FormApp.create(FORM_TITLE);
  form.setDescription(FORM_DESCRIPTION);

  FORM_QUESTIONS.forEach(function (q) {
    var item;
    if (q.type === "choice") {
      item = form.addMultipleChoiceItem().setChoiceValues(q.choices);
    } else if (q.type === "paragraph") {
      item = form.addParagraphTextItem();
    } else {
      item = form.addTextItem();
    }
    item.setTitle(q.title).setRequired(q.required);
    if (q.help) item.setHelpText(q.help);
  });

  // 回答を受け付ける状態にする（画面に埋め込んで表示するため）
  if (typeof form.setPublished === "function") form.setPublished(true);

  // リンクを知っている人が見られるようにする（「テンプレートをコピーして使う」を他の先生が使えるように）
  DriveApp.getFileById(form.getId()).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  Logger.log("FORM_ID: " + form.getId());
  Logger.log("回答用のURL: " + form.getPublishedUrl());
  Logger.log("編集用のURL: " + form.getEditUrl());
}
