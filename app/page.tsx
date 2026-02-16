"use client";

import { useEffect, useMemo, useState } from "react";

type ActionType = "input" | "operator" | "equals";

const displayOperator: Record<string, string> = {
  "/": "÷",
  "*": "×",
  "+": "+",
  "-": "-"
};

const toCleanString = (value: number) => {
  if (!Number.isFinite(value)) return "Error";
  const abs = Math.abs(value);
  const precision = abs >= 1e10 || (abs !== 0 && abs < 1e-6) ? 12 : 12;
  let str = value.toPrecision(precision);
  if (str.includes("e")) return str.replace("+", "");
  if (str.includes(".")) {
    const [whole, decimals] = str.split(".");
    const trimmed = (decimals ?? "").replace(/0+$/u, "");
    str = trimmed.length ? `${whole}.${trimmed}` : whole;
  } else {
    str = str.replace(/\.0+$/u, "");
  }
  return str;
};

const evaluateTokens = (tokens: string[]) => {
  if (tokens.length === 0) return 0;
  const nums: number[] = [parseFloat(tokens[0])];
  const ops: string[] = [];

  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i];
    const next = parseFloat(tokens[i + 1]);
    if (op === "*" || op === "/") {
      const current = nums.pop() ?? 0;
      const result = op === "*" ? current * next : current / next;
      nums.push(result);
    } else {
      ops.push(op);
      nums.push(next);
    }
  }

  let total = nums[0] ?? 0;
  for (let i = 0; i < ops.length; i += 1) {
    const op = ops[i];
    const next = nums[i + 1] ?? 0;
    total = op === "+" ? total + next : total - next;
  }

  return total;
};

