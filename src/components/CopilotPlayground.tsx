"use client";

import { useState, useEffect, useCallback } from "react";
import { useCopilotReadable, useCopilotAction, useCopilotChatSuggestions } from "@copilotkit/react-core";

// ── Types ────────────────────────────────────────────────────────

interface GeneratedWidget {
    id: string;
    type: "weather" | "chart" | "card" | "quote" | "timer" | "color_palette" | "progress" | "stat_card";
    data: Record<string, any>;
    createdAt: string;
}

// ── Playground Component ─────────────────────────────────────────

export function CopilotPlayground() {
    const [widgets, setWidgets] = useState<GeneratedWidget[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // Give copilot context about the playground
    useCopilotReadable({
        description: "The user is on the AI Playground tab — a live sandbox where the copilot can generate interactive UI widgets in real time. The copilot can create weather cards, charts, stat cards, color palettes, countdown timers, quote cards, and progress bars. Currently there are " + widgets.length + " widgets on the canvas.",
        value: JSON.stringify({
            currentView: "playground",
            widgetCount: widgets.length,
            widgetTypes: widgets.map(w => w.type),
            availableWidgets: ["weather", "chart", "card", "quote", "timer", "color_palette", "progress", "stat_card"],
        }),
    });

    // Dynamic suggestions based on what's on the canvas
    const widgetTypeSet = new Set(widgets.map(w => w.type));
    const suggestionParts: string[] = [];
    if (!widgetTypeSet.has("weather")) suggestionParts.push("'Show me the weather in Tokyo'");
    if (!widgetTypeSet.has("chart")) suggestionParts.push("'Create a bar chart of top 5 countries by population'");
    if (!widgetTypeSet.has("color_palette")) suggestionParts.push("'Generate a sunset color palette'");
    if (!widgetTypeSet.has("quote")) suggestionParts.push("'Show me a motivational quote'");
    if (!widgetTypeSet.has("stat_card")) suggestionParts.push("'Create a revenue stat card showing $2.4M up 18%'");
    if (!widgetTypeSet.has("timer")) suggestionParts.push("'Create a 30-second countdown timer'");
    if (!widgetTypeSet.has("progress")) suggestionParts.push("'Show project progress at 73%'");
    if (widgets.length > 0) suggestionParts.push("'Clear the playground'");
    if (widgets.length === 0) suggestionParts.push("'Build me a full dashboard with weather, stats and a chart'");
    // Add variety suggestions if user has tried many types
    if (widgetTypeSet.size >= 3) {
        suggestionParts.push("'Show weather for Paris'");
        suggestionParts.push("'Create a rainbow chart of sales by month'");
    }

    useCopilotChatSuggestions({
        instructions: `The user is in the AI Playground with ${widgets.length} widgets on the canvas (types: ${Array.from(widgetTypeSet).join(", ") || "none"}). Suggest NEW things they haven't tried yet. Pick 3-4 from: ${suggestionParts.join(", ")}. Always vary your suggestions — never repeat the same suggestion twice in a row. Be creative, enthusiastic, and specific.`,
        maxSuggestions: 4,
    });

    const addWidget = useCallback((widget: GeneratedWidget) => {
        setWidgets(prev => [widget, ...prev]);
    }, []);

    const removeWidget = useCallback((id: string) => {
        setWidgets(prev => prev.filter(w => w.id !== id));
    }, []);

    // ── Tool: Weather Widget ──────────────────────────────────────
    useCopilotAction({
        name: "show_weather",
        description: "Show a beautiful weather card for any city. Use when the user asks about weather, temperature, or climate for any location.",
        parameters: [
            { name: "city", type: "string", description: "The city name", required: true },
            { name: "country", type: "string", description: "Country code (optional)", required: false },
        ],
        handler: async ({ city, country }) => {
            // Fetch REAL weather data from wttr.in (free, no API key needed)
            let temp = 22, feelsLike = 20, humidity = 55, wind = 12, condition = "Clear 🌤️", description = "";
            try {
                const query = country ? `${city},${country}` : city;
                const res = await fetch(`https://wttr.in/${encodeURIComponent(query)}?format=j1`, {
                    signal: AbortSignal.timeout(5000),
                });
                if (res.ok) {
                    const data = await res.json();
                    const current = data.current_condition?.[0];
                    if (current) {
                        temp = parseInt(current.temp_C) || 22;
                        feelsLike = parseInt(current.FeelsLikeC) || temp;
                        humidity = parseInt(current.humidity) || 55;
                        wind = parseInt(current.windspeedKmph) || 12;
                        description = current.weatherDesc?.[0]?.value || "Clear";
                        // Map description to emoji condition
                        const desc = description.toLowerCase();
                        if (desc.includes("sun") || desc.includes("clear")) condition = `${description} ☀️`;
                        else if (desc.includes("cloud") || desc.includes("overcast")) condition = `${description} ⛅`;
                        else if (desc.includes("rain") || desc.includes("drizzle")) condition = `${description} 🌧️`;
                        else if (desc.includes("snow")) condition = `${description} ❄️`;
                        else if (desc.includes("thunder") || desc.includes("storm")) condition = `${description} ⛈️`;
                        else if (desc.includes("fog") || desc.includes("mist")) condition = `${description} 🌫️`;
                        else if (desc.includes("wind")) condition = `${description} 💨`;
                        else condition = `${description} 🌤️`;
                    }
                }
            } catch {
                // Fallback: use sensible defaults if API fails
                console.warn(`[Weather] Could not fetch data for ${city}, using defaults`);
            }

            const widget: GeneratedWidget = {
                id: `weather_${Date.now()}`,
                type: "weather",
                data: { city, country: country || "", temp, condition, humidity, wind, feelsLike },
                createdAt: new Date().toISOString(),
            };
            addWidget(widget);
            return `🌤️ Live weather for ${city}: ${temp}°C, ${condition}`;
        },
        render: ({ args, status }) => (
            <MiniRender status={status} label={`Loading weather for ${args?.city || "..."}...`} />
        ),
    });

    // ── Tool: Bar Chart ───────────────────────────────────────────
    useCopilotAction({
        name: "create_chart",
        description: "Create a beautiful animated bar chart with custom data. Use when the user asks for a chart, graph, or data visualization.",
        parameters: [
            { name: "title", type: "string", description: "Chart title", required: true },
            { name: "labels", type: "string", description: "Comma-separated labels (e.g. 'USA,China,India')", required: true },
            { name: "values", type: "string", description: "Comma-separated numeric values (e.g. '331,1412,1408')", required: true },
            { name: "color", type: "string", description: "Chart color theme: purple, blue, green, orange, rainbow", required: false },
        ],
        handler: async ({ title, labels, values, color }) => {
            const labelArr = labels.split(",").map(s => s.trim());
            const valueArr = values.split(",").map(s => parseFloat(s.trim()));
            const widget: GeneratedWidget = {
                id: `chart_${Date.now()}`,
                type: "chart",
                data: { title, labels: labelArr, values: valueArr, color: color || "purple" },
                createdAt: new Date().toISOString(),
            };
            addWidget(widget);
            return `📊 Chart "${title}" created with ${labelArr.length} data points!`;
        },
        render: ({ args, status }) => (
            <MiniRender status={status} label={`Creating chart: ${args?.title || "..."}...`} />
        ),
    });

    // ── Tool: Stat Card ───────────────────────────────────────────
    useCopilotAction({
        name: "create_stat_card",
        description: "Create a stat dashboard card showing a metric with trend. Use for KPIs, metrics, or any numeric display.",
        parameters: [
            { name: "label", type: "string", description: "Metric label (e.g. 'Revenue')", required: true },
            { name: "value", type: "string", description: "Display value (e.g. '$1.2M')", required: true },
            { name: "trend", type: "string", description: "Trend direction: up, down, flat", required: false },
            { name: "change", type: "string", description: "Change percentage (e.g. '+12%')", required: false },
        ],
        handler: async ({ label, value, trend, change }) => {
            const widget: GeneratedWidget = {
                id: `stat_${Date.now()}`,
                type: "stat_card",
                data: { label, value, trend: trend || "up", change: change || "+5%" },
                createdAt: new Date().toISOString(),
            };
            addWidget(widget);
            return `📈 Stat card "${label}: ${value}" created!`;
        },
        render: ({ args, status }) => (
            <MiniRender status={status} label={`Creating stat: ${args?.label || "..."}...`} />
        ),
    });

    // ── Tool: Quote Card ──────────────────────────────────────────
    useCopilotAction({
        name: "show_quote",
        description: "Display an inspirational or motivational quote card. Use when the user asks for a quote, motivation, or inspiration.",
        parameters: [
            { name: "quote", type: "string", description: "The quote text", required: true },
            { name: "author", type: "string", description: "Quote author", required: true },
        ],
        handler: async ({ quote, author }) => {
            const widget: GeneratedWidget = {
                id: `quote_${Date.now()}`,
                type: "quote",
                data: { quote, author },
                createdAt: new Date().toISOString(),
            };
            addWidget(widget);
            return `💭 Quote by ${author} added!`;
        },
        render: ({ args, status }) => (
            <MiniRender status={status} label="Creating quote card..." />
        ),
    });

    // ── Tool: Color Palette ───────────────────────────────────────
    useCopilotAction({
        name: "generate_palette",
        description: "Generate a beautiful color palette. Use when the user asks about colors, palettes, design, or color schemes.",
        parameters: [
            { name: "name", type: "string", description: "Palette name (e.g. 'Ocean Breeze')", required: true },
            { name: "colors", type: "string", description: "Comma-separated hex colors (e.g. '#1a1a2e,#16213e,#0f3460,#e94560')", required: true },
        ],
        handler: async ({ name, colors }) => {
            const colorArr = colors.split(",").map(s => s.trim());
            const widget: GeneratedWidget = {
                id: `palette_${Date.now()}`,
                type: "color_palette",
                data: { name, colors: colorArr },
                createdAt: new Date().toISOString(),
            };
            addWidget(widget);
            return `🎨 Palette "${name}" with ${colorArr.length} colors generated!`;
        },
        render: ({ args, status }) => (
            <MiniRender status={status} label={`Generating palette: ${args?.name || "..."}...`} />
        ),
    });

    // ── Tool: Countdown Timer ─────────────────────────────────────
    useCopilotAction({
        name: "create_timer",
        description: "Create a live countdown timer widget. Use when the user asks for a timer, countdown, or alarm.",
        parameters: [
            { name: "label", type: "string", description: "Timer label", required: true },
            { name: "seconds", type: "number", description: "Countdown duration in seconds", required: true },
        ],
        handler: async ({ label, seconds }) => {
            const widget: GeneratedWidget = {
                id: `timer_${Date.now()}`,
                type: "timer",
                data: { label, seconds, startTime: Date.now() },
                createdAt: new Date().toISOString(),
            };
            addWidget(widget);
            return `⏱️ Timer "${label}" started for ${seconds} seconds!`;
        },
        render: ({ args, status }) => (
            <MiniRender status={status} label={`Creating timer: ${args?.label || "..."}...`} />
        ),
    });

    // ── Tool: Progress Bar ────────────────────────────────────────
    useCopilotAction({
        name: "create_progress",
        description: "Create an animated progress bar widget. Use when showing completion percentage, loading state, or progress metrics.",
        parameters: [
            { name: "label", type: "string", description: "Progress label", required: true },
            { name: "percent", type: "number", description: "Completion percentage 0-100", required: true },
            { name: "color", type: "string", description: "Bar color: purple, blue, green, orange, red", required: false },
        ],
        handler: async ({ label, percent, color }) => {
            const widget: GeneratedWidget = {
                id: `progress_${Date.now()}`,
                type: "progress",
                data: { label, percent: Math.max(0, Math.min(100, percent)), color: color || "purple" },
                createdAt: new Date().toISOString(),
            };
            addWidget(widget);
            return `📊 Progress bar "${label}" at ${percent}% created!`;
        },
        render: ({ args, status }) => (
            <MiniRender status={status} label={`Creating progress: ${args?.label || "..."}...`} />
        ),
    });

    // ── Tool: Clear Canvas ────────────────────────────────────────
    useCopilotAction({
        name: "clear_playground",
        description: "Clear all widgets from the playground canvas. Use when the user wants to start fresh or clean up.",
        parameters: [],
        handler: async () => {
            setWidgets([]);
            return "🧹 Playground cleared!";
        },
    });

    return (
        <div style={{
            minHeight: "100vh",
            overflowY: "auto",
            padding: "20px",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
        }}>
            {/* Hero */}
            <div style={{
                textAlign: "center", marginBottom: "28px", padding: "28px 20px",
                background: "linear-gradient(135deg, rgba(191,90,242,0.08) 0%, rgba(10,132,255,0.06) 50%, rgba(48,209,88,0.05) 100%)",
                borderRadius: "20px",
                border: "0.5px solid rgba(191,90,242,0.15)",
                position: "relative", overflow: "hidden",
            }}>
                <div style={{
                    position: "absolute", top: "-50px", right: "-50px", width: "160px", height: "160px",
                    background: "radial-gradient(circle, rgba(191,90,242,0.15) 0%, transparent 70%)", borderRadius: "50%",
                }} />
                <h2 style={{
                    fontSize: "1.5rem", fontWeight: 800, margin: "0 0 6px",
                    background: "linear-gradient(135deg, #bf5af2, #0a84ff, #30d158)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                    🧪 AI Playground
                </h2>
                <p style={{ fontSize: "0.85rem", color: "rgba(235,235,245,0.5)", margin: "0 0 16px", lineHeight: 1.5 }}>
                    Chat with the AI to generate live UI widgets — weather, charts, stats, palettes & more
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
                    {[
                        { label: "Widgets", value: widgets.length, color: "#bf5af2" },
                        { label: "Tool Types", value: "8", color: "#0a84ff" },
                        { label: "Live", value: "✓", color: "#30d158" },
                    ].map(s => (
                        <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <span style={{ fontSize: "1.2rem", fontWeight: 800, color: s.color }}>{s.value}</span>
                            <span style={{ fontSize: "0.6rem", color: "rgba(235,235,245,0.35)" }}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{
                display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap",
                justifyContent: "center",
            }}>
                {[
                    { label: "🌤️ Weather", prompt: "Show weather for New York" },
                    { label: "📊 Chart", prompt: "Create a bar chart of top 5 programming languages" },
                    { label: "🎨 Palette", prompt: "Generate a sunset color palette" },
                    { label: "💭 Quote", prompt: "Show me an inspirational quote" },
                    { label: "📈 Stats", prompt: "Create a revenue stat card showing $2.4M up 18%" },
                    { label: "⏱️ Timer", prompt: "Create a 30-second timer" },
                    { label: "🧹 Clear", prompt: "Clear the playground" },
                ].map(action => (
                    <button
                        key={action.label}
                        title={`Try: "${action.prompt}"`}
                        style={{
                            padding: "6px 12px", borderRadius: "8px",
                            background: "rgba(255,255,255,0.04)",
                            border: "0.5px solid rgba(255,255,255,0.08)",
                            color: "rgba(235,235,245,0.6)", fontSize: "0.72rem",
                            cursor: "pointer", fontFamily: "inherit",
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={e => {
                            (e.target as HTMLButtonElement).style.background = "rgba(191,90,242,0.1)";
                            (e.target as HTMLButtonElement).style.borderColor = "rgba(191,90,242,0.2)";
                            (e.target as HTMLButtonElement).style.color = "#bf5af2";
                        }}
                        onMouseLeave={e => {
                            (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                            (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                            (e.target as HTMLButtonElement).style.color = "rgba(235,235,245,0.6)";
                        }}
                    >
                        {action.label}
                    </button>
                ))}
            </div>

            {/* Widget Canvas */}
            {widgets.length === 0 ? (
                <div style={{
                    textAlign: "center", padding: "60px 20px",
                    border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "16px",
                    color: "rgba(235,235,245,0.3)",
                }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🎨</div>
                    <p style={{ fontSize: "0.9rem", marginBottom: "6px" }}>Your canvas is empty</p>
                    <p style={{ fontSize: "0.75rem" }}>
                        Ask the AI to create widgets: &quot;Show weather for Tokyo&quot; or &quot;Create a chart&quot;
                    </p>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "14px",
                }}>
                    {widgets.map((widget, i) => (
                        <WidgetRenderer
                            key={widget.id}
                            widget={widget}
                            index={i}
                            onRemove={() => removeWidget(widget.id)}
                            mounted={mounted}
                        />
                    ))}
                </div>
            )}

            {/* Footer */}
            <div style={{
                textAlign: "center", padding: "20px 0 10px", marginTop: "24px",
                borderTop: "1px solid rgba(255,255,255,0.04)",
                fontSize: "0.65rem", color: "rgba(235,235,245,0.25)",
            }}>
                Powered by <span style={{ color: "#bf5af2" }}>CopilotKit</span> Generative UI • All widgets generated in real-time via AI tool calls
            </div>

            <style>{`
                @keyframes fillBar { from { width: 0% } }
                @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

// ── Mini Render for In-Chat Status ───────────────────────────────

function MiniRender({ status, label }: { status: string; label: string }) {
    if (status === "complete") return null;
    return (
        <div style={{
            padding: "10px 14px", borderRadius: "10px",
            background: "rgba(191,90,242,0.08)", border: "0.5px solid rgba(191,90,242,0.15)",
            fontSize: "0.78rem", color: "rgba(235,235,245,0.6)",
            display: "flex", alignItems: "center", gap: "8px",
        }}>
            <span style={{ animation: "pulse 1.5s infinite" }}>⏳</span>
            {label}
        </div>
    );
}

// ── Widget Renderer ──────────────────────────────────────────────

function WidgetRenderer({
    widget, index, onRemove, mounted,
}: {
    widget: GeneratedWidget; index: number; onRemove: () => void; mounted: boolean;
}) {
    return (
        <div style={{
            background: "rgba(28,28,30,0.9)",
            border: "0.5px solid rgba(255,255,255,0.06)",
            borderRadius: "16px",
            overflow: "hidden",
            animation: mounted ? `fadeSlideIn 0.4s ease ${index * 0.08}s both` : undefined,
            position: "relative",
        }}>
            {/* Remove button */}
            <button
                onClick={onRemove}
                style={{
                    position: "absolute", top: "8px", right: "8px", zIndex: 2,
                    width: "22px", height: "22px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)", border: "none",
                    color: "rgba(235,235,245,0.3)", fontSize: "0.6rem",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}
            >✕</button>

            {widget.type === "weather" && <WeatherWidget data={widget.data} />}
            {widget.type === "chart" && <ChartWidget data={widget.data} />}
            {widget.type === "stat_card" && <StatCardWidget data={widget.data} />}
            {widget.type === "quote" && <QuoteWidget data={widget.data} />}
            {widget.type === "color_palette" && <PaletteWidget data={widget.data} />}
            {widget.type === "timer" && <TimerWidget data={widget.data} />}
            {widget.type === "progress" && <ProgressWidget data={widget.data} />}
        </div>
    );
}

// ── Individual Widget Components ─────────────────────────────────

function WeatherWidget({ data }: { data: Record<string, any> }) {
    const bgGradient = data.temp > 25
        ? "linear-gradient(135deg, rgba(255,159,10,0.15), rgba(255,69,58,0.1))"
        : data.temp < 10
            ? "linear-gradient(135deg, rgba(10,132,255,0.15), rgba(100,210,255,0.1))"
            : "linear-gradient(135deg, rgba(48,209,88,0.1), rgba(10,132,255,0.08))";

    return (
        <div style={{ padding: "20px", background: bgGradient }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <h4 style={{ margin: "0 0 2px", fontSize: "1rem", fontWeight: 700, color: "#fff" }}>
                        {data.city}
                    </h4>
                    {data.country && <span style={{ fontSize: "0.65rem", color: "rgba(235,235,245,0.4)" }}>{data.country}</span>}
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{data.temp}°</div>
                    <div style={{ fontSize: "0.65rem", color: "rgba(235,235,245,0.5)" }}>Feels {data.feelsLike}°</div>
                </div>
            </div>
            <div style={{ fontSize: "0.85rem", color: "rgba(235,235,245,0.7)", margin: "10px 0" }}>{data.condition}</div>
            <div style={{ display: "flex", gap: "16px", fontSize: "0.7rem", color: "rgba(235,235,245,0.4)" }}>
                <span>💧 {data.humidity}%</span>
                <span>💨 {data.wind} km/h</span>
            </div>
        </div>
    );
}

function ChartWidget({ data }: { data: Record<string, any> }) {
    const maxVal = Math.max(...(data.values as number[]));
    const colorMap: Record<string, string> = {
        purple: "#bf5af2", blue: "#0a84ff", green: "#30d158", orange: "#ff9f0a", red: "#ff453a",
    };
    const colors = data.color === "rainbow"
        ? ["#ff453a", "#ff9f0a", "#ffd60a", "#30d158", "#0a84ff", "#bf5af2", "#ff375f"]
        : [colorMap[data.color] || "#bf5af2"];

    return (
        <div style={{ padding: "18px" }}>
            <h4 style={{ margin: "0 0 14px", fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>{data.title}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(data.labels as string[]).map((label: string, i: number) => {
                    const pct = maxVal > 0 ? ((data.values as number[])[i] / maxVal) * 100 : 0;
                    const color = colors[i % colors.length];
                    return (
                        <div key={i}>
                            <div style={{
                                display: "flex", justifyContent: "space-between", marginBottom: "3px",
                                fontSize: "0.7rem",
                            }}>
                                <span style={{ color: "rgba(235,235,245,0.6)" }}>{label}</span>
                                <span style={{ color: "rgba(235,235,245,0.4)", fontFamily: "monospace" }}>
                                    {(data.values as number[])[i].toLocaleString()}
                                </span>
                            </div>
                            <div style={{
                                height: "8px", borderRadius: "4px",
                                background: "rgba(255,255,255,0.04)", overflow: "hidden",
                            }}>
                                <div style={{
                                    height: "100%", borderRadius: "4px",
                                    background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                                    width: `${pct}%`,
                                    animation: "fillBar 0.8s ease-out",
                                    transition: "width 0.5s ease",
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function StatCardWidget({ data }: { data: Record<string, any> }) {
    const trendColor = data.trend === "up" ? "#30d158" : data.trend === "down" ? "#ff453a" : "#ff9f0a";
    const trendIcon = data.trend === "up" ? "↑" : data.trend === "down" ? "↓" : "→";

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ fontSize: "0.7rem", color: "rgba(235,235,245,0.4)", fontWeight: 500, marginBottom: "6px" }}>
                {data.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>{data.value}</span>
                <span style={{
                    fontSize: "0.75rem", fontWeight: 600, color: trendColor,
                    display: "flex", alignItems: "center", gap: "2px",
                }}>
                    {trendIcon} {data.change}
                </span>
            </div>
        </div>
    );
}

function QuoteWidget({ data }: { data: Record<string, any> }) {
    return (
        <div style={{
            padding: "22px",
            background: "linear-gradient(135deg, rgba(191,90,242,0.06), rgba(10,132,255,0.04))",
        }}>
            <span style={{ fontSize: "1.5rem", opacity: 0.3 }}>&ldquo;</span>
            <p style={{
                fontSize: "0.9rem", color: "rgba(235,235,245,0.8)",
                lineHeight: 1.6, margin: "0 0 10px", fontStyle: "italic",
            }}>
                {data.quote}
            </p>
            <p style={{ fontSize: "0.72rem", color: "#bf5af2", margin: 0, fontWeight: 500 }}>
                — {data.author}
            </p>
        </div>
    );
}

function PaletteWidget({ data }: { data: Record<string, any> }) {
    const [copiedColor, setCopiedColor] = useState<string | null>(null);

    return (
        <div style={{ padding: "16px" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.8rem", fontWeight: 600, color: "#fff" }}>
                🎨 {data.name}
            </h4>
            <div style={{ display: "flex", borderRadius: "10px", overflow: "hidden", height: "60px" }}>
                {(data.colors as string[]).map((color: string, i: number) => (
                    <div
                        key={i}
                        onClick={() => { navigator.clipboard.writeText(color); setCopiedColor(color); setTimeout(() => setCopiedColor(null), 1500); }}
                        style={{
                            flex: 1, background: color, cursor: "pointer",
                            display: "flex", alignItems: "flex-end", justifyContent: "center",
                            paddingBottom: "4px", transition: "flex 0.2s",
                        }}
                        title={`Copy ${color}`}
                    >
                        <span style={{
                            fontSize: "0.5rem", color: "#fff", fontFamily: "monospace",
                            textShadow: "0 0 4px rgba(0,0,0,0.8)",
                        }}>
                            {copiedColor === color ? "✓" : color}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TimerWidget({ data }: { data: Record<string, any> }) {
    const [remaining, setRemaining] = useState(data.seconds as number);
    const total = data.seconds as number;

    useEffect(() => {
        if (remaining <= 0) return;
        const timer = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
        return () => clearInterval(timer);
    }, [remaining]);

    const pct = total > 0 ? ((total - remaining) / total) * 100 : 100;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const done = remaining === 0;

    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "0.7rem", color: "rgba(235,235,245,0.4)", marginBottom: "8px" }}>
                {data.label}
            </div>
            <div style={{
                fontSize: "2.2rem", fontWeight: 800,
                color: done ? "#30d158" : "#fff",
                fontFamily: "'SF Mono', monospace",
                marginBottom: "12px",
            }}>
                {done ? "✓ Done!" : `${mins}:${secs.toString().padStart(2, "0")}`}
            </div>
            <div style={{
                height: "6px", borderRadius: "3px",
                background: "rgba(255,255,255,0.06)", overflow: "hidden",
            }}>
                <div style={{
                    height: "100%", borderRadius: "3px",
                    background: done ? "#30d158" : "linear-gradient(90deg, #bf5af2, #0a84ff)",
                    width: `${pct}%`, transition: "width 1s linear",
                }} />
            </div>
        </div>
    );
}

function ProgressWidget({ data }: { data: Record<string, any> }) {
    const colorMap: Record<string, string> = {
        purple: "#bf5af2", blue: "#0a84ff", green: "#30d158", orange: "#ff9f0a", red: "#ff453a",
    };
    const color = colorMap[data.color] || "#bf5af2";

    return (
        <div style={{ padding: "18px" }}>
            <div style={{
                display: "flex", justifyContent: "space-between", marginBottom: "8px",
            }}>
                <span style={{ fontSize: "0.78rem", color: "rgba(235,235,245,0.7)", fontWeight: 500 }}>
                    {data.label}
                </span>
                <span style={{ fontSize: "0.78rem", color, fontWeight: 700 }}>
                    {data.percent}%
                </span>
            </div>
            <div style={{
                height: "10px", borderRadius: "5px",
                background: "rgba(255,255,255,0.06)", overflow: "hidden",
            }}>
                <div style={{
                    height: "100%", borderRadius: "5px",
                    background: `linear-gradient(90deg, ${color}, ${color}99)`,
                    width: `${data.percent}%`,
                    animation: "fillBar 1s ease-out",
                }} />
            </div>
        </div>
    );
}
