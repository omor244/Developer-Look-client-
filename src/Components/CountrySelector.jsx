"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

const countries = [
    { code: "us", name: "United States", flag: "🇺🇸" },
    { code: "gb", name: "United Kingdom", flag: "🇬🇧" },
    { code: "ca", name: "Canada", flag: "🇨🇦" },
    { code: "au", name: "Australia", flag: "🇦🇺" },
    { code: "in", name: "India", flag: "🇮🇳" },
    { code: "de", name: "Germany", flag: "🇩🇪" },
    { code: "fr", name: "France", flag: "🇫🇷" },
    { code: "jp", name: "Japan", flag: "🇯🇵" },
];

const categories = [
    { value: "", label: "All Categories" },
    { value: "business", label: "Business" },
    { value: "technology", label: "Technology" },
    { value: "sports", label: "Sports" },
    { value: "entertainment", label: "Entertainment" },
    { value: "health", label: "Health" },
    { value: "science", label: "Science" },
];

export default function CountrySelector() {
    const [selectedCountry, setSelectedCountry] = useState("us");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

   
    const isFetchingFresh = useRef(false);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URI || "http://localhost:4000";

 
    const fetchFreshNews = useCallback(async () => {
        if (isFetchingFresh.current) return;

        isFetchingFresh.current = true;
        try {
            console.log("Triggering manual fetch from API...");
            await axios.post(`${backendUrl}/api/news/fetch-manual`, {
                country: selectedCountry,
                category: selectedCategory || null,
                language: selectedLanguage,
            });

            
            setTimeout(() => {
                fetchNewsFromBackend(true);
            }, 2000);
        } catch (err) {
            console.error("Fresh fetch error:", err);
            setError("Could not update database with new articles.");
            isFetchingFresh.current = false;
        }
    }, [selectedCountry, selectedCategory, selectedLanguage, backendUrl]);

    
    const fetchNewsFromBackend = useCallback(async (skipManualFetch = false) => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                country: selectedCountry,
                language: selectedLanguage,
                status: "active",
            };

            if (selectedCategory) params.category = selectedCategory;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await axios.get("http://localhost:4000/api/news", { params });

            console.log(response.data)

            if (response.data.success) {
                const results = response.data.results || [];

              
                if (results.length === 0 && !skipManualFetch && !isFetchingFresh.current) {
                    console.log("No data in DB, triggering fresh fetch...");
                    await fetchFreshNews();
                } else {
                    setArticles(results);
                    // ডেটা পাওয়া গেলে বা ফেচ শেষ হলে ফ্ল্যাগ রিসেট করুন
                    isFetchingFresh.current = false;
                }
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setError(err.response?.data?.error || "Backend server connection failed.");
            isFetchingFresh.current = false;
        } finally {
            setLoading(false);
        }
    }, [selectedCountry, selectedCategory, selectedLanguage, startDate, endDate, backendUrl, fetchFreshNews]);

    // যখনই কোনো ফিল্টার পরিবর্তন হবে
    useEffect(() => {
        isFetchingFresh.current = false; // নতুন ফিল্টারের জন্য রিসেট
        fetchNewsFromBackend();
    }, [fetchNewsFromBackend]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric",
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Country Selector */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Select a Country</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {countries.map((country) => (
                        <button
                            key={country.code}
                            onClick={() => setSelectedCountry(country.code)}
                            className={`p-4 rounded-xl border-2 transition-all ${selectedCountry === country.code
                                ? "border-blue-600 bg-blue-50 shadow-md scale-105"
                                : "border-gray-200 bg-white hover:border-blue-200"
                                }`}
                        >
                            <div className="text-3xl mb-1">{country.flag}</div>
                            <div className="text-xs font-bold text-center uppercase">{country.code}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters Section */}
            <div className="mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Language</label>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">From Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">To Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Content States */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-500 font-medium">Fetching news...</p>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center">
                    {error}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {articles.map((article) => (
                        <div
                            key={article._id || article.link}
                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
                        >
                            <div className="relative h-44 w-full bg-gray-100">
                                {article.image_url ? (
                                    <Image
                                        src={article.image_url}
                                        alt="news"
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                                )}
                                <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                                    {article.category?.[0] || "General"}
                                </span>
                            </div>

                            <div className="p-5 flex-grow">
                                <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                    {article.description || "Click to read the full story on the original source."}
                                </p>
                            </div>

                            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between mt-auto">
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    {article.source_id || "Global News"}
                                </div>
                                <div className="text-[11px] text-gray-400">{formatDate(article.pubDate)}</div>
                            </div>

                            <a
                                href={article.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-center py-3 bg-white text-blue-600 text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors border-t border-gray-100"
                            >
                                READ FULL ARTICLE
                            </a>
                        </div>
                    ))}
                </div>
            )}

            {!loading && articles.length === 0 && !error && (
                <div className="text-center py-20 text-gray-400">
                    No news articles found for this selection.
                </div>
            )}
        </div>
    );
}