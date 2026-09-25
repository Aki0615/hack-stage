import { FORM_TITLE, FORM_DESCRIPTION, FORM_QUESTIONS } from "@/lib/formTemplate";

// 申し込みformのプレビュー（Googleフォームをまだ用意していないときに表示する）
// 入力はできない見本なので、入力欄はすべて飾り
export function FormPreview() {
  return (
    <div className="flex size-full flex-col gap-3 overflow-y-auto p-5" aria-label="申し込みformのプレビュー">
      <div className="rounded-field border-t-8 border-primary bg-surface p-5">
        <p className="text-h2 font-extrabold">{FORM_TITLE}</p>
        <p className="mt-1 text-h5 text-text-gray">{FORM_DESCRIPTION}</p>
        <p className="mt-2 text-caption">* 必須の質問です</p>
      </div>

      {FORM_QUESTIONS.map((q) => (
        <div key={q.title} className="rounded-field bg-surface p-5">
          <p className="text-h4 font-bold">
            {q.title}
            {q.required && <span aria-label="必須"> *</span>}
          </p>
          {q.help && <p className="text-body text-text-gray">{q.help}</p>}

          {q.type === "choice" ? (
            <div className="mt-3 flex flex-col gap-2">
              {q.choices?.map((c) => (
                <p key={c} className="flex items-center gap-2 text-h5">
                  <span className="size-4 rounded-full border-2 border-gray" />
                  {c}
                </p>
              ))}
            </div>
          ) : (
            <div className={`mt-3 border-b-2 border-gray ${q.type === "paragraph" ? "h-14" : "h-7"}`}>
              <span className="text-body text-text-gray">回答を入力</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
