"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [result, setResult] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mistralApiKey, setMistralApiKey] = useState("");
  const [isKeySaved, setIsKeySaved] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const savedKey = window.localStorage.getItem("mistralApiKey") ?? "";
      setMistralApiKey(savedKey);
      setIsKeySaved(savedKey.length > 0);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const saveApiKey = useCallback(() => {
    const trimmedKey = mistralApiKey.trim();

    if (trimmedKey) {
      window.localStorage.setItem("mistralApiKey", trimmedKey);
      setMistralApiKey(trimmedKey);
      setIsKeySaved(true);
      toast.success("API Key 已保存");
      return;
    }

    window.localStorage.removeItem("mistralApiKey");
    setIsKeySaved(false);
    toast.success("API Key 已清除");
  }, [mistralApiKey]);

  const clearApiKey = useCallback(() => {
    window.localStorage.removeItem("mistralApiKey");
    setMistralApiKey("");
    setIsKeySaved(false);
    toast.success("API Key 已清除");
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (!file) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const image = await readAsDataUrl(file);
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image,
          mistralApiKey: mistralApiKey.trim() || undefined,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to extract ticket data");
      }

      setResult(data);
      toast.success("识别完成");
    } catch (error) {
      const message = error instanceof Error ? error.message : "识别失败";
      setResult({ error: message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [mistralApiKey]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    noClick: true,
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>票据识别 Demo</CardTitle>
          <CardDescription>
            在页面填写 Mistral API Key，拖拽上传票据图片后返回结构化 JSON。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="mistral-api-key"
              className="text-sm font-medium leading-none"
            >
              Mistral API Key
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="mistral-api-key"
                type="password"
                value={mistralApiKey}
                onChange={(event) => {
                  setMistralApiKey(event.target.value);
                  setIsKeySaved(false);
                }}
                placeholder="输入 Mistral API Key"
                className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
              <Button type="button" onClick={saveApiKey} disabled={isLoading}>
                保存
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={clearApiKey}
                disabled={isLoading || !mistralApiKey}
              >
                清除
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {isKeySaved
                ? "已保存在当前浏览器。"
                : "留空时会使用服务器 .env.local 中的 MISTRAL_API_KEY。"}
            </p>
          </div>

          <div
            {...getRootProps()}
            className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-md border border-dashed p-6 text-center"
          >
            <input {...getInputProps()} />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? "松开开始上传" : "拖拽图片到这里"}
            </p>
            <Button type="button" onClick={open} disabled={isLoading}>
              选择图片
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : null}

          {result ? (
            <pre className="max-h-96 overflow-auto rounded-md bg-muted p-4 text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
