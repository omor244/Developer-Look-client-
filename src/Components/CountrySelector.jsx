"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Image from "next/image";

const countries = [
    { code: "us", name: "USA", flag: "🇺🇸" },
    { code: "gb", name: "UK", flag: "🇬🇧" },
    { code: "ca", name: "Canada", flag: "🇨🇦" },
    { code: "au", name: "Australia", flag: "🇦🇺" },
    { code: "in", name: "India", flag: "🇮🇳" },
];

const categories = [
    { value: "", label: "Latest News" },
    { value: "technology", label: "Technology" },
    { value: "business", label: "Business" },
    { value: "sports", label: "Sports" },
    { value: "entertainment", label: "Entertainment" },
];

export default function CountrySelector() {
    const [selectedCountry, setSelectedCountry] = useState("us");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isFetchingFresh = useRef(false);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URI || "http://localhost:4000";

    const fetchNewsFromBackend = useCallback(async (skipManual = false) => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = {
                country: selectedCountry,
                category: selectedCategory || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            };

            const response = await axios.get(`${backendUrl}/api/news`, { params: queryParams });

            if (response.data.success) {
                const results = response.data.results || [];
                if (results.length === 0 && !skipManual && !isFetchingFresh.current) {
                    await handleManualFetch();
                } else {
                    setArticles(results);
                    isFetchingFresh.current = false;
                }
            }
        } catch (err) {
            setError(err.response?.status === 429 ? "Rate limit reached. Showing cached news." : "Failed to sync news.");
        } finally {
            setLoading(false);
        }
    }, [selectedCountry, selectedCategory, startDate, endDate]);

    const handleManualFetch = async () => {
        if (isFetchingFresh.current) return;
        isFetchingFresh.current = true;
        try {
            await axios.post(`${backendUrl}/api/news/fetch-manual`, {
                country: selectedCountry,
                category: selectedCategory || null,
            });
            setTimeout(() => fetchNewsFromBackend(true), 1500);
        } catch (err) {
            isFetchingFresh.current = false;
        }
    };

    useEffect(() => {
        fetchNewsFromBackend();
    }, [fetchNewsFromBackend]);

    return (
        <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans">
            {/* --- HEADER --- */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">D</div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-800">Developer<span className="text-blue-600">Look</span></h1>
                    </div>

                    <div className="hidden md:flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {countries.map(c => (
                            <button
                                key={c.code}
                                onClick={() => setSelectedCountry(c.code)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${selectedCountry === c.code ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                            >
                                <span>{c.flag}</span> {c.name}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* --- FILTERS BAR --- */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10">
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === cat.value ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"}`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <input
                            type="date"
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <input
                            type="date"
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* --- CONTENT GRID --- */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-[400px] bg-slate-200 rounded-3xl" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center font-medium">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((art, i) => (
                            <article key={i} className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-all duration-500 flex flex-col">
                                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                                    {art.image_url ? (
                                        <Image
                                            src={art.image_url}
                                            alt={art.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-300 font-bold uppercase tracking-widest text-xs">No Preview</div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase text-blue-600 shadow-sm">
                                            {art.category?.[0] || "Global"}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>{art.source_id || "Global News"}</span>
                                        <span>•</span>
                                        <span>{new Date(art.pubDate).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-lg font-bold leading-tight text-slate-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {art.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-3 mb-6 leading-relaxed">
                                        {art.description || "Stay updated with the latest headlines and detailed reports from trusted sources worldwide..."}
                                    </p>

                                    <div className="mt-auto">
                                        <a
                                            href={art.link}
                                            target="_blank"
                                            className="inline-flex items-center justify-center w-full py-3 bg-slate-50 text-slate-800 text-xs font-black rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"
                                        >
                                            READ FULL STORY
                                        </a>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}