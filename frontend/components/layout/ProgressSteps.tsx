import { STEP_TITLES } from "@/lib/steps";
import { ProgressBar } from "./ProgressBar";

// Figma「進捗カード」：画面名の上に進捗バーを並べる
export function ProgressSteps({ current }: { current: number }) {
  return (
    <ol className="mx-auto flex w-full max-w-[65rem] gap-[0.625rem]">
      {STEP_TITLES.map((title, i) => {
        let state: "current" | "done" | "todo" = "todo";
        if (i < current) state = "done";
        if (i === current) state = "current";

        return (
          <li key={title} className="flex flex-1 flex-col items-center gap-2"
              aria-current={i === current ? "step" : undefined}>
            <ProgressBar state={state} />
            <span className="text-h5">{title}</span>
          </li>
        );
      })}
    </ol>
  );
}