export default function Home() {
  const [input, setInput] = useState("0");
  const [tokens, setTokens] = useState<string[]>([]);
  const [lastAction, setLastAction] = useState<ActionType>("input");
  const [expressionDisplay, setExpressionDisplay] = useState("");

  const expression = useMemo(() => {
    if (expressionDisplay) return expressionDisplay;
    if (tokens.length === 0) return "";
    return tokens
      .map((token) => displayOperator[token] ?? token)
      .join(" ");
  }, [expressionDisplay, tokens]);

  const reset = () => {
    setInput("0");
    setTokens([]);
    setLastAction("input");
    setExpressionDisplay("");
  };

  const appendNumber = (value: string) => {
    setExpressionDisplay("");
    setLastAction("input");
    setTokens((prev) => {
      if (lastAction === "equals") return [];
      return prev;
    });

    setInput((prev) => {
      const safePrev = prev === "Error" ? "0" : prev;
      if (lastAction === "operator" || lastAction === "equals") {
        if (safePrev === "-0") return `-${value}`;
        return value;
      }
      if (safePrev === "0") return value;
      if (safePrev === "-0") return `-${value}`;
      return `${safePrev}${value}`;
    });
  };

  const appendDecimal = () => {
    setExpressionDisplay("");
    setLastAction("input");
    setTokens((prev) => {
      if (lastAction === "equals") return [];
      return prev;
    });

    setInput((prev) => {
      const safePrev = prev === "Error" ? "0" : prev;
      if (lastAction === "operator" || lastAction === "equals") return "0.";
      if (safePrev.includes(".")) return safePrev;
      return `${safePrev}.`;
    });
  };

  const applyOperator = (op: string) => {
    setExpressionDisplay("");
    setTokens((prev) => {
      if (lastAction === "equals") return [input, op];
      if (lastAction === "operator") {
        const updated = [...prev];
        updated[updated.length - 1] = op;
        return updated;
      }
      return [...prev, input, op];
    });
    setLastAction("operator");
  };

  const applyEquals = () => {
    if (lastAction === "operator") return;
    if (tokens.length === 0) return;
    const allTokens = [...tokens, input];
    const result = evaluateTokens(allTokens);
    const display = toCleanString(result);
    setInput(display);
    setTokens([]);
    setLastAction("equals");
    setExpressionDisplay(
      `${allTokens.map((token) => displayOperator[token] ?? token).join(" ")} =`
    );
  };

  const applyPercent = () => {
    const num = parseFloat(input);
    if (Number.isNaN(num)) return;
    const next = toCleanString(num / 100);
    setInput(next);
    if (lastAction === "equals") setExpressionDisplay("");
  };

  const toggleSign = () => {
    setExpressionDisplay("");
    setInput((prev) => {
      if (prev === "0") return "-0";
      if (prev === "-0") return "0";
      if (prev.startsWith("-")) return prev.slice(1);
      return `-${prev}`;
    });
  };

  const backspace = () => {
    setExpressionDisplay("");
    setLastAction("input");
    setInput((prev) => {
      const safePrev = prev === "Error" ? "0" : prev;
      if (safePrev.length <= 1) return "0";
      if (safePrev.length === 2 && safePrev.startsWith("-")) return "0";
      return safePrev.slice(0, -1);
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;
      if (/^[0-9]$/u.test(key)) {
        appendNumber(key);
        return;
      }
      if (key === ".") {
        appendDecimal();
        return;
      }
      if (key === "+" || key === "-" || key === "*" || key === "/") {
        event.preventDefault();
        applyOperator(key);
        return;
      }
      if (key === "Enter") {
        event.preventDefault();
        applyEquals();
        return;
      }
      if (key === "Escape") {
        reset();
        return;
      }
      if (key === "Backspace") {
        backspace();
        return;
      }
      if (key === "%") {
        applyPercent();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const buttons = [
    { label: "C", action: reset, tone: "action" },
    { label: "+/-", action: toggleSign, tone: "action" },
    { label: "%", action: applyPercent, tone: "action" },
    { label: "÷", action: () => applyOperator("/"), tone: "operator" },
    { label: "7", action: () => appendNumber("7"), tone: "number" },
    { label: "8", action: () => appendNumber("8"), tone: "number" },
    { label: "9", action: () => appendNumber("9"), tone: "number" },
    { label: "×", action: () => applyOperator("*"), tone: "operator" },
    { label: "4", action: () => appendNumber("4"), tone: "number" },
    { label: "5", action: () => appendNumber("5"), tone: "number" },
    { label: "6", action: () => appendNumber("6"), tone: "number" },
    { label: "-", action: () => applyOperator("-"), tone: "operator" },
    { label: "1", action: () => appendNumber("1"), tone: "number" },
    { label: "2", action: () => appendNumber("2"), tone: "number" },
    { label: "3", action: () => appendNumber("3"), tone: "number" },
    { label: "+", action: () => applyOperator("+"), tone: "operator" },
    { label: "0", action: () => appendNumber("0"), tone: "number", span: 2 },
    { label: ".", action: appendDecimal, tone: "number" },
    { label: "=", action: applyEquals, tone: "equals" }
  ];

  return (
    <main className="min-h-screen px-4 py-10 md:py-14 text-white">
      <div className="mx-auto flex max-w-md flex-col gap-6 rounded-[32px] border border-white/5 bg-calc-surface/90 p-6 shadow-soft backdrop-blur">
        <div className="rounded-3xl bg-calc-display/80 px-4 py-6 shadow-glow">
          <div className="min-h-[24px] text-right text-sm tracking-wide text-calc-muted">
            {expression || "\u00A0"}
          </div>
          <div className="mt-2 flex min-h-[48px] items-center justify-end text-4xl font-semibold">
            {input}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {buttons.map((button) => {
            const baseClasses =
              "flex h-16 items-center justify-center rounded-full text-xl font-medium transition active:scale-95 md:h-20";
            const toneClasses =
              button.tone === "operator"
                ? "bg-calc-operator text-black hover:bg-calc-operator-hover"
                : button.tone === "equals"
                  ? "bg-white text-black hover:bg-white/90"
                  : button.tone === "action"
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-calc-number text-white hover:bg-white/15";

            return (
              <button
                key={button.label}
                type="button"
                onClick={button.action}
                className={`${baseClasses} ${toneClasses} ${
                  button.span ? "col-span-2 justify-start px-8" : ""
                }`}
                aria-label={button.label}
              >
                {button.label}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
