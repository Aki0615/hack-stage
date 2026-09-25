// 保護者に配る申し込みformの質問（画面のプレビューで使う）
// Googleフォームを作る scripts/create-form.gs も同じ内容にそろえること。
// 質問のタイトルがそのままスプレッドシートの列名になる。
export type FormQuestion = {
  title: string;
  help?: string;
  type: "text" | "paragraph" | "choice";
  choices?: string[];
  required: boolean;
};

export const FORM_TITLE = "スクールバス利用申込";

export const FORM_DESCRIPTION =
  "新年度のスクールバスの停留所とルートを決めるために使います。ご記入いただいた住所は、停留所の場所を考えるためだけに使います。";

export const FORM_QUESTIONS: FormQuestion[] = [
  { title: "児童氏名", type: "text", required: true },
  { title: "学年", help: "例：3年", type: "text", required: true },
  { title: "ご住所", help: "番地まで入力してください", type: "text", required: true },
  { title: "登校時に利用する", type: "choice", choices: ["はい", "いいえ"], required: true },
  { title: "下校時に利用する", type: "choice", choices: ["はい", "いいえ"], required: true },
  { title: "希望する停留所", help: "希望があればご記入ください（例：○○公園の前）", type: "text", required: false },
  { title: "備考欄", help: "送迎について配慮が必要なことがあればご記入ください", type: "paragraph", required: false },
];
