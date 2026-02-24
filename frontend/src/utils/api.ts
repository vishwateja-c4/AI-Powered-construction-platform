const API_BASE = "http://127.0.0.1:8000/api/v1";

export async function generatePlan(data: {
    description: string;
    project_type: string;
    location: string;
    budget?: number;
    timeline?: string;
}) {
    const res = await fetch(`${API_BASE}/plans/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

export async function estimateCosts(data: {
    plan: any;
    location?: string;
    quality?: string;
}) {
    const res = await fetch(`${API_BASE}/costs/estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

export async function sendChatMessage(data: {
    message: string;
    context?: any;
    history?: { role: string; content: string }[];
}) {
    const res = await fetch(`${API_BASE}/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}
