"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/src/lib/supabase";

type BowelCondition = "normal" | "loose" | "diarrhea" | "constipation" | "bloody";

const BOWEL_CONDITIONS: { value: BowelCondition; label: string }[] = [
  { value: "normal", label: "정상" },
  { value: "loose", label: "무름" },
  { value: "diarrhea", label: "설사" },
  { value: "constipation", label: "변비" },
  { value: "bloody", label: "혈변" },
];

const CONDITION_LEVELS: { value: number; label: string }[] = [
  { value: 1, label: "매우 나쁨" },
  { value: 2, label: "나쁨" },
  { value: 3, label: "보통" },
  { value: 4, label: "좋음" },
  { value: 5, label: "매우 좋음" },
];

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function RecordPage() {
  const router = useRouter();
  const today = getTodayDateString();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [bowelCount, setBowelCount] = useState("");
  const [bowelCondition, setBowelCondition] = useState<BowelCondition | "">("");
  const [painLevel, setPainLevel] = useState(0);
  const [painNote, setPainNote] = useState("");
  const [dietNote, setDietNote] = useState("");
  const [conditionLevel, setConditionLevel] = useState(3);
  const [conditionNote, setConditionNote] = useState("");

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
      setCheckingAuth(false);

      const { data, error } = await supabase
        .from("daily_records")
        .select(
          "bowel_count, bowel_condition, pain_level, pain_note, diet_note, condition_level, condition_note",
        )
        .eq("user_id", user.id)
        .eq("record_date", today)
        .maybeSingle();

      if (!error && data) {
        setBowelCount(data.bowel_count?.toString() ?? "");
        setBowelCondition((data.bowel_condition as BowelCondition) ?? "");
        setPainLevel(data.pain_level ?? 0);
        setPainNote(data.pain_note ?? "");
        setDietNote(data.diet_note ?? "");
        setConditionLevel(data.condition_level ?? 3);
        setConditionNote(data.condition_note ?? "");
      }

      setLoading(false);
    }

    init();
  }, [router, today]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("daily_records").upsert(
      {
        user_id: user.id,
        record_date: today,
        bowel_count: bowelCount === "" ? null : Number(bowelCount),
        bowel_condition: bowelCondition === "" ? null : bowelCondition,
        pain_level: painLevel,
        pain_note: painNote === "" ? null : painNote,
        diet_note: dietNote === "" ? null : dietNote,
        condition_level: conditionLevel,
        condition_note: conditionNote === "" ? null : conditionNote,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,record_date" },
    );

    setSaving(false);

    if (error) {
      setError("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }

    setSaved(true);
  }

  if (checkingAuth || loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <div className="w-full max-w-lg rounded-2xl border border-black/[.08] bg-white p-8 dark:border-white/[.145] dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          오늘의 기록
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{today}</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-8">
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              배변
            </legend>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="bowelCount"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                횟수
              </label>
              <input
                id="bowelCount"
                type="number"
                min={0}
                value={bowelCount}
                onChange={(e) => setBowelCount(e.target.value)}
                className="w-24 rounded-lg border border-black/[.08] bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-black/40 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-white/40"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="bowelCondition"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                상태
              </label>
              <select
                id="bowelCondition"
                value={bowelCondition}
                onChange={(e) =>
                  setBowelCondition(e.target.value as BowelCondition | "")
                }
                className="rounded-lg border border-black/[.08] bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-black/40 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-white/40"
              >
                <option value="">선택 안함</option>
                {BOWEL_CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              통증
            </legend>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="painLevel"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                정도: {painLevel}
              </label>
              <input
                id="painLevel"
                type="range"
                min={0}
                max={10}
                value={painLevel}
                onChange={(e) => setPainLevel(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="painNote"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                메모
              </label>
              <textarea
                id="painNote"
                rows={2}
                value={painNote}
                onChange={(e) => setPainNote(e.target.value)}
                className="rounded-lg border border-black/[.08] bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-black/40 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-white/40"
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              식단
            </legend>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="dietNote"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                오늘 먹은 음식
              </label>
              <textarea
                id="dietNote"
                rows={3}
                value={dietNote}
                onChange={(e) => setDietNote(e.target.value)}
                className="rounded-lg border border-black/[.08] bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-black/40 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-white/40"
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              컨디션
            </legend>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="conditionLevel"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                전반적인 컨디션
              </label>
              <select
                id="conditionLevel"
                value={conditionLevel}
                onChange={(e) => setConditionLevel(Number(e.target.value))}
                className="rounded-lg border border-black/[.08] bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-black/40 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-white/40"
              >
                {CONDITION_LEVELS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="conditionNote"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                메모
              </label>
              <textarea
                id="conditionNote"
                rows={2}
                value={conditionNote}
                onChange={(e) => setConditionNote(e.target.value)}
                className="rounded-lg border border-black/[.08] bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-black/40 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-white/40"
              />
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {saved && (
            <p className="text-sm text-green-600 dark:text-green-400">
              저장되었습니다.
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            {saving ? "저장 중..." : "저장하기"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="font-medium text-zinc-950 underline dark:text-zinc-50">
            홈으로
          </Link>
        </p>
      </div>
    </div>
  );
}
