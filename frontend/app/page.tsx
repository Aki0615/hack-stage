import { redirect } from "next/navigation";

// トップを開いたら最初の画面へ
export default function Home() {
  redirect("/import");
}
