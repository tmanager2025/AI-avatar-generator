"use client";

import { useState, useRef } from "react";
import { PromptForm } from "../prompt-form";

import { GenerateVideo } from "@/actions/GenerateVideo";
import { useApiKey } from "@/hooks/useApiKey";
import { useToast } from "@/hooks/use-toast";

interface VideoSectionProps {
  onVideoCreated?: (data: { url: string; prompt: string }) => void;
  initialPrompt?: string;
  sourceImage?: string;
  setIsGeneratingVideo?: (isGenerating: boolean) => void;
}

export const dynamic = "force-dynamic"; //TODO: Remove this when done testing

export function VideoSection({
  onVideoCreated,
  initialPrompt = "",
  sourceImage,
  setIsGeneratingVideo,
}: VideoSectionProps) {
  const [isPending, setIsPending] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const apiKey = useApiKey((state) => state.apiKey);
  const { toast } = useToast();

  const handleGenerate = async (prompt: string) => {
    setIsGeneratingVideo?.(true);
    setIsPending(true);
    if (!sourceImage) {
      alert("Please upload or generate an image first.");
      setIsGeneratingVideo?.(false);
      setIsPending(false);
      return;
    }

    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Prompt",
        description: "Please enter a prompt first",
      });
      setIsGeneratingVideo?.(false);
      setIsPending(false);
      return;
    }

    try {
      const data = await GenerateVideo(prompt, sourceImage, apiKey);
      onVideoCreated?.({ url: data.video.url, prompt });

      toast({
        title: "Success",
        description: "Hooray video has been generated successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      toast({
        variant: "destructive",
        title: "Video generation Failed",
        description: errorMessage,
      });
    } finally {
      setIsPending(false);
      setIsGeneratingVideo?.(false);
    }
  };

  return (
    <div ref={sectionRef} className="space-y-4 p-6">
      <>
        <h2 className="text-lg font-semibold">Generate the video</h2>
        <span>Video Generations are using Kling 1.6</span>
        <PromptForm
          initialPrompt={initialPrompt}
          onSubmit={handleGenerate}
          allowUpload={false}
          isPending={isPending}
        />
      </>
    </div>
  );
}
