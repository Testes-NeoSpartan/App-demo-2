/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ENV } from "../config/env";

export async function askAI(prompt: string, context: string = "") {
  try {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, context }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to get AI response");
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Gemini Proxy Error:", error);
    return "Lamento, não consigo ligar-me ao serviço de IA neste momento. Se tiver uma preocupação urgente, por favor marque uma consulta ou contacte o seu médico.";
  }
}
